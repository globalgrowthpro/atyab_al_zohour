import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "من نحن | أطيب الزهور" }, { name: "description", content: "من نحن — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "من نحن | أطيب الزهور" }, { property: "og:description", content: "من نحن — أطيب الزهور." }] }),
  component: () => <PageBanner title="من نحن" crumb="من نحن" subtitle="هذه الصفحة قيد التجهيز." />,
});
