import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Headset, Download } from "lucide-react";
import { z } from "zod";
import { useCourier } from "@/features/courier/context";
export const Route = createFileRoute("/courier/support")({
  validateSearch: (search: Record<string, unknown>): { task?: string | undefined } => ({
    task: typeof search["task"] === "string" ? search["task"] : undefined,
  }),
  component: SupportRoute,
});
function SupportRoute() {
  const { task } = Route.useSearch();
  return <CourierSupport key={task ?? "general"} initialTask={task ?? ""} />;
}
const schema = z.object({
  taskId: z.string(),
  subject: z.string().trim().min(4, "أدخل عنواناً من 4 أحرف على الأقل").max(160),
  message: z.string().trim().min(10, "اكتب تفاصيل لا تقل عن 10 أحرف").max(2000),
});
export function CourierSupport({ initialTask = "" }: { initialTask?: string }) {
  const { data, save, saving } = useCourier();
  const [form, setForm] = useState({ taskId: initialTask, subject: "", message: "" });
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "راجع الاستفسار");
      return;
    }
    if (parsed.data.taskId && !data.tasks.some((task) => task.id === parsed.data.taskId)) {
      setError("اختر مهمة موجودة أو استفساراً عاماً.");
      return;
    }
    setError("");
    if (
      await save({
        ...data,
        support: [
          { ...parsed.data, id: `LOCAL-${crypto.randomUUID()}`, at: new Date().toISOString() },
          ...data.support,
        ],
      })
    )
      setForm({ taskId: "", subject: "", message: "" });
  }
  function download(id: string) {
    const draft = data.support.find((item) => item.id === id);
    if (!draft) return;
    try {
      const url = URL.createObjectURL(
        new Blob(
          [
            "\uFEFF",
            `مسودة دعم المندوب — لم تُرسل\nالمهمة: ${draft.taskId || "استفسار عام"}\n${draft.subject}\n\n${draft.message}`,
          ],
          { type: "text/plain;charset=utf-8" },
        ),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "atyab-courier-support.txt";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("تعذّر تحميل المسودة. حاول مرة أخرى.");
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">دعم المندوب</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          جهّز بلاغك واحفظه محلياً أو حمّله للمشاركة. خدمة إرسال البلاغات غير متصلة.
        </p>
      </div>
      <form
        onSubmit={(event) => void submit(event)}
        className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <h3 className="flex items-center gap-2 text-base">
          <Headset className="size-5 text-rose" />
          مسودة بلاغ جديد
        </h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            <span>عنوان البلاغ</span>
            <input
              className="field"
              required
              minLength={4}
              maxLength={160}
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({ ...current, subject: event.target.value }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span>المهمة المرتبطة (اختياري)</span>
            <select
              className="field"
              value={form.taskId}
              onChange={(event) =>
                setForm((current) => ({ ...current, taskId: event.target.value }))
              }
            >
              <option value="">استفسار عام</option>
              {data.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.id} · {task.district}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-2 text-sm">
          <span>تفاصيل البلاغ</span>
          <textarea
            rows={4}
            required
            minLength={10}
            maxLength={2000}
            className="field !h-auto py-3"
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "جارٍ الحفظ…" : "حفظ مسودة البلاغ"}
        </button>
      </form>
      <h3 className="text-lg">مسودات بلاغاتي</h3>
      {!data.support.length ? (
        <p className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          لا توجد بلاغات محفوظة بعد.
        </p>
      ) : (
        <div className="space-y-3">
          {data.support.map((draft) => (
            <details key={draft.id} className="rounded-2xl border bg-card">
              <summary className="cursor-pointer p-5 text-sm font-bold">
                {draft.subject}
                <span className="ms-3 rounded-full bg-blush px-2 py-1 text-[10px] font-normal">
                  مسودة محلية · لم تُرسل
                </span>
              </summary>
              <div className="space-y-4 border-t p-5">
                <p className="text-xs text-muted-foreground">
                  المهمة: {draft.taskId || "استفسار عام"}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm leading-7">{draft.message}</p>
                <p className="text-[11px] text-muted-foreground">
                  لا توجد ردود دعم فعلية في التجربة.
                </p>
                <button
                  onClick={() => download(draft.id)}
                  className="btn btn-outline !h-10 text-xs"
                >
                  <Download className="size-4" />
                  تحميل المسودة
                </button>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
