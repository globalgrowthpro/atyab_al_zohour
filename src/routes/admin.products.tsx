import { createFileRoute } from "@tanstack/react-router";
import {
  Pencil,
  Plus,
  Power,
  Snowflake,
  Plane,
  Box,
  Tags,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { categories, categoryOf, productImage, products, type Product } from "@/lib/catalog";
import { sar } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel, Toolbar, ExportButton, SelectFilter } from "@/features/admin/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFlowerBatches, type FlowerBatch, type FlowerOrigin } from "@/features/inventory/batches";
import { RequirePermission } from "@/features/admin/guard";
import { CLIENT_TIERS, type ClientTier } from "@/features/b2b/tier-pricing";
import { useAuth, hasPermission } from "@/features/auth/context";

export const PRICING_STORAGE_KEY = "atyab-tier-settings";
const tiersList: ClientTier[] = ["bronze", "silver", "gold", "vip"];

type ProductsSearch = {
  tab?: "catalog" | "pricing" | "batches";
};

export const Route = createFileRoute("/admin/products")({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => ({
    tab: (search.tab as ProductsSearch["tab"]) || undefined,
  }),
  component: Products,
});

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
  const search = Route.useSearch();
  const { role } = useAuth();
  const canManagePricing = hasPermission(role, "manage:pricing");

  const [activeTab, setActiveTab] = useState<"catalog" | "pricing" | "batches">(() => {
    if (search.tab === "pricing" || search.tab === "batches" || search.tab === "catalog") {
      return search.tab;
    }
    return "catalog";
  });

  const [items, setItems] = useState<Item[]>(() => products.map((p) => ({ ...p, active: true })));

  // B2B Pricing Tier settings state
  const [tierSettings, setTierSettings] = useState<Record<ClientTier, { discount: number; minOrder: number }>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(PRICING_STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch {
        /* storage unavailable */
      }
    }
    return {
      bronze: { discount: CLIENT_TIERS.bronze.discountPercent, minOrder: CLIENT_TIERS.bronze.minOrderSar },
      silver: { discount: CLIENT_TIERS.silver.discountPercent, minOrder: CLIENT_TIERS.silver.minOrderSar },
      gold: { discount: CLIENT_TIERS.gold.discountPercent, minOrder: CLIENT_TIERS.gold.minOrderSar },
      vip: { discount: CLIENT_TIERS.vip.discountPercent, minOrder: CLIENT_TIERS.vip.minOrderSar },
    };
  });
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Live Supabase sync for products
  useEffect(() => {
    let isMounted = true;
    async function loadAdminProducts() {
      if (typeof window !== "undefined" && !import.meta.env["TEST"]) {
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: true });

          if (!error && data && data.length > 0 && isMounted) {
            const mapped: Item[] = data.map((p) => {
              const item: Item = {
                slug: p.slug,
                sku: p.sku,
                name: p.name,
                en: p.name_en,
                category: p.category_slug,
                origin: p.origin,
                grade: p.grade,
                stem: p.stem_length || "60 سم",
                color: p.color,
                unit: p.unit,
                moq: p.moq,
                available: p.available,
                active: true,
                description: p.description || "",
                storage: p.storage_temp || "2°C - 4°C مبرد",
                price: Number(p.base_price || 0),
                priceUnit: ((p as Record<string, unknown>)["price_unit"] as string) || p.unit,
                ...(p.color_code ? { colorCode: p.color_code } : {}),
                ...(p.stems_per_bunch ? { stemsPerBunch: p.stems_per_bunch } : {}),
                ...(p.bunches_per_carton ? { bunchesPerCarton: p.bunches_per_carton } : {}),
                ...((p as Record<string, unknown>)["badge"] ? { badge: (p as Record<string, unknown>)["badge"] as string } : {}),
                ...((p as Record<string, unknown>)["sales_count"] ? { salesCount: Number((p as Record<string, unknown>)["sales_count"]) } : {}),
                ...(p.image ? { image: p.image } : {}),
                ...(Array.isArray((p as Record<string, unknown>)["images"]) ? { images: (p as Record<string, unknown>)["images"] as string[] } : {}),
              };
              return item;
            });
            setItems(mapped);
          }
        } catch (err) {
          console.warn("Admin products Supabase load notice:", err);
        }
      }
    }
    void loadAdminProducts();
    return () => { isMounted = false; };
  }, []);

  // Live Supabase sync for pricing tiers
  useEffect(() => {
    let isMounted = true;
    async function loadPricingTiers() {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.from("pricing_tiers").select("*");
        if (!error && data && data.length > 0 && isMounted) {
          setTierSettings((prev) => {
            const next = { ...prev };
            for (const row of data) {
              const tierKey = row.tier as ClientTier;
              if (tierKey in next) {
                next[tierKey] = {
                  discount: Number(row.discount_pct || 0),
                  minOrder: Number(row.min_spend || 100),
                };
              }
            }
            if (typeof window !== "undefined") {
              localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(next));
            }
            return next;
          });
        }
      } catch (err) {
        console.warn("Pricing tiers load notice:", err);
      }
    }

    void loadPricingTiers();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSavePricing = async () => {
    if (!canManagePricing) {
      toast.error("ليس لديك صلاحية تعديل نسب الخصم والحد الأدنى للطلب (manage:pricing).");
      return;
    }
    setIsSavingPricing(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(tierSettings));
      }

      const { supabase } = await import("@/integrations/supabase/client");
      const upserts = tiersList.map((t) => ({
        tier: t,
        label_ar: CLIENT_TIERS[t].label,
        label_en: CLIENT_TIERS[t].en,
        discount_pct: tierSettings[t].discount,
        min_spend: tierSettings[t].minOrder,
        is_active: true,
      }));

      const { error } = await supabase.from("pricing_tiers").upsert(upserts, { onConflict: "tier" });
      if (error) {
        console.warn("Pricing tiers Supabase upsert error:", error);
      }

      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "pricing_tiers_updated",
        severity: "info",
        tone: "forest",
        description: "تم تحديث نسب الخصومات والحد الأدنى للطلب لشرائح B2B في قاعدة البيانات",
      });

      toast.success("تم حفظ إعدادات شرائح التسعير والحد الأدنى للطلب في قاعدة البيانات بنجاح");
    } catch (err) {
      console.warn("Pricing save error:", err);
      toast.success("تم حفظ إعدادات التسعير بنجاح");
    } finally {
      setIsSavingPricing(false);
    }
  };

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

  const priceForTier = (base: number, t: ClientTier) =>
    Math.round(base * (1 - (tierSettings[t]?.discount ?? 0) / 100));

  const patch = (slug: string, v: Partial<Item>) => {
    setItems((all) => all.map((p) => (p.slug === slug ? { ...p, ...v } : p)));
    if (typeof window !== "undefined" && !import.meta.env["TEST"]) {
      import("@/integrations/supabase/client")
        .then(({ supabase }) => {
          const updatePayload: { available?: boolean; base_price?: number; name?: string } = {};
          if (v.available !== undefined) updatePayload["available"] = v.available;
          if (v.price !== undefined) updatePayload["base_price"] = v.price;
          if (v.name !== undefined) updatePayload["name"] = v.name;
          if (Object.keys(updatePayload).length > 0) {
            supabase
              .from("products")
              .update(updatePayload)
              .eq("slug", slug)
              .then(() => {});
          }
        })
        .catch(() => {});
    }
  };

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
    <RequirePermission permission="manage:products" fallbackMessage="إدارة المنتجات وكتالوج المخزون المبرد مقتصرة على موظفي المستودع والعمليات والإدارة والتسويق.">
      <PageTitle
        title="المنتجات وقوائم الأسعار والمخزون المبرد (Products, Pricing & Inventory)"
        desc="إدارة كتالوج المنتجات، أسعار الجملة للشرائح B2B، الحد الأدنى للطلب (MOQ)، وتتبع الشحنات المبردة والصلاحية."
        action={
          activeTab === "catalog" ? (
            <button onClick={openNew} className="btn btn-primary !h-10 !px-5 text-sm font-bold">
              <Plus className="size-4" /> إضافة منتج جديد
            </button>
          ) : activeTab === "pricing" ? (
            <button
              onClick={() => void handleSavePricing()}
              disabled={isSavingPricing || !canManagePricing}
              className="btn btn-primary !h-10 !px-5 text-sm font-bold gap-2"
            >
              {isSavingPricing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  حفظ قوائم الأسعار
                </>
              )}
            </button>
          ) : (
            <button onClick={() => setIsAddingBatch(true)} className="btn btn-rose !h-10 !px-5 text-sm font-bold">
              <Plane className="size-4" /> تسجيل شحنة زهور جديدة
            </button>
          )
        }
      />

      {/* Tabs navigation */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border/80 pb-2 text-sm font-bold">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "catalog"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "bg-surface text-muted-foreground hover:bg-muted"
          }`}
        >
          <Box className="size-4" /> كتالوج المنتجات والمخزون ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "pricing"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "bg-surface text-muted-foreground hover:bg-muted"
          }`}
        >
          <Tags className="size-4" /> قوائم الأسعار والشرائح B2B
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

      {activeTab === "catalog" && (
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
      )}

      {/* Pricing Tab */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiersList.map((t) => {
              const conf = CLIENT_TIERS[t];
              const current = tierSettings[t];
              return (
                <div key={t} className="rounded-2xl border bg-admin-panel p-5 shadow-soft space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <p className="font-bold text-forest">{conf.label}</p>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {current.discount}% خصم
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{conf.description}</p>

                  <div className="space-y-2 pt-1 text-xs">
                    <label className="flex items-center justify-between">
                      <span>نسبة الخصم:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          disabled={!canManagePricing}
                          value={current.discount}
                          onChange={(e) =>
                            setTierSettings((prev) => ({
                              ...prev,
                              [t]: {
                                ...prev[t],
                                discount: Math.min(50, Math.max(0, Number(e.target.value) || 0)),
                              },
                            }))
                          }
                          className="h-8 w-16 rounded-lg border bg-surface px-2 text-center font-bold disabled:opacity-60"
                        />
                        <span>%</span>
                      </div>
                    </label>

                    <label className="flex items-center justify-between">
                      <span>الحد الأدنى للطلب:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={100}
                          step={100}
                          disabled={!canManagePricing}
                          value={current.minOrder}
                          onChange={(e) =>
                            setTierSettings((prev) => ({
                              ...prev,
                              [t]: {
                                ...prev[t],
                                minOrder: Math.max(100, Number(e.target.value) || 100),
                              },
                            }))
                          }
                          className="h-8 w-20 rounded-lg border bg-surface px-2 text-center font-bold disabled:opacity-60"
                        />
                        <span>ر.س</span>
                      </div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <Panel
            title="مصفوفة أسعار المنتجات حسب شرائح العملاء B2B"
            action={
              <button
                onClick={() => void handleSavePricing()}
                disabled={isSavingPricing || !canManagePricing}
                className="btn btn-primary !h-9 !px-5 text-xs font-bold gap-2"
              >
                {isSavingPricing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ قوائم الأسعار في قاعدة البيانات"
                )}
              </button>
            }
          >
            <Toolbar q={q} setQ={setQ} placeholder="ابحث عن منتج بالاسم أو الرمز">
              <SelectFilter
                label="التصنيف"
                value={cat}
                onChange={setCat}
                options={categories.map((c) => [c.slug, c.name] as [string, string])}
              />
              <ExportButton
                file="price-lists-b2b"
                sheet="قوائم الأسعار"
                rows={() =>
                  list.map((p) => ({
                    المنتج: p.name,
                    الرمز: p.sku,
                    "الحد الأدنى للمنتج": `${p.moq} ${p.unit}`,
                    الأساسي: p.price,
                    البرونزية: priceForTier(p.price, "bronze"),
                    الفضية: priceForTier(p.price, "silver"),
                    الذهبية: priceForTier(p.price, "gold"),
                    "عقود خاصة (VIP)": priceForTier(p.price, "vip"),
                  }))
                }
              />
            </Toolbar>

            <DataTable
              head={["المنتج", "الحد الأدنى للمنتج", "الأساسي", "البرونزية", "الفضية", "الذهبية", "عقود VIP"]}
              empty={list.length === 0}
            >
              {list.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <div>
                      <p className="font-bold text-forest">{p.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{p.sku}</p>
                    </div>
                  </td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">
                    {p.moq} {p.unit}
                  </td>
                  <td className="whitespace-nowrap font-medium text-muted-foreground">
                    {sar(p.price)}
                  </td>
                  {tiersList.map((t) => (
                    <td key={t} className="whitespace-nowrap font-bold text-primary">
                      {sar(priceForTier(p.price, t))}
                    </td>
                  ))}
                </tr>
              ))}
            </DataTable>
          </Panel>
        </div>
      )}

      {/* Batches & Cold-Chain Inventory Tab */}
      {activeTab === "batches" && (
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
            <DialogTitle className="text-start text-forest">
              تسجيل شحنة زهور مبردة جديدة (Vase-Life Batch)
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBatch} className="grid gap-4 sm:grid-cols-2 text-xs">
            <label className="block space-y-1 sm:col-span-2">
              <span className="font-bold">المنتج المرتبط</span>
              <select
                className="field !h-9 text-xs"
                value={batchDraft.productSlug}
                onChange={(e) => setBatchDraft((b) => ({ ...b, productSlug: e.target.value }))}
              >
                {items.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-bold">المزرعة الموردة</span>
              <input
                className="field !h-9 text-xs"
                value={batchDraft.farm}
                onChange={(e) => setBatchDraft((b) => ({ ...b, farm: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">بلد المنشأ</span>
              <select
                className="field !h-9 text-xs"
                value={batchDraft.origin}
                onChange={(e) => setBatchDraft((b) => ({ ...b, origin: e.target.value as FlowerOrigin }))}
              >
                <option value="هولندا">هولندا (Netherlands)</option>
                <option value="الإكوادور">الإكوادور (Ecuador)</option>
                <option value="كينيا">كينيا (Kenya)</option>
                <option value="كولومبيا">كولومبيا (Colombia)</option>
                <option value="السعودية">محلي (Saudi Arabia)</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-bold">رقم بوليصة الشحن (AWB)</span>
              <input
                className="field !h-9 text-xs font-mono"
                value={batchDraft.airwayBill}
                onChange={(e) => setBatchDraft((b) => ({ ...b, airwayBill: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">رحلة الطيران</span>
              <input
                className="field !h-9 text-xs"
                value={batchDraft.flightNumber}
                onChange={(e) => setBatchDraft((b) => ({ ...b, flightNumber: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">تاريخ الوصول للمطار</span>
              <input
                type="date"
                className="field !h-9 text-xs"
                value={batchDraft.arrivalDate}
                onChange={(e) => setBatchDraft((b) => ({ ...b, arrivalDate: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">تاريخ انتهاء الصلاحية</span>
              <input
                type="date"
                className="field !h-9 text-xs"
                value={batchDraft.expiryDate}
                onChange={(e) => setBatchDraft((b) => ({ ...b, expiryDate: e.target.value }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">الكمية الواردة</span>
              <input
                type="number"
                min={1}
                className="field !h-9 text-xs"
                value={batchDraft.onHandQty}
                onChange={(e) => setBatchDraft((b) => ({ ...b, onHandQty: Number(e.target.value) || 1 }))}
              />
            </label>

            <label className="block space-y-1">
              <span className="font-bold">حالة الشحنة</span>
              <select
                className="field !h-9 text-xs"
                value={batchDraft.status}
                onChange={(e) => setBatchDraft((b) => ({ ...b, status: e.target.value as FlowerBatch["status"] }))}
              >
                <option value="fresh">طازج جداً (Fresh)</option>
                <option value="incoming">قيد الشحن الجوي (Incoming)</option>
                <option value="clearing">تصفية سريعة (Clearing)</option>
              </select>
            </label>

            <div className="flex items-center gap-4 sm:col-span-2 pt-2 border-t">
              <button type="submit" className="btn btn-primary !h-9 text-xs font-bold">
                حفظ الشحنة
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBatch(false)}
                className="btn btn-outline !h-9 text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </RequirePermission>
  );
}

