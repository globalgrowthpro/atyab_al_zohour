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

export function Select({
  label,
  options,
  defaultValue,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: [string, string][];
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-forest">
      {label}
      <select
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="field mt-2"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  desc,
  defaultChecked,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border bg-background p-4 cursor-pointer hover:border-primary/40 transition-colors">
      <span>
        <span className="block text-sm font-bold text-forest">{label}</span>
        {desc && <span className="mt-1 block text-xs text-muted-foreground">{desc}</span>}
      </span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 size-5 shrink-0 accent-primary cursor-pointer"
      />
    </label>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>;
}
