import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "عروض الجملة | أطيب الزهور" }, { name: "description", content: "عروض الجملة — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "عروض الجملة | أطيب الزهور" }, { property: "og:description", content: "عروض الجملة — أطيب الزهور." }] }),
  component: () => <PageBanner title="عروض الجملة" crumb="عروض الجملة" subtitle="هذه الصفحة قيد التجهيز." />,
});
