import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Award,
  PackageCheck,
  Coins,
  Truck,
  ArrowLeft,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categories, type Product } from "@/lib/catalog";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import heroImg from "@/assets/hero.jpg";
import warehouseImg from "@/assets/warehouse.jpg";

type SearchParams = {
  q?: string | undefined;
  category?: string | undefined;
  origin?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sort?: string | undefined;
  page?: number | undefined;
};

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
    category: typeof s["category"] === "string" ? s["category"] : undefined,
    origin: typeof s["origin"] === "string" ? s["origin"] : undefined,
    minPrice: typeof s["minPrice"] === "number" ? s["minPrice"] : undefined,
    maxPrice: typeof s["maxPrice"] === "number" ? s["maxPrice"] : undefined,
    sort: typeof s["sort"] === "string" ? s["sort"] : undefined,
    page: typeof s["page"] === "number" ? s["page"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "منتجاتنا — أجود أنواع الورود بالجملة | أطيب الزهور" },
      {
        name: "description",
        content:
          "مجموعة واسعة من الورود الطبيعية المستوردة والمحلية لتلبية احتياجات الشركات والمحلات في جميع أنحاء المملكة.",
      },
      { property: "og:title", content: "منتجاتنا — أجود أنواع الورود بالجملة | أطيب الزهور" },
      {
        property: "og:description",
        content: "توريد الورود الطبيعية بالجملة بأسعار خاصة للشركات والمحلات.",
      },
    ],
  }),
  component: ProductsPage,
});

const ORIGINS = [
  "محلي (السعودية)",
  "هولندا",
  "كولومبيا",
  "كينيا",
  "تركيا",
  "أخرى",
];

const COLOR_SWATCHES = [
  { name: "أحمر", code: "#DC2626" },
  { name: "وردي", code: "#F472B6" },
  { name: "أبيض", code: "#FFFFFF" },
  { name: "برتقالي", code: "#FB923C" },
  { name: "أصفر", code: "#FACC15" },
  { name: "ملون", code: "#701A75" },
  { name: "بنفسجي", code: "#DDD6FE" },
  { name: "خوخي", code: "#FDBA74" },
  { name: "أخضر", code: "#16A34A" },
];

const ITEMS_PER_PAGE = 12;

function ProductsPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  // Search and Filter States
  const [q, setQ] = useState(searchParams.q || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.category || "all");
  const [maxPrice, setMaxPrice] = useState<number>(searchParams.maxPrice || 500);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(
    searchParams.origin ? searchParams.origin.split(",") : []
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>(searchParams.sort || "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(searchParams.page || 1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL search params change
  useEffect(() => {
    if (searchParams.q !== undefined) setQ(searchParams.q);
    if (searchParams.category !== undefined) setSelectedCategory(searchParams.category);
    if (searchParams.page !== undefined) setCurrentPage(searchParams.page);
  }, [searchParams.q, searchParams.category, searchParams.page]);

  // Distinct primary categories for the sidebar matching UI mockup
  const sidebarCategories = useMemo(() => {
    return [
      { slug: "all", name: "جميع المنتجات", count: products.length, image: "/flowers/ready-bouquet.jpg" },
      { slug: "red-roses", name: "الورد الأحمر", count: 8, image: "/flowers/red-rose.jpg" },
      { slug: "pink-roses", name: "الورد الوردي", count: 7, image: "/flowers/pink-rose.jpg" },
      { slug: "white-roses", name: "الورد الأبيض", count: 6, image: "/flowers/white-rose.jpg" },
      { slug: "mixed-roses", name: "الورد الملون", count: 5, image: "/flowers/mixed-roses.jpg" },
      { slug: "orange-roses", name: "الورد البرتقالي", count: 4, image: "/flowers/orange-rose.jpg" },
      { slug: "yellow-roses", name: "الورد الأصفر", count: 4, image: "/flowers/yellow-rose.jpg" },
      { slug: "seasonal-flowers", name: "الورود الموسمية", count: 6, image: "/flowers/tulips.jpg" },
      { slug: "dried-flowers", name: "ورود مجففة", count: 4, image: "/flowers/dried-flowers.jpg" },
    ];
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      // Search text match
      if (q.trim()) {
        const query = q.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesEn = p.en.toLowerCase().includes(query);
        const matchesOrigin = p.origin.toLowerCase().includes(query);
        if (!matchesName && !matchesEn && !matchesOrigin) return false;
      }

      // Category match
      if (selectedCategory && selectedCategory !== "all") {
        if (p.category !== selectedCategory) {
          // Handle category aliases if any
          if (selectedCategory === "roses" && !["red-roses", "pink-roses", "white-roses", "mixed-roses", "orange-roses", "yellow-roses"].includes(p.category)) {
            return false;
          } else if (p.category !== selectedCategory) {
            return false;
          }
        }
      }

      // Price filter (50 to maxPrice)
      if (p.price > maxPrice) return false;

      // Origin filter
      if (selectedOrigins.length > 0) {
        if (!selectedOrigins.includes(p.origin)) return false;
      }

      // Color filter
      if (selectedColor) {
        const colorMatches = p.colorCode === selectedColor || p.color.includes(selectedColor);
        if (!colorMatches) return false;
      }

      return true;
    });
  }, [q, selectedCategory, maxPrice, selectedOrigins, selectedColor]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "popular") {
      list.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list.sort((a, b) => (b.badge === "جديد" ? 1 : 0) - (a.badge === "جديد" ? 1 : 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Pagination calculation
  const totalCount = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * ITEMS_PER_PAGE;
  const displayedProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const startRange = totalCount === 0 ? 0 : startIndex + 1;
  const endRange = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

  // Change page handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    navigate({
      search: (prev) => ({ ...prev, page: newPage > 1 ? newPage : undefined }),
    });
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setQ("");
    setSelectedCategory("all");
    setMaxPrice(500);
    setSelectedOrigins([]);
    setSelectedColor(null);
    setSortBy("popular");
    setCurrentPage(1);
    navigate({ search: {} });
  };

  // Toggle origin checkbox
  const toggleOrigin = (origin: string) => {
    setSelectedOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#FAF8F5] pb-16 min-h-screen text-[#2E2E2E]">
      {/* 1. HERO BANNER — Matches UI Mockup exactly */}
      <section className="relative overflow-hidden bg-[#0A2E20] text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="أطيب الزهور"
            className="size-full object-cover object-left opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#062419]/80 to-[#051c14]" />
        </div>

        <div className="container-x relative z-10 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Right: Text & Badges */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-sm font-bold tracking-wide text-[#E5C378]">منتجاتنا</span>
              <h1 className="text-3xl font-black text-rose md:text-5xl lg:leading-tight">
                أجود أنواع الورود بالجملة
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-gray-200 md:text-base">
                مجموعة واسعة من الورود الطبيعية المستوردة والمحلية لتلبية احتياجات الشركات والمحلات
                في جميع أنحاء المملكة
              </p>
            </div>

            {/* Features mini strip inside the hero */}
            <div className="lg:col-span-4 flex flex-col gap-2.5 sm:grid sm:grid-cols-2 lg:flex lg:flex-col">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                <Award className="size-5 text-[#E5C378] shrink-0" />
                <span className="text-xs font-semibold text-white">أعلى معايير الجودة</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                <PackageCheck className="size-5 text-[#E5C378] shrink-0" />
                <span className="text-xs font-semibold text-white">توريد مستمر</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                <Coins className="size-5 text-[#E5C378] shrink-0" />
                <span className="text-xs font-semibold text-white">أسعار خاصة للشركات</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                <Truck className="size-5 text-[#E5C378] shrink-0" />
                <span className="text-xs font-semibold text-white">توصيل لجميع المناطق</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BREADCRUMBS BAR */}
      <div className="border-b border-border/40 bg-surface/80 backdrop-blur-xs">
        <div className="container-x flex items-center justify-between py-3 text-xs md:text-sm">
          <nav className="flex items-center gap-1.5 text-muted-foreground">
            <Link to="/" className="transition hover:text-rose">
              الرئيسية
            </Link>
            <span>&gt;</span>
            <span className="font-semibold text-rose">المنتجات</span>
            {selectedCategory !== "all" && (
              <>
                <span>&gt;</span>
                <span className="text-foreground">
                  {sidebarCategories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </nav>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal className="size-3.5 text-rose" />
            <span>الفلاتر والتصنيفات</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (RTL: Filters on Right, Products on Left) */}
      <div className="container-x mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-12">
          {/* ============================================================== */}
          {/* SIDEBAR FILTERS (Column: 3 on xl, 1 on lg)                    */}
          {/* ============================================================== */}
          <aside
            className={`space-y-5 lg:col-span-1 xl:col-span-3 ${
              mobileFilterOpen
                ? "fixed inset-0 z-50 overflow-y-auto bg-surface p-5 shadow-2xl block"
                : "hidden lg:block"
            }`}
          >
            {mobileFilterOpen && (
              <div className="flex items-center justify-between border-b pb-3 mb-4 lg:hidden">
                <h3 className="text-base font-bold text-foreground">تصفية المنتجات</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>
            )}

            {/* CARD 1: البحث في المنتجات */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
              <h3 className="mb-3 text-sm font-bold text-foreground">البحث في المنتجات</h3>
              <div className="relative flex items-center">
                <Search className="absolute start-3 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ابحث عن نوع الورد..."
                  className="w-full rounded-xl border border-border/80 bg-surface pe-8 ps-9 py-2 text-xs font-medium text-foreground outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/20"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    aria-label="مسح البحث"
                    className="absolute end-2.5 text-muted-foreground hover:text-rose"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: التصنيفات */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs">
              <h3 className="mb-3 text-sm font-bold text-foreground">التصنيفات</h3>
              <div className="flex flex-col gap-1.5">
                {sidebarCategories.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setCurrentPage(1);
                        if (mobileFilterOpen) setMobileFilterOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-rose/10 text-rose border border-rose/30 shadow-2xs font-bold"
                          : "text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="size-6 rounded-full object-cover ring-1 ring-border/80"
                          />
                        ) : (
                          <div
                            className={`size-6 rounded-full grid place-items-center text-[10px] ${
                              isActive ? "bg-rose text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            🌸
                          </div>
                        )}
                        <span>{cat.name}</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isActive
                            ? "bg-rose text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 3: تصفية النتائج (السعر، المنشأ، اللون) */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-2xs space-y-5">
              <h3 className="text-sm font-bold text-foreground">تصفية النتائج</h3>

              {/* السعر للباقة */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-muted-foreground">السعر للباقة</span>
                </div>
                <Slider
                  value={[maxPrice]}
                  onValueChange={(val) => {
                    const price = Array.isArray(val) ? val[0] : 500;
                    if (price !== undefined) setMaxPrice(price);
                    setCurrentPage(1);
                  }}
                  min={50}
                  max={500}
                  step={10}
                  className="my-3"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>من 50 ر.س إلى {maxPrice} ر.س</span>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* المنشأ */}
              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-2.5">
                  المنشأ
                </span>
                <div className="space-y-2">
                  {ORIGINS.map((origin) => {
                    const checked = selectedOrigins.includes(origin);
                    return (
                      <label
                        key={origin}
                        className="flex items-center justify-between text-xs cursor-pointer group select-none"
                      >
                        <span className="text-foreground transition group-hover:text-rose">
                          {origin}
                        </span>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleOrigin(origin)}
                          className="data-[state=checked]:bg-rose data-[state=checked]:border-rose"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* اللون */}
              <div>
                <span className="text-xs font-bold text-muted-foreground block mb-2.5">
                  اللون
                </span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((color) => {
                    const isSelected = selectedColor === color.code;
                    return (
                      <button
                        key={color.code}
                        type="button"
                        title={color.name}
                        onClick={() => {
                          setSelectedColor(isSelected ? null : color.code);
                          setCurrentPage(1);
                        }}
                        style={{ backgroundColor: color.code }}
                        className={`size-6 rounded-full border border-black/15 shadow-2xs transition-transform hover:scale-110 relative ${
                          isSelected ? "ring-2 ring-rose ring-offset-2 scale-110" : ""
                        }`}
                      >
                        {isSelected && (
                          <span
                            className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
                              color.code === "#FFFFFF" || color.code === "#FACC15" || color.code === "#FDBA74"
                                ? "text-black"
                                : "text-white"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (mobileFilterOpen) setMobileFilterOpen(false);
                  }}
                  className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-rose text-white text-xs font-bold shadow-xs transition hover:bg-rose/90 active:scale-98"
                >
                  تطبيق الفلاتر
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full text-center text-xs text-muted-foreground hover:text-rose transition py-1 block"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================== */}
          {/* MAIN CATALOG (Column: 9 on xl, 3 on lg)                       */}
          {/* ============================================================== */}
          <main className="lg:col-span-3 xl:col-span-9 space-y-5">
            {/* Controls Bar: Item count, Sorting, View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-2xs">
              {/* Product Counter on Right */}
              <div className="text-xs font-bold text-foreground">
                عرض {startRange} - {endRange} من {totalCount} منتج
              </div>

              {/* Controls on Left */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">ترتيب حسب:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none rounded-xl border border-border/80 bg-surface pe-7 ps-3 py-1.5 text-xs font-semibold text-foreground outline-none transition focus:border-rose cursor-pointer"
                    >
                      <option value="popular">الأكثر مبيعاً</option>
                      <option value="price-asc">الأقل سعراً</option>
                      <option value="price-desc">الأعلى سعراً</option>
                      <option value="newest">الأحدث</option>
                      <option value="name">الاسم الأبجدي</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  </div>
                </div>

                {/* View Switcher: Grid vs List */}
                <div className="hidden sm:flex items-center rounded-xl border border-border/80 bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="عرض شبكي"
                    className={`grid size-7 place-items-center rounded-lg transition ${
                      viewMode === "grid"
                        ? "bg-rose text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="عرض طولي"
                    className={`grid size-7 place-items-center rounded-lg transition ${
                      viewMode === "list"
                        ? "bg-rose text-white shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid or List */}
            {displayedProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-3"
                }
              >
                {displayedProducts.map((product) => (
                  <ProductCard key={product.slug} p={product} layout={viewMode} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose/10 text-rose">
                  <Search className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">
                  لا توجد نتائج مطابقة لبحثك
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  جرب تغيير كلمات البحث، اختيار تصنيف آخر، أو زيادة نطاق السعر.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose/90"
                >
                  <RotateCcw className="size-3.5" />
                  <span>إعادة تعيين جميع الفلاتر</span>
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-6">
                <button
                  type="button"
                  disabled={currentPageSafe <= 1}
                  onClick={() => handlePageChange(currentPageSafe - 1)}
                  aria-label="الصفحة السابقة"
                  className="grid size-9 place-items-center rounded-full border border-border/80 bg-surface text-foreground transition hover:border-rose hover:text-rose disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => {
                  const isActive = page === currentPageSafe;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`grid size-9 place-items-center rounded-full text-xs font-bold transition ${
                        isActive
                          ? "bg-rose text-white shadow-xs"
                          : "border border-border/80 bg-surface text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPageSafe >= totalPages}
                  onClick={() => handlePageChange(currentPageSafe + 1)}
                  aria-label="الصفحة التالية"
                  className="grid size-9 place-items-center rounded-full border border-border/80 bg-surface text-foreground transition hover:border-rose hover:text-rose disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. VALUE PROPOSITION / TRUST STRIP — Matches Mockup            */}
      {/* ============================================================== */}
      <section className="container-x mt-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-rose/10 text-rose shrink-0">
              <Award className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">جودة مضمونة</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">فحص دقيق لكل شحنة</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-rose/10 text-rose shrink-0">
              <PackageCheck className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">توريد مستمر</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">على مدار العام</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-rose/10 text-rose shrink-0">
              <Coins className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">أسعار خاصة للشركات</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">خصومات للكميات الكبيرة</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-rose/10 text-rose shrink-0">
              <Truck className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">توصيل سريع</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">لجميع مناطق المملكة</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. BOTTOM PARTNER BANNER ("شريكك الموثوق في توريد الورود")       */}
      {/* ============================================================== */}
      <section className="container-x mt-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#09261B] text-white">
          <div className="absolute inset-0 z-0">
            <img
              src={warehouseImg}
              alt="توريد الورود للشركات"
              className="size-full object-cover object-left opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#082318]/90 to-[#061b13]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-10 md:px-12 md:py-14 text-center md:text-start">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl md:text-3xl font-black text-white">
                شريكك الموثوق في توريد الورود
              </h3>
              <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
                نوفر لك أجود أنواع الورود الطبيعية لتلبية احتياجات عملك على مدار العام
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-xs md:text-sm font-bold text-white shadow-soft transition hover:bg-rose/90 hover:scale-105 active:scale-95 shrink-0"
            >
              <span>تواصل معنا الآن</span>
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
