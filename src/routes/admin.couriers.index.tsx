import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { type AdminCourier, type CourierStatus, courierStatusLabel, courierStatusTone } from "@/features/admin/data";
import { Badge, ExportButton, FilterChips, PageTitle, Panel, SelectFilter, Toolbar, uniq } from "@/features/admin/shared";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/couriers/")({ component: Couriers });

function Couriers() {
  const [couriers, setCouriers] = useState<AdminCourier[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CourierStatus | "all">("all");
  const [zone, setZone] = useState("all");

  // Load couriers and tasks from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadCouriers() {
      try {
        const [couriersRes, tasksRes] = await Promise.all([
          supabase.from("couriers").select("*").order("id", { ascending: true }),
          supabase.from("delivery_tasks").select("courier_id, status"),
        ]);

        if (isMounted && couriersRes.data) {
          const tasks = tasksRes.data || [];
          const remoteList: AdminCourier[] = couriersRes.data.map((c) => {
            const courierTasks = tasks.filter((t) => t.courier_id === c.id);
            const done = courierTasks.filter((t) => t.status === "delivered").length;
            const onRoute = courierTasks.some((t) => t.status === "out_for_delivery");
            const cStatus: CourierStatus = !c.active ? "off" : onRoute ? "on-route" : "available";

            return {
              id: c.id,
              name: c.name,
              zone: `${c.city} — ${c.vehicle}`,
              vehicle: c.vehicle,
              today: courierTasks.length,
              done,
              rating: 4.8,
              status: cStatus,
            };
          });

          setCouriers(remoteList);
        }
      } catch (err) {
        console.warn("Couriers load notice:", err);
      }
    }

    void loadCouriers();
    return () => {
      isMounted = false;
    };
  }, []);

  const list = couriers.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      (zone === "all" || c.zone === zone) &&
      (c.name + c.zone + c.vehicle).includes(q.trim())
  );

  const totalTasks = couriers.reduce((s, c) => s + c.today, 0);
  const doneTasks = couriers.reduce((s, c) => s + c.done, 0);
  const onRoute = couriers.filter((c) => c.status === "on-route").length;
  const avgRating = (couriers.reduce((s, c) => s + c.rating, 0) / (couriers.length || 1)).toFixed(1);

  return (
    <RequirePermission permission="manage:couriers" fallbackMessage="إدارة وتتبع مناديب التوصيل والأسطول المبرد مقتصرة على مدراء العمليات والنظام.">
      <PageTitle title="المندوبون" desc="حالة فريق التوصيل وإنجاز مهام اليوم وسلسلة التبريد." />
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">في جولة الآن</p>
          <p className="mt-1 text-xl font-extrabold text-forest">{onRoute} من {couriers.length}</p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">مهام اليوم</p>
          <p className="mt-1 text-xl font-extrabold text-forest">{doneTasks} / {totalTasks}</p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
          <p className="mt-1 text-xl font-extrabold text-primary">{totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%</p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">متوسط التقييم</p>
          <p className="mt-1 flex items-center gap-1 text-xl font-extrabold text-forest">
            <Star className="size-5 fill-gold text-gold" />{avgRating}
          </p>
        </div>
      </div>
      <div className="mb-4">
        <Panel>
          <Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المندوب أو المنطقة">
            <FilterChips
              value={status}
              onChange={setStatus}
              options={[["all", "الكل"], ...(Object.entries(courierStatusLabel) as [CourierStatus, string][])]}
            />
            <SelectFilter label="المنطقة" value={zone} onChange={setZone} options={uniq(couriers.map((c) => c.zone))} />
            <ExportButton
              file="couriers"
              sheet="المندوبون"
              rows={() =>
                list.map((c) => ({
                  المندوب: c.name,
                  المنطقة: c.zone,
                  المركبة: c.vehicle,
                  "مهام اليوم": c.today,
                  المنجزة: c.done,
                  التقييم: c.rating,
                  الحالة: courierStatusLabel[c.status],
                }))
              }
            />
          </Toolbar>
        </Panel>
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => {
          const pct = c.today ? Math.round((c.done / c.today) * 100) : 0;
          return (
            <Link
              key={c.id}
              to="/admin/couriers/$courierId"
              params={{ courierId: c.id }}
              className="block rounded-2xl border bg-admin-panel p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Truck className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.zone} · {c.vehicle}</p>
                  </div>
                </div>
                <Badge tone={courierStatusTone[c.status]}>{courierStatusLabel[c.status]}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>مهام اليوم: <b>{c.done}</b> / {c.today}</span>
                <span className="flex items-center gap-1 text-forest">
                  <Star className="size-4 fill-gold text-gold" />{c.rating}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </RequirePermission>
  );
}
