import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import type { Tone } from "./data";

const toneClass: Record<Tone, string> = {
  rose: "bg-blush text-rose",
  gold: "bg-gold/15 text-forest",
  sage: "bg-primary/10 text-primary",
  forest: "bg-primary text-primary-foreground",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-destructive/10 text-destructive",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${toneClass[tone]}`}>{children}</span>;
}

export function PageTitle({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl">{title}</h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid size-10 place-items-center rounded-xl bg-blush text-rose"><Icon className="size-5" /></span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-forest">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card shadow-soft">
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-base">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function DataTable({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-start text-xs text-muted-foreground">
            {head.map((h) => <th key={h} className="px-4 py-3 text-start font-bold">{h}</th>)}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr:last-child]:border-0 [&_td]:px-4 [&_td]:py-3">{children}</tbody>
      </table>
      {empty && <p className="p-8 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>}
    </div>
  );
}

export function Toolbar({ q, setQ, placeholder, children }: { q: string; setQ: (v: string) => void; placeholder: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b p-4">
      <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-xl border bg-background px-3">
        <Search className="size-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm outline-none" />
      </label>
      {children}
    </div>
  );
}

export function FilterChips<T extends string>({ value, onChange, options }: { value: T | "all"; onChange: (v: T | "all") => void; options: [T | "all", string][] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([k, label]) => (
        <button key={k} type="button" onClick={() => onChange(k)}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${value === k ? "border-primary bg-primary text-primary-foreground" : "bg-background text-forest hover:bg-muted"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

// KPI card with icon, trend chip and optional hint — the main dashboard metric.
export function KpiCard({ icon: Icon, label, value, trend, trendUp, hint }: { icon: LucideIcon; label: string; value: string; trend?: string; trendUp?: boolean; hint?: string }) {
  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-5" /></span>
        {trend && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${trendUp ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
            {trendUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}{trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-forest">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}{hint ? ` · ${hint}` : ""}</p>
    </div>
  );
}

// Small labelled progress bar used in summaries and distribution widgets.
export function Meter({ label, value, pct, tone = "bg-primary" }: { label: string; value: string; pct: number; tone?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm"><span>{label}</span><span className="font-bold text-forest">{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, Math.max(0, pct * 100))}%` }} /></div>
    </div>
  );
}

// Circular gauge (SVG) showing a 0-100 percentage.
export function Radial({ pct, label, sub }: { pct: number; label: string; sub?: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid size-24 place-items-center">
        <svg viewBox="0 0 84 84" className="size-24 -rotate-90">
          <circle cx="42" cy="42" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle cx="42" cy="42" r={r} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-primary"
            strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)} />
        </svg>
        <span className="absolute text-lg font-extrabold text-forest">{pct}%</span>
      </div>
      <p className="text-center text-xs font-bold text-forest">{label}</p>
      {sub && <p className="-mt-1 text-center text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
