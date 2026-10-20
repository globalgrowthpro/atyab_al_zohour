import { Check, PackageCheck, Truck, ClipboardCheck, Flower2, House } from "lucide-react";
import { deliverySteps, orderStatus, progressIndex, type ClientOrder } from "./data";
export { DeliveryMap } from "./geographic-map";
const stepIcons = [ClipboardCheck, Flower2, PackageCheck, Truck, House] as const;
export function DeliveryStepper({ order }: { order: ClientOrder }) {
  const current = progressIndex(order.status);
  if (current < 0)
    return (
      <p className="rounded-xl bg-muted p-4 text-sm">هذا الطلب ملغي؛ لا توجد مراحل توصيل نشطة.</p>
    );
  return (
    <ol aria-label="مراحل توصيل الطلب" className="client-stepper">
      {deliverySteps.map((step, index) => {
        const complete = index < current || order.status === "delivered";
        const active = index === current;
        const Icon = stepIcons[index]!;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={`client-step ${complete ? "is-complete" : ""} ${active ? "is-current" : ""}`}
          >
            <div className="client-step-icon">
              {complete ? <Check className="size-5" /> : <Icon className="size-5" />}
            </div>
            <div className="client-step-copy">
              <h4>{orderStatus[step]}</h4>
              <p>
                {complete ? "مكتملة ✓" : active ? "الخطوة الحالية" : "في انتظار الخطوة التالية"}
              </p>
              {active && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {order.status === "delivered" ? "اكتمل الطلب" : "طلبك هنا الآن"}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
