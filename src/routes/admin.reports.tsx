import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useChartTheme } from "@/features/admin/theme";

import { adminOrders, orderStatusLabel, orderStatusTone, sar, weeklySales, type OrderStatus } from "@/features/admin/data";
import { useState } from "react";
import { Badge, ExportButton, Meter, PageTitle, Panel, SelectFilter, uniq } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

function Reports() {
  const chart = useChartTheme();
  const statusColors: Record<OrderStatus, string> = {
    new: "#E7547A", preparing: "#D4AF37", ready: chart.sage, shipping: chart.line, delivered: "#9CA3AF", cancelled: "#DC2626",
  };

  const [city, setCity] = useState("all");
  const [status, setStatus] = useState("all");
  const orders = adminOrders.filter((o) => (city === "all" || o.city === city) && (status === "all" || o.status === status));
  const done = orders.filter((o) => o.status !== "cancelled");
  const byClient = Object.entries(done.reduce<Record<string, number>>((m, o) => ({ ...m, [o.client]: (m[o.client] ?? 0) + o.total }), {})).sort((a, b) => b[1] - a[1]);
  const byCity = Object.entries(done.reduce<Record<string, number>>((m, o) => ({ ...m, [o.city]: (m[o.city] ?? 0) + o.total }), {})).sort((a, b) => b[1] - a[1]);
  const byStatus = (Object.keys(orderStatusLabel) as OrderStatus[])
    .map((s) => ({ status: s, name: orderStatusLabel[s], count: orders.filter((o) => o.status === s).length }))
    .filter((x) => x.count > 0);
  const top = byClient[0]?.[1] ?? 1;
  const topCity = byCity[0]?.[1] ?? 1;
  const cityData = byCity.map(([name, total]) => ({ name, total }));

  return (
    <>
      <PageTitle title="التقارير" desc="ملخص أداء المبيعات (بيانات تجريبية)." action={<div className="flex flex-wrap gap-2">
        <SelectFilter label="المدينة" value={city} onChange={setCity} options={uniq(adminOrders.map((o) => o.city))} />
        <SelectFilter label="الحالة" value={status} onChange={setStatus} options={Object.entries(orderStatusLabel)} />
        <ExportButton file="sales-report" sheet="تقرير المبيعات" rows={() => [
          ...byClient.map(([name, v]) => ({ "النوع": "عميل", "الاسم": name, "المبيعات (ر.س)": v })),
          ...byCity.map(([name, v]) => ({ "النوع": "مدينة", "الاسم": name, "المبيعات (ر.س)": v })),
          ...byStatus.map((x) => ({ "النوع": "حالة", "الاسم": x.name, "المبيعات (ر.س)": x.count })),
        ]} />
      </div>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="مقارنة المبيعات اليومية" action={<span className="text-xs text-muted-foreground">آخر 7 أيام</span>}>
          <div className="h-64 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: chart.tick }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false} width={48}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => [sar(Number(v)), "المبيعات"]} contentStyle={chart.tooltip} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {weeklySales.map((d) => <Cell key={d.day} fill={d.total === Math.max(...weeklySales.map((x) => x.total)) ? chart.rose : chart.line} />)}

                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="الطلبات حسب الحالة">
          <div className="flex flex-col items-center gap-4 p-5">
            <div className="h-48 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="count" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                    {byStatus.map((s) => <Cell key={s.status} fill={statusColors[s.status]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [v, "طلبات"]} contentStyle={chart.tooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-wrap justify-center gap-2">
              {byStatus.map((s) => (
                <li key={s.status} className="flex items-center gap-1.5 text-xs">
                  <Badge tone={orderStatusTone[s.status]}>{s.name}: {s.count}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel title="المبيعات حسب المدينة">
          <div className="h-56 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: chart.tickStrong }} axisLine={false} tickLine={false} width={64} />
                <Tooltip formatter={(v) => [sar(Number(v)), "المبيعات"]} contentStyle={chart.tooltip} />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} fill={chart.sage} />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="أعلى العملاء مبيعاً">
          <ul className="space-y-4 p-5">
            {byClient.map(([name, v]) => <li key={name}><Meter label={name} value={sar(v)} pct={v / top} tone="bg-rose" /></li>)}
          </ul>
        </Panel>
      </div>
    </>
  );
}
