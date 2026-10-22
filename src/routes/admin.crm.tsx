import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Handshake, KanbanSquare, List, Mail, MapPin, Phone, Target, TrendingUp, UserPlus, Users, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sar, type Tone } from "@/features/admin/data";
import { Badge, DataTable, KpiCard, PageTitle, Panel, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/crm")({
  head: () => ({ meta: [{ title: "إدارة علاقات العملاء | لوحة الإدارة" }, { name: "description", content: "مسار المبيعات والعملاء المحتملين ومهام المتابعة." }] }),
  component: Crm,
});

// Sample CRM data — demo only, nothing is saved.
type Stage = "lead" | "contacted" | "proposal" | "negotiation" | "won" | "lost";
const stages: Stage[] = ["lead", "contacted", "proposal", "negotiation", "won", "lost"];
const flow: Stage[] = ["lead", "contacted", "proposal", "negotiation", "won"];
const stageLabel: Record<Stage, string> = { lead: "عميل محتمل", contacted: "تم التواصل", proposal: "عرض مقدَّم", negotiation: "تفاوض", won: "صفقة رابحة", lost: "مفقودة" };
const stageTone: Record<Stage, Tone> = { lead: "muted", contacted: "rose", proposal: "gold", negotiation: "forest", won: "sage", lost: "danger" };
const stageBar: Record<Stage, string> = { lead: "bg-muted-foreground/40", contacted: "bg-rose", proposal: "bg-gold", negotiation: "bg-forest", won: "bg-primary", lost: "bg-destructive" };
const stageProb: Record<Stage, number> = { lead: 10, contacted: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 };
type Deal = { id: string; company: string; contact: string; type: string; city: string; value: number; stage: Stage; owner: string; next: string; source: string };
const initialDeals: Deal[] = [
  { id: "DL-01", company: "مطعم ريحان", contact: "أ. سارة", type: "مطعم", city: "الرياض", value: 6000, stage: "lead", owner: "نورة", next: "2026-10-22", source: "الموقع" },
  { id: "DL-02", company: "متجر بتلات", contact: "أ. فيصل", type: "محل ورد", city: "جدة", value: 9500, stage: "contacted", owner: "عمر", next: "2026-10-21", source: "إحالة" },
  { id: "DL-03", company: "فندق النخيل", contact: "أ. هند", type: "فندق", city: "الرياض", value: 24000, stage: "proposal", owner: "نورة", next: "2026-10-23", source: "معرض" },
  { id: "DL-04", company: "قاعة الفخامة للمناسبات", contact: "أ. منيرة", type: "قاعة مناسبات", city: "الدمام", value: 18000, stage: "negotiation", owner: "عمر", next: "2026-10-21", source: "عميل حالي" },
  { id: "DL-05", company: "منتجع البحر الأحمر", contact: "أ. طارق", type: "منتجع", city: "جدة", value: 32000, stage: "won", owner: "نورة", next: "—", source: "عميل حالي" },
  { id: "DL-06", company: "مقهى ليلك", contact: "أ. لمى", type: "مقهى", city: "الرياض", value: 3000, stage: "lost", owner: "عمر", next: "—", source: "الموقع" },
  { id: "DL-07", company: "شركة ومضة للفعاليات", contact: "أ. يزن", type: "شركة فعاليات", city: "الخبر", value: 15000, stage: "proposal", owner: "عمر", next: "2026-10-24", source: "إنستغرام" },
  { id: "DL-08", company: "متجر زهرة الجنوب", contact: "أ. علي", type: "محل ورد", city: "أبها", value: 7200, stage: "lead", owner: "نورة", next: "2026-10-25", source: "الموقع" },
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
  { t: "قبل 3 أيام", text: "تسجيل عميل محتمل جديد: متجر زهرة الجنوب" },
];
const trend = [
  { m: "مايو", v: 38000 }, { m: "يونيو", v: 42000 }, { m: "يوليو", v: 51000 },
  { m: "أغسطس", v: 47000 }, { m: "سبتمبر", v: 63000 }, { m: "أكتوبر", v: 74700 },
];
const pieColors: string[] = ["var(--color-primary)", "var(--color-rose)", "var(--color-gold)", "var(--color-forest)", "var(--color-muted-foreground)"];
const initials = (s: string) => s.replace(/^(أ\.|شركة|متجر|مطعم|فندق|قاعة|منتجع|مقهى)\s*/, "").slice(0, 2);

