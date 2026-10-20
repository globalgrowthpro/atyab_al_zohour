import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminTickets, ticketStatusLabel, ticketStatusTone } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/support")({ component: Support });

function Support() {
  const [tickets, setTickets] = useState(adminTickets);
  const close = (id: string) => { setTickets((t) => t.map((x) => (x.id === id ? { ...x, status: "closed" as const } : x))); toast.success("تم إغلاق التذكرة"); };
  return (
    <>
      <PageTitle title="تذاكر الدعم" desc="استفسارات وطلبات العملاء." />
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
