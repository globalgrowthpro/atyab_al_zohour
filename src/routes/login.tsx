import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId, type FormEvent } from "react";
import { useAuth, getRoleLabel, type AppRole } from "@/features/auth/context";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  HelpCircle,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";

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

  const loginWithRole = async (selectedRole: AppRole) => {
    const roleEmail = `${selectedRole}@atyabalzohour.com`;
    const defaultPassword = "password123";
    setEmail(roleEmail);
    setPassword(defaultPassword);
    setIsLoading(true);
    toast.loading(`تسجيل الدخول بصلاحية ${getRoleLabel(selectedRole)}...`, { id: "login-toast" });

    try {
      const res = await signIn({ email: roleEmail, password: defaultPassword });
      if (res.success) {
        toast.success(`أهلاً بك! تم الدخول بصلاحية: ${getRoleLabel(selectedRole)}`, {
          id: "login-toast",
          duration: 2500,
        });
        void navigate({ to: res.destination || "/dashboard" });
      } else {
        toast.error("فشل تسجيل الدخول", { id: "login-toast", description: res.error });
      }
    } catch (err) {
      toast.error("حدث خطأ", { id: "login-toast" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center py-10 md:py-16 px-4 sm:px-6 lg:px-8 bg-cream/30 overflow-hidden">
      {/* Background Graphic */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${loginBg})` }}
        aria-hidden="true"
      />

      {/* Subtle overlay to soften edges and keep text crisp */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40 pointer-events-none"
        aria-hidden="true"
      />

      <section className="container-x relative z-10 max-w-6xl w-full">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs font-medium text-forest/80 backdrop-blur-xs bg-white/50 w-fit px-3 py-1.5 rounded-full border border-white/70 shadow-xs">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="size-3 text-muted-foreground" />
          <span className="font-bold text-forest">تسجيل الدخول</span>
        </nav>

        {/* Positioned on the right side in RTL to keep the roses & brand logo unobstructed */}
        <div className="flex flex-col items-start">
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:mr-8 xl:mr-12">
            <div className="rounded-3xl border border-white/90 bg-white/95 dark:bg-card/95 p-6 sm:p-8 md:p-9 shadow-2xl backdrop-blur-xl transition-all">
              <div className="mb-6 flex items-center justify-between border-b pb-5">
                <div>
                  <span className="eyebrow text-xs text-primary font-bold">بوابة الأعمال الموحدة</span>
                  <h1 className="mt-1 text-2xl font-bold text-forest">تسجيل الدخول</h1>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-forest/5 text-forest border border-forest/10">
                  <LogIn className="size-6 text-primary" />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Email */}
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
                      className="field !pl-10 text-start font-mono text-sm bg-background/80"
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
                      className="field !pl-10 !pr-10 text-start font-mono text-sm bg-background/80"
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

              {/* Register Link */}
              <div className="mt-6 border-t pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ليس لديك حساب منشأة؟</span>
                  <Link to="/register" className="font-bold text-primary hover:underline">
                    إنشاء حساب تجاري جديد
                  </Link>
                </div>
              </div>

              {/* Demo Accounts Quick Login by Role */}
              <div className="mt-6 border-t border-dashed pt-4">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-forest">
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>دخول تجريبي سريع حسب الصلاحيات (RBAC):</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void loginWithRole("superadmin")}
                    className="flex items-center justify-center gap-1 rounded-xl border border-amber-300/60 bg-amber-500/10 px-2 py-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all shadow-2xs"
                  >
                    <span>👑 المدير العام</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void loginWithRole("admin")}
                    className="flex items-center justify-center gap-1 rounded-xl border border-emerald-300/60 bg-emerald-500/10 px-2 py-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-2xs"
                  >
                    <span>🛡️ مدير النظام</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void loginWithRole("manager")}
                    className="flex items-center justify-center gap-1 rounded-xl border border-sky-300/60 bg-sky-500/10 px-2 py-2 text-[11px] font-bold text-sky-800 dark:text-sky-300 hover:bg-sky-500/20 transition-all shadow-2xs"
                  >
                    <span>📋 مدير العمليات</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void loginWithRole("seo")}
                    className="flex items-center justify-center gap-1 rounded-xl border border-purple-300/60 bg-purple-500/10 px-2 py-2 text-[11px] font-bold text-purple-800 dark:text-purple-300 hover:bg-purple-500/20 transition-all shadow-2xs"
                  >
                    <span>🚀 مسؤول SEO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void loginWithRole("courier")}
                    className="flex items-center justify-center gap-1 rounded-xl border border-orange-300/60 bg-orange-500/10 px-2 py-2 text-[11px] font-bold text-orange-800 dark:text-orange-300 hover:bg-orange-500/20 transition-all shadow-2xs"
                  >
                    <span>🚚 كابتن التوصيل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void loginWithRole("client")}
                    className="flex items-center justify-center gap-1 rounded-xl border border-border bg-muted/60 px-2 py-2 text-[11px] font-bold text-forest hover:bg-muted transition-all shadow-2xs"
                  >
                    <span>🏢 عميل تجاري</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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
