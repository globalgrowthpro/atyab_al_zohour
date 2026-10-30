import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminClients, clientStatusLabel, clientStatusTone, tierLabel, type ClientStatus, type PriceTier } from "@/features/admin/data";
import { Badge, DataTable, FilterChips, Meter, PageTitle, Panel, Toolbar, ExportButton, SelectFilter, uniq } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/clients")({ component: Clients });

function Clients() {
  const [clients, setClients] = useState(adminClients);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [tier, setTier] = useState("all");
  const patch = (id: string, v: Partial<(typeof clients)[number]>, msg: string) => {
    setClients((all) => all.map((c) => (c.id === id ? { ...c, ...v } : c)));
    toast.success(msg);
  };
  const list = clients.filter((c) => (status === "all" || c.status === status) && (city === "all" || c.city === city) && (type === "all" || c.type === type) && (tier === "all" || c.tier === tier) && (c.name + c.city + c.type).includes(q.trim()));
  const tiers = (Object.keys(tierLabel) as PriceTier[]).map((t) => ({ t, n: clients.filter((c) => c.tier === t).length }));
  const maxTier = Math.max(1, ...tiers.map((x) => x.n));
  return (
    <>
      <PageTitle title="حسابات العملاء" desc="وافق على الحسابات الجديدة وحدد فئة السعر لكل عميل." />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">إجمالي الحسابات</p><p className="mt-1 text-xl font-extrabold text-forest">{clients.length}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">مفعّلة</p><p className="mt-1 text-xl font-extrabold text-primary">{clients.filter((c) => c.status === "active").length}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">بانتظار الموافقة</p><p className="mt-1 text-xl font-extrabold text-rose">{clients.filter((c) => c.status === "pending").length}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="mb-2 text-xs text-muted-foreground">توزيع فئات الأسعار</p>
          <div className="space-y-2">
            {tiers.map(({ t, n }) => <Meter key={t} label={`فئة ${t}`} value={String(n)} pct={n / maxTier} tone={t === "A" ? "bg-gold" : t === "B" ? "bg-rose" : "bg-primary"} />)}
          </div>
        </div>
      </div>
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المنشأة أو المدينة">
          <FilterChips value={status} onChange={setStatus} options={[["all", "الكل"], ...(Object.entries(clientStatusLabel) as [ClientStatus, string][])]} />
          <SelectFilter label="النوع" value={type} onChange={setType} options={uniq(clients.map((c) => c.type))} />
          <SelectFilter label="المدينة" value={city} onChange={setCity} options={uniq(clients.map((c) => c.city))} />
          <SelectFilter label="الفئة" value={tier} onChange={setTier} options={Object.entries(tierLabel)} />
          <ExportButton file="clients" sheet="العملاء" rows={() => list.map((c) => ({ "الرقم": c.id, "المنشأة": c.name, "السجل التجاري": c.cr, "النوع": c.type, "المدينة": c.city, "الطلبات": c.orders, "فئة السعر": tierLabel[c.tier], "الحالة": clientStatusLabel[c.status] }))} />
        </Toolbar>
        <DataTable head={["المنشأة", "النوع", "المدينة", "الطلبات", "فئة السعر", "الحالة", ""]} empty={list.length === 0}>
          {list.map((c) => (
            <tr key={c.id} onClick={() => navigate({ to: "/admin/clients/$clientId", params: { clientId: c.id } })}
              className="cursor-pointer transition hover:bg-admin-head/60">
              <td><p className="font-bold text-forest underline-offset-4 group-hover:underline">{c.name}</p><p className="text-xs text-muted-foreground" dir="ltr">{c.id} · CR {c.cr}</p></td>
              <td>{c.type}</td><td>{c.city}</td><td>{c.orders}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <select aria-label={`فئة ${c.name}`} value={c.tier} onChange={(e) => patch(c.id, { tier: e.target.value as PriceTier }, "تم تحديث فئة السعر")}
                  className="h-9 rounded-lg border bg-surface px-2 text-xs">
                  {(Object.keys(tierLabel) as PriceTier[]).map((t) => <option key={t} value={t}>{tierLabel[t]}</option>)}
                </select>
              </td>
              <td><Badge tone={clientStatusTone[c.status]}>{clientStatusLabel[c.status]}</Badge></td>
              <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {c.status === "pending" && <>
                  <button onClick={() => patch(c.id, { status: "active" }, `تم تفعيل ${c.name}`)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">موافقة</button>
                  <button onClick={() => patch(c.id, { status: "suspended" }, "تم رفض الحساب")} className="ms-2 text-xs font-bold text-destructive">رفض</button>
                </>}
                {c.status === "active" && <button onClick={() => patch(c.id, { status: "suspended" }, "تم إيقاف الحساب")} className="text-xs font-bold text-destructive">إيقاف</button>}
                {c.status === "suspended" && <button onClick={() => patch(c.id, { status: "active" }, "تم إعادة التفعيل")} className="text-xs font-bold text-primary">إعادة تفعيل</button>}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
