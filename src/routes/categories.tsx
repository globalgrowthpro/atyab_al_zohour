import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";
import { categories, products } from "@/lib/catalog";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "التصنيفات | أطيب الزهور" },
      { name: "description", content: "تصفح تصنيفات الورود والزهور ومستلزمات التنسيق بالجملة لدى أطيب الزهور." },
      { property: "og:title", content: "التصنيفات | أطيب الزهور" },
      { property: "og:description", content: "ورود، زنابق، قرنفل، أوراق زينة ومستلزمات تنسيق بالجملة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <PageBanner title="التصنيفات" crumb="التصنيفات" subtitle="اختر التصنيف المناسب لمحلك أو مناسبتك وتصفح المنتجات المتوفرة بالجملة." />
      <section className="container-x py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const items = products.filter((p) => p.category === c.slug);
            const available = items.filter((p) => p.available).length;
            return (
              <Link key={c.slug} to="/products" search={{ category: c.slug }} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={c.image} alt={c.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
                  <div className="absolute bottom-3 start-4">
                    <h2 className="text-2xl !text-forest-foreground">{c.name}</h2>
                    <p className="text-xs text-forest-foreground/80" dir="ltr">{c.en}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 text-sm">
                  <span className="text-muted-foreground">{items.length} منتج · {available} متوفر</span>
                  <span className="flex items-center gap-1 font-bold text-primary">تصفح <ArrowLeft className="size-4 transition group-hover:-translate-x-1" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
