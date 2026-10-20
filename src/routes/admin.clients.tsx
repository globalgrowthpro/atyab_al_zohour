import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminClients, clientStatusLabel, clientStatusTone, tierLabel, type ClientStatus, type PriceTier } from "@/features/admin/data";
import { Badge, DataTable, FilterChips, PageTitle, Panel, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/clients")({ component: Clients });

function Clients() {
  const [clients, setClients] = useState(adminClients);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const patch = (id: string, v: Partial<(typeof clients)[number]>, msg: string) => {
    setClients((all) => all.map((c) => (c.id === id ? { ...c, ...v } : c)));
    toast.success(msg);
  };
  const list = clients.filter((c) => (status === "all" || c.status === status) && (c.name + c.city + c.type).includes(q.trim()));
  return (
    <>
      <PageTitle title="حسابات العملاء" desc="وافق على الحسابات الجديدة وحدد فئة السعر لكل عميل." />
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المنشأة أو المدينة">
          <FilterChips value={status} onChange={setStatus} options={[["all", "الكل"], ...(Object.entries(clientStatusLabel) as [ClientStatus, string][])]} />
        </Toolbar>
        <DataTable head={["المنشأة", "النوع", "المدينة", "الطلبات", "فئة السعر", "الحالة", ""]} empty={list.length === 0}>
          {list.map((c) => (
            <tr key={c.id}>
              <td><p className="font-bold text-forest">{c.name}</p><p className="text-xs text-muted-foreground" dir="ltr">{c.id} · CR {c.cr}</p></td>
              <td>{c.type}</td><td>{c.city}</td><td>{c.orders}</td>
              <td>
                <select aria-label={`فئة ${c.name}`} value={c.tier} onChange={(e) => patch(c.id, { tier: e.target.value as PriceTier }, "تم تحديث فئة السعر")}
                  className="h-9 rounded-lg border bg-background px-2 text-xs">
                  {(Object.keys(tierLabel) as PriceTier[]).map((t) => <option key={t} value={t}>{tierLabel[t]}</option>)}
                </select>
              </td>
              <td><Badge tone={clientStatusTone[c.status]}>{clientStatusLabel[c.status]}</Badge></td>
              <td className="whitespace-nowrap">
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
