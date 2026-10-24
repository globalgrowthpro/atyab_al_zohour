import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, BadgeCheck, Building2, CalendarHeart, ClipboardList, Headset, Hotel, PackageCheck, Store, Tag, Truck, UserPlus, UtensilsCrossed, Leaf, Search, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import warehouse from "@/assets/warehouse.jpg";
import { categories, products } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

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
  ["كيف أسجّل حساب شركة؟", "من خلال صفحة «إنشاء حساب» بإدخال بيانات المنشأة والسجل التجاري، ويتم تفعيل الحساب بعد المراجعة."],
  ["لماذا لا تظهر الأسعار؟", "أسعار الجملة خاصة بكل حساب تجاري، وتظهر بعد تسجيل الدخول والموافقة على الحساب."],
  ["هل يتوفر التوصيل لجميع المناطق؟", "نوصّل عبر مندوبي الشركة، وتُحدد مناطق ومواعيد التوصيل حسب الفرع الأقرب."],
  ["كيف أعرف توفر المنتج؟", "تظهر حالة التوفر على كل منتج، وقد تختلف الأصناف الموسمية حسب الموسم."],
  ["هل يمكنني طلب عرض سعر لكميات كبيرة؟", "نعم، أضف المنتجات إلى طلبك واضغط «طلب عرض سعر» وسيتواصل معك فريق المبيعات."],
];

