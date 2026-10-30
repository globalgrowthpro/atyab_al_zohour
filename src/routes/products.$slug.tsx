import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ShoppingCart, FileText, Snowflake, Truck, ShieldCheck, Sparkles, Plane, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ProductCard, QtyStepper } from "@/components/site/ProductCard";
import { categoryOf, productImage, products } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useClientTier, calculateTierPrice, CLIENT_TIERS, type ClientTier } from "@/features/b2b/tier-pricing";
import { getProductInventorySummary } from "@/features/inventory/batches";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const p = products.find((x) => x.slug === params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "منتج"} | أطيب الزهور` },
      { name: "description", content: loaderData?.description ?? "منتج من أطيب الزهور" },
      { property: "og:title", content: loaderData?.name ?? "منتج" },
      { property: "og:description", content: loaderData?.description ?? "منتج من أطيب الزهور" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl">المنتج غير موجود</h1>
      <Link to="/products" className="btn btn-primary mt-6">العودة للمنتجات</Link>
    </div>
  ),
  errorComponent: () => <div className="container-x py-24 text-center">حدث خطأ أثناء تحميل المنتج.</div>,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const cat = categoryOf(p.category);
  const { add } = useCart();
  const [tier, setTier] = useClientTier();
  const inv = getProductInventorySummary(p.slug);
  const tierPrice = calculateTierPrice(p.price, tier);
  const [qty, setQty] = useState(p.moq || 1);

  const related = products
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .concat(products.filter((x) => x.category !== p.category))
    .slice(0, 4);

  const specs: [string, string | number | undefined][] = [
    ["رمز المنتج", p.sku],
    ["التصنيف", cat?.name],
    ["المنشأ", p.origin],
    ["الدرجة", p.grade],
    ["طول الساق", p.stem],
    ["اللون", p.color],
    ["وحدة البيع", p.unit],
    ["الحد الأدنى للطلب (MOQ)", `${p.moq} ${p.unit}`],
    ["عدد السيقان في الباقة", p.stemsPerBunch],
    ["عدد الباقات في الكرتون", p.bunchesPerCarton],
  ];

  return (
    <>
      <div className="container-x py-5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">الرئيسية</Link> / <Link to="/products" className="hover:text-primary">المنتجات</Link>
        {cat && <> / <Link to="/products" search={{ category: cat.slug }} className="hover:text-primary">{cat.name}</Link></>} / <span className="text-foreground">{p.name}</span>
      </div>

      <section className="container-x grid gap-10 pb-16 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border bg-muted shadow-soft">
            <img src={productImage(p)} alt={p.name} className="aspect-square size-full object-cover" width={816} height={816} />
          </div>

          {/* Perishable Batch & Cold Chain Info */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm space-y-3">
            <div className="flex items-center justify-between border-b border-primary/10 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-forest">
                <Snowflake className="size-4 text-primary" /> تتبع الشحنة المبردة والنضارة (Vase-Life)
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {inv.freshnessLabel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface p-2.5 shadow-2xs border">
                <p className="text-[11px] text-muted-foreground">المستلم بالمستودع</p>
                <p className="text-base font-black text-forest">{inv.onHand} <span className="text-xs font-normal">{p.unit}</span></p>
              </div>
              <div className="rounded-xl bg-surface p-2.5 shadow-2xs border">
                <p className="text-[11px] text-muted-foreground">محجوز لطلبات</p>
                <p className="text-base font-black text-amber-600">{inv.reserved} <span className="text-xs font-normal">{p.unit}</span></p>
              </div>
              <div className="rounded-xl bg-surface p-2.5 shadow-2xs border border-primary/30">
                <p className="text-[11px] text-muted-foreground">متاح للطلب الفوري</p>
                <p className="text-base font-black text-primary">{inv.available} <span className="text-xs font-normal">{p.unit}</span></p>
              </div>
            </div>

            {inv.activeBatch && (
              <div className="text-xs text-muted-foreground space-y-1 bg-surface/60 rounded-xl p-2.5 border">
                <div className="flex justify-between">
                  <span>رقم الشحنة: <strong className="text-forest" dir="ltr">{inv.activeBatch.id}</strong></span>
                  <span>المزرعة: <strong className="text-forest">{inv.activeBatch.farm}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الوصول: <strong className="text-forest">{inv.activeBatch.arrivalDate}</strong></span>
                  <span>صلاحية النضارة حتى: <strong className="text-forest">{inv.activeBatch.expiryDate}</strong></span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>الشحن الجوي: <strong className="text-forest" dir="ltr">{inv.activeBatch.flightNumber}</strong></span>
                  <span>درجة التبريد: <strong className="text-forest">{inv.activeBatch.coldStorageTemp}</strong></span>
                </div>
              </div>
            )}

            {inv.incoming && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200">
                <Plane className="size-4 shrink-0 text-amber-600" />
                <span>
                  شحنة إضافية في الشحن الجوي من <strong>{inv.incoming.origin}</strong> تصل بتاريخ <strong>{inv.incoming.arrivalDate}</strong> ({inv.incoming.onHandQty} {p.unit}).
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${p.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {p.available ? "متوفر بالمستودع المبرد" : "غير متوفر حالياً"}
          </span>
          <h1 className="mt-3 text-4xl">{p.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">{p.en} · {p.sku}</p>
          <p className="mt-5 text-lg leading-8">{p.description}</p>

          {/* Tier Pricing Matrix */}
          <div className="mt-6 rounded-2xl border bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-forest">
                <Sparkles className="size-4 text-rose" /> جدول تسعير الجملة حسب شريحة العميل (B2B Tiers)
              </span>
              <span className="text-xs text-muted-foreground">شريحتك الحالية: <strong className="text-primary">{CLIENT_TIERS[tier].label.split("—")[0]}</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CLIENT_TIERS) as ClientTier[]).map((tKey) => {
                const conf = CLIENT_TIERS[tKey];
                const priceForTier = calculateTierPrice(p.price, tKey);
                const isActive = tier === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setTier(tKey)}
                    className={`rounded-xl border p-2.5 text-start transition ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                        : "border-border/60 hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-[11px] font-bold text-muted-foreground">{conf.label.split("—")[0]}</p>
                    <p className="mt-1 text-base font-black text-rose">{priceForTier} <span className="text-xs font-normal">ر.س</span></p>
                    <p className="text-[10px] text-muted-foreground">
                      {conf.discountPercent > 0 ? `خصم ${conf.discountPercent}%` : "سعر أساسي"}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              الحد الأدنى لطلب الجملة: <strong>{p.moq} {p.unit}</strong> لكل منتج، وإجمالي طلبات الشريحة لا يقل عن <strong>{CLIENT_TIERS[tier].minOrderSar} ر.س</strong>.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} min={p.moq || 1} />
            <button
              disabled={!p.available || inv.available < (p.moq || 1)}
              onClick={() => {
                if (qty > inv.available) {
                  toast.error(`الكمية المتاحة حالياً بالمستودع هي ${inv.available} ${p.unit} فقط (الباقي محجوز).`);
                  return;
                }
                add(p.slug, qty);
                toast.success(`تمت إضافة ${qty} ${p.unit} من ${p.name} إلى السلة بسعر ${tierPrice} ر.س.`);
              }}
              className="btn btn-primary flex-1"
            >
              <ShoppingCart className="size-4" /> أضف للطلب ({qty * tierPrice} ر.س)
            </button>
            <Link to="/quote" className="btn btn-outline"><FileText className="size-4" /> طلب عرض سعر</Link>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            الحد الأدنى للمنتج: {p.moq} {p.unit} · الكمية المتاحة بدون حجز مسبق: {inv.available} {p.unit}
          </p>

          <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border text-sm">
            {specs.filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="border-b bg-surface p-3 text-muted-foreground">{k}</dt>
                <dd className="border-b p-3 font-bold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="flex items-start gap-2 rounded-xl border p-3">
              <Snowflake className="size-5 shrink-0 text-primary" />
              <span>{p.storage}</span>
            </div>
            <div className="flex items-start gap-2 rounded-xl border p-3">
              <Truck className="size-5 shrink-0 text-primary" />
              <span>شحن مبرّد بالكامل (2°C - 6°C) للمحلات وقاعات المناسبات.</span>
            </div>
            <div className="flex items-start gap-2 rounded-xl border p-3">
              <ShieldCheck className="size-5 shrink-0 text-primary" />
              <span>فحص جودة السيقان والنضارة قبل خروج الشاحنة.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-x">
          <h2 className="text-3xl">منتجات ذات صلة</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.slug} p={r} />)}
          </div>
        </div>
      </section>
    </>
  );
}
