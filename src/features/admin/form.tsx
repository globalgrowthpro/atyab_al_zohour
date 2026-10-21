import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Field({ label, hint, ...rest }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-bold text-forest">
      {label}
      <input {...rest} className="field mt-2" />
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Area({ label, hint, ...rest }: { label: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm font-bold text-forest md:col-span-2">
      {label}
      <textarea rows={3} {...rest} className="field mt-2 h-auto py-3" />
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Select({ label, options, defaultValue }: { label: string; options: [string, string][]; defaultValue?: string }) {
  return (
    <label className="block text-sm font-bold text-forest">
      {label}
      <select defaultValue={defaultValue} className="field mt-2">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export function Toggle({ label, desc, defaultChecked }: { label: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border bg-background p-4">
      <span>
        <span className="block text-sm font-bold text-forest">{label}</span>
        {desc && <span className="mt-1 block text-xs text-muted-foreground">{desc}</span>}
      </span>
      <input type="checkbox" defaultChecked={defaultChecked} className="mt-1 size-5 shrink-0 accent-primary" />
    </label>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>;
}
