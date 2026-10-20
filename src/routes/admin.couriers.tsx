import { createFileRoute } from "@tanstack/react-router";
import { Star, Truck } from "lucide-react";
import { adminCouriers, courierStatusLabel, courierStatusTone } from "@/features/admin/data";
import { Badge, PageTitle } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/couriers")({ component: Couriers });

function Couriers() {
  return (
    <>
      <PageTitle title="المندوبون" desc="حالة فريق التوصيل وإنجاز مهام اليوم." />
      <div className="grid gap-4 md:grid-cols-2">
        {adminCouriers.map((c) => {
          const pct = c.today ? Math.round((c.done / c.today) * 100) : 0;
          return (
            <article key={c.id} className="rounded-2xl border bg-card p-5 shadow-soft">
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
