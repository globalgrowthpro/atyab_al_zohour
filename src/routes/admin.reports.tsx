import { createFileRoute } from "@tanstack/react-router";
import { adminOrders, orderStatusLabel, sar, type OrderStatus } from "@/features/admin/data";
import { PageTitle, Panel } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

function Reports() {
  const done = adminOrders.filter((o) => o.status !== "cancelled");
  const byClient = Object.entries(done.reduce<Record<string, number>>((m, o) => ({ ...m, [o.client]: (m[o.client] ?? 0) + o.total }), {})).sort((a, b) => b[1] - a[1]);
  const byCity = Object.entries(done.reduce<Record<string, number>>((m, o) => ({ ...m, [o.city]: (m[o.city] ?? 0) + o.total }), {})).sort((a, b) => b[1] - a[1]);
  const byStatus = Object.entries(adminOrders.reduce<Record<string, number>>((m, o) => ({ ...m, [o.status]: (m[o.status] ?? 0) + 1 }), {}));
  const top = byClient[0]?.[1] ?? 1;
  const topCity = byCity[0]?.[1] ?? 1;
  return (
    <>
      <PageTitle title="التقارير" desc="ملخص أداء المبيعات (بيانات تجريبية)." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="أعلى العملاء مبيعاً">
          <ul className="space-y-3 p-5">
            {byClient.map(([name, v]) => <Bar key={name} label={name} value={v} pct={v / top} />)}
          </ul>
        </Panel>
        <Panel title="المبيعات حسب المدينة">
          <ul className="space-y-3 p-5">
            {byCity.map(([name, v]) => <Bar key={name} label={name} value={v} pct={v / topCity} />)}
          </ul>
        </Panel>
        <Panel title="الطلبات حسب الحالة">
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
            {byStatus.map(([s, n]) => (
              <div key={s} className="rounded-xl bg-muted/50 p-4 text-center">
                <p className="text-2xl font-extrabold text-forest">{n}</p>
                <p className="text-xs text-muted-foreground">{orderStatusLabel[s as OrderStatus]}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Bar({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <li>
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-bold text-forest">{sar(value)}</span></div>
      <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-rose" style={{ width: `${pct * 100}%` }} /></div>
    </li>
  );
}
