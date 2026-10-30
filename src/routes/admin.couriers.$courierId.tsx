import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Car, ClipboardList, Hash, MapPin, PackageCheck, Star, Truck, Wallet } from "lucide-react";
import {
  adminCouriers, adminOrders, courierStatusLabel, courierStatusTone,
  orderStatusLabel, orderStatusTone, type CourierStatus,
} from "@/features/admin/data";
import { Badge, DataTable, KpiCard, Panel } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/couriers/$courierId")({
  beforeLoad: ({ params }) => {
    if (!adminCouriers.some((c) => c.id === params.courierId)) throw notFound();
  },
  head: () => ({ meta: [{ title: "تفاصيل المندوب — لوحة الإدارة" }, { name: "robots", content: "noindex" }] }),
  component: CourierDetails,
});

function CourierDetails() {
  const { courierId } = Route.useParams();
  const courier = adminCouriers.find((c) => c.id === courierId)!;
  const [status, setStatus] = useState<CourierStatus>(courier.status);

  const orders = adminOrders.filter((o) => o.courier === courier.name);
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const value = orders.reduce((s, o) => s + o.total, 0);
  const pct = courier.today ? Math.round((courier.done / courier.today) * 100) : 0;

  const change = (next: CourierStatus) => { setStatus(next); toast.success(`تم تغيير الحالة إلى: ${courierStatusLabel[next]}`); };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/couriers" className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <ArrowRight className="size-3.5" />العودة إلى المندوبين
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Truck className="size-6" /></span>
            <h2 className="text-2xl">{courier.name}</h2>
            <Badge tone={courierStatusTone[status]}>{courierStatusLabel[status]}</Badge>
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={ClipboardList} label="مهام اليوم" value={`${courier.done} / ${courier.today}`} hint={`نسبة الإنجاز ${pct}%`} color="forest" />
        <KpiCard icon={PackageCheck} label="طلبات مُسلّمة" value={String(delivered)} hint={`من ${orders.length} طلبات مرتبطة`} color="sage" />
        <KpiCard icon={Wallet} label="قيمة الطلبات المرتبطة" value={`${value.toLocaleString("en-US")} ر.س`} color="gold" />
        <KpiCard icon={Star} label="التقييم" value={String(courier.rating)} color="rose" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Panel title="بيانات المندوب" className="lg:col-span-2">
          <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
            <Info icon={Hash} label="رقم المندوب" value={courier.id} />
            <Info icon={MapPin} label="منطقة التوصيل" value={courier.zone} />
            <Info icon={Car} label="المركبة" value={courier.vehicle} />
            <Info icon={Star} label="متوسط التقييم" value={`${courier.rating} من 5`} />
          </dl>
          <div className="px-5 pb-5">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>تقدّم مهام اليوم</span><span>{pct}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
          </div>
        </Panel>
        <Panel title="الحالة">
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-xl bg-admin-head p-3">
              <span className="text-sm text-muted-foreground">الحالة الحالية</span>
              <Badge tone={courierStatusTone[status]}>{courierStatusLabel[status]}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(courierStatusLabel) as CourierStatus[]).map((s) => (
                <button key={s} disabled={s === status} onClick={() => change(s)}
                  className="rounded-xl border px-3 py-2 text-xs font-bold text-forest hover:bg-primary/10 disabled:bg-primary disabled:text-primary-foreground">
                  {courierStatusLabel[s]}
                </button>
              ))}
            </div>
            <div className="rounded-xl border bg-surface p-3 text-xs leading-6 text-muted-foreground">
              <span className="font-bold text-forest">ملاحظة:</span> تغيير الحالة تجريبي ويعود عند تحديث الصفحة.
            </div>
          </div>
        </Panel>
      </div>

      <Panel title={`الطلبات المرتبطة (${orders.length})`}>
        <DataTable head={["رقم الطلب", "العميل", "المدينة", "التاريخ", "الأصناف", "الإجمالي", "الحالة"]} empty={orders.length === 0}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="font-bold text-forest" dir="ltr">{o.id}</td>
              <td>{o.client}</td>
              <td>{o.city}</td>
              <td dir="ltr">{o.date}</td>
              <td>{o.items}</td>
              <td className="font-bold text-forest">{o.total.toLocaleString("en-US")} ر.س</td>
              <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</dt>
      <dd className="mt-1 text-sm font-bold text-forest">{value}</dd>
    </div>
  );
}
