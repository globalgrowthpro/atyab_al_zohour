import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ShoppingCart, FileText, Snowflake, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ProductCard, QtyStepper } from "@/components/site/ProductCard";
import { categoryOf, productImage, products } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

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
  const [qty, setQty] = useState(p.moq);
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).concat(products.filter((x) => x.category !== p.category)).slice(0, 4);
  const specs: [string, string | number | undefined][] = [
    ["رمز المنتج", p.sku], ["التصنيف", cat?.name], ["المنشأ", p.origin], ["الدرجة", p.grade],
    ["طول الساق", p.stem], ["اللون", p.color], ["وحدة البيع", p.unit], ["الحد الأدنى للطلب", `${p.moq} ${p.unit}`],
    ["عدد السيقان في الباقة", p.stemsPerBunch], ["عدد الباقات في الكرتون", p.bunchesPerCarton],
  ];

  return (
    <>
      <div className="container-x py-5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">الرئيسية</Link> / <Link to="/products" className="hover:text-primary">المنتجات</Link>
        {cat && <> / <Link to="/products" search={{ category: cat.slug }} className="hover:text-primary">{cat.name}</Link></>} / <span className="text-foreground">{p.name}</span>
      </div>
      <section className="container-x grid gap-10 pb-16 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border bg-muted shadow-soft">
          <img src={productImage(p)} alt={p.name} className="aspect-square size-full object-cover" width={816} height={816} />
        </div>
        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${p.available ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {p.available ? "متوفر" : "غير متوفر حالياً"}
          </span>
          <h1 className="mt-3 text-4xl">{p.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">{p.en} · {p.sku}</p>
          <p className="mt-5 text-lg leading-8">{p.description}</p>

          <Link to="/login" className="mt-6 flex items-center gap-2 rounded-2xl bg-blush/60 p-4 font-bold text-forest">
            <Lock className="size-4 text-rose" /> سجّل الدخول لعرض سعر الجملة الخاص بحسابك
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} min={p.moq} />
            <button disabled={!p.available} onClick={() => { add(p.slug, qty); toast.success(`تمت إضافة ${p.name} إلى الطلب`); }} className="btn btn-primary flex-1">
              <ShoppingCart className="size-4" /> أضف للطلب
            </button>
            <Link to="/quote" className="btn btn-outline"><FileText className="size-4" /> اطلب عرض سعر</Link>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">الحد الأدنى للطلب: {p.moq} {p.unit}</p>

          <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border text-sm">
            {specs.filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="border-b bg-surface p-3 text-muted-foreground">{k}</dt>
                <dd className="border-b p-3 font-bold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="flex items-start gap-2 rounded-xl border p-3"><Snowflake className="size-5 shrink-0 text-primary" /><span>{p.storage}</span></div>
            <div className="flex items-start gap-2 rounded-xl border p-3"><Truck className="size-5 shrink-0 text-primary" /><span>توصيل مبرّد للمحلات والفعاليات.</span></div>
            <div className="flex items-start gap-2 rounded-xl border p-3"><ShieldCheck className="size-5 shrink-0 text-primary" /><span>فحص الجودة قبل الشحن.</span></div>
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
