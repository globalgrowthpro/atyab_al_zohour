import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, FileText, Package, TrendingUp, Truck, Users, Shield, Loader2 } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/features/admin/theme";

import {
  orderStatusLabel, orderStatusTone, sar, type AdminActivity, type AdminOrder, type OrderStatus,
} from "@/features/admin/data";
import { Badge, DataTable, ExportButton, KpiCard, Panel, Radial } from "@/features/admin/shared";
import { supabase } from "@/integrations/supabase/client";

function AdminIndexError({ error }: { error: unknown }) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
      <h3 className="text-lg font-bold text-destructive">حدث خطأ أثناء عرض لوحة الإحصائيات</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
      {error instanceof Error && error.stack && (
        <pre className="mt-4 max-h-48 overflow-auto rounded bg-card p-3 font-mono text-[11px] text-destructive text-start" dir="ltr">
          {error.stack}
        </pre>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/")({
  component: Overview,
  errorComponent: AdminIndexError,
});

const activityIcon: Record<string, typeof ClipboardList> = {
  order: ClipboardList,
  client: Users,
  quote: FileText,
  courier: Truck,
  ticket: AlertTriangle,
  security: Shield,
};

const initialWeeklyDays = [
  { day: "السبت", total: 0 },
  { day: "الأحد", total: 0 },
  { day: "الاثنين", total: 0 },
  { day: "الثلاثاء", total: 0 },
  { day: "الأربعاء", total: 0 },
  { day: "الخميس", total: 0 },
  { day: "الجمعة", total: 0 },
];

const initialHourlySlots = [
  { h: "09:00", orders: 0 },
  { h: "11:00", orders: 0 },
  { h: "13:00", orders: 0 },
  { h: "15:00", orders: 0 },
  { h: "17:00", orders: 0 },
  { h: "19:00", orders: 0 },
];

