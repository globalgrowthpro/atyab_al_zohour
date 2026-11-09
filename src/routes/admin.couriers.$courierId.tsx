import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Car, ClipboardList, Hash, MapPin, PackageCheck, Star, Truck, Wallet, ShieldCheck } from "lucide-react";
import {
  courierStatusLabel, courierStatusTone,
  orderStatusLabel, orderStatusTone, type AdminCourier, type CourierStatus,
  type AdminOrder, type OrderStatus,
} from "@/features/admin/data";
import { Badge, DataTable, KpiCard, Panel } from "@/features/admin/shared";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/couriers/$courierId")({
  head: () => ({ meta: [{ title: "تفاصيل المندوب — لوحة الإدارة" }, { name: "robots", content: "noindex" }] }),
  component: CourierDetails,
});

function CourierDetails() {
  const { courierId } = Route.useParams();

  const [courier, setCourier] = useState<AdminCourier>({
    id: courierId,
    name: "مندوب التوصيل المعتمد",
    zone: "الرياض — فان مبرد",
    vehicle: "فان تبريد (2°C - 4°C)",
    today: 0,
    done: 0,
    rating: 4.8,
    status: "available",
  });

  const [status, setStatus] = useState<CourierStatus>("available");
  const [phone, setPhone] = useState("");
  const [temperature, setTemperature] = useState<number | null>(3.2);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  // Load live courier details from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadCourier() {
      try {
        const [courierRes, tasksRes, ordersRes] = await Promise.all([
          supabase.from("couriers").select("*").eq("id", courierId).maybeSingle(),
          supabase.from("delivery_tasks").select("*").eq("courier_id", courierId),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
        ]);

        if (isMounted) {
          if (courierRes.data) {
            const c = courierRes.data;
            const tasks = tasksRes.data || [];
            const done = tasks.filter((t) => t.status === "delivered").length;
            const onRoute = tasks.some((t) => t.status === "out_for_delivery");
            const cStatus: CourierStatus = !c.active ? "off" : onRoute ? "on-route" : "available";

            const loaded: AdminCourier = {
              id: c.id,
              name: c.name,
              zone: `${c.city} — ${c.vehicle}`,
              vehicle: c.vehicle,
              today: tasks.length,
              done,
              rating: 4.8,
              status: cStatus,
            };

            setCourier(loaded);
            setStatus(cStatus);
            if (c.phone) setPhone(c.phone);
            if (c.temperature_celsius !== null) setTemperature(Number(c.temperature_celsius));

            if (ordersRes.data) {
              const taskOrderIds = new Set(tasks.map((t) => t.order_id).filter(Boolean));
              const statusMap: Record<string, OrderStatus> = {
                received: "new",
                preparing: "preparing",
                ready: "ready",
                shipping: "shipping",
                delivered: "delivered",
                cancelled: "cancelled",
              };

              const matched = ordersRes.data
                .filter((o) => taskOrderIds.has(o.id) || (o.city === c.city && o.status === "shipping"))
                .map((o) => ({
                  id: o.id,
                  client: o.client_name,
                  city: o.city,
                  date: o.created_at ? o.created_at.split("T")[0]! : "2026-11-08",
                  items: Array.isArray(o.items) ? o.items.length : 1,
                  total: Number(o.total || 0),
                  status: statusMap[o.status] || "new",
                  courier: c.name,
                }));

              setOrders(matched);
            }
          }
        }
      } catch (err) {
        console.warn("Courier details fetch error:", err);
      }
    }

    void loadCourier();
    return () => {
      isMounted = false;
    };
  }, [courierId]);
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const value = orders.reduce((s, o) => s + o.total, 0);
  const pct = courier.today ? Math.round((courier.done / courier.today) * 100) : 0;

  const change = async (next: CourierStatus) => {
    setStatus(next);
    toast.success(`تم تغيير الحالة إلى: ${courierStatusLabel[next]}`);

    try {
      const isActive = next !== "off";
      await supabase
        .from("couriers")
        .update({ active: isActive })
        .eq("id", courierId);

      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "courier_status_changed",
        severity: "info",
        tone: "forest",
        description: `تم تحديث حالة المندوب ${courier.name} (${courierId}) إلى: ${courierStatusLabel[next]}`,
      });
    } catch (err) {
      console.warn("Courier status update error:", err);
    }
  };

  return (
    <RequirePermission permission="manage:couriers" fallbackMessage="إدارة وتفاصيل كباتن التوصيل مقتصرة على موظفي العمليات والإدارة.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/couriers" className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <ArrowRight className="size-3.5" />العودة إلى المندوبين
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Truck className="size-6" /></span>
            <h2 className="text-2xl font-bold">{courier.name}</h2>
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
            {phone && <Info icon={Hash} label="رقم الجوال" value={phone} ltr />}
            {temperature !== null && <Info icon={Hash} label="حرارة التبريد" value={`${temperature}°C`} ltr />}
          </dl>
          <div className="px-5 pb-5">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>تقدّم مهام اليوم</span><span>{pct}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
          </div>
        </Panel>
        <Panel title="الحالة وسلسلة التبريد">
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-xl bg-admin-head p-3">
              <span className="text-sm text-muted-foreground">الحالة الحالية</span>
              <Badge tone={courierStatusTone[status]}>{courierStatusLabel[status]}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(courierStatusLabel) as CourierStatus[]).map((s) => (
                <button key={s} disabled={s === status} onClick={() => void change(s)}
                  className="rounded-xl border px-3 py-2 text-xs font-bold text-forest hover:bg-primary/10 disabled:bg-primary disabled:text-primary-foreground transition">
                  {courierStatusLabel[s]}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-forest">
              <span className="flex items-center gap-1.5 font-bold mb-1"><ShieldCheck className="size-4 text-primary" />سلسلة تبريد موثقة</span>
              يتم تسجيل مهام وتتبع درجات حرارة الحاويات المبردة في قاعدة بيانات Supabase لحظياً.
            </div>
          </div>
        </Panel>
      </div>

      <Panel title={`الطلبات المرتبطة (${orders.length})`}>
        <DataTable head={["رقم الطلب", "العميل", "المدينة", "التاريخ", "الإجمالي", "الحالة"]} empty={orders.length === 0}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="font-bold text-forest" dir="ltr">{o.id}</td>
              <td>{o.client}</td>
              <td>{o.city}</td>
              <td dir="ltr">{o.date}</td>
              <td className="font-bold text-forest">{o.total.toLocaleString("en-US")} ر.س</td>
              <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </RequirePermission>
  );
}

function Info({ icon: Icon, label, value, ltr }: { icon: typeof Hash; label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</dt>
      <dd className="mt-1 text-sm font-bold text-forest" dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "end" } : undefined}>{value}</dd>
    </div>
  );
}
