import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, CalendarDays, ClipboardList, FileText, Headset, MapPin, PackageCheck, Wallet, ShieldCheck } from "lucide-react";
import {
  adminClients, adminOrders, adminQuotes, adminTickets,
  clientStatusLabel, clientStatusTone, orderStatusLabel, orderStatusTone,
  quoteStatusLabel, quoteStatusTone, ticketStatusLabel, ticketStatusTone,
  tierDiscount, tierLabel, type AdminClient, type ClientStatus, type PriceTier,
} from "@/features/admin/data";
import { Badge, DataTable, KpiCard, Panel } from "@/features/admin/shared";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/clients/$clientId")({
  component: ClientDetails,
});

function mapDbTierToPriceTier(tier?: string | null): PriceTier {
  if (!tier) return "C";
  const upper = tier.toUpperCase();
  if (upper === "A" || upper === "GOLD" || upper === "VIP" || upper === "PLATINUM") return "A";
  if (upper === "B" || upper === "SILVER") return "B";
  return "C";
}

function ClientDetails() {
  const { clientId } = Route.useParams();
  const demoClient = adminClients.find((c) => c.id === clientId);

  const [client, setClient] = useState<AdminClient>(
    demoClient || {
      id: clientId,
      name: "عميل تجاري مسجل",
      type: "منشأة معتمدة",
      city: "الرياض",
      cr: "1010xxxxxx",
      orders: 0,
      tier: "C",
      status: "pending",
      joined: new Date().toISOString().split("T")[0]!,
    }
  );

  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [tier, setTier] = useState<PriceTier>(client.tier);
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Fetch real client data from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadClient() {
      try {
        const [profileRes, clientRowRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", clientId).maybeSingle(),
          supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
        ]);

        if (isMounted) {
          if (profileRes.data) {
            const p = profileRes.data;
            const loaded: AdminClient = {
              id: p.id,
              name: p.company_name || p.full_name || "عميل تجاري",
              type: p.company_name ? "منشأة تجارية" : "محل ورد",
              city: p.city || "الرياض",
              cr: p.commercial_register || "1010xxxxxx",
              orders: 0,
              tier: mapDbTierToPriceTier(p.tier),
              status: p.is_verified ? "active" : "pending",
              joined: p.created_at ? p.created_at.split("T")[0]! : "2026-11-09",
            };
            setClient(loaded);
            setStatus(loaded.status);
            setTier(loaded.tier);
            if (p.phone) setPhone(p.phone);
            if (p.email) setEmail(p.email);
          } else if (clientRowRes.data) {
            const c = clientRowRes.data;
            const loaded: AdminClient = {
              id: c.id,
              name: c.company || c.name,
              type: c.company ? "منشأة تجارية" : "محل ورد",
              city: c.city || "الرياض",
              cr: c.cr_number || "1010xxxxxx",
              orders: 0,
              tier: mapDbTierToPriceTier(c.tier),
              status: "active",
              joined: c.created_at ? c.created_at.split("T")[0]! : "2026-11-09",
            };
            setClient(loaded);
            setStatus(loaded.status);
            setTier(loaded.tier);
            if (c.phone) setPhone(c.phone);
            if (c.email) setEmail(c.email);
          }
        }
      } catch (err) {
        console.warn("Client details load error:", err);
      }
    }

    void loadClient();
    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const orders = adminOrders.filter((o) => o.client === client.name);
  const quotes = adminQuotes.filter((q) => q.client === client.name);
  const tickets = adminTickets.filter((t) => t.client === client.name);
  const recentValue = orders.reduce((s, o) => s + o.total, 0);
  const lastOrder = orders.map((o) => o.date).sort().at(-1);

  const patchStatus = async (next: ClientStatus, msg: string) => {
    setStatus(next);
    toast.success(msg);

    try {
      const isVerified = next === "active";
      await supabase
        .from("profiles")
        .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
        .eq("id", clientId);

      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "client_status_changed",
        severity: "info",
        tone: "forest",
        description: `تم تحديث حالة العميل ${client.name} (${clientId}) إلى: ${clientStatusLabel[next]}`,
      });
    } catch (err) {
      console.warn("Client status update error:", err);
    }
  };

  const patchTier = async (nextTier: PriceTier) => {
    setTier(nextTier);
    toast.success(`تم تحديث فئة السعر إلى ${tierLabel[nextTier]}`);

    try {
      await supabase
        .from("profiles")
        .update({ tier: nextTier, updated_at: new Date().toISOString() })
        .eq("id", clientId);

      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "client_tier_changed",
        severity: "info",
        tone: "gold",
        description: `تم تحديث فئة سعر العميل ${client.name} (${clientId}) إلى فئة: ${nextTier}`,
      });
    } catch (err) {
      console.warn("Client tier update error:", err);
    }
  };

  return (
    <RequirePermission permission="manage:clients" fallbackMessage="إدارة وتفاصيل حسابات العملاء مقتصرة على موظفي الإدارة والعمليات.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/clients" className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            <ArrowRight className="size-3.5" />العودة إلى حسابات العملاء
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <Badge tone={clientStatusTone[status]}>{clientStatusLabel[status]}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => void patchStatus("active", `تم تفعيل واعتماد ${client.name}`)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
              >
                موافقة وتفعيل
              </button>
              <button
                type="button"
                onClick={() => void patchStatus("suspended", "تم رفض الحساب")}
                className="rounded-xl border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
              >
                رفض
              </button>
            </>
          )}
          {status === "active" && (
            <button
              type="button"
              onClick={() => void patchStatus("suspended", "تم إيقاف الحساب")}
              className="rounded-xl border border-destructive/40 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
            >
              إيقاف الحساب
            </button>
          )}
          {status === "suspended" && (
            <button
              type="button"
              onClick={() => void patchStatus("active", "تم إعادة التفعيل")}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
            >
              إعادة التفعيل
            </button>
          )}
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
            {phone && <Info icon={Building2} label="رقم الجوال" value={phone} ltr />}
            {email && <Info icon={Building2} label="البريد الإلكتروني" value={email} ltr />}
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />فئة السعر</dt>
              <dd className="mt-1">
                <select
                  aria-label="فئة السعر"
                  value={tier}
                  onChange={(e) => void patchTier(e.target.value as PriceTier)}
                  className="h-9 rounded-lg border bg-surface px-2 text-sm font-bold text-forest"
                >
                  {(Object.keys(tierLabel) as PriceTier[]).map((t) => (
                    <option key={t} value={t}>{tierLabel[t]}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">خصم تلقائي {tierDiscount[tier]}% على قوائم الأسعار</p>
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="حالة الحساب والأمان">
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-xl bg-admin-head p-3">
              <span className="text-sm text-muted-foreground">الحالة الحالية</span>
              <Badge tone={clientStatusTone[status]}>{clientStatusLabel[status]}</Badge>
            </div>
            <p className="text-xs leading-6 text-muted-foreground">
              {status === "active" && "الحساب مفعّل وموثق ويمكنه الطلب بأسعار فئته المعتمدة."}
              {status === "pending" && "الحساب بانتظار مراجعة الإدارة واعتماده لتمكينه من طلبات الجملة."}
              {status === "suspended" && "الحساب موقوف مؤقتاً ولا يستطيع إتمام طلبيات جديدة."}
            </p>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-forest">
              <span className="flex items-center gap-1.5 font-bold mb-1"><ShieldCheck className="size-4 text-primary" />موثق في Supabase</span>
              أي تغيير في الحالة أو فئة السعر يتم حفظه لحظياً في قاعدة البيانات ويوثق في سجل الرقابة الأمنية.
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
    </RequirePermission>
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