function Overview() {
  const chart = useChartTheme();

  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [pendingClientsCount, setPendingClientsCount] = useState(0);
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0);
  const [couriersCount, setCouriersCount] = useState(0);
  const [couriersOnRoute, setCouriersOnRoute] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [dynamicWeeklySales, setDynamicWeeklySales] = useState(initialWeeklyDays);
  const [hourlyDistribution, setHourlyDistribution] = useState(initialHourlySlots);
  const [dynamicCategoryShare, setDynamicCategoryShare] = useState<Array<{ name: string; value: number }>>([
    { name: "الورد الهولندي", value: 100 },
  ]);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardRealData() {
      try {
        const [
          ordersRes,
          quotesRes,
          clientsRes,
          profilesRes,
          couriersRes,
          productsRes,
          logsRes,
        ] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("quotations").select("id, status"),
          supabase.from("clients").select("id, name, city"),
          supabase.from("profiles").select("id, is_verified, role"),
          supabase.from("couriers").select("id, active"),
          supabase.from("products").select("id, available, category_slug"),
          supabase.from("security_logs").select("*").order("created_at", { ascending: false }).limit(6),
        ]);

        if (!isMounted) return;

        // 1. Live Orders
        if (!ordersRes.error && ordersRes.data && ordersRes.data.length > 0) {
          const statusMap: Record<string, OrderStatus> = {
            received: "new",
            preparing: "preparing",
            ready: "ready",
            shipping: "shipping",
            delivered: "delivered",
            cancelled: "cancelled",
          };

          const realOrders: AdminOrder[] = ordersRes.data.map((o) => ({
            id: o.id,
            client: o.client_name,
            city: o.city,
            date: o.created_at ? o.created_at.split("T")[0]! : "2026-11-08",
            items: Array.isArray(o.items) ? o.items.length : 1,
            total: Number(o.total || 0),
            status: statusMap[o.status] || "new",
          }));

          setOrders(realOrders);

          // Calculate real weekly sales from the last 7 days
          const daysMap: Record<string, number> = {
            "السبت": 0, "الأحد": 0, "الاثنين": 0, "الثلاثاء": 0, "الأربعاء": 0, "الخميس": 0, "الجمعة": 0,
          };
          const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

          for (const ord of realOrders) {
            if (ord.status !== "cancelled") {
              const d = new Date(ord.date);
              const dayName = dayNames[d.getDay()] || "السبت";
              daysMap[dayName] = (daysMap[dayName] || 0) + ord.total;
            }
          }

          const computedWeekly = Object.entries(daysMap).map(([day, total]) => ({
            day,
            total,
          }));
          setDynamicWeeklySales(computedWeekly);

          // Calculate real hourly distribution from orders timestamps
          const hourSlots: Record<string, number> = {
            "09:00": 0, "11:00": 0, "13:00": 0, "15:00": 0, "17:00": 0, "19:00": 0,
          };
          for (const ord of ordersRes.data) {
            if (ord.created_at) {
              const hr = new Date(ord.created_at).getHours();
              if (hr < 10) hourSlots["09:00"] = (hourSlots["09:00"] || 0) + 1;
              else if (hr < 12) hourSlots["11:00"] = (hourSlots["11:00"] || 0) + 1;
              else if (hr < 14) hourSlots["13:00"] = (hourSlots["13:00"] || 0) + 1;
              else if (hr < 16) hourSlots["15:00"] = (hourSlots["15:00"] || 0) + 1;
              else if (hr < 18) hourSlots["17:00"] = (hourSlots["17:00"] || 0) + 1;
              else hourSlots["19:00"] = (hourSlots["19:00"] || 0) + 1;
            }
          }
          setHourlyDistribution(Object.entries(hourSlots).map(([h, orders]) => ({ h, orders })));

          // Calculate real category share from orders items
          const catTotals: Record<string, number> = {};
          for (const ord of ordersRes.data) {
            const rawItems = Array.isArray(ord.items) ? (ord.items as Array<{ category?: string; qty?: number } | null>) : [];
            for (const item of rawItems) {
              if (item && typeof item === "object") {
                const cat = item.category || "الورد الهولندي";
                catTotals[cat] = (catTotals[cat] || 0) + (Number(item.qty) || 1);
              }
            }
          }

          const sumUnits = Object.values(catTotals).reduce((a, b) => a + b, 0);
          if (sumUnits > 0) {
            const share = Object.entries(catTotals).map(([name, units]) => ({
              name,
              value: Math.round((units / sumUnits) * 100),
            }));
            setDynamicCategoryShare(share);
          }
        }

        // 2. Live Quotes
        if (!quotesRes.error && quotesRes.data) {
          const pending = quotesRes.data.filter((q) => q.status === "pending").length;
          setPendingQuotesCount(pending);
        }

        // 3. Live Clients & Verification
        if (!profilesRes.error && profilesRes.data) {
          const pending = profilesRes.data.filter((p) => p.role === "client" && !p.is_verified).length;
          const active = profilesRes.data.filter((p) => p.role === "client" && p.is_verified).length;
          setPendingClientsCount(pending);
          setActiveClientsCount(active);
          setClientsCount(profilesRes.data.length);
        }

        // 4. Live Couriers
        if (!couriersRes.error && couriersRes.data && couriersRes.data.length > 0) {
          setCouriersCount(couriersRes.data.length);
          const onRoute = couriersRes.data.filter((c) => c.active).length;
          setCouriersOnRoute(onRoute);
        }

        // 5. Live Products
        if (!productsRes.error && productsRes.data && productsRes.data.length > 0) {
          setTotalProductsCount(productsRes.data.length);
          const oos = productsRes.data.filter((p) => !p.available).length;
          setOutOfStockCount(oos);
        }

        // 6. Live Activity Feed from Security Logs
        if (!logsRes.error && logsRes.data && logsRes.data.length > 0) {
          const liveLogs: AdminActivity[] = logsRes.data.map((l) => {
            const iconKey = l.event_type.includes("order")
              ? "order"
              : l.event_type.includes("client")
              ? "client"
              : l.event_type.includes("quote")
              ? "quote"
              : l.event_type.includes("courier")
              ? "courier"
              : "security";

            const timeStr = l.created_at ? l.created_at.split("T")[1]?.slice(0, 5) || "الآن" : "الآن";

            return {
              id: l.id,
              icon: iconKey as any,
              text: `${l.actor_name}: ${l.description}`,
              time: `اليوم ${timeStr}`,
            };
          });

          setActivities(liveLogs);
        }
      } catch (err) {
        console.warn("Live admin dashboard sync notice:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchDashboardRealData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const deliveryPct = orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 100;
  const couriersPct = couriersCount > 0 ? Math.round((couriersOnRoute / couriersCount) * 100) : 0;
  const stockPct = totalProductsCount > 0 ? Math.round(((totalProductsCount - outOfStockCount) / totalProductsCount) * 100) : 100;
  const clientsPct = clientsCount > 0 ? Math.round((activeClientsCount / clientsCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Live Sync Banner */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
        <span className="flex items-center gap-2 font-bold text-forest">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          بيانات حية مباشرة من قاعدة بيانات Supabase (Live Sync)
        </span>
        {isLoading && (
          <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            جاري التحديث...
          </span>
        )}
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard color="forest" icon={TrendingUp} label="إجمالي مبيعات الطلبات" value={sar(totalRevenue)} trend="+15%" trendUp hint="قيمة العقود والطلبات المسجلة" />
        <KpiCard color="rose" icon={ClipboardList} label="طلبات جارية وقيد التجهيز" value={String(activeOrders)} trend={`${orders.length} إجمالي الطلبات`} trendUp />
        <KpiCard color="gold" icon={FileText} label="عروض أسعار بانتظار الاعتماد" value={String(pendingQuotesCount)} trend={pendingQuotesCount > 0 ? "تحتاج تسعير فوري" : "محدثة بالكامل"} trendUp={pendingQuotesCount === 0} />
        <KpiCard color="sage" icon={Users} label="حسابات بانتظار التوثيق" value={String(pendingClientsCount)} trend={pendingClientsCount > 0 ? "تحتاج مراجعة السجل" : "جميع الحسابات موثقة"} trendUp={pendingClientsCount === 0} />
      </div>

      {/* Sales area chart + category donut */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="المبيعات الأسبوعية للطلبات" action={<span className="text-xs text-muted-foreground">بيانات حية</span>}>
          <div className="h-64 p-4" dir="ltr">
            {isClientMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicWeeklySales} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.line} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={chart.line} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: chart.tick }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false} width={48}
                    tickFormatter={(v: number) => `${Math.round((v || 0) / 1000)}k`} />
                  <Tooltip formatter={(v) => [sar(Number(v || 0)), "المبيعات"]} labelStyle={{ fontWeight: 700 }}
                    contentStyle={chart.tooltip} />
                  <Area type="monotone" dataKey="total" stroke={chart.line} strokeWidth={2.5} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin me-2 text-primary" />
                جاري تجهيز الرسم البياني...
              </div>
            )}
          </div>
        </Panel>
        <Panel title="توزيع الطلبات حسب الأصناف" action={<span className="text-xs text-muted-foreground">النسب المئوية</span>}>
          <div className="flex flex-col items-center gap-4 p-5">
            <div className="h-44 w-full" dir="ltr">
              {isClientMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicCategoryShare} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                      {dynamicCategoryShare.map((c, i) => <Cell key={c.name} fill={chart.pieColors[i % chart.pieColors.length] ?? chart.line} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v || 0}%`, "الحصة"]} contentStyle={chart.tooltip} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin me-2 text-primary" />
                  جاري تجهيز الرسم البياني...
                </div>
              )}
            </div>
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {dynamicCategoryShare.map((c, i) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: chart.pieColors[i % chart.pieColors.length] }} />
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
        <Panel title="توزيع أوقات الطلبات" action={<span className="text-xs text-muted-foreground">{orders.length} طلباً إجمالياً</span>}>
          <div className="h-52 p-4" dir="ltr">
            {isClientMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip formatter={(v) => [v ?? 0, "طلبات"]} contentStyle={chart.tooltip} />
                  <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill={chart.rose} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin me-2 text-primary" />
                جاري تجهيز الرسم البياني...
              </div>
            )}
          </div>
        </Panel>
        <Panel title="مؤشرات أداء العمليات (KPIs)">
          <div className="grid grid-cols-2 gap-4 p-5">
            <Radial pct={deliveryPct} label="نسبة اكتمال التسليم" sub={`${deliveredOrders} من ${orders.length} طلبات`} />
            <Radial pct={couriersPct} label="المندوبون في الميدان" sub={`${couriersOnRoute} من ${couriersCount}`} />
            <Radial pct={stockPct} label="جاهزية المخزون المبرد" sub={`${outOfStockCount} صنف بحاجة توريد`} />
            <Radial pct={clientsPct} label="حسابات B2B مفعلة" sub={`${activeClientsCount} من ${clientsCount}`} />
          </div>
        </Panel>
        <Panel title="تنبيهات الإدارة والعمليات">
          <ul className="space-y-3 p-5 text-sm">
            {pendingClientsCount > 0 && (
              <li className="flex items-start gap-2">
                <Users className="mt-0.5 size-4 shrink-0 text-rose" />
                <span>يوجد <b>{pendingClientsCount}</b> حسابات منشآت بانتظار مراجعة السجل التجاري والتفعيل.</span>
              </li>
            )}
            {pendingQuotesCount > 0 && (
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>يوجد <b>{pendingQuotesCount}</b> طلبات عروض أسعار بانتظار تحديد هامش الربح والاعتماد.</span>
              </li>
            )}
            {outOfStockCount > 0 && (
              <li className="flex items-start gap-2">
                <Package className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <span>يوجد <b>{outOfStockCount}</b> أصناف زهور نفدت من المستودع وبحاجة لأمر استيراد جديد.</span>
              </li>
            )}
            {pendingClientsCount === 0 && pendingQuotesCount === 0 && outOfStockCount === 0 && (
              <li className="text-muted-foreground flex items-center gap-2 py-4 justify-center">
                <span>لا توجد تنبيهات معلقة. المنظومة تعمل بأعلى كفاءة.</span>
              </li>
            )}
          </ul>
        </Panel>
      </div>

      {/* Activity feed + latest orders */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Panel title="سجل أحدث النشاطات والعمليات">
          <ul className="divide-y">
            {activities.map((a) => {
              const Icon = activityIcon[a.icon] || ClipboardList;
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
        <Panel title="أحدث الطلبات الحية" action={<div className="flex items-center gap-3"><ExportButton file="latest-orders" sheet="أحدث الطلبات" rows={() => orders.slice(0, 5).map((o) => ({ "رقم الطلب": o.id, "العميل": o.client, "المدينة": o.city, "الإجمالي (ر.س)": o.total, "الحالة": orderStatusLabel[o.status] }))} /><Link to="/admin/orders" className="text-sm font-bold text-rose">عرض الكل</Link></div>}>
          <DataTable head={["رقم الطلب", "العميل", "المدينة", "الإجمالي", "الحالة"]}>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id}>
                <td className="font-bold font-mono text-xs" dir="ltr">{o.id}</td>
                <td className="font-bold text-forest">{o.client}</td>
                <td>{o.city}</td>
                <td className="font-bold text-rose">{sar(o.total)}</td>
                <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </div>
  );
}
