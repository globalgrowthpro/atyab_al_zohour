import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Handshake, Leaf, ShieldCheck } from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";
import warehouse from "@/assets/warehouse.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | أطيب الزهور" },
      { name: "description", content: "تعرف على أطيب الزهور — مورد الورود الطبيعية بالجملة في المملكة العربية السعودية." },
      { property: "og:title", content: "من نحن | أطيب الزهور" },
      { property: "og:description", content: "قصتنا وقيمنا في توريد الورود الطبيعية بالجملة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Leaf, title: "النضارة", text: "نختار زهوراً طازجة ونحافظ عليها حتى تصل إليك." },
  { icon: ShieldCheck, title: "الجودة", text: "فحص الجودة قبل الشحن لضمان ثبات المواصفات." },
  { icon: Handshake, title: "الشراكة", text: "علاقات طويلة الأمد مع عملائنا من المحلات والشركات." },
  { icon: Award, title: "الالتزام", text: "التزام بالمواعيد والكميات المتفق عليها." },
];

function AboutPage() {
  return (
    <>
      <PageBanner title="من نحن" crumb="من نحن" subtitle="أطيب الزهور — شريكك في توريد الورود الطبيعية بالجملة." />
      <section className="container-x grid items-center gap-12 py-16 lg:grid-cols-2">
        <div className="space-y-5">
          <span className="eyebrow">قصتنا</span>
          <h2 className="text-3xl md:text-4xl">نوصل جمال الطبيعة إلى أعمالكم</h2>
          <p className="leading-9 text-muted-foreground">
            أطيب الزهور متخصصة في توريد الورود والزهور الطبيعية ومستلزمات التنسيق بالجملة لمحلات الورد والفنادق والمطاعم والشركات ومنظمي المناسبات في المملكة العربية السعودية.
          </p>
          <p className="leading-9 text-muted-foreground">
            نعمل على توفير تشكيلة واسعة من الزهور من مصادر متعددة، مع الاهتمام بالحفظ والتبريد والتسليم لتصل الزهور بأفضل حال.
          </p>
          <Link to="/products" className="btn btn-primary">تصفح المنتجات</Link>
        </div>
        <img src={warehouse} alt="مستودع أطيب الزهور" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" />
      </section>
      <section className="bg-muted/60">
        <div className="container-x py-16">
          <div className="mb-10 text-center"><span className="eyebrow">قيمنا</span><h2 className="mt-3 text-3xl">ما يميزنا</h2></div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-card p-6 text-center shadow-soft">
                <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-accent text-primary"><Icon className="size-7" /></div>
                <h3 className="text-xl">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
