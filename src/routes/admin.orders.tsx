import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { adminCouriers, adminOrders, orderStatusLabel, orderStatusTone, sar, type OrderStatus } from "@/features/admin/data";
import { Badge, DataTable, FilterChips, PageTitle, Panel, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/orders")({ component: Orders });

const flow: OrderStatus[] = ["new", "preparing", "ready", "shipping", "delivered"];

function Orders() {
  const [orders, setOrders] = useState(adminOrders);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const list = useMemo(
    () => orders.filter((o) => (status === "all" || o.status === status) && (o.id + o.client + o.city).includes(q.trim())),
    [orders, q, status],
  );
  const update = (id: string, patch: Partial<(typeof orders)[number]>) =>
    setOrders((all) => all.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const advance = (id: string, s: OrderStatus) => {
    const next = flow[flow.indexOf(s) + 1];
    if (next) { update(id, { status: next }); toast.success(`تم تحديث ${id} إلى: ${orderStatusLabel[next]}`); }
  };

  const counts = flow.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));
  const totalValue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  return (
    <>
      <PageTitle title="الطلبات" desc="تابع الطلبات وحدّث حالتها وعيّن المندوب." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">قيمة الطلبات</p>
          <p className="mt-1 text-lg font-extrabold text-forest">{sar(totalValue)}</p>
        </div>
        {counts.map(({ s, n }) => (
          <button key={s} type="button" onClick={() => setStatus(status === s ? "all" : s)}
            className={`rounded-2xl border p-4 text-start shadow-soft transition hover:-translate-y-0.5 ${status === s ? "border-primary bg-primary/5" : "bg-card"}`}>
            <p className="text-xs text-muted-foreground">{orderStatusLabel[s]}</p>
            <p className="mt-1 text-lg font-extrabold text-forest">{n}</p>
          </button>
        ))}
      </div>
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث برقم الطلب أو العميل أو المدينة">
          <FilterChips value={status} onChange={setStatus} options={[["all", "الكل"], ...(Object.entries(orderStatusLabel) as [OrderStatus, string][])]} />
        </Toolbar>
        <DataTable head={["رقم الطلب", "العميل", "التاريخ", "الأصناف", "الإجمالي", "المندوب", "الحالة", ""]} empty={list.length === 0}>
          {list.map((o) => (
            <tr key={o.id}>
              <td className="font-bold" dir="ltr">{o.id}</td>
              <td>{o.client}<div className="text-xs text-muted-foreground">{o.city}</div></td>
              <td dir="ltr" className="text-end">{o.date}</td>
              <td>{o.items}</td>
              <td className="whitespace-nowrap">{sar(o.total)}</td>
              <td>
                <select aria-label={`مندوب ${o.id}`} value={o.courier ?? ""} disabled={o.status === "cancelled" || o.status === "delivered"}
                  onChange={(e) => { update(o.id, { courier: e.target.value || undefined }); toast.success("تم تعيين المندوب"); }}
                  className="h-9 rounded-lg border bg-surface px-2 text-xs">
                  <option value="">— غير معيّن —</option>
                  {adminCouriers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </td>
              <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
              <td className="whitespace-nowrap">
                {flow.indexOf(o.status) >= 0 && o.status !== "delivered" && (
                  <button onClick={() => advance(o.id, o.status)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">المرحلة التالية</button>
                )}
                {o.status === "new" && (
                  <button onClick={() => { update(o.id, { status: "cancelled" }); toast("تم إلغاء الطلب"); }} className="ms-2 text-xs font-bold text-destructive">إلغاء</button>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
