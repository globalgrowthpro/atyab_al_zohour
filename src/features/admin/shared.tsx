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
