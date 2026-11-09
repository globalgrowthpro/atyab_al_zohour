import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type TicketStatus, adminTickets, ticketStatusLabel, ticketStatusTone } from "@/features/admin/data";
import { Badge, DataTable, ExportButton, FilterChips, PageTitle, Panel, Toolbar } from "@/features/admin/shared";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/support")({ component: Support });

function Support() {
  const [tickets, setTickets] = useState(adminTickets);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");

  // Load real tickets from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadTickets() {
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          const remoteList = data.map((t) => {
            const rawStatus = t.status === "closed" ? "closed" : t.status === "answered" ? "answered" : "open";
            return {
              id: t.id,
              client: t.client_phone || "عميل مسجل",
              subject: t.subject,
              date: t.created_at ? t.created_at.split("T")[0]! : "2026-11-09",
              status: rawStatus as TicketStatus,
            };
          });

          const remoteIds = new Set(remoteList.map((r) => r.id));
          const uniqueDemo = adminTickets.filter((dt) => !remoteIds.has(dt.id));
          setTickets([...remoteList, ...uniqueDemo]);
        }
      } catch (err) {
        console.warn("Tickets load notice:", err);
      }
    }

    void loadTickets();
    return () => {
      isMounted = false;
    };
  }, []);

  const close = async (id: string) => {
    setTickets((t) => t.map((x) => (x.id === id ? { ...x, status: "closed" as const } : x)));
    toast.success("تم إغلاق التذكرة بنجاح");

    try {
      await supabase
        .from("tickets")
        .update({ status: "closed" })
        .eq("id", id);

      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "ticket_closed",
        severity: "info",
        tone: "forest",
        description: `تم إغلاق تذكرة الدعم الفني ${id}`,
      });
    } catch (err) {
      console.warn("Ticket close database sync error:", err);
    }
  };

  const list = tickets.filter(
    (t) => (status === "all" || t.status === status) && (t.id + t.client + t.subject).includes(q.trim())
  );
  const open = tickets.filter((t) => t.status === "open").length;
  const answered = tickets.filter((t) => t.status === "answered").length;
  const closed = tickets.filter((t) => t.status === "closed").length;

  return (
    <RequirePermission permission="manage:support" fallbackMessage="إدارة تذاكر الدعم وخدمة العملاء مقتصرة على موظفي الدعم والعمليات والإدارة.">
      <PageTitle title="تذاكر الدعم" desc="استفسارات وطلبات العملاء من البوابة الإلكترونية." />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">مفتوحة</p>
          <p className="mt-1 text-xl font-extrabold text-rose">{open}</p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">تم الرد</p>
          <p className="mt-1 text-xl font-extrabold text-forest">{answered}</p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">مغلقة</p>
          <p className="mt-1 text-xl font-extrabold text-muted-foreground">{closed}</p>
        </div>
      </div>
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث برقم التذكرة أو العميل أو الموضوع">
          <FilterChips
            value={status}
            onChange={setStatus}
            options={[["all", "الكل"], ...(Object.entries(ticketStatusLabel) as [TicketStatus, string][])]}
          />
          <ExportButton
            file="support-tickets"
            sheet="التذاكر"
            rows={() =>
              list.map((t) => ({
                التذكرة: t.id,
                العميل: t.client,
                الموضوع: t.subject,
                التاريخ: t.date,
                الحالة: ticketStatusLabel[t.status],
              }))
            }
          />
        </Toolbar>
        <DataTable head={["التذكرة", "العميل", "الموضوع", "التاريخ", "الحالة", ""]} empty={list.length === 0}>
          {list.map((t) => (
            <tr key={t.id}>
              <td className="font-bold text-forest" dir="ltr">{t.id}</td>
              <td>{t.client}</td>
              <td>{t.subject}</td>
              <td dir="ltr" className="text-end">{t.date}</td>
              <td>
                <Badge tone={ticketStatusTone[t.status]}>{ticketStatusLabel[t.status]}</Badge>
              </td>
              <td>
                {t.status !== "closed" && (
                  <button
                    onClick={() => void close(t.id)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    إغلاق
                  </button>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </RequirePermission>
  );
}
