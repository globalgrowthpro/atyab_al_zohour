import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Power } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { categories, categoryOf, productImage, products, type Product } from "@/lib/catalog";
import { sar } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel, Toolbar, ExportButton, SelectFilter } from "@/features/admin/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/products")({ component: Products });

type Seo = { seoTitle: string; seoDesc: string; seoKeywords: string; seoSlug: string };
type Item = Product & { active: boolean } & Partial<Seo>;
type Draft = { name: string; sku: string; category: string; unit: string; moq: number; price: number; available: boolean; active: boolean; image: string } & Seo;

const emptyDraft = (): Draft => ({ name: "", sku: "", category: categories[0]?.slug ?? "", unit: "باقة", moq: 1, price: 0, available: true, active: true, image: "", seoTitle: "", seoDesc: "", seoKeywords: "", seoSlug: "" });

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
  const openEdit = (p: Item) => { setDraft({ name: p.name, sku: p.sku, category: p.category, unit: p.unit, moq: p.moq, price: p.price, available: p.available, active: p.active, image: productImage(p), seoTitle: p.seoTitle ?? "", seoDesc: p.seoDesc ?? "", seoKeywords: p.seoKeywords ?? "", seoSlug: p.seoSlug ?? p.slug }); setEditing(p.slug); };
  const pickImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("الملف يجب أن يكون صورة"); return; }
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, image: String(r.result) }));
    r.readAsDataURL(file);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.sku.trim()) { toast.error("الاسم ورمز المنتج مطلوبان"); return; }
    if (items.some((p) => p.sku === draft.sku.trim() && p.slug !== editing)) { toast.error("رمز المنتج مستخدم من قبل"); return; }
    const values = { ...draft, name: draft.name.trim(), sku: draft.sku.trim() };
    if (editing === "new") {
      const base = items[0] ?? products[0];
      if (!base) return;
      setItems((all) => [{ ...base, ...values, slug: `new-${Date.now()}`, en: "" }, ...all]);
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
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle className="text-start text-forest">{editing === "new" ? "إضافة منتج" : "تعديل المنتج"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 sm:col-span-2">
              {draft.image
                ? <img src={draft.image} alt="" className="size-24 rounded-xl border object-cover" />
                : <div className="grid size-24 place-items-center rounded-xl border border-dashed bg-surface text-xs text-muted-foreground">لا توجد صورة</div>}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold text-forest">صورة المنتج</p>
                <div className="flex flex-wrap gap-2">
                  <label className="btn btn-outline !h-9 cursor-pointer !px-4 text-xs">رفع صورة<input type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} /></label>
                  {draft.image && <button type="button" onClick={() => setDraft({ ...draft, image: "" })} className="btn btn-outline !h-9 !px-4 text-xs text-destructive">إزالة</button>}
                </div>
                <input className="field" dir="ltr" placeholder="أو الصق رابط الصورة https://" value={draft.image.startsWith("data:") ? "" : draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
              </div>
            </div>
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
            <fieldset className="grid gap-4 rounded-xl border bg-surface p-4 sm:col-span-2 sm:grid-cols-2">
              <legend className="px-2 text-sm font-bold text-forest">تحسين الظهور في البحث SEO</legend>
              <F label={`عنوان الصفحة (${draft.seoTitle.length}/60)`}><input className="field mt-2" maxLength={70} placeholder={draft.name || "عنوان يظهر في Google"} value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} /></F>
              <F label="رابط الصفحة"><input className="field mt-2" dir="ltr" placeholder="red-rose" value={draft.seoSlug} onChange={(e) => setDraft({ ...draft, seoSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} /></F>
              <div className="sm:col-span-2"><F label={`الوصف (${draft.seoDesc.length}/160)`}><textarea rows={3} maxLength={200} className="field mt-2 !h-auto py-2" value={draft.seoDesc} onChange={(e) => setDraft({ ...draft, seoDesc: e.target.value })} /></F></div>
              <div className="sm:col-span-2"><F label="الكلمات المفتاحية (افصل بفاصلة)"><input className="field mt-2" value={draft.seoKeywords} onChange={(e) => setDraft({ ...draft, seoKeywords: e.target.value })} /></F></div>
              <div className="rounded-lg border bg-card p-3 sm:col-span-2">
                <p className="text-xs text-muted-foreground" dir="ltr">atyab-flowers.com/products/{draft.seoSlug || "..."}</p>
                <p className="mt-1 font-bold text-primary">{draft.seoTitle || draft.name || "عنوان المنتج"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{draft.seoDesc || "سيظهر وصف المنتج هنا في نتائج البحث."}</p>
              </div>
            </fieldset>
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
