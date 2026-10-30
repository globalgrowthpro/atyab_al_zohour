import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, CalendarDays, ClipboardList, FileText, Headset, MapPin, PackageCheck, Wallet } from "lucide-react";
import {
  adminClients, adminOrders, adminQuotes, adminTickets,
  clientStatusLabel, clientStatusTone, orderStatusLabel, orderStatusTone,
  quoteStatusLabel, quoteStatusTone, ticketStatusLabel, ticketStatusTone,
  tierDiscount, tierLabel, type ClientStatus, type PriceTier,
} from "@/features/admin/data";
import { Badge, DataTable, KpiCard, Panel } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/clients/$clientId")({
  beforeLoad: ({ params }) => {
    if (!adminClients.some((c) => c.id === params.clientId)) throw notFound();
  },
  component: ClientDetails,
});

function ClientDetails() {
  const { clientId } = Route.useParams();
  const client = adminClients.find((c) => c.id === clientId)!;
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [tier, setTier] = useState<PriceTier>(client.tier);

  const orders = adminOrders.filter((o) => o.client === client.name);
  const quotes = adminQuotes.filter((q) => q.client === client.name);
  const tickets = adminTickets.filter((t) => t.client === client.name);
  const recentValue = orders.reduce((s, o) => s + o.total, 0);
  const lastOrder = orders.map((o) => o.date).sort().at(-1);

  const patchStatus = (next: ClientStatus, msg: string) => { setStatus(next); toast.success(msg); };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/clients" className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <ArrowRight className="size-3.5" />العودة إلى حسابات العملاء
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl">{client.name}</h2>
            <Badge tone={clientStatusTone[status]}>{clientStatusLabel[status]}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && <>
            <button onClick={() => patchStatus("active", `تم تفعيل ${client.name}`)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">موافقة وتفعيل</button>
            <button onClick={() => patchStatus("suspended", "تم رفض الحساب")} className="rounded-xl border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10">رفض</button>
          </>}
          {status === "active" && <button onClick={() => patchStatus("suspended", "تم إيقاف الحساب")} className="rounded-xl border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10">إيقاف الحساب</button>}
          {status === "suspended" && <button onClick={() => patchStatus("active", "تم إعادة التفعيل")} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">إعادة التفعيل</button>}
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={ClipboardList} label="إجمالي الطلبات" value={String(client.orders)} color="forest" />
        <KpiCard icon={Wallet} label="قيمة الطلبات المسجلة" value={`${recentValue.toLocaleString("en-US")} ر.س`} hint="من الطلبات الظاهرة أدناه" color="gold" />
        <KpiCard icon={PackageCheck} label="أحدث طلب" value={lastOrder ?? "لا يوجد"} color="sage" />
        <KpiCard icon={Headset} label="تذاكر الدعم" value={String(tickets.length)} hint={`${quotes.length} عرض سعر`} color="rose" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Panel title="بيانات الحساب" className="lg:col-span-2">
          <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
            <Info icon={Building2} label="رقم الحساب" value={client.id} />
            <Info icon={Building2} label="السجل التجاري" value={client.cr} ltr />
            <Info icon={Building2} label="نوع النشاط" value={client.type} />
            <Info icon={MapPin} label="المدينة" value={client.city} />
            <Info icon={CalendarDays} label="تاريخ الانضمام" value={client.joined} ltr />
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />فئة السعر</dt>
              <dd className="mt-1">
                <select aria-label="فئة السعر" value={tier} onChange={(e) => { setTier(e.target.value as PriceTier); toast.success("تم تحديث فئة السعر"); }}
                  className="h-9 rounded-lg border bg-surface px-2 text-sm font-bold text-forest">
                  {(Object.keys(tierLabel) as PriceTier[]).map((t) => <option key={t} value={t}>{tierLabel[t]}</option>)}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">خصم تلقائي {tierDiscount[tier]}% على قوائم الأسعار</p>
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="حالة الحساب">
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-xl bg-admin-head p-3">
              <span className="text-sm text-muted-foreground">الحالة الحالية</span>
              <Badge tone={clientStatusTone[status]}>{clientStatusLabel[status]}</Badge>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              {status === "active" && "الحساب مفعّل ويمكنه الطلب بشروط فئته الحالية."}
              {status === "pending" && "الحساب جديد وينتظر موافقتك قبل تمكينه من الطلب."}
              {status === "suspended" && "الحساب موقوف ولا يستطيع إتمام طلبات جديدة."}
            </p>
            <div className="rounded-xl border bg-surface p-3 text-xs leading-6 text-muted-foreground">
              <span className="font-bold text-forest">ملاحظة:</span> تعديلات الحالة والفئة هنا تجريبية وتعود لوضعها السابق عند تحديث الصفحة.
            </div>
          </div>
        </Panel>
      </div>

      <Panel title={`الطلبات المرتبطة (${orders.length})`} className="mb-4">
        <DataTable head={["رقم الطلب", "التاريخ", "الأصناف", "الإجمالي", "المندوب", "الحالة"]} empty={orders.length === 0}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="font-bold text-forest" dir="ltr">{o.id}</td>
              <td dir="ltr">{o.date}</td>
              <td>{o.items}</td>
              <td className="font-bold text-forest">{o.total.toLocaleString("en-US")} ر.س</td>
              <td>{o.courier ?? "—"}</td>
              <td><Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge></td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={`عروض الأسعار (${quotes.length})`}>
          <DataTable head={["الرقم", "التاريخ", "الحالة"]} empty={quotes.length === 0}>
            {quotes.map((q) => (
              <tr key={q.id}>
                <td className="font-bold text-forest" dir="ltr">{q.id}</td>
                <td dir="ltr">{q.date}</td>
                <td><Badge tone={quoteStatusTone[q.status]}>{quoteStatusLabel[q.status]}</Badge></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
        <Panel title={`تذاكر الدعم (${tickets.length})`}>
          <DataTable head={["الرقم", "الموضوع", "الحالة"]} empty={tickets.length === 0}>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="font-bold text-forest" dir="ltr">{t.id}</td>
                <td>{t.subject}</td>
                <td><Badge tone={ticketStatusTone[t.status]}>{ticketStatusLabel[t.status]}</Badge></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}

function Info({ icon: Icon, label, value, ltr }: { icon: typeof Building2; label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</dt>
      <dd className="mt-1 text-sm font-bold text-forest" dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "end" } : undefined}>{value}</dd>
    </div>
  );
}
