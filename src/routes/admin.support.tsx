import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminTickets, ticketStatusLabel, ticketStatusTone } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/support")({ component: Support });

function Support() {
  const [tickets, setTickets] = useState(adminTickets);
  const close = (id: string) => { setTickets((t) => t.map((x) => (x.id === id ? { ...x, status: "closed" as const } : x))); toast.success("تم إغلاق التذكرة"); };
  const open = tickets.filter((t) => t.status === "open").length;
  const answered = tickets.filter((t) => t.status === "answered").length;
  const closed = tickets.filter((t) => t.status === "closed").length;
  return (
    <>
      <PageTitle title="تذاكر الدعم" desc="استفسارات وطلبات العملاء." />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">مفتوحة</p><p className="mt-1 text-xl font-extrabold text-rose">{open}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">تم الرد</p><p className="mt-1 text-xl font-extrabold text-forest">{answered}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">مغلقة</p><p className="mt-1 text-xl font-extrabold text-muted-foreground">{closed}</p></div>
      </div>
      <Panel>
        <DataTable head={["التذكرة", "العميل", "الموضوع", "التاريخ", "الحالة", ""]}>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td className="font-bold" dir="ltr">{t.id}</td><td>{t.client}</td><td>{t.subject}</td>
              <td dir="ltr" className="text-end">{t.date}</td>
              <td><Badge tone={ticketStatusTone[t.status]}>{ticketStatusLabel[t.status]}</Badge></td>
              <td>{t.status !== "closed" && <button onClick={() => close(t.id)} className="text-xs font-bold text-primary">إغلاق</button>}</td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