function Home() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [topCategoryApi, setTopCategoryApi] = useState<CarouselApi>();
  const [bottomCategoryApi, setBottomCategoryApi] = useState<CarouselApi>();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      void navigate({ to: "/products", search: { q: heroSearch.trim() } });
    }
  };

  const quickStories = useMemo(
    () => [
      { slug: "red-roses", name: "أحمر", img: "/flowers/red-rose.jpg" },
      { slug: "pink-roses", name: "وردي", img: "/flowers/pink-rose.jpg" },
      { slug: "white-roses", name: "أبيض", img: "/flowers/white-rose.jpg" },
      { slug: "seasonal-flowers", name: "موسمي", img: "/flowers/tulips.jpg" },
      { slug: "corporate-bouquets", name: "بوكيهات", img: "/flowers/ready-bouquet.jpg" },
      { slug: "dried-flowers", name: "مجفف", img: "/flowers/dried-flowers.jpg" },
    ],
    []
  );

  const topCategories = useMemo(() => categories.slice(0, 5), []);
  const bottomCategories = useMemo(() => categories.slice(4, 9), []);

  // Top row: plays from right (scrollNext in RTL)
  useEffect(() => {
    if (!topCategoryApi) return;
    const timer = setInterval(() => {
      topCategoryApi.scrollNext();
    }, 2800);
    return () => clearInterval(timer);
  }, [topCategoryApi]);

  // Down row: plays from left (scrollPrev in RTL)
  useEffect(() => {
    if (!bottomCategoryApi) return;
    const timer = setInterval(() => {
      bottomCategoryApi.scrollPrev();
    }, 2800);
    return () => clearInterval(timer);
  }, [bottomCategoryApi]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream pt-3 pb-8 sm:pb-14 md:py-20">
        {/* Desktop Background Photo */}
        <img
          src={hero}
          alt="تنسيق ورود وردية طبيعية فاخرة"
          width={1920}
          height={1088}
          className="hidden md:block absolute inset-0 size-full object-cover object-left opacity-100"
        />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-l from-cream via-cream/90 to-transparent" />

        <div className="container-x relative">
          {/* ================= MOBILE NEW STYLE (md:hidden) ================= */}
          <div className="md:hidden space-y-4">
            {/* 1. Quick Category Stories Strip (Scrollbar Hidden) */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 pt-1 -mx-4 px-4">
              {quickStories.map((s) => (
                <Link
                  key={s.slug}
                  to="/products"
                  search={{ category: s.slug }}
                  className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition"
                >
                  <div className="size-13 rounded-full p-0.5 bg-gradient-to-tr from-gold via-rose to-primary ring-2 ring-gold/30 shadow-2xs">
                    <img
                      src={s.img}
                      alt={s.name}
                      className="size-full rounded-full object-cover border-2 border-surface"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-forest group-hover:text-rose transition">
                    {s.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* 2. Visual Hero Showcase Card */}
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-lift border border-gold/30 aspect-[16/10] bg-forest">
              <img
                src={hero}
                alt="أطيب الزهور"
                className="size-full object-cover object-center opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />

              {/* Floating Badge (Top Right) */}
              <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-forest shadow-xs">
                <Sparkles className="size-3 text-gold" />
                <span>توريد جملة مباشر</span>
              </div>

              {/* Floating Pill (Top Left) */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-forest/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs border border-white/20">
                <Truck className="size-3 text-gold" />
                <span>نقل مبرد</span>
              </div>

              {/* Bottom Card Title */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                  منصة التوريد المعتمدة
                </span>
                <h1 className="text-2xl font-black leading-tight text-white mt-0.5 drop-shadow-sm">
                  أطيب الزهور...
                  <span className="block text-blush text-lg font-bold">شريككم في عالم الورود</span>
                </h1>
              </div>
            </div>

            {/* 3. Embedded Quick Search Bar */}
            <form onSubmit={handleHeroSearch} className="relative">
              <input
                type="search"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="ابحث عن نوع الورد، الصنف، أو المناسبة..."
                className="field !h-12 pr-11 pl-12 rounded-2xl bg-surface border-gold/30 shadow-soft text-xs"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-xl bg-primary text-primary-foreground grid place-items-center active:scale-95 transition shadow-2xs"
                aria-label="بحث"
              >
                <ArrowLeft className="size-4" />
              </button>
            </form>

            {/* 4. Action CTA Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                to="/products"
                className="btn btn-primary !h-11 !px-3 text-xs font-bold shadow-soft"
              >
                <span>تصفح الكتالوج</span>
                <ArrowLeft className="size-3.5" />
              </Link>
              <Link
                to="/quote"
                className="btn btn-rose !h-11 !px-3 text-xs font-bold shadow-soft"
              >
                <span>طلب تسعيرة جملة</span>
              </Link>
            </div>

            {/* 5. Mobile Quick Stats / Trust Strip */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 pb-1">
              <div className="rounded-2xl border border-border/80 bg-surface py-2.5 px-1.5 text-center shadow-2xs">
                <span className="block text-base font-black text-rose font-mono leading-none">+50</span>
                <span className="mt-1.5 block text-[11px] text-muted-foreground font-bold">صنف ورود</span>
              </div>
              <div className="rounded-2xl border border-border/80 bg-surface py-2.5 px-1.5 text-center shadow-2xs">
                <span className="block text-base font-black text-primary font-mono leading-none">100%</span>
                <span className="mt-1.5 block text-[11px] text-muted-foreground font-bold">نقل مبرد</span>
              </div>
              <div className="rounded-2xl border border-border/80 bg-surface py-2.5 px-1.5 text-center shadow-2xs">
                <span className="block text-base font-black text-gold font-mono leading-none">فوري</span>
                <span className="mt-1.5 block text-[11px] text-muted-foreground font-bold">عروض أسعار</span>
              </div>
            </div>
          </div>

          {/* ================= DESKTOP VIEW (hidden md:grid) ================= */}
          <div className="hidden md:grid min-h-[620px] items-center py-20">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/10 px-4 py-1.5 text-sm font-bold text-rose shadow-2xs backdrop-blur-xs">
                <span className="flex size-2 rounded-full bg-rose animate-pulse" />
                <span>توريد الورود بالجملة للشركات والمحلات</span>
              </div>

              <h1 className="mt-5 text-5xl md:text-6xl font-extrabold leading-[1.2] text-forest">
                أطيب الزهور...
                <span className="mt-1 block bg-gradient-to-l from-rose via-rose to-pink-700 bg-clip-text text-transparent">
                  شريككم في عالم الورود
                </span>
              </h1>

              <p className="mt-5 text-xl leading-9 text-foreground/85">
                توريد الورود الطبيعية بالجملة للمحلات والشركات والفنادق في المملكة العربية السعودية بسلسلة تبريد معتمدة.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/products" className="btn btn-primary !h-12 !px-6 text-sm shadow-soft">
                  <span>تصفح المنتجات</span>
                  <ArrowLeft className="size-4" />
                </Link>
                <Link to="/quote" className="btn btn-rose !h-12 !px-6 text-sm shadow-soft">
                  <span>طلب عرض سعر</span>
                </Link>
              </div>

              <div className="gold-rule my-7 max-w-md opacity-80" />

              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 font-bold text-primary">
                <div className="inline-flex items-center gap-1.5">
                  <Leaf className="size-4 text-gold shrink-0" />
                  <span>توريد مستمر</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-emerald-600 shrink-0" />
                  <span>جودة موثوقة</span>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <Truck className="size-4 text-rose shrink-0" />
                  <span>شحن مبرد</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="container-x mt-6 md:-mt-12 relative z-10">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border bg-surface p-3.5 shadow-lift sm:p-6 sm:gap-4 lg:grid-cols-4">
          {why.map(({ icon: I, t, d }) => (
            <div key={t} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-2.5 sm:gap-4 p-2 sm:p-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blush text-rose sm:size-12">
                <I className="size-5 sm:size-6" />
              </span>
              <div>
                <h3 className="text-sm font-bold sm:text-lg">{t}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x py-16 md:py-24">
        <SectionHead eyebrow="تسوّق حسب التصنيف" title="تشكيلة واسعة من أجود الورود والزهور" />

        {/* Mobile View: 2 Independent Rows Sliding in Opposite Directions */}
        <div className="space-y-3.5 md:hidden">
          {/* Top Row: plays from right */}
          <Carousel
            opts={{
              loop: true,
              align: "start",
              direction: "rtl",
            }}
            setApi={setTopCategoryApi}
            className="w-full"
          >
            <CarouselContent className="-ms-3">
              {topCategories.map((c, idx) => (
                <CarouselItem key={`${c.slug}-top-${idx}`} className="basis-[62%] sm:basis-[48%] ps-3">
                  <Link
                    to="/products"
                    search={{ category: c.slug }}
                    className="group relative h-[135px] overflow-hidden rounded-2xl shadow-soft block"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3.5">
                      <div>
                        <h3 className="text-sm font-bold !text-forest-foreground">{c.name}</h3>
                        <p className="text-[10px] text-forest-foreground/75" dir="ltr">{c.en}</p>
                      </div>
                      <span className="grid size-7 place-items-center rounded-full bg-surface/90 text-primary shadow-xs">
                        <ArrowLeft className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Down Row: plays from left */}
          <Carousel
            opts={{
              loop: true,
              align: "start",
              direction: "rtl",
            }}
            setApi={setBottomCategoryApi}
            className="w-full"
          >
            <CarouselContent className="-ms-3">
              {bottomCategories.map((c, idx) => (
                <CarouselItem key={`${c.slug}-bot-${idx}`} className="basis-[62%] sm:basis-[48%] ps-3">
                  <Link
                    to="/products"
                    search={{ category: c.slug }}
                    className="group relative h-[135px] overflow-hidden rounded-2xl shadow-soft block"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3.5">
                      <div>
                        <h3 className="text-sm font-bold !text-forest-foreground">{c.name}</h3>
                        <p className="text-[10px] text-forest-foreground/75" dir="ltr">{c.en}</p>
                      </div>
                      <span className="grid size-7 place-items-center rounded-full bg-surface/90 text-primary shadow-xs">
                        <ArrowLeft className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.slug} to="/products" search={{ category: c.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
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
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
          <div className="mt-10 text-center"><Link to="/products" className="btn btn-primary">عرض جميع المنتجات <ArrowLeft className="size-4" /></Link></div>
        </div>
      </section>

      {/* Steps */}
      <section className="container-x py-16 md:py-24">
        <SectionHead eyebrow="كيف تطلب بالجملة" title="أربع خطوات بسيطة" />
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-4">
          {steps.map(({ icon: I, t, d }, i) => (
            <div key={t} className="relative rounded-2xl border bg-surface p-4 text-center shadow-soft sm:p-6">
              <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 grid size-7 place-items-center rounded-full bg-gold text-xs font-bold text-forest sm:-top-4 sm:size-8 sm:text-sm">{i + 1}</span>
              <span className="mx-auto mt-2 grid size-12 place-items-center rounded-full bg-primary/10 text-primary sm:size-16"><I className="size-6 sm:size-7" /></span>
              <h3 className="mt-3 text-base font-bold text-forest sm:mt-4 sm:text-lg">{t}</h3>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">{d}</p>
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
            <Link to="/register" className="btn btn-rose">إنشاء حساب</Link>
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
