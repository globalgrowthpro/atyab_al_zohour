import { useState, type FormEvent } from "react";
import { Check, Truck, PackageCheck, AlertTriangle, RotateCcw, Banknote } from "lucide-react";
import { useCourier } from "./context";
import { failureReasons, taskActionSchema, type CourierTask, type TaskAction } from "./data";
import { sar } from "@/features/admin/data";

export function TaskActions({ task }: { task: CourierTask }) {
  const { updateTask, saving } = useCourier();
  const [mode, setMode] = useState<"none" | "deliver" | "fail">("none");
  const [recipient, setRecipient] = useState("");
  const [verified, setVerified] = useState(false);
  const [codCollected, setCodCollected] = useState(false);
  const [reason, setReason] = useState<keyof typeof failureReasons>("unavailable");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const isCod =
    task.paymentMethod === "cash_on_delivery" ||
    Boolean(task.amountToCollect && task.amountToCollect > 0) ||
    task.instruction?.includes("تحصيل") ||
    task.instruction?.includes("الدفع عند الاستلام");

  async function act(input: unknown) {
    if (mode === "deliver" && isCod && !codCollected) {
      setError("يرجى تأكيد تحصيل مبلغ الدفع عند الاستلام (نقداً أو شبكة) قبل إنهاء المهمة.");
      return;
    }
    const parsed = taskActionSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "راجع بيانات التأكيد.");
      return;
    }
    setError("");
    const actionData = {
      ...(parsed.data as TaskAction),
      ...(mode === "deliver" && isCod ? { note: `${note ? note + " | " : ""}تم تحصيل الدفع عند الاستلام` } : {}),
    };
    if (await updateTask(task.id, actionData as TaskAction)) {
      setMode("none");
      setNote("");
      setRecipient("");
      setVerified(false);
      setCodCollected(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void act(
      mode === "deliver"
        ? { type: "deliver", recipient, verified, note }
        : { type: "fail", reason, note },
    );
  }
  if (task.status === "delivered")
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="flex items-center gap-2 font-bold text-primary">
          <Check className="size-5" />
          تم التسليم في التجربة المحلية
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          المستلم: {task.recipient ?? "غير محدد"}. لا يتم إخطار العميل فعلياً.
        </p>
      </div>
    );
  return (
    <div className="space-y-4">
      {mode === "none" ? (
        <div className="flex flex-wrap gap-3">
          {task.status === "assigned" && (
            <button
              disabled={saving}
              className="btn btn-primary"
              onClick={() => void act({ type: "accept" })}
            >
              <PackageCheck className="size-4" />
              استلام المهمة
            </button>
          )}
          {task.status === "accepted" && (
            <button
              disabled={saving}
              className="btn btn-primary"
              onClick={() => void act({ type: "depart" })}
            >
              <Truck className="size-4" />
              بدء التوصيل
            </button>
          )}
          {task.status === "out_for_delivery" && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMode("deliver");
                  setError("");
                }}
              >
                <Check className="size-4" />
                تأكيد التسليم
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setMode("fail");
                  setError("");
                }}
              >
                <AlertTriangle className="size-4" />
                تعذّر التسليم
              </button>
            </>
          )}
          {task.status === "failed" && (
            <>
              <p className="w-full text-sm text-muted-foreground">
                سبب التعذّر: {task.failureReason ? failureReasons[task.failureReason] : "غير محدد"}
              </p>
              <button
                disabled={saving}
                onClick={() => void act({ type: "retry" })}
                className="btn btn-outline"
              >
                <RotateCcw className="size-4" />
                إعادة محاولة التوصيل
              </button>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-muted/30 p-5">
          <h4 className="text-base">
            {mode === "deliver" ? "مراجعة تأكيد التسليم" : "تسجيل تعذّر التسليم"}
          </h4>
          <p className="text-xs leading-6 text-muted-foreground">
            هذا الإجراء يغيّر بيانات العرض على هذا المتصفح فقط.
          </p>
          {mode === "deliver" ? (
            <>
              <label className="block space-y-2 text-sm">
                <span>اسم المستلم</span>
                <input
                  className="field"
                  required
                  minLength={2}
                  maxLength={120}
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                />
              </label>
              <label className="flex items-start gap-3 text-sm leading-7">
                <input
                  type="checkbox"
                  className="mt-2 accent-primary"
                  required
                  checked={verified}
                  onChange={(event) => setVerified(event.target.checked)}
                />
                <span>أؤكد مراجعة المنتجات والكميات وتسليمها للمستلم في هذه التجربة.</span>
              </label>

              {isCod && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="size-4 text-amber-600" />
                      طلب دفع عند الاستلام (COD)
                    </span>
                    {task.amountToCollect ? (
                      <span className="font-mono text-sm">{sar(task.amountToCollect)}</span>
                    ) : (
                      <span className="text-xs">المبلغ حسب الفاتورة</span>
                    )}
                  </div>
                  <label className="flex items-start gap-2.5 text-xs font-semibold cursor-pointer text-amber-950 dark:text-amber-200">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-amber-600"
                      required
                      checked={codCollected}
                      onChange={(e) => setCodCollected(e.target.checked)}
                    />
                    <span>تم استلام وتحصيل كامل المبلغ المطلوب (نقداً أو عبر جهاز شبكة POS).</span>
                  </label>
                </div>
              )}
            </>
          ) : (
            <label className="block space-y-2 text-sm">
              <span>سبب تعذّر التسليم</span>
              <select
                className="field"
                value={reason}
                onChange={(event) => setReason(event.target.value as keyof typeof failureReasons)}
              >
                {Object.entries(failureReasons).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block space-y-2 text-sm">
            <span>{mode === "deliver" ? "ملاحظات التسليم (اختياري)" : "توضيح السبب"}</span>
            <textarea
              className="field !h-auto py-3"
              rows={3}
              required={mode === "fail"}
              minLength={mode === "fail" ? 5 : undefined}
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving
                ? "جارٍ الحفظ…"
                : mode === "deliver"
                  ? "حفظ تأكيد التسليم محلياً"
                  : "حفظ سبب التعذّر"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setMode("none");
                setError("");
              }}
              className="btn btn-outline"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
