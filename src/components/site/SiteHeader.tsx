import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Mail, MapPin, Menu, Phone, Search, ShoppingCart, User, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { siteConfig } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/categories", label: "التصنيفات" },
  { to: "/offers", label: "عروض الجملة" },
  { to: "/services", label: "خدماتنا" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined } });
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-forest text-forest-foreground text-[13px]">
        <div className="container-x flex h-10 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-gold" />{siteConfig.location}</span>
            {siteConfig.phone && <a href={`tel:${siteConfig.phone}`} className="hidden sm:flex items-center gap-1.5" dir="ltr"><Phone className="size-3.5 text-gold" />{siteConfig.phone}</a>}
            {siteConfig.email && <a href={`mailto:${siteConfig.email}`} className="hidden md:flex items-center gap-1.5"><Mail className="size-3.5 text-gold" />{siteConfig.email}</a>}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-gold">تسجيل الدخول</Link>
            <Link to="/register" className="rounded-full bg-rose px-3 py-1 font-bold text-rose-foreground">إنشاء حساب</Link>
          </div>
        </div>
      </div>

      <div className="border-b bg-surface/95 backdrop-blur">
        <div className="container-x flex h-20 items-center gap-6">
          <Link to="/" className="shrink-0" aria-label="أطيب الزهور">
            <img src={logo} alt="أطيب الزهور — ATYAB AL ZOHOUR" className="h-16 w-auto" />
          </Link>
          <nav className="hidden xl:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-full px-3.5 py-2 text-[15px] font-medium text-foreground transition hover:text-primary"
                activeProps={{ className: "bg-primary !text-primary-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={submit} className="ms-auto hidden lg:flex items-center rounded-full border bg-muted px-4 h-11 w-64">
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج أو صنف..." className="w-full bg-transparent px-2 text-sm outline-none" />
          </form>
          <div className="ms-auto lg:ms-0 flex items-center gap-1">
            <Link to="/quote" className="hidden md:inline-flex btn btn-outline !h-10 !px-4 text-sm"><FileText className="size-4" />طلب عرض سعر</Link>
            <Link to="/login" aria-label="حسابي" className="grid size-10 place-items-center rounded-full hover:bg-muted"><User className="size-5 text-primary" /></Link>
            <Link to="/quote" aria-label="سلة الطلب" className="relative grid size-10 place-items-center rounded-full hover:bg-muted">
              <ShoppingCart className="size-5 text-primary" />
              <span className="absolute -top-0.5 -end-0.5 grid min-w-5 h-5 place-items-center rounded-full bg-rose px-1 text-[11px] font-bold text-rose-foreground">{count}</span>
            </Link>
            <button onClick={() => setOpen(!open)} className="xl:hidden grid size-10 place-items-center rounded-full hover:bg-muted" aria-label="القائمة">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="xl:hidden border-t bg-surface">
            <div className="container-x py-4 space-y-1">
              <form onSubmit={submit} className="flex items-center rounded-full border bg-muted px-4 h-11 mb-3 lg:hidden">
                <Search className="size-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن منتج..." className="w-full bg-transparent px-2 text-sm outline-none" />
              </form>
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-medium hover:bg-muted">{n.label}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