function Avatar({ name }: { name: string }) {
  return <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blush text-xs font-extrabold text-rose">{initials(name)}</span>;
}

function Crm() {
  const [deals, setDeals] = useState(initialDeals);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const [sel, setSel] = useState<Deal | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const setStage = (d: Deal, stage: Stage) => {
    setDeals((all) => all.map((x) => (x.id === d.id ? { ...x, stage } : x)));
    setSel((s) => (s && s.id === d.id ? { ...s, stage } : s));
    toast.success(`${d.company}: ${stageLabel[stage]}`);
  };
  const move = (d: Deal, dir: 1 | -1) => { const n = flow[flow.indexOf(d.stage) + dir]; if (n) setStage(d, n); };
  const addLead = () => {
    const id = `DL-${String(deals.length + 1).padStart(2, "0")}`;
    setDeals((all) => [{ id, company: "عميل محتمل جديد", contact: "—", type: "—", city: "—", value: 0, stage: "lead", owner: "نورة", next: "—", source: "يدوي" }, ...all]);
    toast.success("تمت إضافة عميل محتمل");
  };

  const list = deals.filter((d) => (d.company + d.contact + d.type + d.city).includes(q.trim()));
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = deals.filter((d) => d.stage === "won");
  const closed = won.length + deals.filter((d) => d.stage === "lost").length;
  const weighted = open.reduce((n, d) => n + (d.value * stageProb[d.stage]) / 100, 0);
  const sources = Object.entries(deals.reduce<Record<string, number>>((m, d) => ({ ...m, [d.source]: (m[d.source] ?? 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
  const funnel = flow.map((s) => ({ s, n: deals.filter((d) => flow.indexOf(d.stage) >= flow.indexOf(s)).length }));
  const maxFunnel = Math.max(1, funnel[0]?.n ?? 1);

  return (
    <>
      <PageTitle title="إدارة علاقات العملاء" desc="تابع العملاء المحتملين ومراحل الصفقات والمهام من مكان واحد."
        action={<button onClick={addLead} className="btn btn-primary"><UserPlus className="size-4" />عميل محتمل</button>} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Target} label="قيمة الصفقات المفتوحة" value={sar(open.reduce((n, d) => n + d.value, 0))} trend="+12%" trendUp />
        <KpiCard icon={TrendingUp} label="التوقع المرجّح" value={sar(Math.round(weighted))} hint="حسب احتمال كل مرحلة" />
        <KpiCard icon={Handshake} label="صفقات رابحة" value={String(won.length)} hint={sar(won.reduce((n, d) => n + d.value, 0))} trend="+1" trendUp />
        <KpiCard icon={Users} label="معدل الإغلاق" value={`${closed ? Math.round((won.length / closed) * 100) : 0}%`} trend="+5%" trendUp />
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <Panel title="نمو قيمة المسار (6 أشهر)">
          <div className="h-56 p-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs><linearGradient id="crmG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10 }} reversed />
                <YAxis tick={{ fontSize: 10 }} orientation="right" width={44} />
                <Tooltip formatter={(v) => sar(Number(v))} />
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#crmG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="قمع التحويل">
          <div className="space-y-2.5 p-5">
            {funnel.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-bold text-forest">{stageLabel[s]}</span>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-muted">
                  <div className={`flex h-full items-center justify-end rounded-lg px-2 text-xs font-extrabold text-primary-foreground ${stageBar[s]}`} style={{ width: `${Math.max(12, (n / maxFunnel) * 100)}%` }}>{n}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="مصادر العملاء">
          <div className="flex items-center gap-4 p-5">
            <div className="size-36 shrink-0" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={sources} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={3}>{sources.map((s, i) => <Cell key={s.name} fill={pieColors[i % pieColors.length] ?? ""} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {sources.map((s, i) => (
                <li key={s.name} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] ?? "" }} /><span className="flex-1">{s.name}</span><span className="font-bold text-forest">{s.value}</span></li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <h3 className="text-base">مسار المبيعات</h3>
          <div className="flex rounded-xl border bg-muted/50 p-1">
            {([["board", "لوحة", KanbanSquare], ["list", "قائمة", List]] as const).map(([k, l, I]) => (
              <button key={k} onClick={() => setView(k)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${view === k ? "bg-card text-forest shadow-soft" : "text-muted-foreground"}`}><I className="size-3.5" />{l}</button>
            ))}
          </div>
        </div>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المنشأة أو جهة التواصل أو المدينة" />

        {view === "board" ? (
          <div className="flex gap-3 overflow-x-auto p-4">
            {stages.map((s) => {
              const col = list.filter((d) => d.stage === s);
              return (
                <div key={s} className="w-64 shrink-0 overflow-hidden rounded-2xl border bg-muted/40">
                  <div className={`h-1 ${stageBar[s]}`} />
                  <div className="flex items-center justify-between px-3 py-3">
                    <div><p className="text-sm font-extrabold text-forest">{stageLabel[s]}</p><p className="text-[11px] text-muted-foreground">{sar(col.reduce((n, d) => n + d.value, 0))}</p></div>
                    <span className="grid size-7 place-items-center rounded-full bg-card text-xs font-bold text-forest shadow-soft">{col.length}</span>
                  </div>
                  <div className="space-y-2 px-3 pb-3">
                    {col.map((d) => (
                      <div key={d.id} role="button" tabIndex={0} onClick={() => setSel(d)} onKeyDown={(e) => e.key === "Enter" && setSel(d)}
                        className="cursor-pointer rounded-xl border bg-admin-panel p-3 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift">
                        <div className="flex items-start gap-2.5">
                          <Avatar name={d.company} />
                          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-forest">{d.company}</p><p className="truncate text-xs text-muted-foreground">{d.contact} · {d.type}</p></div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-extrabold text-primary">{sar(d.value)}</span>
                          <span className="text-[11px] font-bold text-muted-foreground">{stageProb[d.stage]}%</span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className={`h-full ${stageBar[d.stage]}`} style={{ width: `${stageProb[d.stage]}%` }} /></div>
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarClock className="size-3.5" /><span dir="ltr">{d.next}</span></span><span>{d.owner}</span>
                        </div>
                      </div>
                    ))}
                    {col.length === 0 && <p className="rounded-xl border border-dashed py-6 text-center text-xs text-muted-foreground">لا توجد صفقات</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DataTable head={["المنشأة", "المرحلة", "القيمة", "الاحتمال", "المدينة", "المسؤول", "المتابعة القادمة"]} empty={list.length === 0}>
            {list.map((d) => (
              <tr key={d.id} onClick={() => setSel(d)} className="cursor-pointer hover:bg-muted/40">
                <td><div className="flex items-center gap-2.5"><Avatar name={d.company} /><div><p className="font-bold text-forest">{d.company}</p><p className="text-xs text-muted-foreground">{d.contact}</p></div></div></td>
                <td><Badge tone={stageTone[d.stage]}>{stageLabel[d.stage]}</Badge></td>
                <td className="font-bold text-primary">{sar(d.value)}</td>
                <td>{stageProb[d.stage]}%</td>
                <td>{d.city}</td>
                <td>{d.owner}</td>
                <td dir="ltr" className="text-end">{d.next}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="مهام المتابعة" action={<span className="text-xs font-bold text-muted-foreground">{done.length}/{tasks.length} منجزة</span>}>
          <ul className="divide-y">
            {tasks.map((t) => {
              const Icon = t.kind === "call" ? Phone : t.kind === "mail" ? Mail : MapPin;
              const isDone = done.includes(t.id);
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                  <button aria-label={t.text} onClick={() => setDone((d) => (isDone ? d.filter((x) => x !== t.id) : [...d, t.id]))}
                    className={`grid size-6 place-items-center rounded-full border-2 ${isDone ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>{isDone && <CheckCircle2 className="size-4" />}</button>
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" /></span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isDone ? "text-muted-foreground line-through" : "text-forest"}`}>{t.text}</p>
                    <p className="text-xs text-muted-foreground">{t.who}</p>
                  </div>
                  <Badge tone={t.due === "اليوم" ? "rose" : "muted"}>{t.due}</Badge>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="آخر التفاعلات">
          <ol className="relative space-y-5 p-5 before:absolute before:inset-y-6 before:start-[27px] before:w-0.5 before:bg-border">
            {timeline.map((e) => (
              <li key={e.text} className="relative flex gap-3">
                <span className="relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-card bg-gold ring-2 ring-gold/30" />
                <div><p className="text-sm text-forest">{e.text}</p><p className="mt-0.5 text-xs text-muted-foreground">{e.t}</p></div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex justify-start bg-foreground/40" onClick={() => setSel(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3"><Avatar name={sel.company} /><div><h3 className="text-lg">{sel.company}</h3><p className="text-xs text-muted-foreground" dir="ltr">{sel.id}</p></div></div>
              <button aria-label="إغلاق" onClick={() => setSel(null)} className="grid size-9 place-items-center rounded-xl hover:bg-muted"><X className="size-4" /></button>
            </div>
            <div className="mt-4 flex items-center gap-2"><Badge tone={stageTone[sel.stage]}>{stageLabel[sel.stage]}</Badge><span className="text-xs text-muted-foreground">احتمال الإغلاق {stageProb[sel.stage]}%</span></div>
            <div className="mt-5 rounded-2xl bg-forest-gradient p-5 text-primary-foreground"><p className="text-xs opacity-80">قيمة الصفقة</p><p className="mt-1 text-3xl font-extrabold">{sar(sel.value)}</p></div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[["جهة التواصل", sel.contact], ["النشاط", sel.type], ["المدينة", sel.city], ["المصدر", sel.source], ["المسؤول", sel.owner], ["المتابعة القادمة", sel.next]].map(([k, v]) => (
                <div key={k} className="rounded-xl border p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 font-bold text-forest">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-6 mb-2 text-sm font-bold text-forest">مراحل الصفقة</p>
            <div className="flex gap-1">{flow.map((s) => <div key={s} title={stageLabel[s]} className={`h-2 flex-1 rounded-full ${flow.indexOf(s) <= flow.indexOf(sel.stage) && sel.stage !== "lost" ? stageBar[s] : "bg-muted"}`} />)}</div>
            {sel.stage !== "won" && sel.stage !== "lost" && (
              <div className="mt-6 flex flex-wrap gap-2">
                {sel.stage !== "lead" && <button onClick={() => move(sel, -1)} className="btn btn-outline !h-10 text-xs"><ArrowRight className="size-4" />رجوع</button>}
                <button onClick={() => move(sel, 1)} className="btn btn-primary !h-10 flex-1 text-xs">نقل إلى {stageLabel[flow[flow.indexOf(sel.stage) + 1] ?? "won"]}<ArrowLeft className="size-4" /></button>
                <button onClick={() => setStage(sel, "lost")} className="btn btn-outline !h-10 text-xs text-destructive">فقدان</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
