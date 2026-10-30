import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Power, Snowflake, Plane, Clock, ShieldCheck, AlertCircle, Box } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { categories, categoryOf, productImage, products, type Product } from "@/lib/catalog";
import { sar } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel, Toolbar, ExportButton, SelectFilter } from "@/features/admin/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFlowerBatches, type FlowerBatch, type FlowerOrigin } from "@/features/inventory/batches";

export const Route = createFileRoute("/admin/products")({ component: Products });

type Seo = { seoTitle: string; seoDesc: string; seoKeywords: string; seoSlug: string };
type Item = Product & { active: boolean } & Partial<Seo>;
type Draft = { name: string; sku: string; category: string; unit: string; moq: number; price: number; available: boolean; active: boolean; image: string } & Seo;

const emptyDraft = (): Draft => ({
  name: "",
  sku: "",
  category: categories[0]?.slug ?? "",
  unit: "باقة",
  moq: 1,
  price: 0,
  available: true,
  active: true,
  image: "",
  seoTitle: "",
  seoDesc: "",
  seoKeywords: "",
  seoSlug: "",
});

function Products() {
  const [activeTab, setActiveTab] = useState<"catalog" | "batches">("catalog");
  const [items, setItems] = useState<Item[]>(() => products.map((p) => ({ ...p, active: true })));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [avail, setAvail] = useState("all");
  const [state, setState] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  // Perishable batches hook
  const { batches, addBatch } = useFlowerBatches();
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [batchDraft, setBatchDraft] = useState({
    productSlug: products[0]?.slug ?? "red-naomi-rose",
    origin: "هولندا" as FlowerOrigin,
    farm: "Porta Nova Farms",
    airwayBill: "SV-088-2940",
    flightNumber: "SV 128 (أمستردام - الرياض)",
    arrivalDate: new Date().toISOString().split("T")[0] ?? "2026-10-31",
    expiryDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split("T")[0] ?? "2026-11-10",
    vaseLifeDays: 10,
    coldStorageTemp: "2°C - 4°C",
    unit: "كرتون",
    onHandQty: 50,
    reservedQty: 0,
    status: "fresh" as FlowerBatch["status"],
  });

  const list = useMemo(
    () =>
      items.filter(
        (p) =>
          (cat === "all" || p.category === cat) &&
          (avail === "all" || (avail === "yes") === p.available) &&
          (state === "all" || (state === "active") === p.active) &&
          (p.name + p.sku + p.en).toLowerCase().includes(q.trim().toLowerCase())
      ),
    [items, q, cat, avail, state]
  );

  const patch = (slug: string, v: Partial<Item>) =>
    setItems((all) => all.map((p) => (p.slug === slug ? { ...p, ...v } : p)));

  const openNew = () => {
    setDraft(emptyDraft());
    setEditing("new");
  };

  const openEdit = (p: Item) => {
    setDraft({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unit: p.unit,
      moq: p.moq,
      price: p.price,
      available: p.available,
      active: p.active,
      image: productImage(p),
      seoTitle: p.seoTitle ?? "",
      seoDesc: p.seoDesc ?? "",
      seoKeywords: p.seoKeywords ?? "",
      seoSlug: p.seoSlug ?? p.slug,
    });
    setEditing(p.slug);
  };

  const pickImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("الملف يجب أن يكون صورة");
      return;
    }
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, image: String(r.result) }));
    r.readAsDataURL(file);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.sku.trim()) {
      toast.error("الاسم ورمز المنتج مطلوبان");
      return;
    }
    if (items.some((p) => p.sku === draft.sku.trim() && p.slug !== editing)) {
      toast.error("رمز المنتج مستخدم من قبل");
      return;
    }
    const values = { ...draft, name: draft.name.trim(), sku: draft.sku.trim() };
    if (editing === "new") {
      const base = items[0] ?? products[0];
      if (!base) return;
      setItems((all) => [{ ...base, ...values, slug: `new-${Date.now()}`, en: "" }, ...all]);
      toast.success("تمت إضافة المنتج بنجاح");
    } else if (editing) {
      patch(editing, values);
      toast.success("تم حفظ التعديلات");
    }
    setEditing(null);
  };

  const handleSaveBatch = (e: FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.slug === batchDraft.productSlug);
    addBatch({
      ...batchDraft,
      productName: prod?.name ?? "ورد مستورد",
      sku: prod?.sku ?? "SKU-EXP",
    });
    toast.success("تم تسجيل الشحنة المبردة وحجزها في المستودع بنجاح");
    setIsAddingBatch(false);
  };

  return (
    <>
      <PageTitle
        title="المنتجات والمخزون المبرد (Products & Cold-Chain Inventory)"
        desc="إدارة كتالوج المنتجات، الحد الأدنى للطلب (MOQ)، ومتابعة الشحنات المستوردة وفترة نضارتها (Vase-Life)."
        action={
          activeTab === "catalog" ? (
            <button onClick={openNew} className="btn btn-primary !h-10 !px-5 text-sm font-bold">
              <Plus className="size-4" /> إضافة منتج جديد
            </button>
          ) : (
            <button onClick={() => setIsAddingBatch(true)} className="btn btn-rose !h-10 !px-5 text-sm font-bold">
              <Plane className="size-4" /> تسجيل شحنة زهور جديدة
            </button>
          )
        }
      />

      {/* Tabs navigation */}
      <div className="mb-6 flex gap-2 border-b border-border/80 pb-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "catalog"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "bg-surface text-muted-foreground hover:bg-muted"
          }`}
        >
          <Box className="size-4" /> كتالوج المنتجات ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "batches"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "bg-surface text-muted-foreground hover:bg-muted"
          }`}
        >
          <Snowflake className="size-4" /> تتبع الشحنات المبردة والصلاحية ({batches.length})
        </button>
      </div>

      {activeTab === "catalog" ? (
        <Panel>
          <Toolbar q={q} setQ={setQ} placeholder="ابحث بالاسم أو رمز المنتج">
            <SelectFilter
              label="التصنيف"
              value={cat}
              onChange={setCat}
              options={categories.map((c) => [c.slug, c.name] as [string, string])}
            />
            <SelectFilter
              label="الحالة"
              value={state}
              onChange={setState}
              options={[
                ["active", "نشط"],
                ["inactive", "غير نشط"],
              ]}
            />
            <SelectFilter
              label="التوفر"
              value={avail}
              onChange={setAvail}
              options={[
                ["yes", "متوفر"],
                ["no", "غير متوفر"],
              ]}
            />
            <ExportButton
              file="products"
              sheet="المنتجات"
              rows={() =>
                list.map((p) => ({
                  المنتج: p.name,
                  الرمز: p.sku,
                  التصنيف: categoryOf(p.category)?.name ?? p.category,
                  "الحد الأدنى للطلب": `${p.moq} ${p.unit}`,
                  "السعر الأساسي (ر.س)": p.price,
                  الحالة: p.active ? "نشط" : "غير نشط",
                  التوفر: p.available ? "متوفر" : "غير متوفر",
                }))
              }
            />
          </Toolbar>

          <DataTable
            head={["المنتج", "التصنيف", "الحد الأدنى (MOQ)", "السعر الأساسي", "الحالة", "التوفر", "الإجراءات"]}
            empty={list.length === 0}
          >
            {list.map((p) => (
              <tr key={p.slug} className={p.active ? "" : "opacity-60"}>
                <td>
                  <div className="flex items-center gap-3">
                    <img
                      src={productImage(p)}
                      alt=""
                      className="size-11 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-bold text-forest">{p.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td>{categoryOf(p.category)?.name ?? p.category}</td>
                <td className="font-bold text-forest whitespace-nowrap">
                  {p.moq} {p.unit}
                </td>
                <td className="whitespace-nowrap font-bold text-rose">{sar(p.price)}</td>
                <td>
                  <Badge tone={p.active ? "sage" : "muted"}>
                    {p.active ? "نشط" : "غير نشط"}
                  </Badge>
                </td>
                <td>
                  <button
                    onClick={() => {
                      patch(p.slug, { available: !p.available });
                      toast.success("تم تحديث التوفر");
                    }}
                    aria-label={`تبديل توفر ${p.name}`}
                  >
                    <Badge tone={p.available ? "sage" : "danger"}>
                      {p.available ? "متوفر" : "غير متوفر"}
                    </Badge>
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border bg-surface px-3 text-xs font-bold text-forest hover:bg-muted"
                    >
                      <Pencil className="size-3.5" /> تعديل
                    </button>
                    <button
                      onClick={() => {
                        patch(p.slug, { active: !p.active });
                        toast.success(p.active ? "تم إيقاف المنتج" : "تم تفعيل المنتج");
                      }}
                      className={`inline-flex h-8 items-center gap-1 rounded-lg border px-3 text-xs font-bold ${
                        p.active
                          ? "text-destructive hover:bg-destructive/10"
                          : "text-primary hover:bg-primary/10"
                      }`}
                    >
                      <Power className="size-3.5" />
                      {p.active ? "إيقاف" : "تفعيل"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      ) : (
        /* Batches & Cold-Chain Inventory Tab */
        <Panel
          title="شحنات الورود المستوردة وسلسلة التبريد (Vase-Life & Inflow Tracking)"
          action={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> طازج
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-amber-500" /> قيد الشحن
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-rose-500" /> تصفية
              </span>
            </div>
          }
        >
          <DataTable
            head={[
              "رقم الشحنة (LOT)",
              "الصنف",
              "المزرعة والمنشأ",
              "الشحن الجوي",
              "تاريخ الوصول",
              "انتهاء الصلاحية",
              "المخزون بالمستودع",
              "المحجوز",
              "المتاح للبيع",
              "الحالة",
            ]}
            empty={batches.length === 0}
          >
            {batches.map((b) => {
              const available = Math.max(0, b.onHandQty - b.reservedQty);
              return (
                <tr key={b.id}>
                  <td className="font-mono font-bold text-forest" dir="ltr">
                    {b.id}
                  </td>
                  <td>
                    <div>
                      <p className="font-bold text-foreground">{b.productName}</p>
                      <p className="text-[11px] text-muted-foreground" dir="ltr">{b.sku}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-semibold">{b.farm}</p>
                      <p className="text-[11px] text-muted-foreground">{b.origin}</p>
                    </div>
                  </td>
                  <td className="text-xs font-mono text-muted-foreground" dir="ltr">
                    {b.flightNumber}
                  </td>
                  <td className="text-xs whitespace-nowrap">{b.arrivalDate}</td>
                  <td className="text-xs whitespace-nowrap font-bold text-amber-700">
                    {b.expiryDate}
                  </td>
                  <td className="text-center font-bold whitespace-nowrap">
                    {b.onHandQty} {b.unit}
                  </td>
                  <td className="text-center font-bold text-amber-600 whitespace-nowrap">
                    {b.reservedQty} {b.unit}
                  </td>
                  <td className="text-center font-black text-primary whitespace-nowrap">
                    {available} {b.unit}
                  </td>
                  <td>
                    <Badge
                      tone={
                        b.status === "fresh"
                          ? "sage"
                          : b.status === "incoming"
                          ? "gold"
                          : b.status === "clearing"
                          ? "rose"
                          : "muted"
                      }
                    >
                      {b.status === "fresh"
                        ? "طازج جداً"
                        : b.status === "incoming"
                        ? "في الشحن الجوي"
                        : b.status === "clearing"
                        ? "تصفية سريعة"
                        : "عادي"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>
      )}

      {/* Edit/Add Product Dialog */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-start text-forest">
              {editing === "new" ? "إضافة منتج جديد" : "تعديل بيانات المنتج والحد الأدنى"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 text-xs">
            <label className="block space-y-1">
              <span className="font-bold">اسم المنتج *</span>
              <input
                className="field !h-9 text-xs"
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold">رمز المنتج (SKU) *</span>
              <input
                className="field !h-9 text-xs font-mono"
                required
                value={draft.sku}
                onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold">الحد الأدنى للطلب (MOQ) *</span>
              <input
                type="number"
                min={1}
                className="field !h-9 text-xs"
                required
                value={draft.moq}
                onChange={(e) => setDraft((d) => ({ ...d, moq: Number(e.target.value) || 1 }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold">السعر الأساسي (ر.س) *</span>
              <input
                type="number"
                min={0}
                className="field !h-9 text-xs"
                required
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="font-bold">وحدة البيع</span>
              <select
                className="field !h-9 text-xs"
                value={draft.unit}
                onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
              >
                <option value="كرتون">كرتون</option>
                <option value="باقة">باقة</option>
                <option value="حزمة">حزمة</option>
                <option value="صندوق">صندوق مبرد</option>
              </select>
            </label>
            <div className="flex items-center gap-4 sm:col-span-2 pt-2 border-t">
              <button type="submit" className="btn btn-primary !h-9 text-xs font-bold">
                حفظ المنتج
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline !h-9 text-xs">
                إلغاء
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Flower Batch Dialog */}
      <Dialog open={isAddingBatch} onOpenChange={setIsAddingBatch}>
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-start text-forest flex items-center gap-2">
              <Plane className="size-5 text-rose" /> تسجيل شحنة زهور مستوردة جديدة
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBatch} className="grid gap-3 sm:grid-cols-2 text-xs">
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-bold">اختر صنف الزهور:</span>
              <select
                className="field !h-9 text-xs"
                value={batchDraft.productSlug}
                onChange={(e) => setBatchDraft((d) => ({ ...d, productSlug: e.target.value }))}
              >
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.sku}) — {p.origin}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-bold">بلد المنشأ:</span>
              <select
                className="field !h-9 text-xs"
                value={batchDraft.origin}
                onChange={(e) => setBatchDraft((d) => ({ ...d, origin: e.target.value as FlowerOrigin }))}
              >
                <option value="هولندا">هولندا</option>
                <option value="الإكوادور">الإكوادور</option>
                <option value="كينيا">كينيا</option>
                <option value="كولومبيا">كولومبيا</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-bold">اسم المزرعة المنتجة:</span>
              <input
                className="field !h-9 text-xs"
                required
                value={batchDraft.farm}
                onChange={(e) => setBatchDraft((d) => ({ ...d, farm: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">رقم الشحن الجوي (AWB):</span>
              <input
                className="field !h-9 text-xs font-mono"
                required
                value={batchDraft.airwayBill}
                onChange={(e) => setBatchDraft((d) => ({ ...d, airwayBill: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">الكمية المستلمة:</span>
              <input
                type="number"
                min={1}
                className="field !h-9 text-xs"
                required
                value={batchDraft.onHandQty}
                onChange={(e) => setBatchDraft((d) => ({ ...d, onHandQty: Number(e.target.value) || 1 }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">تاريخ الوصول:</span>
              <input
                type="date"
                className="field !h-9 text-xs"
                required
                value={batchDraft.arrivalDate}
                onChange={(e) => setBatchDraft((d) => ({ ...d, arrivalDate: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">تاريخ انتهاء النضارة (Vase-Life):</span>
              <input
                type="date"
                className="field !h-9 text-xs"
                required
                value={batchDraft.expiryDate}
                onChange={(e) => setBatchDraft((d) => ({ ...d, expiryDate: e.target.value }))}
              />
            </label>

            <div className="flex items-center gap-3 sm:col-span-2 pt-3 border-t">
              <button type="submit" className="btn btn-primary !h-9 text-xs font-bold">
                حفظ الشحنة وتحديث المخزون
              </button>
              <button type="button" onClick={() => setIsAddingBatch(false)} className="btn btn-outline !h-9 text-xs">
                إلغاء
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
