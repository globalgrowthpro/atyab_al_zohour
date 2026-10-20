import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, MapPin, Warehouse, ArrowDown, ArrowUpLeft, Clock3 } from "lucide-react";
import { useClientData } from "@/features/client/context";
import { EmptyState, StatusBadge } from "@/features/client/shared";
import { DeliveryMap, DeliveryStepper } from "@/features/client/tracking";
import { orderAddress, orderMapState, formatOrderDate } from "@/features/client/order-presentation";
export const Route = createFileRoute("/dashboard/track")({
  validateSearch: (search: Record<string, unknown>): { order?: string | undefined } => ({
    order: typeof search["order"] === "string" ? search["order"] : undefined,
  }),
  component: Track,
});
function Track() {
  const { data } = useClientData();
  const { order: id } = Route.useSearch();
  const navigate = useNavigate();
  const order = id ? data.orders.find((item) => item.id === id) : data.orders[0];
  const address = order ? orderAddress(order) : undefined;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl">تتبّع الطلب</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            كل مرحلة في رحلة طلبك، من القبول وحتى الاستلام.
          </p>
        </div>
        {data.orders.length > 0 && (
          <label className="space-y-2">
            <span className="block text-xs text-muted-foreground">اختر الطلب</span>
            <select
              className="field !h-10 !w-auto min-w-52 text-sm"
              value={order?.id ?? ""}
              onChange={(event) =>
                void navigate({
                  to: "/dashboard/track",
                  search: { order: event.target.value },
                  resetScroll: false,
                })
              }
            >
              {!order && <option value="">اختر طلباً</option>}
              {data.orders.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} · {item.city}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {!data.orders.length ? (
        <EmptyState
          title="لا يوجد طلب لتتبّعه"
          text="حمّل بيانات العرض من النظرة العامة لاستكشاف مراحل التوصيل."
        />
      ) : !order ? (
        <p role="alert" className="rounded-2xl border bg-card p-6">
          هذا الطلب غير موجود. اختر طلباً من القائمة.
        </p>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg">
                  الطلب <bdi>{order.id}</bdi>
                </h3>
                <StatusBadge status={order.status} />
                <span className="text-xs text-muted-foreground">{formatOrderDate(order.date)}</span>
              </div>
              <Link
                to="/dashboard/orders"
                search={{ order: order.id }}
                className="flex items-center gap-1 text-xs font-bold text-primary"
              >
                تفاصيل الطلب <ArrowUpLeft className="size-4" />
              </Link>
            </div>
            <div className="px-5 py-7 sm:px-8 sm:py-8">
              <DeliveryStepper order={order} />
            </div>
          </section>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_250px]">
            <DeliveryMap order={order} />
            <aside className="overflow-hidden rounded-2xl border bg-card">
              <div className="border-b p-5">
                <h3 className="text-base">رحلة التوصيل</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">نقاط ومسار توضيحيان</p>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                    <Warehouse className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] text-muted-foreground">من</p>
                    <p className="mt-1 text-sm font-bold">مركز التجهيز</p>
                    <p className="mt-1 text-xs text-muted-foreground">{order.city} · موقع تجريبي</p>
                  </div>
                </div>
                <ArrowDown className="ms-2 size-4 text-muted-foreground/50" />
                <div className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blush/60 text-rose">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] text-muted-foreground">إلى</p>
                    <p className="mt-1 text-sm font-bold">
                      {address?.city}، {address?.district}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                      {address?.street}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    موعد الوصول
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {order.status === "delivered"
                      ? "تم الاستلام (مثال)"
                      : (order.deliveryWindow ?? "بانتظار تأكيد الموعد")}
                  </p>
                </div>
                <p className="text-[11px] leading-6 text-muted-foreground">
                  {orderMapState(order).location}. الموقع ثابت للعرض، ولا يُحدّث لحظياً.
                </p>
                <Link
                  to="/dashboard/support"
                  search={{ order: order.id }}
                  className="btn btn-outline !h-10 w-full !px-3 text-xs"
                >
                  مساعدة بخصوص التوصيل
                </Link>
              </div>
            </aside>
          </div>
          <details className="rounded-2xl border bg-card">
            <summary className="cursor-pointer px-6 py-5 text-sm font-bold text-forest">
              سجل تحديثات الطلب{" "}
              <span className="ms-2 text-xs font-normal text-muted-foreground">
                {order.events.length} تحديثات توضيحية
              </span>
            </summary>
            <ol className="divide-y border-t px-6">
              {order.events.map((event, index) => (
                <li key={index} className="flex gap-3 py-4">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex-1">
                    <h4 className="text-sm">{event.label}</h4>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{event.detail}</p>
                  </div>
                  <time className="text-[11px] text-muted-foreground" dir="ltr">
                    {event.at}
                  </time>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </div>
  );
}
