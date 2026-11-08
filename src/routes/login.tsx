import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId, type FormEvent } from "react";
import { useAuth } from "@/features/auth/context";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  HelpCircle,
  Shield,
  Layers,
  CheckCircle2,
  Phone,
  Snowflake,
  FileCheck,
} from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | أطيب الزهور" },
      {
        name: "description",
        content: "تسجيل الدخول إلى منصة أطيب الزهور لتوريد الورود بالجملة وإدارة الطلبات والعمليات اللوجستية.",
      },
      { property: "og:title", content: "تسجيل الدخول | أطيب الزهور" },
      { property: "og:description", content: "تسجيل الدخول إلى حسابك في أطياب الزهور." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const formId = useId();
  const { signIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Form submit handler with Supabase Auth
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!password.trim()) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);
    toast.loading("جاري التحقق من بيانات الدخول...", { id: "login-toast" });

    try {
      const res = await signIn({ email, password });
      if (res.success) {
        toast.success("تم تسجيل الدخول بنجاح!", {
          id: "login-toast",
          description: "أهلاً بك في منصة أطياب الزهور. جاري توجيهك...",
          duration: 3000,
        });
        void navigate({ to: res.destination || "/dashboard" });
      } else {
        toast.error("فشل تسجيل الدخول", {
          id: "login-toast",
          description: res.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        });
      }
    } catch (err) {
      toast.error("حدث خطأ في الاتصال بالخادم", {
        id: "login-toast",
        description: err instanceof Error ? err.message : "يرجى المحاولة مجدداً.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream/40 pb-20">
      <PageBanner
        title="بوابة تسجيل الدخول"
        crumb="تسجيل الدخول"
        subtitle="سجّل الدخول إلى حسابك للوصول إلى لوحة التحكم ومتابعة الطلبات وخدمات التوريد المباشر."
      />

      <section className="container-x py-10 md:py-16 max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Main Sign-In Form (6 cols) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
              <div className="mb-6 flex items-center justify-between border-b pb-5">
                <div>
                  <span className="eyebrow text-xs">أطياب الزهور</span>
                  <h2 className="mt-1 text-2xl font-bold text-forest">تسجيل الدخول</h2>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-forest/5 text-forest">
                  <LogIn className="size-6 text-primary" />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Email or Username */}
                <div>
                  <label
                    htmlFor={`${formId}-email`}
                    className="mb-1.5 block text-xs font-bold text-forest"
                  >
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      id={`${formId}-email`}
                      required
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="field !pl-10 text-start font-mono text-sm"
                      autoComplete="username"
                    />
                    <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor={`${formId}-password`}
                      className="block text-xs font-bold text-forest"
                    >
                      كلمة المرور
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-semibold text-rose hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id={`${formId}-password`}
                      required
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="field !pl-10 !pr-10 text-start font-mono text-sm"
                      autoComplete="current-password"
                    />
                    <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>تذكر بيانات تسجيل الدخول على هذا الجهاز</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="btn btn-primary mt-2 w-full gap-2 text-base shadow-soft !h-12"
                >
                  {isLoading || authLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري التحقق...
                    </span>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <ArrowLeft className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & Support Note */}
              <div className="mt-6 border-t pt-5 space-y-3">
                <div className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                  <Shield className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    الاتصال مشفر وآمن عبر بروتوكول SSL 256-bit وقاعدة بيانات Supabase الموثقة.
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground">ليس لديك حساب منشأة؟</span>
                  <Link to="/register" className="font-bold text-primary hover:underline">
                    إنشاء حساب تجاري جديد
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Side Brand & Platform Info (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="rounded-3xl border border-forest/20 bg-forest p-7 text-forest-foreground shadow-soft space-y-5">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-gold/20 text-gold">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-forest-foreground">بوابة توريد الزهور الموحدة</h3>
                  <p className="text-xs text-forest-foreground/75">المملكة العربية السعودية</p>
                </div>
              </div>

              <p className="text-sm leading-7 text-forest-foreground/85">
                تمنحك المنصة وصولاً مباشراً إلى شحنات الورود الهولندية والإكوادورية والكينية الطازجة، مع متابعة سلسلة التبريد والفواتير الضريبية لحظياً.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 text-xs">
                  <Snowflake className="size-5 shrink-0 text-gold" />
                  <span>سلسلة تبريد دقيقة (2°C - 4°C) من مزارع الاستيراد حتى باب محلك.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 text-xs">
                  <FileCheck className="size-5 shrink-0 text-gold" />
                  <span>فواتير إلكترونية معتمدة فورية مطابقة لاشتراطات هيئة الزكاة (ZATCA).</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 text-xs">
                  <Layers className="size-5 shrink-0 text-gold" />
                  <span>أسعار جملة متدرجة حسب شرائح الشراء مع تسهيلات دفع للمتاجر المعتمدة.</span>
                </div>
              </div>

              <div className="border-t border-forest-foreground/15 pt-4 flex items-center justify-between text-xs">
                <span className="text-forest-foreground/70">هل ترغب بطلب تسعيرة سريعة دون تسجيل؟</span>
                <Link to="/quote" className="font-bold text-gold hover:underline flex items-center gap-1">
                  طلب عرض سعر
                  <ArrowLeft className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2 text-forest">
                <HelpCircle className="size-5 text-primary" />
                <h3 className="text-base font-bold">استعادة كلمة المرور</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            <div className="py-5 text-xs leading-6 text-muted-foreground space-y-3">
              <p className="text-foreground">
                لإعادة تعيين كلمة المرور أو تحديث بيانات الحساب التجاري، يرجى التواصل مباشرة مع إدارة العمليات أو الدعم الفني:
              </p>

              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4 text-forest space-y-1.5">
                <p className="font-bold text-xs">فريق دعم أطياب الزهور:</p>
                <p className="font-mono text-sm text-primary font-bold" dir="ltr">
                  +201007419344
                </p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  support@atyabalzohour.com
                </p>
              </div>

              <p className="text-[11px] text-muted-foreground">
                سيتولى مسؤول الحسابات التحقق من هويتكم وإرسال رابط إعادة تعيين آمن إلى بريدكم المسجل.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-primary !h-9 !px-5 text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
