import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Building2, CalendarHeart, ClipboardList, Headset, Hotel, PackageCheck, Store, Tag, Truck, UserPlus, UtensilsCrossed, Leaf } from "lucide-react";
import hero from "@/assets/hero.jpg";
import warehouse from "@/assets/warehouse.jpg";
import { categories, products } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "أطيب الزهور | شريككم في عالم الورود — توريد بالجملة" },
      { name: "description", content: "توريد الورود الطبيعية بالجملة للمحلات والفنادق والشركات في المملكة العربية السعودية." },
      { property: "og:title", content: "أطيب الزهور | توريد الورود بالجملة" },
      { property: "og:description", content: "شريككم في عالم الورود — توريد مستمر وجودة موثوقة للشركات." },
    ],
  }),
  component: Home,
});

const why = [
  { icon: BadgeCheck, t: "ضمان الجودة", d: "ورود طازجة مختارة ومحفوظة بسلسلة تبريد متكاملة." },
  { icon: Tag, t: "أسعار الجملة", d: "أسعار خاصة حسب حساب الشركة وحجم الطلب." },
  { icon: Truck, t: "توصيل موثوق", d: "مندوبو توصيل تابعون للشركة بمواعيد محددة." },
  { icon: Headset, t: "دعم مخصص للأعمال", d: "فريق يتابع طلباتكم المتكررة واحتياجاتكم." },
];
const steps = [
  { icon: UserPlus, t: "أنشئ حساب شركة", d: "سجّل منشأتك أو ادخل إلى حسابك." },
  { icon: ClipboardList, t: "اختر المنتجات والكميات", d: "تصفح الكتالوج وحدد الكميات المطلوبة." },
  { icon: PackageCheck, t: "راجع الأسعار وأكّد", d: "اطلع على أسعارك الخاصة أو اطلب عرض سعر." },
  { icon: Truck, t: "استلم وتابع الطلب", d: "تابع حالة الطلب حتى وصوله إليك." },
];
const solutions = [
  { icon: Store, t: "محلات الورد" },
  { icon: Hotel, t: "الفنادق والمنتجعات" },
  { icon: UtensilsCrossed, t: "المطاعم والمقاهي" },
  { icon: CalendarHeart, t: "المناسبات والأعراس" },
  { icon: Building2, t: "الشركات والجهات" },
];
const faqs = [
  ["ما هو الحد الأدنى للطلب؟", "يختلف الحد الأدنى حسب المنتج، ويظهر بوضوح على بطاقة كل منتج (مثل 10 باقات)."],
  ["كيف أسجّل حساب شركة؟", "من خلال صفحة «إنشاء حساب شركة» بإدخال بيانات المنشأة والسجل التجاري، ويتم تفعيل الحساب بعد المراجعة."],
  ["لماذا لا تظهر الأسعار؟", "أسعار الجملة خاصة بكل حساب تجاري، وتظهر بعد تسجيل الدخول والموافقة على الحساب."],
  ["هل يتوفر التوصيل لجميع المناطق؟", "نوصّل عبر مندوبي الشركة، وتُحدد مناطق ومواعيد التوصيل حسب الفرع الأقرب."],
  ["كيف أعرف توفر المنتج؟", "تظهر حالة التوفر على كل منتج، وقد تختلف الأصناف الموسمية حسب الموسم."],
  ["هل يمكنني طلب عرض سعر لكميات كبيرة؟", "نعم، أضف المنتجات إلى طلبك واضغط «طلب عرض سعر» وسيتواصل معك فريق المبيعات."],
];

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <img src={hero} alt="تنسيق ورود وردية طبيعية" width={1920} height={1088} className="absolute inset-0 size-full object-cover object-left" />
        <div className="absolute inset-0 bg-gradient-to-l from-cream via-cream/90 to-transparent" />
        <div className="container-x relative grid min-h-[620px] items-center py-20">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-block rounded-full bg-rose px-4 py-1.5 text-sm font-bold text-rose-foreground">توريد بالجملة للشركات</span>
            <h1 className="mt-6 text-5xl leading-[1.25] md:text-6xl">
              أطيب الزهور...
              <span className="block text-rose">شريككم في عالم الورود</span>
            </h1>
            <p className="mt-6 text-xl leading-9 text-foreground/80">توريد الورود الطبيعية بالجملة للمحلات والشركات في المملكة العربية السعودية.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-primary">تصفح المنتجات <ArrowLeft className="size-4" /></Link>
              <Link to="/quote" className="btn btn-rose">طلب عرض سعر</Link>
            </div>
            <div className="gold-rule my-8 max-w-md" />
            <ul className="flex flex-wrap gap-x-8 gap-y-3 font-bold text-primary">
              {["توريد مستمر", "جودة موثوقة", "حلول مخصصة للشركات"].map((b) => (
                <li key={b} className="flex items-center gap-2"><Leaf className="size-4 text-gold" />{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="container-x -mt-12 relative z-10">
        <div className="grid gap-4 rounded-3xl border bg-surface p-6 shadow-lift sm:grid-cols-2 lg:grid-cols-4">
          {why.map(({ icon: I, t, d }) => (
            <div key={t} className="flex gap-4 p-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blush text-rose"><I className="size-6" /></span>
              <div><h3 className="text-lg">{t}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-24">
        <SectionHead eyebrow="تسوّق حسب التصنيف" title="تشكيلة واسعة من أجود الورود والزهور" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} to="/products/" search={{ category: c.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
              <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="size-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <div><h3 className="text-xl !text-forest-foreground">{c.name}</h3><p className="text-xs text-forest-foreground/70" dir="ltr">{c.en}</p></div>
                <span className="grid size-9 place-items-center rounded-full bg-surface text-primary"><ArrowLeft className="size-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-surface py-24">
        <div className="container-x">
          <SectionHead eyebrow="منتجات الجملة المميزة" title="الأكثر طلباً من عملائنا" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
          <div className="mt-10 text-center"><Link to="/products" className="btn btn-primary">عرض جميع المنتجات <ArrowLeft className="size-4" /></Link></div>
        </div>
      </section>

      {/* Steps */}
      <section className="container-x py-24">
        <SectionHead eyebrow="كيف تطلب بالجملة" title="أربع خطوات بسيطة" />
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map(({ icon: I, t, d }, i) => (
            <div key={t} className="relative rounded-2xl border bg-surface p-6 text-center shadow-soft">
              <span className="absolute -top-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 grid size-8 place-items-center rounded-full bg-gold font-bold text-forest">{i + 1}</span>
              <span className="mx-auto mt-2 grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><I className="size-7" /></span>
              <h3 className="mt-4 text-lg">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-blush/40 py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <img src={warehouse} alt="فريق أطيب الزهور يجهّز الطلبات في المستودع المبرد" loading="lazy" width={1280} height={960} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" />
          <div>
            <span className="eyebrow">من نحن</span>
            <h2 className="mt-4 text-4xl leading-tight">أطيب الزهور.. شريك نجاحكم في عالم الورود</h2>
            <p className="mt-6 text-lg leading-9 text-foreground/80">
              نستقبل الورود الطبيعية من موردين مختارين، ونحفظها في مستودعات مبردة، ثم نوزعها على عملائنا من الشركات عبر مندوبي التوصيل التابعين لنا — بالتزام كامل بالجودة والمواعيد.
            </p>
            <Link to="/about" className="btn btn-primary mt-8">المزيد عن الشركة <ArrowLeft className="size-4" /></Link>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="container-x py-24">
        <SectionHead eyebrow="حلول الجملة" title="حلول مصممة لكل قطاع" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {solutions.map(({ icon: I, t }) => (
            <Link key={t} to="/services" className="group rounded-2xl border bg-surface p-6 text-center shadow-soft transition hover:border-rose hover:-translate-y-1">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blush text-rose transition group-hover:bg-rose group-hover:text-rose-foreground"><I className="size-7" /></span>
              <h3 className="mt-4 text-base">{t}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-gradient px-8 py-16 text-center shadow-lift">
          <div className="gold-rule absolute inset-x-0 top-0" />
          <h2 className="text-3xl md:text-4xl !text-forest-foreground">ابدأ شراكتك التجارية مع أطيب الزهور</h2>
          <p className="mx-auto mt-4 max-w-xl text-forest-foreground/80">افتح حساب شركتك واحصل على أسعار جملة خاصة وطلبات متكررة بسهولة.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn btn-rose">إنشاء حساب شركة</Link>
            <Link to="/quote" className="btn btn-ghost-light">طلب عرض سعر</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface py-24">
        <div className="container-x max-w-3xl">
          <SectionHead eyebrow="الأسئلة الشائعة" title="إجابات سريعة لعملائنا" />
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`f${i}`} className="rounded-2xl border bg-cream px-5">
                <AccordionTrigger className="text-start text-base font-bold text-forest hover:no-underline">{q}</AccordionTrigger>
                <AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

export function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-12 text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}
