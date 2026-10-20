import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Headset, Download } from "lucide-react";
import { useClientData } from "@/features/client/context";
import { ticketInputSchema, type TicketInput } from "@/features/client/data";
export const Route = createFileRoute("/dashboard/support")({
  validateSearch: (search: Record<string, unknown>): { order?: string | undefined } => ({
    order: typeof search["order"] === "string" ? search["order"] : undefined,
  }),
  component: SupportRoute,
});
function SupportRoute() {
  const { order } = Route.useSearch();
  return <SupportPage key={order ?? "general"} initialOrder={order ?? ""} />;
}
const categories = {
  order: "استفسار عن طلب",
  delivery: "التوصيل",
  account: "الملف والحساب",
  other: "أخرى",
} as const;
const ticketStatuses = {
  draft: "مسودة محلية · لم تُرسل",
  open: "مفتوحة · مثال",
  pending: "قيد المتابعة · مثال",
  closed: "مغلقة · مثال",
} as const;
export function SupportPage({ initialOrder = "" }: { initialOrder?: string }) {
  const { data, saving, save } = useClientData();
  const [form, setForm] = useState<TicketInput>({
    subject: "",
    category: "order",
    orderId: initialOrder,
    message: "",
  });
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(data.tickets[0]?.id ?? "");
  const ticket = data.tickets.find((t) => t.id === selected);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = ticketInputSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "راجع بيانات التذكرة");
      return;
    }
    if (parsed.data.orderId && !data.orders.some((o) => o.id === parsed.data.orderId)) {
      setError("اختر طلباً موجوداً أو استفساراً عاماً.");
      return;
    }
    const draft = {
      ...parsed.data,
      id: `LOCAL-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      status: "draft" as const,
      origin: "local" as const,
      replies: [],
    };
    setError("");
    if (await save({ ...data, tickets: [draft, ...data.tickets] })) {
      setSelected(draft.id);
      setForm({ subject: "", category: "order", orderId: "", message: "" });
    }
  }
  function downloadTicket() {
    if (!ticket) return;
    try {
      const url = URL.createObjectURL(
        new Blob(
          [
            "\uFEFF",
            `${ticket.origin === "demo" ? "محادثة دعم توضيحية — ليست تذكرة حقيقية" : "مسودة دعم محلية — لم تُرسل للشركة"}\n${ticket.subject}\nالنوع: ${categories[ticket.category]}\nالطلب: ${ticket.orderId || "استفسار عام"}\n\n${ticket.message}\n\n${ticket.replies.map((reply) => `${reply.author === "support" ? "مثال رد الدعم" : "مثال رد العميل"}: ${reply.message}`).join("\n")}`,
          ],
          { type: "text/plain;charset=utf-8" },
        ),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "atyab-support-draft.txt";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("تعذّر تحميل مسودة الدعم. حاول مرة أخرى.");
    }
  }
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl">تذاكر الدعم</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          جهّز استفسارك واحفظه كمسودة محلية للمشاركة مع المبيعات. لا توجد خدمة إرسال أو ردود دعم
          متصلة بعد.
        </p>
      </div>
      <form
        onSubmit={(e) => void submit(e)}
        className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft"
      >
        <h3 className="flex items-center gap-2 text-xl">
          <Headset className="size-5 text-rose" />
          مسودة تذكرة جديدة
        </h3>
        <label className="block space-y-2">
          <span>عنوان الاستفسار</span>
          <input
            className="field"
            required
            minLength={4}
            maxLength={160}
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span>نوع الاستفسار</span>
            <select
              className="field"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as TicketInput["category"] }))
              }
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span>الطلب المرتبط (اختياري)</span>
            <select
              className="field"
              value={form.orderId}
              onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
            >
              <option value="">استفسار عام</option>
              {data.orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-2">
          <span>تفاصيل الاستفسار</span>
          <textarea
            className="field !h-auto py-3"
            rows={5}
            required
            minLength={10}
            maxLength={3000}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        </label>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "جارٍ الحفظ…" : "حفظ مسودة محلية"}
        </button>
      </form>
      <h3 className="text-xl">تذاكر الدعم والمسودات</h3>
      {!data.tickets.length ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          لا توجد مسودات محفوظة. يمكنك تجهيز استفسارك من النموذج أعلاه.
        </div>
      ) : (
        <div className="space-y-3">
          {data.tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 text-start shadow-soft"
            >
              <span className="min-w-0 break-words font-bold">
                {t.subject}
                <small className="mt-1 block font-normal text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString("ar-SA")} · {categories[t.category]}
                </small>
              </span>
              <span className="rounded-full bg-blush px-3 py-1 text-xs font-bold text-forest">
                {ticketStatuses[t.status]}
              </span>
            </button>
          ))}
        </div>
      )}
      {ticket && (
        <section className="space-y-4 rounded-3xl border bg-card p-6">
          <h3 className="break-words text-xl">{ticket.subject}</h3>
          <p className="text-sm text-muted-foreground">الطلب: {ticket.orderId || "استفسار عام"}</p>
          <p className="whitespace-pre-wrap break-words leading-8">{ticket.message}</p>
          {ticket.origin === "demo" && (
            <p className="text-sm font-bold text-rose">
              محادثة نموذجية للعرض فقط · كل الرسائل التالية توضيحية
            </p>
          )}
          {ticket.replies.map((reply, index) => (
            <div
              key={index}
              className={`rounded-2xl p-5 ${reply.author === "support" ? "bg-accent" : "bg-muted"}`}
            >
              <p className="mb-2 text-sm font-bold text-primary">
                {reply.author === "support" ? "فريق الدعم (مثال)" : "العميل (مثال)"}
              </p>
              <p className="whitespace-pre-wrap break-words leading-7">{reply.message}</p>
              <time className="mt-2 block text-xs text-muted-foreground">
                {new Date(reply.at).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}
              </time>
            </div>
          ))}
          <p className="rounded-xl bg-muted p-4 text-sm">
            {ticket.origin === "demo"
              ? "الحالة والردود بيانات توضيحية ثابتة، ولا تمثل تواصلاً فعلياً مع فريق الدعم."
              : "لا توجد ردود أو تحديثات حالة من الشركة لأن التذكرة لم تُرسل."}
          </p>
          <button className="btn btn-outline" onClick={downloadTicket}>
            <Download className="size-4" />
            {ticket.origin === "demo" ? "تحميل المحادثة التوضيحية" : "تحميل المسودة"}
          </button>
        </section>
      )}
    </div>
  );
}
