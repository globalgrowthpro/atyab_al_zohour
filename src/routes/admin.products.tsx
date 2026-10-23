import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Power } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { categories, categoryOf, productImage, products, type Product } from "@/lib/catalog";
import { sar } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel, Toolbar, ExportButton, SelectFilter } from "@/features/admin/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/products")({ component: Products });

type Item = Product & { active: boolean };
type Draft = { name: string; sku: string; category: string; unit: string; moq: number; price: number; available: boolean; active: boolean };

const emptyDraft = (): Draft => ({ name: "", sku: "", category: categories[0]?.slug ?? "", unit: "باقة", moq: 1, price: 0, available: true, active: true });

function Products() {
  const [items, setItems] = useState<Item[]>(() => products.map((p) => ({ ...p, active: true })));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [avail, setAvail] = useState("all");
  const [state, setState] = useState("all");
  const [editing, setEditing] = useState<string | null>(null); // slug, "new", or null
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const list = useMemo(() => items.filter((p) =>
    (cat === "all" || p.category === cat) &&
    (avail === "all" || (avail === "yes") === p.available) &&
    (state === "all" || (state === "active") === p.active) &&
    (p.name + p.sku + p.en).toLowerCase().includes(q.trim().toLowerCase())), [items, q, cat, avail, state]);
  const patch = (slug: string, v: Partial<Item>) => setItems((all) => all.map((p) => (p.slug === slug ? { ...p, ...v } : p)));

  const openNew = () => { setDraft(emptyDraft()); setEditing("new"); };
  const openEdit = (p: Item) => { setDraft({ name: p.name, sku: p.sku, category: p.category, unit: p.unit, moq: p.moq, price: p.price, available: p.available, active: p.active }); setEditing(p.slug); };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.sku.trim()) { toast.error("الاسم ورمز المنتج مطلوبان"); return; }
    if (items.some((p) => p.sku === draft.sku.trim() && p.slug !== editing)) { toast.error("رمز المنتج مستخدم من قبل"); return; }
    const values = { ...draft, name: draft.name.trim(), sku: draft.sku.trim() };
    if (editing === "new") {
      const base = items[0] ?? products[0];
      if (!base) return;
      setItems((all) => [{ ...base, ...values, slug: `new-${Date.now()}`, en: "", badge: undefined } as Item, ...all]);
      toast.success("تمت إضافة المنتج");
    } else if (editing) {
      patch(editing, values);
      toast.success("تم حفظ التعديلات");
    }
    setEditing(null);
  };

  return (
    <>
      <PageTitle title="المنتجات والمخزون" desc={`${items.length} منتج · ${items.filter((p) => p.active).length} نشط · ${items.filter((p) => !p.active).length} غير نشط · ${items.filter((p) => !p.available).length} غير متوفر`}
        action={<button onClick={openNew} className="btn btn-primary !h-10 !px-5 text-sm"><Plus className="size-4" />إضافة منتج</button>} />
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث بالاسم أو رمز المنتج">
          <SelectFilter label="التصنيف" value={cat} onChange={setCat} options={categories.map((c) => [c.slug, c.name] as [string, string])} />
          <SelectFilter label="الحالة" value={state} onChange={setState} options={[["active", "نشط"], ["inactive", "غير نشط"]]} />
          <SelectFilter label="التوفر" value={avail} onChange={setAvail} options={[["yes", "متوفر"], ["no", "غير متوفر"]]} />
          <ExportButton file="products" sheet="المنتجات" rows={() => list.map((p) => ({ "المنتج": p.name, "الرمز": p.sku, "التصنيف": categoryOf(p.category)?.name ?? p.category, "الحد الأدنى": `${p.moq} ${p.unit}`, "السعر الأساسي (ر.س)": p.price, "الحالة": p.active ? "نشط" : "غير نشط", "التوفر": p.available ? "متوفر" : "غير متوفر" }))} />
        </Toolbar>
        <DataTable head={["المنتج", "التصنيف", "الحد الأدنى", "السعر الأساسي", "الحالة", "التوفر", "الإجراءات"]} empty={list.length === 0}>
          {list.map((p) => (
            <tr key={p.slug} className={p.active ? "" : "opacity-60"}>
              <td>
                <div className="flex items-center gap-3">
                  <img src={productImage(p)} alt="" className="size-11 rounded-lg object-cover" loading="lazy" />
                  <div><p className="font-bold text-forest">{p.name}</p><p className="text-xs text-muted-foreground" dir="ltr">{p.sku}</p></div>
                </div>
              </td>
              <td>{categoryOf(p.category)?.name ?? p.category}</td>
              <td>{p.moq} {p.unit}</td>
              <td className="whitespace-nowrap">{sar(p.price)}</td>
              <td><Badge tone={p.active ? "sage" : "muted"}>{p.active ? "نشط" : "غير نشط"}</Badge></td>
              <td>
                <button onClick={() => { patch(p.slug, { available: !p.available }); toast.success("تم تحديث التوفر"); }} aria-label={`تبديل توفر ${p.name}`}>
                  <Badge tone={p.available ? "sage" : "danger"}>{p.available ? "متوفر" : "غير متوفر"}</Badge>
                </button>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(p)} className="inline-flex h-8 items-center gap-1 rounded-lg border bg-surface px-3 text-xs font-bold text-forest hover:bg-muted"><Pencil className="size-3.5" />تعديل</button>
                  <button onClick={() => { patch(p.slug, { active: !p.active }); toast.success(p.active ? "تم إيقاف المنتج" : "تم تفعيل المنتج"); }}
                    className={`inline-flex h-8 items-center gap-1 rounded-lg border px-3 text-xs font-bold ${p.active ? "text-destructive hover:bg-destructive/10" : "text-primary hover:bg-primary/10"}`}>
                    <Power className="size-3.5" />{p.active ? "إيقاف" : "تفعيل"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle className="text-start text-forest">{editing === "new" ? "إضافة منتج" : "تعديل المنتج"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <F label="اسم المنتج"><input className="field mt-2" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></F>
            <F label="رمز المنتج"><input className="field mt-2" dir="ltr" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} required /></F>
            <F label="التصنيف">
              <select className="field mt-2" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </F>
            <F label="الوحدة"><input className="field mt-2" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} /></F>
            <F label="الحد الأدنى للطلب"><input type="number" min={1} className="field mt-2" value={draft.moq} onChange={(e) => setDraft({ ...draft, moq: Math.max(1, Number(e.target.value) || 1) })} /></F>
            <F label="السعر الأساسي (ر.س)"><input type="number" min={0} className="field mt-2" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Math.max(0, Number(e.target.value) || 0) })} /></F>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />نشط (يظهر للعملاء)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.checked })} />متوفر في المخزون</label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="btn btn-primary !h-10 !px-6 text-sm">حفظ</button>
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline !h-10 !px-6 text-sm">إلغاء</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-forest">{label}{children}</label>;
}
