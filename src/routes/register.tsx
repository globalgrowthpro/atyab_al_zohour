import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId, type FormEvent } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  Building2,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";
import { useAuth } from "@/features/auth/context";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب B2B جديد | أطيب الزهور" },
      {
        name: "description",
        content: "سجّل حسابك التجاري كمتجر ورود أو منسق حفلات للحصول على أسعار الجملة وحجز الشحنات المبردة مباشرة.",
      },
      { property: "og:title", content: "إنشاء حساب B2B جديد | أطيب الزهور" },
      { property: "og:description", content: "انضم إلى شبكة عملاء أطياب الزهور للجملة وسلسلة التبريد المباشرة." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { signUp, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [commercialRegister, setCommercialRegister] = useState("");
  const [city, setCity] = useState("الرياض");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullNameId = useId();
  const companyId = useId();
  const crId = useId();
  const cityId = useId();
  const phoneId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !companyName.trim() || !phone.trim() || !email.trim() || !password) {
      toast.error("يرجى تعبئة كافة الحقول الإلزامية.");
      return;
    }

    if (password.length < 8) {
      toast.error("كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("جاري إنشاء الحساب وتوثيقه...", { id: "register-toast" });

    try {
      const res = await signUp({
        email,
        password,
        fullName,
        phone,
        companyName,
        city,
        ...(commercialRegister.trim() ? { commercialRegister: commercialRegister.trim() } : {}),
      });

      if (res.success) {
        toast.success("تم إنشاء الحساب بنجاح!", {
          id: "register-toast",
          description: "أهلاً بك في منصة أطياب الزهور للجملة. جاري توجيهك إلى حسابك...",
          duration: 3500,
        });

        setTimeout(() => {
          void navigate({ to: "/dashboard" });
        }, 1000);
      } else {
        toast.error("تعذّر إنشاء الحساب", {
          id: "register-toast",
          description: res.error || "يرجى التحقق من صحة البيانات أو استخدام بريد آخر.",
        });
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء التسجيل", {
        id: "register-toast",
        description: err instanceof Error ? err.message : "يرجى المحاولة لاحقاً.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream/40 pb-20">
      <PageBanner
        title="إنشاء حساب عميل تجاري B2B"
        crumb="تسجيل جديد"
        subtitle="انضم لشبكة محلات الزهور ومنسقي الحفلات المعتمدين واستفد من أسعار الجملة والتبريد المباشر."
      />

      <div className="container-x py-10 md:py-14 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Highlights Sidebar */}
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-3 text-forest">
                <div className="grid size-10 place-items-center rounded-xl bg-forest/10">
                  <Store className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold">مزايا حساب الجملة</h3>
                  <p className="text-xs text-muted-foreground">للمتاجر والمنسقين</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs leading-6 text-foreground/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>خصومات تصاعدية تبدأ من الشريحة البرونزية حتى 15% VIP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>أولوية حجز شحنات المزادات الهولندية والإكوادورية قبل وصول الطائرات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>فواتير ضريبية إلكترونية معتمدة مطابقة لهيئة الزكاة ZATCA.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>توصيل مبرد قياسي ومباشر لعنوان محلك أو موقع فعاليتك.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-gold/30 bg-gold/5 p-5 text-center">
              <Sparkles className="size-6 text-gold mx-auto mb-2" />
              <p className="text-xs font-bold text-foreground">لديك حساب مسجل بالفعل؟</p>
              <Link to="/login" className="btn btn-outline text-xs mt-3 w-full !h-9">
                تسجيل الدخول الآن
              </Link>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
              <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="size-6 text-primary" />
                  بيانات المنشأة والمسؤول
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  املأ البيانات التالية لإنشاء وتفعيل حسابك المعتمد في أطياب الزهور.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={fullNameId} className="block text-xs font-bold mb-1.5">
                      اسم المسؤول الكامل *
                    </label>
                    <div className="relative">
                      <input
                        id={fullNameId}
                        required
                        type="text"
                        className="field !pe-10"
                        placeholder="سارة العتيبي"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                      <User className="absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={companyId} className="block text-xs font-bold mb-1.5">
                      اسم المتجر أو الشركة *
                    </label>
                    <div className="relative">
                      <input
                        id={companyId}
                        required
                        type="text"
                        className="field !pe-10"
                        placeholder="مؤسسة زهرة الربيع"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                      <Building2 className="absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-bold mb-1.5">
                      رقم الجوال التجاري *
                    </label>
                    <div className="relative">
                      <input
                        id={phoneId}
                        required
                        type="tel"
                        dir="ltr"
                        className="field !pe-10"
                        placeholder="0501234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <Phone className="absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={cityId} className="block text-xs font-bold mb-1.5">
                      مدينة التوصيل *
                    </label>
                    <div className="relative">
                      <select
                        id={cityId}
                        className="field"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        <option value="الرياض">الرياض</option>
                        <option value="جدة">جدة</option>
                        <option value="الدمام">الدمام</option>
                        <option value="مكة المكرمة">مكة المكرمة</option>
                        <option value="المدينة المنورة">المدينة المنورة</option>
                        <option value="الخبر">الخبر</option>
                        <option value="أبها">أبها</option>
                        <option value="الطائف">الطائف</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={crId} className="block text-xs font-bold mb-1.5">
                      رقم السجل التجاري (إن وجد)
                    </label>
                    <div className="relative">
                      <input
                        id={crId}
                        type="text"
                        dir="ltr"
                        className="field !pe-10"
                        placeholder="1010XXXXXX"
                        value={commercialRegister}
                        onChange={(e) => setCommercialRegister(e.target.value)}
                      />
                      <FileText className="absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={emailId} className="block text-xs font-bold mb-1.5">
                      البريد الإلكتروني للتوثيق *
                    </label>
                    <div className="relative">
                      <input
                        id={emailId}
                        required
                        type="email"
                        dir="ltr"
                        className="field !pe-10"
                        placeholder="procurement@florist.sa"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Mail className="absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={passwordId} className="block text-xs font-bold mb-1.5">
                      كلمة المرور (8 خانات كحد أدنى) *
                    </label>
                    <div className="relative">
                      <input
                        id={passwordId}
                        required
                        type={showPassword ? "text" : "password"}
                        dir="ltr"
                        className="field !pe-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={confirmPasswordId} className="block text-xs font-bold mb-1.5">
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        id={confirmPasswordId}
                        required
                        type={showPassword ? "text" : "password"}
                        dir="ltr"
                        className="field !pe-10"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <Lock className="absolute end-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="btn btn-primary w-full !h-12 text-sm font-bold gap-2"
                  >
                    {isSubmitting || authLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        جاري توثيق الحساب...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-5" />
                        إنشاء حساب الجملة وتأكيده
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground pt-2">
                  بالتسجيل، أنت توافق على شروط توريد الزهور وسياسة سلسلة التبريد المعتمدة.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
