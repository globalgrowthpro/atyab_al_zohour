import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home,
  LayoutGrid,
  Info,
  Menu,
  X,
  Search,
  ShoppingCart,
  FileText,
  Percent,
  Briefcase,
  Phone,
  MapPin,
  Shield,
  User,
  Truck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/logo.png";
import bottomNavLogo from "@/assets/nav-logo.png";
import { useCart } from "@/lib/cart";
import { siteConfig } from "@/lib/catalog";

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      void navigate({ to: "/products", search: { q: searchQuery.trim() } });
      setMoreOpen(false);
      setSearchQuery("");
    }
  };

  const closeMore = () => setMoreOpen(false);

  interface RemainingPage {
    to: string;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string;
  }

  // Remaining pages list for the "More" drawer
  const remainingPages: RemainingPage[] = [
    {
      to: "/offers",
      label: "عروض الجملة والتخفيضات",
      desc: "خصومات خاصة على الكميات والأصناف الموسمية",
      icon: Percent,
      color: "text-rose bg-rose/10",
      badge: "عروض حية",
    },
    {
      to: "/services",
      label: "خدماتنا وتوريد الفنادق",
      desc: "حلول التوريد للمحلات والمعارض والمناسبات",
      icon: Briefcase,
      color: "text-primary bg-primary/10",
    },
    {
      to: "/quote",
      label: "طلب عرض سعر رسمي",
      desc: "احصل على تسعيرة فورية للكميات الكبيرة",
      icon: FileText,
      color: "text-gold bg-gold/15",
      badge: "سريع",
    },
    {
      to: "/contact",
      label: "تواصل معنا وقنوات الدعم",
      desc: "أرقام الاتصال المباشرة ومواقع المستودعات",
      icon: Phone,
      color: "text-forest bg-forest/10",
    },
  ];

  const dashboardPages = [
    {
      to: "/login",
      label: "تسجيل الدخول / الحسابات التجريبية",
      desc: "تجربة بوابات الإدارة والعميل والمندوب",
      icon: Sparkles,
      color: "text-gold bg-gold/15",
    },
    {
      to: "/dashboard",
      label: "لوحة مساحة العميل",
      desc: "متابعة الطلبات وتتبع الشحنات المبردة",
      icon: User,
      color: "text-rose bg-rose/10",
    },
    {
      to: "/courier",
      label: "لوحة مهام المندوب",
      desc: "خريطة المسارات ومتابعة التسليم الميداني",
      icon: Truck,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      to: "/admin",
      label: "لوحة الإدارة والتحكم",
      desc: "إدارة الكتالوج، الطلبات، الـ CRM، والأمان",
      icon: Shield,
      color: "text-emerald-700 bg-emerald-600/10",
    },
  ] as const;

  return (
    <>
      {/* Fixed Bottom Navigation Bar (Mobile only: md:hidden) */}
      <nav
        aria-label="شريط التنقل السفلي للجوال"
        className="fixed inset-x-0 bottom-0 z-40 block border-t border-border/80 bg-surface/95 backdrop-blur-lg shadow-[0_-6px_25px_rgba(0,0,0,0.08)] md:hidden"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid h-[68px] grid-cols-5 items-center px-2">
          {/* 1. Home (الرئيسية) */}
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="flex flex-col items-center justify-center gap-1 py-1 text-muted-foreground transition hover:text-primary active:scale-95"
            activeProps={{ className: "!text-primary font-bold" }}
            onClick={closeMore}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex size-8 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Home className="size-5 shrink-0" />
                </div>
                <span className="text-[11px] leading-none">الرئيسية</span>
              </>
            )}
          </Link>

          {/* 2. Categories (التصنيفات) */}
          <Link
            to="/categories"
            className="flex flex-col items-center justify-center gap-1 py-1 text-muted-foreground transition hover:text-primary active:scale-95"
            activeProps={{ className: "!text-primary font-bold" }}
            onClick={closeMore}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex size-8 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <LayoutGrid className="size-5 shrink-0" />
                </div>
                <span className="text-[11px] leading-none">التصنيفات</span>
              </>
            )}
          </Link>

          {/* 3. Products (المنتجات) - WITH LOGO A BIT TO TOP IN CIRCLE */}
          <Link
            to="/products"
            className="group relative flex flex-col items-center justify-center text-forest active:scale-95"
            onClick={closeMore}
          >
            {({ isActive }) => (
              <>
                {/* Elevated single-circle logo floating above navbar */}
                <div
                  className={`-top-5 relative flex size-14 items-center justify-center transition-transform duration-200 group-hover:scale-105 active:scale-95 ${
                    isActive ? "drop-shadow-[0_8px_16px_rgba(11,77,51,0.35)]" : "drop-shadow-md"
                  }`}
                >
                  <img
                    src={bottomNavLogo}
                    alt="المنتجات"
                    className="size-14 object-contain"
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className={`-mt-3 text-[11px] font-bold leading-none ${
                    isActive ? "text-primary" : "text-forest"
                  }`}
                >
                  المنتجات
                </span>
              </>
            )}
          </Link>

          {/* 4. About (من نحن) */}
          <Link
            to="/about"
            className="flex flex-col items-center justify-center gap-1 py-1 text-muted-foreground transition hover:text-primary active:scale-95"
            activeProps={{ className: "!text-primary font-bold" }}
            onClick={closeMore}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex size-8 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Info className="size-5 shrink-0" />
                </div>
                <span className="text-[11px] leading-none">من نحن</span>
              </>
            )}
          </Link>

          {/* 5. More (المزيد) - Opens drawer */}
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-label="المزيد من الصفحات والخيارات"
            aria-expanded={moreOpen}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 transition active:scale-95 ${
              moreOpen ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <div
              className={`relative flex size-8 items-center justify-center rounded-xl transition ${
                moreOpen ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <Menu className="size-5 shrink-0" />
              {/* Badge for items in cart */}
              {count > 0 && (
                <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-rose text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </div>
            <span className="text-[11px] leading-none">المزيد</span>
          </button>
        </div>
      </nav>

      {/* "More" Drawer / Bottom Sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeMore}
            aria-hidden="true"
          />

          {/* Sheet Container */}
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-border bg-card p-5 shadow-2xl animate-in slide-in-from-bottom duration-250"
            role="dialog"
            aria-label="قائمة المزيد من الصفحات"
          >
            {/* Sheet Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/25" />

            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="أطيب الزهور" className="h-9 w-auto" />
                <div>
                  <h3 className="text-base font-bold text-forest">أطيب الزهور</h3>
                  <p className="text-xs text-muted-foreground">تصفح جميع أقسام وبوابات المنصة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMore}
                className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="mb-5">
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن ورد، صنف، أو صنف موسمي..."
                  className="field h-11 pr-10 text-sm"
                />
              </div>
            </form>

            {/* Cart & Quote Quick Card */}
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-gold/30 bg-gradient-to-r from-forest to-forest/90 p-4 text-white shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">سلة طلبات الجملة</h4>
                  <p className="text-xs text-white/80">
                    {count > 0 ? `${count} أصناف مضافة للسلة` : "السلة فارغة حالياً"}
                  </p>
                </div>
              </div>
              <Link
                to="/quote"
                onClick={closeMore}
                className="btn bg-gold !h-9 shrink-0 !px-4 text-xs font-bold !text-forest hover:brightness-110"
              >
                <span>متابعة الطلب</span>
                <ArrowLeft className="size-3.5" />
              </Link>
            </div>

            {/* Section 1: Services & Catalog Pages */}
            <div className="mb-6 space-y-2">
              <h4 className="px-1 text-xs font-bold text-muted-foreground">الأقسام والخدمات</h4>
              <div className="grid gap-2">
                {remainingPages.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMore}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/80 bg-surface hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[10px] font-bold text-rose">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Dashboards & Accounts */}
            <div className="mb-6 space-y-2">
              <h4 className="px-1 text-xs font-bold text-muted-foreground">
                البوابات والحسابات التجريبية
              </h4>
              <div className="grid gap-2">
                {dashboardPages.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMore}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/80 bg-surface hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-foreground">{item.label}</span>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Direct Contact Bar */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-forest">تحتاج مساعدة أو استفسار؟</h5>
                  <p className="text-[11px] text-muted-foreground">{siteConfig.location}</p>
                </div>
                {siteConfig.phone && (
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="btn btn-primary !h-8 !px-3 text-xs"
                    dir="ltr"
                  >
                    <Phone className="size-3.5" />
                    <span>اتصال</span>
                  </a>
                )}
              </div>
            </div>

            {/* Safe bottom spacer */}
            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  );
}
