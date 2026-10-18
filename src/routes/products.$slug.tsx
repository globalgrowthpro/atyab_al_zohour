import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/catalog";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => { const p = products.find((x) => x.slug === params.slug); if (!p) throw notFound(); return p; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? "منتج"} | أطيب الزهور` }, { name: "description", content: loaderData?.description ?? "" }, { property: "og:title", content: loaderData?.name ?? "منتج" }, { property: "og:description", content: loaderData?.description ?? "" }] }),
  component: () => { const p = Route.useLoaderData(); return (<><PageBanner title={p.name} crumb={p.name} subtitle={p.description} /><div className="container-x max-w-sm py-16"><ProductCard p={p} /></div></>); },
});
