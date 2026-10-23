import { createFileRoute } from "@tanstack/react-router";
import { Star, Truck } from "lucide-react";
import { useState } from "react";
import { type CourierStatus, adminCouriers, courierStatusLabel, courierStatusTone } from "@/features/admin/data";
import { Badge, ExportButton, FilterChips, PageTitle, Panel, SelectFilter, Toolbar, uniq } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/couriers")({ component: Couriers });

function Couriers() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CourierStatus | "all">("all");
  const [zone, setZone] = useState("all");
  const list = adminCouriers.filter((c) => (status === "all" || c.status === status) && (zone === "all" || c.zone === zone) && (c.name + c.zone + c.vehicle).includes(q.trim()));
  const totalTasks = adminCouriers.reduce((s, c) => s + c.today, 0);
  const doneTasks = adminCouriers.reduce((s, c) => s + c.done, 0);
  const onRoute = adminCouriers.filter((c) => c.status === "on-route").length;
  const avgRating = (adminCouriers.reduce((s, c) => s + c.rating, 0) / adminCouriers.length).toFixed(1);
  return (
    <>
      <PageTitle title="المندوبون" desc="حالة فريق التوصيل وإنجاز مهام اليوم." />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">في جولة الآن</p><p className="mt-1 text-xl font-extrabold text-forest">{onRoute} من {adminCouriers.length}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">مهام اليوم</p><p className="mt-1 text-xl font-extrabold text-forest">{doneTasks} / {totalTasks}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">نسبة الإنجاز</p><p className="mt-1 text-xl font-extrabold text-primary">{totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">متوسط التقييم</p><p className="mt-1 flex items-center gap-1 text-xl font-extrabold text-forest"><Star className="size-5 fill-gold text-gold" />{avgRating}</p></div>
      </div>
      <div className="mb-4"><Panel><Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المندوب أو المنطقة">
        <FilterChips value={status} onChange={setStatus} options={[["all", "الكل"], ...(Object.entries(courierStatusLabel) as [CourierStatus, string][])]} />
        <SelectFilter label="المنطقة" value={zone} onChange={setZone} options={uniq(adminCouriers.map((c) => c.zone))} />
        <ExportButton file="couriers" sheet="المندوبون" rows={() => list.map((c) => ({ "المندوب": c.name, "المنطقة": c.zone, "المركبة": c.vehicle, "مهام اليوم": c.today, "المنجزة": c.done, "التقييم": c.rating, "الحالة": courierStatusLabel[c.status] }))} />
      </Toolbar></Panel></div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => {
          const pct = c.today ? Math.round((c.done / c.today) * 100) : 0;
          return (
            <article key={c.id} className="rounded-2xl border bg-admin-panel p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Truck className="size-6" /></span>
                  <div><h3 className="text-lg">{c.name}</h3><p className="text-xs text-muted-foreground">{c.zone} · {c.vehicle}</p></div>
                </div>
                <Badge tone={courierStatusTone[c.status]}>{courierStatusLabel[c.status]}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>مهام اليوم: <b>{c.done}</b> / {c.today}</span>
                <span className="flex items-center gap-1 text-forest"><Star className="size-4 fill-gold text-gold" />{c.rating}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
            </article>
          );
        })}
      </div>
    </>
  );
}
