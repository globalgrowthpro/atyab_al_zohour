import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, FileText, Package, TrendingUp, Truck, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  adminActivity, adminClients, adminCouriers, adminOrders, adminQuotes, categoryShare, hourlyOrders,
  orderStatusLabel, orderStatusTone, sar, weeklySales, type AdminActivity,
} from "@/features/admin/data";
import { Badge, DataTable, KpiCard, Panel, Radial } from "@/features/admin/shared";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/admin/")({ component: Overview });

const pieColors = ["#0B4D33", "#E7547A", "#D4AF37", "#4E8F6E", "#063321", "#B23A5E", "#8A7A3A"];

const activityIcon: Record<AdminActivity["icon"], typeof ClipboardList> = {
  order: ClipboardList, client: Users, quote: FileText, courier: Truck, ticket: AlertTriangle,
};

function Overview() {
  const revenue = weeklySales.reduce((s, d) => s + d.total, 0);
  const active = adminOrders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
  const delivered = adminOrders.filter((o) => o.status === "delivered").length;
  const pendingClients = adminClients.filter((c) => c.status === "pending");
  const pendingQuotes = adminQuotes.filter((q) => q.status === "pending").length;
  const outOfStock = products.filter((p) => !p.available);
  const couriersOnRoute = adminCouriers.filter((c) => c.status === "on-route").length;
  const todayTotal = hourlyOrders.reduce((s, h) => s + h.orders, 0);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={TrendingUp} label="مبيعات الأسبوع" value={sar(revenue)} trend="+12%" trendUp hint="مقارنة بالأسبوع الماضي" />
        <KpiCard icon={ClipboardList} label="طلبات قيد التنفيذ" value={String(active)} trend={`${adminOrders.length} إجمالي`} trendUp />
        <KpiCard icon={FileText} label="عروض بانتظار التسعير" value={String(pendingQuotes)} trend="تحتاج إجراء" trendUp={false} />
        <KpiCard icon={Users} label="حسابات بانتظار الموافقة" value={String(pendingClients.length)} trend="تحتاج إجراء" trendUp={false} />
      </div>

      {/* Sales area chart + category donut */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="المبيعات اليومية" action={<span className="text-xs text-muted-foreground">آخر 7 أيام</span>}>
          <div className="h-64 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B4D33" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0B4D33" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={48}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => [sar(Number(v)), "المبيعات"]} labelStyle={{ fontWeight: 700 }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontFamily: "Tajawal" }} />
                <Area type="monotone" dataKey="total" stroke="#0B4D33" strokeWidth={2.5} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="المبيعات حسب التصنيف" action={<span className="text-xs text-muted-foreground">هذا الشهر</span>}>
          <div className="flex flex-col items-center gap-4 p-5">
            <div className="h-44 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                    {categoryShare.map((c, i) => <Cell key={c.name} fill={pieColors[i % pieColors.length] ?? "#0B4D33"} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, "الحصة"]} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontFamily: "Tajawal" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {categoryShare.map((c, i) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="truncate">{c.name}</span>
                  <span className="ms-auto font-bold text-forest">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Hourly orders + delivery gauges + alerts */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="طلبات اليوم بالساعة" action={<span className="text-xs text-muted-foreground">{todayTotal} طلباً اليوم</span>}>
          <div className="h-52 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyOrders} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="h" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip formatter={(v) => [v, "طلبات"]} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontFamily: "Tajawal" }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="#E7547A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="مؤشرات التشغيل">
          <div className="grid grid-cols-2 gap-4 p-5">
            <Radial pct={Math.round((delivered / adminOrders.length) * 100)} label="نسبة التسليم" sub={`${delivered} من ${adminOrders.length} طلبات`} />
            <Radial pct={Math.round((couriersOnRoute / adminCouriers.length) * 100)} label="المندوبون في الميدان" sub={`${couriersOnRoute} من ${adminCouriers.length}`} />
            <Radial pct={Math.round(((products.length - outOfStock.length) / products.length) * 100)} label="توفر المخزون" sub={`${outOfStock.length} غير متوفر`} />
            <Radial pct={Math.round((adminClients.filter((c) => c.status === "active").length / adminClients.length) * 100)} label="حسابات مفعّلة" sub={`${adminClients.length} حساب`} />
          </div>
        </Panel>
        <Panel title="تنبيهات">
          <ul className="space-y-3 p-5 text-sm">
            {pendingClients.map((c) => (
              <li key={c.id} className="flex items-start gap-2"><Users className="mt-0.5 size-4 shrink-0 text-rose" />حساب جديد بانتظار المراجعة: <b>{c.name}</b></li>
            ))}
            {outOfStock.slice(0, 3).map((p) => (
              <li key={p.slug} className="flex items-start gap-2"><Package className="mt-0.5 size-4 shrink-0 text-gold" />غير متوفر حالياً: {p.name}</li>
            ))}
            {pendingClients.length + outOfStock.length === 0 && <li className="text-muted-foreground">لا توجد تنبيهات.</li>}
          </ul>
        </Panel>
      </div>

      {/* Activity feed + latest orders */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Panel title="آخر النشاطات">
          <ul className="divide-y">
            {adminActivity.map((a) => {
              const Icon = activityIcon[a.icon];
              return (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blush text-rose"><Icon className="size-4" /></span>
                  <div className="min-w-0">
                    <p className="text-sm leading-6">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
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
    </div>
  );
}
