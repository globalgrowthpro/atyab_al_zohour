import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock, ChevronLeft, Handshake, Phone, Target, TrendingUp, UserPlus, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sar, type Tone } from "@/features/admin/data";
import { Badge, KpiCard, Meter, PageTitle, Panel, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/crm")({ component: Crm });

// Sample CRM data — demo only, nothing is saved.
type Stage = "lead" | "contacted" | "proposal" | "negotiation" | "won" | "lost";
const stages: Stage[] = ["lead", "contacted", "proposal", "negotiation", "won", "lost"];
const stageLabel: Record<Stage, string> = { lead: "عميل محتمل", contacted: "تم التواصل", proposal: "عرض مقدَّم", negotiation: "تفاوض", won: "صفقة رابحة", lost: "مفقودة" };
const stageTone: Record<Stage, Tone> = { lead: "muted", contacted: "rose", proposal: "gold", negotiation: "forest", won: "sage", lost: "danger" };
type Deal = { id: string; company: string; contact: string; type: string; value: number; stage: Stage; owner: string; next: string; source: string };
const initialDeals: Deal[] = [
  { id: "DL-01", company: "مطعم ريحان", contact: "أ. سارة", type: "مطعم", value: 6000, stage: "lead", owner: "نورة", next: "2026-10-22", source: "الموقع" },
  { id: "DL-02", company: "متجر بتلات", contact: "أ. فيصل", type: "محل ورد", value: 9500, stage: "contacted", owner: "عمر", next: "2026-10-21", source: "إحالة" },
  { id: "DL-03", company: "فندق النخيل", contact: "أ. هند", type: "فندق", value: 24000, stage: "proposal", owner: "نورة", next: "2026-10-23", source: "معرض" },
  { id: "DL-04", company: "قاعة الفخامة للمناسبات", contact: "أ. منيرة", type: "قاعة مناسبات", value: 18000, stage: "negotiation", owner: "عمر", next: "2026-10-21", source: "عميل حالي" },
  { id: "DL-05", company: "منتجع البحر الأحمر", contact: "أ. طارق", type: "منتجع", value: 32000, stage: "won", owner: "نورة", next: "—", source: "عميل حالي" },
  { id: "DL-06", company: "مقهى ليلك", contact: "أ. لمى", type: "مقهى", value: 3000, stage: "lost", owner: "عمر", next: "—", source: "الموقع" },
  { id: "DL-07", company: "شركة ومضة للفعاليات", contact: "أ. يزن", type: "شركة فعاليات", value: 15000, stage: "proposal", owner: "عمر", next: "2026-10-24", source: "إنستغرام" },
  { id: "DL-08", company: "متجر زهرة الجنوب", contact: "أ. علي", type: "محل ورد", value: 7200, stage: "lead", owner: "نورة", next: "2026-10-25", source: "الموقع" },
];
const tasks = [
  { id: "T1", text: "متابعة عرض فندق النخيل", who: "نورة", due: "اليوم", kind: "call" },
  { id: "T2", text: "زيارة قاعة الفخامة لعرض العينات", who: "عمر", due: "غداً", kind: "meet" },
  { id: "T3", text: "إرسال الكتالوج لمطعم ريحان", who: "نورة", due: "غداً", kind: "mail" },
  { id: "T4", text: "اتصال تعريفي بمتجر زهرة الجنوب", who: "نورة", due: "الأحد", kind: "call" },
];
const timeline = [
  { t: "قبل ساعة", text: "مكالمة مع أ. منيرة — طلب خصم إضافي على 400 باقة" },
  { t: "أمس", text: "تم إرسال عرض السعر لفندق النخيل" },
  { t: "قبل يومين", text: "تحويل منتجع البحر الأحمر إلى صفقة رابحة" },
  { t: "قبل 3 أيام", text: "تسجيل عميل محتمل جديد من الموقع: متجر زهرة الجنوب" },
];

function Crm() {
  const [deals, setDeals] = useState(initialDeals);
  const [q, setQ] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const move = (d: Deal, dir: 1 | -1) => {
    const flow = stages.slice(0, 5);
    const next = flow[flow.indexOf(d.stage) + dir];
    if (!next) return;
    setDeals((all) => all.map((x) => (x.id === d.id ? { ...x, stage: next } : x)));
    toast.success(`${d.company}: ${stageLabel[next]}`);
  };
  const addLead = () => {
    const id = `DL-${String(deals.length + 1).padStart(2, "0")}`;
    setDeals((all) => [{ id, company: "عميل محتمل جديد", contact: "—", type: "—", value: 0, stage: "lead", owner: "نورة", next: "—", source: "يدوي" }, ...all]);
    toast.success("تمت إضافة عميل محتمل");
  };
  const list = deals.filter((d) => (d.company + d.contact + d.type).includes(q.trim()));
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won");
  const closed = won.length + deals.filter((d) => d.stage === "lost").length;
  const pipeline = stages.map((s) => ({ name: stageLabel[s], value: deals.filter((d) => d.stage === s).reduce((n, d) => n + d.value, 0) }));
  const sources = Object.entries(deals.reduce<Record<string, number>>((m, d) => ({ ...m, [d.source]: (m[d.source] ?? 0) + 1 }), {}));

  return (
    <>
      <PageTitle title="إدارة علاقات العملاء CRM" desc="تابع العملاء المحتملين ومراحل الصفقات والمهام من مكان واحد."
        action={<button onClick={addLead} className="btn btn-primary"><UserPlus className="size-4" />عميل محتمل</button>} />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Target} label="قيمة الصفقات المفتوحة" value={sar(open.reduce((n, d) => n + d.value, 0))} trend="+12%" trendUp />
        <KpiCard icon={Handshake} label="صفقات رابحة" value={String(won.length)} hint={sar(won.reduce((n, d) => n + d.value, 0))} />
        <KpiCard icon={TrendingUp} label="معدل الإغلاق" value={`${closed ? Math.round((won.length / closed) * 100) : 0}%`} trend="+5%" trendUp />
        <KpiCard icon={Users} label="عملاء محتملون" value={String(deals.filter((d) => d.stage === "lead").length)} />
      </div>

      <Panel title="مسار المبيعات">
        <div className="p-4"><Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المنشأة أو جهة التواصل" /></div>
        <div className="grid gap-3 overflow-x-auto px-4 pb-4 md:grid-cols-3 xl:grid-cols-6">
          {stages.map((s) => {
            const col = list.filter((d) => d.stage === s);
            return (
              <div key={s} className="min-w-52 rounded-xl bg-muted/50 p-3">
                <div className="mb-3 flex items-center justify-between"><Badge tone={stageTone[s]}>{stageLabel[s]}</Badge><span className="text-xs font-bold text-muted-foreground">{col.length}</span></div>
                <div className="space-y-2">
                  {col.map((d) => (
                    <div key={d.id} className="rounded-xl border bg-card p-3 shadow-soft">
                      <p className="text-sm font-bold text-forest">{d.company}</p>
                      <p className="text-xs text-muted-foreground">{d.contact} · {d.type}</p>
                      <p className="mt-2 text-sm font-extrabold text-primary">{sar(d.value)}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalendarClock className="size-3.5" /><span dir="ltr">{d.next}</span></span><span>{d.owner}</span>
                      </div>
                      {s !== "won" && s !== "lost" && (
                        <div className="mt-2 flex gap-2">
                          {s !== "lead" && <button onClick={() => move(d, -1)} className="text-xs font-bold text-muted-foreground">رجوع</button>}
                          <button onClick={() => move(d, 1)} className="ms-auto flex items-center text-xs font-bold text-primary">تقدّم<ChevronLeft className="size-3.5" /></button>
                          <button onClick={() => { setDeals((a) => a.map((x) => (x.id === d.id ? { ...x, stage: "lost" } : x))); toast("تم تسجيل الصفقة كمفقودة"); }} className="text-xs font-bold text-destructive">فقدان</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {col.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">لا توجد صفقات</p>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="قيمة الصفقات حسب المرحلة">
          <div className="h-64 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} reversed />
                <YAxis tick={{ fontSize: 10 }} orientation="right" />
                <Tooltip formatter={(v) => sar(Number(v))} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="مهام المتابعة">
          <ul className="divide-y">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <input type="checkbox" aria-label={t.text} checked={done.includes(t.id)} onChange={() => setDone((d) => (d.includes(t.id) ? d.filter((x) => x !== t.id) : [...d, t.id]))} className="size-4 accent-primary" />
                <div className="flex-1">
                  <p className={`text-sm font-bold ${done.includes(t.id) ? "text-muted-foreground line-through" : "text-forest"}`}>{t.text}</p>
                  <p className="text-xs text-muted-foreground">{t.who} · {t.due}</p>
                </div>
                {t.kind === "call" && <Phone className="size-4 text-rose" />}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="مصادر العملاء">
          <div className="space-y-3 p-5">
            {sources.map(([s, n]) => <Meter key={s} label={s} value={String(n)} pct={n / deals.length} tone="bg-rose" />)}
          </div>
          <div className="border-t p-5">
            <p className="mb-3 text-sm font-bold text-forest">آخر التفاعلات</p>
            <ol className="space-y-3 border-s-2 border-gold ps-4">
              {timeline.map((e) => <li key={e.text} className="text-sm"><p>{e.text}</p><p className="text-xs text-muted-foreground">{e.t}</p></li>)}
            </ol>
          </div>
        </Panel>
      </div>
    </>
  );
}
