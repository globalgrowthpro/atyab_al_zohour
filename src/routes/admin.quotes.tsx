import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { adminQuotes, quoteStatusLabel, quoteStatusTone, type QuoteStatus } from "@/features/admin/data";
import { Badge, ExportButton, FilterChips, PageTitle, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/quotes")({ component: Quotes });

function Quotes() {
  const [quotes, setQuotes] = useState(adminQuotes);
  const [status, setStatus] = useState<QuoteStatus | "all">("all");
  const [q, setQ] = useState("");
  const set = (id: string, s: QuoteStatus) => {
    setQuotes((all) => all.map((q) => (q.id === id ? { ...q, status: s } : q)));
    toast.success(`${id}: ${quoteStatusLabel[s]}`);
  };
  const list = quotes.filter((x) => (status === "all" || x.status === status) && (x.id + x.client + x.contact + x.note).includes(q.trim()));
  const sent = quotes.filter((q) => q.status === "sent").length;
  const accepted = quotes.filter((q) => q.status === "accepted").length;
  const decided = quotes.filter((q) => q.status === "accepted" || q.status === "rejected").length;
  const rate = decided ? Math.round((accepted / decided) * 100) : 0;
  return (
    <>
      <PageTitle title="طلبات عروض الأسعار" desc="راجع الطلبات وأرسل العروض للعملاء." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">بانتظار التسعير</p><p className="mt-1 text-xl font-extrabold text-rose">{quotes.filter((q) => q.status === "pending").length}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">عروض مرسلة</p><p className="mt-1 text-xl font-extrabold text-forest">{sent}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">عروض مقبولة</p><p className="mt-1 text-xl font-extrabold text-primary">{accepted}</p></div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft"><p className="text-xs text-muted-foreground">معدل القبول</p><p className="mt-1 text-xl font-extrabold text-forest">{rate}%</p></div>
      </div>
      <div className="mb-4 rounded-2xl border bg-admin-panel shadow-soft"><Toolbar q={q} setQ={setQ} placeholder="ابحث برقم الطلب أو العميل">
        <FilterChips value={status} onChange={setStatus} options={[["all", "الكل"], ...(Object.entries(quoteStatusLabel) as [QuoteStatus, string][])]} />
        <ExportButton file="quotes" sheet="عروض الأسعار" rows={() => list.map((x) => ({ "الرقم": x.id, "التاريخ": x.date, "العميل": x.client, "المسؤول": x.contact, "الأصناف": x.items, "الملاحظة": x.note, "الحالة": quoteStatusLabel[x.status] }))} />
      </Toolbar></div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((q) => (
          <article key={q.id} className="rounded-2xl border bg-admin-panel p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs text-muted-foreground" dir="ltr">{q.id} · {q.date}</p><h3 className="mt-1 text-lg">{q.client}</h3></div>
              <Badge tone={quoteStatusTone[q.status]}>{quoteStatusLabel[q.status]}</Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-foreground/80">{q.note}</p>
            <p className="mt-2 text-xs text-muted-foreground">المسؤول: {q.contact} · {q.items} أصناف</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {q.status === "pending" && <button onClick={() => set(q.id, "sent")} className="btn btn-primary !h-9 !px-4 text-xs">إرسال العرض</button>}
              {q.status === "sent" && <>
                <button onClick={() => set(q.id, "accepted")} className="btn btn-primary !h-9 !px-4 text-xs">تحويل إلى طلب</button>
                <button onClick={() => set(q.id, "rejected")} className="btn btn-outline !h-9 !px-4 text-xs">رفض</button>
              </>}
            </div>
          </article>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">لا توجد طلبات.</p>}
      </div>
    </>
  );
}
