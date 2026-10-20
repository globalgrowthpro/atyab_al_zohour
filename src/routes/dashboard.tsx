import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, MapPin, Headset, UserRound, ArrowLeft } from "lucide-react";
import { ClientProvider, useClientData } from "@/features/client/context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة العميل | أطيب الزهور" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});
const navigation = [
  ["/dashboard", "نظرة عامة", LayoutDashboard],
  ["/dashboard/orders", "طلباتي", Package],
  ["/dashboard/track", "تتبّع الطلبات", MapPin],
  ["/dashboard/support", "تذاكر الدعم", Headset],
  ["/dashboard/profile", "الملف الشخصي", UserRound],
] as const;
function DashboardLayout() {
  return (
    <section className="container-x py-7 md:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-5">
        <div>
          <span className="eyebrow">مساحتك في أطيب الزهور</span>
          <h1 className="mt-2 text-3xl">لوحة العميل</h1>
          <p className="mt-2 text-sm text-muted-foreground">طلباتك ودعمك وبياناتك في مكان واحد.</p>
        </div>
        <Link to="/products" className="btn btn-outline">
          تصفح الكتالوج <ArrowLeft className="size-4" />
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gold/30 bg-blush/30 px-4 py-2.5 text-xs leading-6 text-forest">
        <strong>بيانات تجريبية</strong>
        <span className="text-muted-foreground">
          الطلبات والمسار والرسائل للعرض فقط. التعديلات تُحفظ محلياً.
        </span>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav
          aria-label="أقسام لوحة العميل"
          className="flex gap-2 overflow-x-auto rounded-3xl border bg-card p-3 shadow-soft lg:sticky lg:top-40 lg:flex-col"
        >
          {navigation.map(([to, label, Icon]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/dashboard" }}
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold text-forest hover:bg-muted"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">
          <ClientProvider>
            <DashboardContent />
          </ClientProvider>
        </div>
      </div>
    </section>
  );
}
function DashboardContent() {
  const { notice, error } = useClientData();
  return (
    <>
      {error && (
        <p role="alert" className="mb-5 rounded-2xl border border-destructive p-4 text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-5 rounded-2xl bg-accent p-4 text-primary">
          {notice}
        </p>
      )}
      <Outlet />
    </>
  );
}
