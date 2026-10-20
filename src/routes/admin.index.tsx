import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, FileText, TrendingUp, Users } from "lucide-react";
import { adminClients, adminOrders, adminQuotes, orderStatusLabel, orderStatusTone, sar, weeklySales } from "@/features/admin/data";
import { products } from "@/lib/catalog";
import { Badge, DataTable, Panel, StatCard } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/")({ component: Overview });

function Overview() {
  const revenue = weeklySales.reduce((s, d) => s + d.total, 0);
  const max = Math.max(...weeklySales.map((d) => d.total));
  const active = adminOrders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
  const pendingClients = adminClients.filter((c) => c.status === "pending");
  const pendingQuotes = adminQuotes.filter((q) => q.status === "pending").length;
  const outOfStock = products.filter((p) => !p.available);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="مبيعات الأسبوع" value={sar(revenue)} hint="آخر 7 أيام" />
        <StatCard icon={ClipboardList} label="طلبات قيد التنفيذ" value={String(active)} />
        <StatCard icon={FileText} label="عروض بانتظار التسعير" value={String(pendingQuotes)} />
        <StatCard icon={Users} label="حسابات بانتظار الموافقة" value={String(pendingClients.length)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="المبيعات اليومية">
          <div className="flex h-56 items-end gap-3 p-5">
            {weeklySales.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-primary/80 transition hover:bg-rose" style={{ height: `${(d.total / max) * 100}%` }} title={sar(d.total)} />
                <span className="text-xs text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="تنبيهات">
          <ul className="space-y-3 p-5 text-sm">
            {pendingClients.map((c) => (
              <li key={c.id} className="flex items-start gap-2"><Users className="mt-0.5 size-4 text-rose" />حساب جديد بانتظار المراجعة: <b>{c.name}</b></li>
            ))}
            {outOfStock.slice(0, 3).map((p) => (
              <li key={p.slug} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 text-gold" />غير متوفر حالياً: {p.name}</li>
            ))}
            {pendingClients.length + outOfStock.length === 0 && <li className="text-muted-foreground">لا توجد تنبيهات.</li>}
          </ul>
        </Panel>
      </div>

      <Panel title="أحدث الطلبات" action={<Link to="/admin/orders" className="text-sm font-bold text-rose">عرض الكل</Link>}>
        <DataTable head={["رقم الطلب", "العميل", "المدينة", "الإجمالي", "الحالة"]}>
          {adminOrders.slice(0, 5).map((o) => (
            <tr key={o.id}>
              <td className="font-bold" dir="ltr">{o.id}</td><td>{o.client}</td><td>{o.city}</td><td>{sar(o.total)}</td>
              <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </div>
  );
}
