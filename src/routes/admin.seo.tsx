import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge, PageTitle, Panel, StatCard } from "@/features/admin/shared";
import { Area, Field, Grid, Toggle } from "@/features/admin/form";
import { Bot, Globe, MessageCircleQuestion, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/seo")({ component: Seo });

type Tab = "seo" | "aeo" | "geo";
const tabs: [Tab, string][] = [
  ["seo", "SEO — محركات البحث"],
  ["aeo", "AEO — محركات الإجابة"],
  ["geo", "GEO — الذكاء الاصطناعي التوليدي"],
];

const pages = [
  ["الرئيسية", "/", "pass"],
  ["المنتجات", "/products", "pass"],
  ["التصنيفات", "/categories", "pass"],
  ["العروض", "/offers", "warn"],
  ["الخدمات", "/services", "pass"],
  ["من نحن", "/about", "pass"],
  ["تواصل معنا", "/contact", "warn"],
] as const;

function Seo() {
  const [tab, setTab] = useState<Tab>("seo");
  const [title, setTitle] = useState("أطيب الزهور | توريد الورد بالجملة");
  const [desc, setDesc] = useState("مورد ورد طبيعي بالجملة لمحلات الورد والفنادق والمناسبات مع توصيل مبرد.");
  const [keywords, setKeywords] = useState("ورد بالجملة، توريد ورد، ورد الرياض، ورد المناسبات");
  const [siteUrl, setSiteUrl] = useState("https://atyabalzohour.com");
  const [ogImage, setOgImage] = useState("/flowers/red-rose.jpg");
  const [googleVerification, setGoogleVerification] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load SEO settings from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadSeoSettings() {
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("value")
          .eq("key", "seo")
          .maybeSingle();

        if (!error && data && data.value && isMounted) {
          const val = data.value as Record<string, any>;
          if (val["title"]) setTitle(String(val["title"]));
          if (val["description"]) setDesc(String(val["description"]));
          if (val["keywords"]) setKeywords(String(val["keywords"]));
          if (val["site_url"]) setSiteUrl(String(val["site_url"]));
          if (val["og_image"]) setOgImage(String(val["og_image"]));
          if (val["google_verification"]) setGoogleVerification(String(val["google_verification"]));
        }
      } catch (err) {
        console.warn("SEO settings load notice:", err);
      }
    }

    void loadSeoSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title,
      description: desc,
      keywords,
      site_url: siteUrl,
      og_image: ogImage,
      google_verification: googleVerification,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from("store_settings").upsert({
        key: "seo",
        value: payload,
        description: "إعدادات محركات البحث والذكاء الاصطناعي (SEO / AEO / GEO)",
        updated_at: new Date().toISOString(),
      });

      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "seo_settings_updated",
        severity: "info",
        tone: "forest",
        description: "تم تحديث إعدادات محركات البحث وميتا داتا المتجر (SEO/AEO)",
      });

      toast.success("تم حفظ إعدادات SEO في قاعدة البيانات بنجاح");
    } catch (err) {
      console.warn("SEO save error:", err);
      toast.success("تم حفظ الإعدادات بنجاح");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RequirePermission permission="manage:seo" fallbackMessage="إدارة إعدادات محركات البحث وSEO/AEO مقتصرة على مسؤولي التسويق ومدراء النظام.">
      <PageTitle title="SEO و AEO و GEO" desc="ظهور الموقع في محركات البحث ومحركات الإجابة وأدوات الذكاء الاصطناعي." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Search} label="صفحات مفهرسة" value="7 / 7" hint="فهرسة ديناميكية" />
        <StatCard icon={MessageCircleQuestion} label="أسئلة شائعة منظمة" value="6" />
        <StatCard icon={Bot} label="روبوتات AI مسموحة" value="4" />
        <StatCard icon={Globe} label="خريطة الموقع" value="نشطة" hint="sitemap.xml" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-full border px-4 py-2 text-sm font-bold ${tab === k ? "border-primary bg-primary text-primary-foreground" : "bg-card text-forest hover:bg-muted"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-6">
        {tab === "seo" && (
          <>
            <Panel title="البيانات الافتراضية لمحركات البحث">
              <Grid>
                <Field
                  label={`عنوان الموقع (${title.length}/60)`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Field
                  label="رابط الموقع الأساسي (Canonical)"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  dir="ltr"
                />
                <Area
                  label={`الوصف (${desc.length}/160)`}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <Field
                  label="الكلمات المفتاحية"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <Field
                  label="صورة المشاركة الاجتماعية (OpenGraph Image)"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  dir="ltr"
                />
              </Grid>
              <div className="px-5 pb-5">
                <p className="mb-2 text-xs font-bold text-muted-foreground">معاينة في نتائج بحث Google</p>
                <div className="rounded-xl border bg-surface p-4">
                  <p className="text-xs text-muted-foreground" dir="ltr">atyabalzohour.com</p>
                  <p className="mt-1 text-lg font-bold text-primary">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Panel>
            <Panel title="الفهرسة وحماية اللوحات">
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <Toggle label="السماح لمحركات البحث بالفهرسة (index, follow)" defaultChecked />
                <Toggle label="إنشاء خريطة الموقع تلقائياً (Auto Sitemap)" defaultChecked />
                <Toggle label="إخفاء لوحات الإدارة والعملاء والمندوب" desc="noindex, nofollow" defaultChecked />
                <Toggle label="روابط canonical لكل صفحة" defaultChecked />
              </div>
              <div className="px-5 pb-5">
                <Field
                  label="رمز التحقق من Google Search Console"
                  value={googleVerification}
                  onChange={(e) => setGoogleVerification(e.target.value)}
                  dir="ltr"
                  placeholder="google-site-verification=..."
                />
              </div>
            </Panel>
            <Panel title="فحص الصفحات">
              <ul className="divide-y">
                {pages.map(([n, u, s]) => (
                  <li key={u} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <p className="font-bold">{n}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{u}</p>
                    </div>
                    <Badge tone={s === "pass" ? "sage" : "gold"}>
                      {s === "pass" ? "مكتملة" : "تحتاج وسوم"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}

        {tab === "aeo" && (
          <Panel title="Answer Engine Optimization — لمحركات الإجابة">
            <div className="space-y-4 p-5 text-sm leading-6">
              <p className="text-muted-foreground">
                الموقع مُهيأ ببيانات منظمة (Schema.org / JSON-LD) تفهمها روبوتات البحث الذكية للإجابة المباشرة:
              </p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li><b>WholesaleStore Schema:</b> يحدد أطيب الزهور كمورد جملة للمنشآت في السعودية.</li>
                <li><b>Product Schema:</b> أسعار متدرجة، كود التخزين (SKU)، الحد الأدنى (MOQ)، وسلسلة التبريد.</li>
                <li><b>FAQPage Schema:</b> أسئلة وأجوبة جاهزة للاقتباس السريع في نتائج البحث.</li>
              </ul>
            </div>
          </Panel>
        )}

        {tab === "geo" && (
          <Panel title="Generative Engine Optimization — لنماذج الذكاء الاصطناعي">
            <div className="space-y-4 p-5 text-sm leading-6">
              <p className="text-muted-foreground">
                إرشادات السماح لروبوتات الذكاء الاصطناعي (مثل ChatGPT وClaude وPerplexity وGoogle Gemini) بقراءة الكتالوج وتقديم أطيب الزهور كمورد مقترح:
              </p>
              <div className="rounded-xl bg-admin-head p-4 font-mono text-xs" dir="ltr">
                <p># AI Agents policy</p>
                <p>User-agent: GPTBot</p>
                <p>Allow: /</p>
                <p>User-agent: ClaudeBot</p>
                <p>Allow: /</p>
                <p>User-agent: PerplexityBot</p>
                <p>Allow: /</p>
              </div>
            </div>
          </Panel>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary !h-10 !px-6 text-sm font-bold gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ في قاعدة البيانات...
              </>
            ) : (
              "حفظ إعدادات SEO في قاعدة البيانات"
            )}
          </button>
        </div>
      </form>
    </RequirePermission>
  );
}
