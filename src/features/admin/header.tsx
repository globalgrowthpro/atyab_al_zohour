import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search, X, LogOut, Settings, UserRound, ArrowUpLeft, Clock3 } from "lucide-react";
import logo from "@/assets/nav-logo.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme";
import { adminNavigation } from "./navigation";

import { adminClients, adminOrders, adminQuotes, adminCouriers, adminTickets } from "./data";
import { products } from "@/lib/catalog";

const searchEntries = [
  ...adminNavigation.map(([to, label, Icon]) => ({ id: to, to, label, detail: "أقسام الإدارة", Icon })),
  ...adminOrders.map((o) => ({ id: o.id, to: "/admin/orders" as const, label: o.id, detail: `الطلبات · ${o.client}`, Icon: adminNavigation[1][2] })),
  ...adminClients.map((c) => ({ id: c.id, to: "/admin/clients" as const, label: c.name, detail: `العملاء · ${c.id} · ${c.city}`, Icon: UserRound })),
  ...adminQuotes.map((q) => ({ id: q.id, to: "/admin/quotes" as const, label: q.id, detail: `عروض الأسعار · ${q.client}`, Icon: adminNavigation[2][2] })),
  ...products.map((p) => ({ id: p.slug, to: "/admin/products" as const, label: p.name, detail: "المنتجات والمخزون", Icon: adminNavigation[3][2] })),
  ...adminCouriers.map((c) => ({ id: c.id, to: "/admin/couriers" as const, label: c.name, detail: `المندوبون · ${c.zone}`, Icon: adminNavigation[7][2] })),
  ...adminTickets.map((t) => ({ id: t.id, to: "/admin/support" as const, label: t.id, detail: `الدعم · ${t.subject}`, Icon: adminNavigation[8][2] })),
];

function DigitalClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const time = now?.toLocaleTimeString("en-GB", { hour12: false }) ?? "--:--:--";
  const date = now?.toLocaleDateString("ar", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) ?? "—";
  const zone = now ? Intl.DateTimeFormat("ar", { timeZoneName: "short" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value : "—";
  return (
    <div className="flex shrink-0 items-center gap-3 border-s border-white/20 ps-4" aria-label="التاريخ والوقت الحالي">
      <Clock3 className="hidden size-4 text-emerald-300 xl:block" />
      <div className="text-center">
        <time dateTime={now?.toISOString()} dir="ltr" className="block min-w-[112px] font-mono text-xl font-bold tabular-nums leading-7 text-white">
          {time}
        </time>
        <p className="whitespace-nowrap text-[11px] text-white/80">{date}</p>
        <p className="text-[10px] text-emerald-300/80">{zone}</p>
      </div>
    </div>
  );
}

export function AdminHeader() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const term = query.trim().toLocaleLowerCase();
  const results = (term ? searchEntries.filter((e) => `${e.label} ${e.detail}`.toLocaleLowerCase().includes(term)) : searchEntries.slice(0, 6)).slice(0, 8);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!searchRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const dismissSearch = () => { setOpen(false); setQuery(""); setActive(0); };

  return (
    <header aria-label="شريط الإدارة" className="relative z-30 mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-950/40 bg-gradient-to-r from-[#062619] via-[#0B3D2A] to-[#072418] px-4 py-3 shadow-xl text-white md:px-5">
      <div className="order-1 flex shrink-0 items-center gap-3.5 md:order-none">
        <img
          src={logo}
          alt="أطيب الزهور"
          className="h-13 w-13 sm:h-15 sm:w-15 shrink-0 object-contain drop-shadow-md select-none transition-transform hover:scale-105"
        />
        <span className="min-w-0 whitespace-nowrap">
          <span className="block text-sm font-bold text-white md:text-base">مرحبًا بك في لوحة الإدارة</span>
          <span className="hidden text-[11px] text-emerald-200/80 md:block">أطيب الزهور — إدارة الطلبات والعملاء والمنتجات</span>
        </span>
      </div>
      <div ref={searchRef} className="relative order-3 w-full md:order-none md:w-auto md:min-w-[200px] md:flex-1">
        <div className="flex h-11 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3.5 backdrop-blur-xs text-white transition-all focus-within:bg-white/15 focus-within:border-white/40 focus-within:ring-2 focus-within:ring-emerald-400/30">
          <Search className="size-4 shrink-0 text-white/70" />
          <input
            aria-label="البحث الشامل"
            role="combobox"
            aria-expanded={open}
            aria-controls="admin-search-results"
            aria-autocomplete="list"
            aria-activedescendant={open && results[active] ? `admin-search-${active}` : undefined}
            value={query}
            placeholder="ابحث عن طلب، عميل، منتج…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
              if (e.key === "Enter" && open) { const entry = results[active]; if (entry) { void navigate({ to: entry.to }); dismissSearch(); } }
            }}
          />
          {query && (
            <Button size="icon" variant="ghost" className="size-7 text-white/70 hover:text-white hover:bg-white/10" aria-label="مسح البحث" onClick={() => { setQuery(""); setActive(0); }}>
              <X />
            </Button>
          )}
        </div>
        {open && (
          <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lift">
            <p className="border-b px-4 py-2.5 text-xs font-bold text-muted-foreground">{term ? "نتائج البحث" : "وصول سريع"}</p>
            <div id="admin-search-results" role="listbox" aria-label="نتائج البحث" className="max-h-80 overflow-y-auto p-1">
              {results.map((r, i) => (
                <Link
                  key={r.id}
                  to={r.to}
                  role="option"
                  aria-selected={active === i}
                  id={`admin-search-${i}`}
                  onClick={dismissSearch}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-foreground ${active === i ? "bg-muted" : "hover:bg-muted"}`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <r.Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{r.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.detail}</span>
                  </span>
                  <ArrowUpLeft className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
              {!results.length && <p className="px-4 py-8 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>}
            </div>
          </div>
        )}
      </div>
      <DigitalClock />
      <div className="ms-auto flex items-center gap-2 md:ms-0">
        <ThemeToggle />
        <DropdownMenu dir="rtl">

          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-3 px-2 py-1.5 text-white hover:bg-white/10 hover:text-white rounded-xl" aria-label="قائمة المستخدم">
              <Avatar className="size-10 border-2 border-white/20 shadow-xs">
                <AvatarFallback className="bg-emerald-800 text-white">
                  <UserRound className="size-5" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-start lg:block">
                <span className="block text-sm font-bold text-white">مدير النظام</span>
                <span className="block text-[11px] text-emerald-200/80">أطيب الزهور</span>
              </span>
              <ChevronDown className="text-white/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>مدير النظام</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings"><Settings />إعدادات الحساب</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void navigate({ to: "/login" })} className="text-destructive">
              <LogOut />تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
          className="text-white/80 hover:text-rose-300 hover:bg-white/10 rounded-xl"
          onClick={() => void navigate({ to: "/login" })}
        >
          <LogOut />
        </Button>
      </div>
    </header>
  );
}