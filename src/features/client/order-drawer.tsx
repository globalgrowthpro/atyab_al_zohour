import { Link } from "@tanstack/react-router";
import { MapPin, CalendarDays, Package, Truck, CircleHelp } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge } from "./shared";
import { type ClientOrder } from "./data";
import { formatOrderDate, orderAddress, orderAmount, orderQuantity } from "./order-presentation";

export function OrderDrawer({
  order,
  open,
  onClose,
}: {
  order: ClientOrder | undefined;
  open: boolean;
  onClose: () => void;
}) {
  const address = order ? orderAddress(order) : undefined;
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent
        side="left"
        className="!w-full overflow-y-auto !p-0 sm:!max-w-[640px]"
        dir="rtl"
      >
        <div className="border-b bg-surface px-7 pb-6 pt-12">
          <p className="mb-3 text-xs font-bold tracking-wide text-rose">تفاصيل الطلب</p>
          <SheetTitle className="!text-start !text-3xl">
            <bdi>{order?.id ?? "طلب غير موجود"}</bdi>
          </SheetTitle>
          <SheetDescription className="mt-3 !text-start">
            كل معلومات طلبك في مكان واحد. بيانات العرض توضيحية.
          </SheetDescription>
          {order && (
            <div className="mt-4">
              <StatusBadge status={order.status} />
            </div>
          )}
        </div>
        {!order ? (
          <p role="alert" className="p-7">
            لم نعثر على هذا الطلب ضمن بيانات التجربة.
          </p>
        ) : (
          <div className="space-y-7 p-5 sm:p-7">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-card p-4">
                <CalendarDays className="mb-3 size-5 text-primary" />
                <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
                <p className="mt-2 font-bold">{formatOrderDate(order.date)}</p>
              </div>
              <div className="rounded-2xl border bg-card p-4">
                <Package className="mb-3 size-5 text-primary" />
                <p className="text-xs text-muted-foreground">الأصناف والكميات</p>
                <p className="mt-2 font-bold">{order.items.length} أصناف</p>
                <p className="mt-1 text-xs text-muted-foreground">{orderQuantity(order)}</p>
              </div>
            </div>
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-base">
                <MapPin className="size-5 text-rose" />
                عنوان الاستلام
                {address?.example && (
                  <span className="text-xs font-normal text-muted-foreground">(تجريبي)</span>
                )}
              </h3>
              <div className="rounded-2xl bg-muted/60 p-5 leading-8">
                <p className="font-bold">
                  {address?.city}، {address?.district}
                </p>
                <p className="text-sm text-muted-foreground">{address?.street}</p>
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                  موعد التوصيل: {order.deliveryWindow ?? "لم يتم تأكيده"}
                </p>
              </div>
            </section>
            <section>
              <h3 className="mb-4 text-base">
                بنود الطلب <span className="text-muted-foreground">({order.items.length})</span>
              </h3>
              <div className="divide-y rounded-2xl border">
                {order.items.map((item) => (
                  <div key={item.sku} className="flex items-center gap-4 p-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                      <Package className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                        {item.sku}
                      </p>
                    </div>
                    <strong className="shrink-0 text-sm">
                      {item.qty} {item.unit}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
            <div className="flex items-center justify-between rounded-2xl bg-forest p-5 text-forest-foreground">
              <div>
                <p className="text-sm opacity-80">إجمالي الطلب</p>
                <p className="mt-1 text-xs opacity-65">
                  {order.total === undefined
                    ? "يُحدّد في عرض السعر"
                    : order.id.startsWith("DEMO-")
                      ? "مبلغ توضيحي"
                      : "بالريال السعودي"}
                </p>
              </div>
              <strong>{orderAmount(order)}</strong>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/dashboard/track"
                search={{ order: order.id }}
                onClick={onClose}
                className="btn btn-primary"
              >
                <Truck className="size-4" />
                تتبّع هذا الطلب
              </Link>
              <Link
                to="/dashboard/support"
                search={{ order: order.id }}
                onClick={onClose}
                className="btn btn-outline"
              >
                <CircleHelp className="size-4" />
                طلب مساعدة
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
