import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Store,
  Truck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  KeyRound,
  LogIn,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول والحسابات التجريبية | أطيب الزهور" },
      {
        name: "description",
        content: "تسجيل الدخول إلى منصة أطيب الزهور لتوريد الورود بالجملة واستكشاف الحسابات التجريبية للإدارة والعملاء والمندوبين.",
      },
      { property: "og:title", content: "تسجيل الدخول والحسابات التجريبية | أطيب الزهور" },
      { property: "og:description", content: "تسجيل الدخول — استكشف لوحة الإدارة، لوحة العميل، ولوحة المندوب ببيانات تجريبية جاهزة." },
    ],
  }),
  component: LoginPage,
});

interface DemoAccount {
  id: "admin" | "client" | "courier";
  roleTitle: string;
  badge: string;
  personaName: string;
  email: string;
  pass: string;
  destination: string;
  dashboardLabel: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    pill: string;
    badgeBg: string;
    iconBg: string;
  };
  highlights: string[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "admin",
    roleTitle: "الإدارة والمشرف العام",
    badge: "صلاحيات تنفيذية كاملة",
    personaName: "م. حافظ رحيم (المدير العام)",
    email: "admin@atyabalzohour.com",
    pass: "admin123",
    destination: "/admin",
    dashboardLabel: "لوحة تحكم الإدارة",
    colorScheme: {
      bg: "bg-emerald-50/50 hover:bg-emerald-50/80",
      border: "border-emerald-600/20 hover:border-emerald-600/40",
      text: "text-emerald-900",
      pill: "bg-emerald-100/80 text-emerald-800 border-emerald-300",
      badgeBg: "bg-emerald-600 text-white",
      iconBg: "bg-emerald-600/10 text-emerald-700",
    },
    highlights: [
      "التحكم الكامل بالكتالوج والأسعار",
      "إدارة طلبات الجملة و CRM وعلاقات العملاء",
      "لوحات التقارير المالية والتحليلات",
      "أمان النظام وضبط إعدادات البريد SMTP",
    ],
  },
  {
    id: "client",
    roleTitle: "عميل جملة / مشتريات",
    badge: "بوابة متجر زهور معتمد",
    personaName: "شركة أزهار الرياض للفعاليات",
    email: "client@florist.sa",
    pass: "client123",
    destination: "/dashboard",
    dashboardLabel: "لوحة مساحة العميل",
    colorScheme: {
      bg: "bg-rose/5 hover:bg-rose/10",
      border: "border-rose/20 hover:border-rose/40",
      text: "text-rose-950",
      pill: "bg-rose/15 text-rose-800 border-rose/30",
      badgeBg: "bg-rose text-white",
      iconBg: "bg-rose/15 text-rose",
    },
    highlights: [
      "متابعة الطلبات المفتوحة وسجل الفواتير",
      "تتبّع حي لمسار الشحنات المبردة",
      "طلب عروض أسعار مخصصة للكميات الكبيرة",
      "تذاكر الدعم والمساعدة المباشرة",
    ],
  },
  {
    id: "courier",
    roleTitle: "كابتن أسطول التوصيل",
    badge: "الخدمات اللوجستية والتسليم",
    personaName: "الكابتن أحمد الزهراني (مشرف مسار)",
    email: "courier@atyab.logistics",
    pass: "courier123",
    destination: "/courier",
    dashboardLabel: "لوحة مهام المندوب",
    colorScheme: {
      bg: "bg-amber-50/50 hover:bg-amber-50/80",
      border: "border-amber-600/20 hover:border-amber-600/40",
      text: "text-amber-950",
      pill: "bg-amber-100/80 text-amber-800 border-amber-300",
      badgeBg: "bg-amber-600 text-white",
      iconBg: "bg-amber-600/10 text-amber-700",
    },
    highlights: [
      "قائمة مهام الشحن والتسليم اليومية",
      "خريطة ملاحة حية بنقاط التوصيل الميداني",
      "تحديث حالة الطلب (تم الاستلام / تم التسليم)",
      "قناة اتصال سريعة مع غرفة العمليات",
    ],
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const formId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [activeAccountType, setActiveAccountType] = useState<"admin" | "client" | "courier" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Auto-fill inputs from a demo account
  const handleAutoFill = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setActiveAccountType(acc.id);
    toast.info(`تمت تعبئة بيانات حساب «${acc.roleTitle}» في النموذج`, {
      description: "يمكنك الآن الضغط على تسجيل الدخول أو التعديل كما ترغب.",
      duration: 3000,
    });
  };

  // Direct 1-click enter for demo accounts
  const handleDirectLogin = (acc: DemoAccount) => {
    setIsLoading(true);
    toast.loading(`جاري تسجيل الدخول كـ ${acc.roleTitle}...`, { id: "login-toast" });

    // Store in localStorage for session simulation
    try {
      localStorage.setItem(
        "atyab_auth_session",
        JSON.stringify({
          role: acc.id,
          roleTitle: acc.roleTitle,
          personaName: acc.personaName,
          email: acc.email,
          loggedInAt: new Date().toISOString(),
          isDemo: true,
        })
      );
    } catch {
      // localStorage may fail in restricted iframes
    }

    setTimeout(() => {
      setIsLoading(false);
      toast.success(`مرحباً بك مجدداً، ${acc.personaName}!`, {
        id: "login-toast",
        description: `تم تحويلك إلى ${acc.dashboardLabel}.`,
        duration: 3500,
      });
      void navigate({ to: acc.destination });
    }, 600);
  };

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني أو اسم المستخدم");
      return;
    }
    if (!password.trim()) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);
    toast.loading("جاري التحقق من بيانات الدخول...", { id: "login-toast" });

    setTimeout(() => {
      setIsLoading(false);

      // Check which account it matches
      const cleanEmail = email.trim().toLowerCase();
      let matched = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === cleanEmail || cleanEmail.includes(a.id)
      );

      // Default fallback destination
      let destination = "/dashboard";
      let roleTitle = "عميل أطيب الزهور";

      if (matched) {
        destination = matched.destination;
        roleTitle = matched.roleTitle;
      } else if (cleanEmail.includes("admin")) {
        destination = "/admin";
        roleTitle = "مدير النظام";
      } else if (cleanEmail.includes("courier")) {
        destination = "/courier";
        roleTitle = "كابتن التوصيل";
      }

      try {
        localStorage.setItem(
          "atyab_auth_session",
          JSON.stringify({
            role: matched ? matched.id : "client",
            roleTitle,
            personaName: email,
            email,
            loggedInAt: new Date().toISOString(),
            isDemo: Boolean(matched),
          })
        );
      } catch {
        // Safe fallback
      }

      toast.success("تم تسجيل الدخول بنجاح!", {
        id: "login-toast",
        description: `أهلاً بك بصلاحية ${roleTitle}. جاري توجيهك...`,
        duration: 3000,
      });

      void navigate({ to: destination });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-cream/40">
      <PageBanner
        title="بوابة تسجيل الدخول الموحدة"
        crumb="تسجيل الدخول"
        subtitle="سجّل الدخول إلى مساحة عملك أو استكشف لوحات الإدارة والعملاء والمندوبين عبر الحسابات التجريبية الجاهزة."
      />

      <section className="container-x py-10 md:py-16">
        {/* Quick Demo Switcher Strip */}
        <div className="mb-10 rounded-2xl border border-gold/30 bg-card p-4 shadow-soft md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2.5 text-forest">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Sparkles className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-forest">
                  دخول فوري للحسابات التجريبية (بنقرة واحدة)
                </h3>
                <p className="text-xs text-muted-foreground">
                  جرّب جميع مزايا النظام فوراً باختيار أحد الأدوار التالية دون الحاجة لإدخال بيانات يدوية:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-0">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.id === "admin" ? ShieldCheck : acc.id === "client" ? Store : Truck;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleDirectLogin(acc)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground shadow-2xs transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:text-primary active:translate-y-0"
                  >
                    <Icon className="size-4 shrink-0 text-gold" />
                    <span>{acc.roleTitle}</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      دخول مباشر
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Left (Form), Right (Demo Accounts Cards) */}
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Main Sign-In Form (5 cols on large screens) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
              <div className="mb-6 flex items-center justify-between border-b pb-5">
                <div>
                  <span className="eyebrow text-xs">أطيب الزهور</span>
                  <h2 className="mt-2 text-2xl font-bold text-forest">تسجيل الدخول</h2>
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
                    البريد الإلكتروني أو اسم المستخدم
                  </label>
                  <div className="relative">
                    <input
                      id={`${formId}-email`}
                      type="text"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="field pl-10 text-start font-mono text-sm"
                      autoComplete="username"
                    />
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="field pl-10 pr-10 text-start font-mono text-sm"
                      autoComplete="current-password"
                    />
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                  disabled={isLoading}
                  className="btn btn-primary mt-2 w-full gap-2 text-base shadow-soft"
                >
                  {isLoading ? (
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
              <div className="mt-6 border-t pt-5">
                <div className="flex items-start gap-2.5 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                  <Shield className="size-4 shrink-0 text-emerald-600" />
                  <span>
                    الاتصال مشفر وآمن عبر بروتوكول SSL 256-bit. للحصول على صلاحيات حساب جملة رسمي معتمد، يرجى تقديم طلب توريد.
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>ليس لديك حساب تاجر؟</span>
                  <Link to="/quote" className="font-bold text-primary hover:underline">
                    طلب فتح حساب جملة
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Accounts Showcase (7 cols on large screens) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-col gap-1">
              <span className="eyebrow text-xs">الحسابات الجاهزة</span>
              <h2 className="text-2xl font-bold text-forest">
                اختر حساباً تجريبياً واستكشف النظام كاملاً
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                تم تجهيز 3 حسابات تمثيلية تغطي جميع جوانب منظومة توريد الزهور. يمكنك الدخول فوراً بنقرة زر أو تعبئة البيانات في النموذج لتجربة عملية الدخول.
              </p>
            </div>

            <div className="grid gap-4">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.id === "admin" ? ShieldCheck : acc.id === "client" ? Store : Truck;
                const isSelected = activeAccountType === acc.id;

                return (
                  <div
                    key={acc.id}
                    className={`relative rounded-3xl border p-5 transition-all md:p-6 shadow-soft ${acc.colorScheme.border} ${
                      isSelected ? "ring-2 ring-primary ring-offset-2 bg-card" : "bg-card"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left side details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${acc.colorScheme.iconBg}`}
                        >
                          <Icon className="size-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-forest">{acc.roleTitle}</h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${acc.colorScheme.badgeBg}`}
                            >
                              {acc.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {acc.personaName}
                          </p>

                          {/* Credentials mini bar */}
                          <div className="mt-2.5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-mono text-muted-foreground">
                            <span>{acc.email}</span>
                            <span className="text-border">|</span>
                            <span className="tracking-widest">••••••••</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side actions */}
                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                        <button
                          type="button"
                          onClick={() => handleDirectLogin(acc)}
                          disabled={isLoading}
                          className="btn btn-primary !h-10 w-full !px-4 text-xs shadow-soft sm:w-auto"
                        >
                          <span>دخول فوري</span>
                          <ArrowLeft className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAutoFill(acc)}
                          className="btn btn-outline !h-9 w-full !px-3 text-xs sm:w-auto"
                        >
                          <KeyRound className="size-3.5 text-gold" />
                          <span>تعبئة في النموذج</span>
                        </button>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="mt-4 border-t border-border/60 pt-3">
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {acc.highlights.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wholesale inquiry banner */}
            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-forest/90 to-forest p-5 text-white sm:flex-row md:p-6">
              <div className="flex items-center gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">هل تدير متجر زهور أو شركة فعاليات؟</h4>
                  <p className="mt-0.5 text-xs text-white/80">
                    احصل على أسعار الجملة المباشرة، خطوط شحن مبردة يومية، وفواتير ضريبية فورية.
                  </p>
                </div>
              </div>
              <Link
                to="/quote"
                className="btn bg-gold !h-10 shrink-0 !px-5 text-xs font-bold !text-forest hover:brightness-110"
              >
                <span>طلب تسعيرة جملة</span>
                <ArrowLeft className="size-3.5" />
              </Link>
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

            <div className="py-5 text-xs leading-6 text-muted-foreground">
              <p className="font-semibold text-foreground">
                للحسابات التجريبية:
              </p>
              <p className="mt-1">
                لا تحتاج لتغيير كلمة المرور. يمكنك استخدام الأزرار الجاهزة «دخول فوري» للاستكشاف المباشر، أو تعبئة كلمة المرور الافتراضية لكل حساب (المكتوبة على البطاقة).
              </p>

              <div className="mt-4 rounded-xl border border-gold/30 bg-blush/20 p-3 text-forest">
                <p className="font-bold">لحسابات التجار والموردين الرسمية:</p>
                <p className="mt-1">
                  يرجى التواصل مع إدارة العمليات أو الدعم الفني المباشر لإعادة تعيين بيانات الحساب:
                </p>
                <p className="mt-2 font-mono font-bold text-primary" dir="ltr">
                  +201007419344 / support@atyabalzohour.com
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-primary !h-9 !px-5 text-xs"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
