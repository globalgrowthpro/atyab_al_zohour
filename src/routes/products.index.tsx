import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/catalog";

type S = { q?: string; category?: string };
export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): S => ({ q: typeof s.q === "string" ? s.q : undefined, category: typeof s.category === "string" ? s.category : undefined }),
  head: () => ({ meta: [{ title: "المنتجات | أطيب الزهور" }, { name: "description", content: "كتالوج الورود والزهور بالجملة." }, { property: "og:title", content: "المنتجات | أطيب الزهور" }, { property: "og:description", content: "كتالوج الورود بالجملة." }] }),
  component: Products,
});
function Products() {
  const { q, category } = Route.useSearch();
  const list = products.filter((p) => (!category || p.category === category) && (!q || p.name.includes(q) || p.en.toLowerCase().includes(q.toLowerCase())));
  return (<><PageBanner title="المنتجات" crumb="المنتجات" subtitle="مجموعة واسعة من الورود الطبيعية لتلبية احتياجات الشركات." />
    <div className="container-x grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div></>);
}
