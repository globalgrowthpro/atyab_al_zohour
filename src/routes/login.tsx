import { createFileRoute, Link } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | أطيب الزهور" },
      { name: "description", content: "تسجيل الدخول — أطيب الزهور لتوريد الورود بالجملة." },
      { property: "og:title", content: "تسجيل الدخول | أطيب الزهور" },
      { property: "og:description", content: "تسجيل الدخول — أطيب الزهور." },
    ],
  }),
  component: () => (
    <>
      <PageBanner
        title="تسجيل الدخول"
        crumb="تسجيل الدخول"
        subtitle="دخول الحسابات الفعلية لم يُربط بعد."
      />
      <section className="container-x grid gap-6 py-14 lg:grid-cols-2">
        <div className="mx-auto max-w-xl rounded-3xl border bg-card p-8 text-center shadow-soft">
          <span className="eyebrow">تجربة لوحة العميل</span>
          <h2 className="mt-4 text-2xl">استكشف مساحتك في أطيب الزهور</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            الدخول التجريبي لا يحتاج إيميلاً أو كلمة مرور. البيانات محلية على هذا المتصفح، ولا يمنحك
            الوصول إلى أي حساب أو طلب حقيقي.
          </p>
          <Link to="/dashboard" className="btn btn-primary mt-6">
            استكشاف لوحة العميل
          </Link>
        </div>
        <div className="mx-auto w-full max-w-xl rounded-3xl border bg-card p-8 text-center shadow-soft">
          <span className="eyebrow">تجربة لوحة المندوب</span>
          <h2 className="mt-4 text-2xl">جولتك من استلام المهمة للتسليم</h2>
          <p className="mt-4 leading-8 text-muted-foreground">
            جرّب مهام التوصيل والخريطة وتحديث الحالات ببيانات محلية جاهزة. لا تحتاج إيميلاً أو كلمة
            مرور، ولا يوجد اتصال بمندوب أو طلب فعلي.
          </p>
          <Link to="/courier" className="btn btn-primary mt-6">
            استكشاف لوحة المندوب
          </Link>
        </div>
      </section>
    </>
  ),
});
