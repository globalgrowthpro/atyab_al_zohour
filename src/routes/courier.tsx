import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Route as RouteIcon,
  Headset,
  UserRound,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { CourierProvider, useCourier } from "@/features/courier/context";
export const Route = createFileRoute("/courier")({
  head: () => ({
    meta: [
      { title: "لوحة المندوب | أطيب الزهور" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CourierLayout,
});
const navigation = [
  ["/courier", "نظرة عامة", LayoutDashboard],
  ["/courier/tasks", "مهام التوصيل", Package],
  ["/courier/map", "مسار التوصيل", RouteIcon],
  ["/courier/support", "دعم المندوب", Headset],
  ["/courier/profile", "ملفي الشخصي", UserRound],
] as const;
function CourierLayout() {
  return (
    <section className="container-x py-7 md:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">أطيب الزهور · فريق التوصيل</span>
          <h1 className="mt-2 text-3xl">لوحة المندوب</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            مهامك ومسار جولتك، من الاستلام إلى التسليم.
          </p>
        </div>
        <Link to="/login" className="btn btn-outline !h-10 !px-5 text-sm">
          تبديل مساحة العرض <ArrowLeft className="size-4" />
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gold/30 bg-blush/30 px-4 py-2.5 text-xs leading-6 text-forest">
        <span className="flex items-center gap-2 font-bold">
          <Truck className="size-4" />
          عرض مندوب تجريبي
        </span>
        <span className="text-muted-foreground">
          المهام والمواقع تمثيلية. التحديثات محلية ولا تُرسل للعميل أو الشركة.
        </span>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav
          aria-label="أقسام لوحة المندوب"
          className="flex gap-2 overflow-x-auto rounded-2xl border bg-card p-3 shadow-soft lg:sticky lg:top-40 lg:flex-col"
        >
          {navigation.map(([to, label, Icon]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/courier" }}
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-forest hover:bg-muted"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">
          <CourierProvider>
            <CourierContent />
          </CourierProvider>
        </div>
      </div>
    </section>
  );
}
function CourierContent() {
  const { error, notice } = useCourier();
  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-card p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-primary/15 bg-accent/40 p-4 text-xs leading-6 text-primary"
        >
          {notice}
        </p>
      )}
      <Outlet />
    </>
  );
}
