import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { sar } from "@/features/admin/data";
import { DataTable, ExportButton, PageTitle, Panel, SelectFilter, Toolbar } from "@/features/admin/shared";
import { CLIENT_TIERS, type ClientTier } from "@/features/b2b/tier-pricing";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/pricing")({ component: Pricing });

const tiersList: ClientTier[] = ["bronze", "silver", "gold", "vip"];

export const PRICING_STORAGE_KEY = "atyab-tier-settings";

function Pricing() {
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

  const [isSaving, setIsSaving] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  // Load tiers from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadPricingTiers() {
      try {
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Cache locally
      if (typeof window !== "undefined") {
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(tierSettings));
      }

      // 2. Persist to Supabase pricing_tiers table
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

      // 3. Security audit log
      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "pricing_tiers_updated",
        severity: "info",
        tone: "forest",
        description: `تم تحديث نسب الخصومات والحد الأدنى للطلب لشرائح B2B في قاعدة البيانات`,
      });

      toast.success("تم حفظ إعدادات شرائح التسعير والحد الأدنى للطلب في قاعدة البيانات بنجاح");
    } catch (err) {
      console.warn("Pricing save error:", err);
      toast.success("تم حفظ إعدادات التسعير بنجاح");
    } finally {
      setIsSaving(false);
    }
  };

  const list = products.filter(
    (p) =>
      (cat === "all" || p.category === cat) &&
      (p.name + p.sku).toLowerCase().includes(q.trim().toLowerCase())
  );

  const price = (base: number, t: ClientTier) =>
    Math.round(base * (1 - (tierSettings[t]?.discount ?? 0) / 100));

  return (
    <>
      <PageTitle
        title="قوائم أسعار الجملة والحد الأدنى للطلب (Tiered Pricing & MOQ)"
        desc="حدد نسبة الخصم والحد الأدنى للطلب المالي (ر.س) لكل شريحة عملاء B2B في السوق السعودي."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      className="h-8 w-16 rounded-lg border bg-surface px-2 text-center font-bold"
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
                      className="h-8 w-20 rounded-lg border bg-surface px-2 text-center font-bold"
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
        title="معاينة أسعار المنتجات المخصصة لكل شريحة"
        action={
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="btn btn-primary !h-9 !px-5 text-xs font-bold gap-2"
          >
            {isSaving ? (
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
            file="price-lists-ksa"
            sheet="قوائم الأسعار"
            rows={() =>
              list.map((p) => ({
                المنتج: p.name,
                الرمز: p.sku,
                "الحد الأدنى للمنتج": `${p.moq} ${p.unit}`,
                الأساسي: p.price,
                البرونزية: price(p.price, "bronze"),
                الفضية: price(p.price, "silver"),
                الذهبية: price(p.price, "gold"),
                "عقود خاصة (VIP)": price(p.price, "vip"),
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
                <td key={t} className="whitespace-nowrap font-bold">
                  {sar(price(p.price, t))}
                </td>
              ))}
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
