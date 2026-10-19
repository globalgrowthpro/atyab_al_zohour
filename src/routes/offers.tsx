import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, Layers, Repeat, BadgePercent } from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "عروض الجملة | أطيب الزهور" },
      { name: "description", content: "عروض الجملة على الورود والزهور: كميات كبيرة، طلبات متكررة، ومواسم ومناسبات." },
      { property: "og:title", content: "عروض الجملة | أطيب الزهور" },
      { property: "og:description", content: "عروض حصرية لعملاء الجملة المسجلين لدى أطيب الزهور." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

const programs = [
  { icon: Layers, title: "عروض الكميات", text: "أسعار أفضل كلما زادت كمية الطلب بالكرتون أو الباقة." },
  { icon: Repeat, title: "الطلبات المتكررة", text: "مزايا خاصة للمحلات والفنادق ذات الطلبات الأسبوعية الثابتة." },
  { icon: CalendarHeart, title: "المواسم والمناسبات", text: "تجهيز مبكر لمواسم الأعراس والأعياد والمناسبات الوطنية." },
  { icon: BadgePercent, title: "عروض الحساب", text: "تظهر الأسعار والخصومات الخاصة بحسابك بعد تسجيل الدخول." },
];

function OffersPage() {
  const featured = products.filter((p) => p.available).slice(0, 4);
  return (
    <>
      <PageBanner title="عروض الجملة" crumb="عروض الجملة" subtitle="عروض مخصصة لعملاء الجملة — سجّل حسابك لتظهر لك الأسعار والخصومات الخاصة بك." />
      <section className="container-x py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <span className="grid size-12 place-items-center rounded-xl bg-blush/60 text-rose"><Icon className="size-6" /></span>
              <h2 className="mt-4 text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-surface py-16">
        <div className="container-x">
          <p className="eyebrow">منتجات مختارة</p>
          <h2 className="mt-2 text-3xl">متوفرة الآن للطلب</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
      <section className="container-x py-16">
        <div className="rounded-3xl bg-forest-gradient p-10 text-center">
          <h2 className="text-3xl !text-forest-foreground">تحتاج عرضاً لكمية كبيرة أو مناسبة؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-forest-foreground/85">أرسل طلب عرض سعر وسنجهز لك عرضاً مناسباً لاحتياجك.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/quote" className="btn btn-rose">اطلب عرض سعر</Link>
            <Link to="/register" className="btn btn-ghost-light">افتح حساب جملة</Link>
          </div>
        </div>
      </section>
    </>
  );
}
