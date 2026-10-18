import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { productImage, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function QtyStepper({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex h-10 items-center rounded-full border bg-surface">
      <button type="button" aria-label="زيادة" onClick={() => onChange(value + 1)} className="grid size-10 place-items-center text-primary"><Plus className="size-4" /></button>
      <span className="w-8 text-center font-bold">{value}</span>
      <button type="button" aria-label="إنقاص" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-10 place-items-center text-primary"><Minus className="size-4" /></button>
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(p.moq);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
      <Link to="/products/$slug" params={{ slug: p.slug }} className="relative block aspect-square overflow-hidden bg-muted">
        <img src={productImage(p)} alt={p.name} loading="lazy" width={816} height={816} className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <span className={`absolute top-3 start-3 rounded-full px-3 py-1 text-xs font-bold ${p.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {p.available ? "متوفر" : "غير متوفر حالياً"}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link to="/products/$slug" params={{ slug: p.slug }}><h3 className="text-lg leading-tight">{p.name}</h3></Link>
          <p className="text-xs text-muted-foreground" dir="ltr">{p.en} · {p.sku}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
          <dt className="text-muted-foreground">المنشأ</dt><dd>{p.origin}</dd>
          <dt className="text-muted-foreground">الدرجة</dt><dd>{p.grade}</dd>
          <dt className="text-muted-foreground">الطول</dt><dd>{p.stem}</dd>
          <dt className="text-muted-foreground">الحد الأدنى</dt><dd>{p.moq} {p.unit}</dd>
        </dl>
        <Link to="/login" className="flex items-center gap-1.5 rounded-xl bg-blush/60 px-3 py-2 text-[13px] font-bold text-forest">
          <Lock className="size-3.5 text-rose" /> سجّل الدخول لعرض سعر الجملة
        </Link>
        <div className="mt-auto flex items-center gap-2">
          <QtyStepper value={qty} onChange={setQty} min={p.moq} />
          <button
            disabled={!p.available}
            onClick={() => { add(p.slug, qty); toast.success(`تمت إضافة ${p.name} إلى الطلب`); }}
            className="btn btn-primary !h-10 flex-1 !px-3 text-sm"
          >
            <ShoppingCart className="size-4" /> أضف للطلب
          </button>
        </div>
      </div>
    </article>
  );
}
