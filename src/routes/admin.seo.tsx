import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge, PageTitle, Panel, StatCard } from "@/features/admin/shared";
import { Area, Field, Grid, Toggle } from "@/features/admin/form";
import { Bot, Globe, MessageCircleQuestion, Search } from "lucide-react";

export const Route = createFileRoute("/admin/seo")({ component: Seo });

type Tab = "seo" | "aeo" | "geo";
const tabs: [Tab, string][] = [["seo", "SEO — محركات البحث"], ["aeo", "AEO — محركات الإجابة"], ["geo", "GEO — الذكاء الاصطناعي التوليدي"]];

const pages = [
  ["الرئيسية", "/", "pass"], ["المنتجات", "/products", "pass"], ["التصنيفات", "/categories", "pass"],
  ["العروض", "/offers", "warn"], ["الخدمات", "/services", "pass"], ["من نحن", "/about", "pass"], ["تواصل معنا", "/contact", "warn"],
] as const;

function Seo() {
  const [tab, setTab] = useState<Tab>("seo");
  const [title, setTitle] = useState("أطيب الزهور | توريد الورد بالجملة");
  const [desc, setDesc] = useState("مورد ورد طبيعي بالجملة لمحلات الورد والفنادق والمناسبات مع توصيل مبرد.");
  const save = (e: FormEvent) => { e.preventDefault(); toast.success("تم حفظ الإعدادات (تجريبي)"); };

  return (
    <>
      <PageTitle title="SEO و AEO و GEO" desc="ظهور الموقع في محركات البحث ومحركات الإجابة وأدوات الذكاء الاصطناعي." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Search} label="صفحات مفهرسة" value="7 / 7" hint="بيانات تمثيلية" />
        <StatCard icon={MessageCircleQuestion} label="أسئلة شائعة منظمة" value="6" />
        <StatCard icon={Bot} label="روبوتات AI مسموحة" value="4" />
        <StatCard icon={Globe} label="خريطة الموقع" value="لم تُنشأ" hint="تحتاج رابط الموقع المنشور" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`rounded-full border px-4 py-2 text-sm font-bold ${tab === k ? "border-primary bg-primary text-primary-foreground" : "bg-card text-forest hover:bg-muted"}`}>{l}</button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-6">
        {tab === "seo" && (
          <>
            <Panel title="البيانات الافتراضية">
              <Grid>
                <Field label={`عنوان الموقع (${title.length}/60)`} value={title} onChange={(e) => setTitle(e.target.value)} />
                <Field label="رابط الموقع الأساسي" placeholder="يُضاف بعد النشر" dir="ltr" />
                <Area label={`الوصف (${desc.length}/160)`} value={desc} onChange={(e) => setDesc(e.target.value)} />
                <Field label="الكلمات المفتاحية" defaultValue="ورد بالجملة، توريد ورد، ورد الرياض، ورد المناسبات" />
                <Field label="صورة المشاركة (رابط)" placeholder="1200×630" dir="ltr" />
              </Grid>
              <div className="px-5 pb-5">
                <p className="mb-2 text-xs font-bold text-muted-foreground">معاينة في نتائج البحث</p>
                <div className="rounded-xl border bg-surface p-4">
                  <p className="text-xs text-muted-foreground" dir="ltr">atyab-flowers.com</p>
                  <p className="mt-1 text-lg font-bold text-primary">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Panel>
            <Panel title="الفهرسة">
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <Toggle label="السماح لمحركات البحث بالفهرسة" defaultChecked />
                <Toggle label="إنشاء خريطة الموقع تلقائياً" defaultChecked />
                <Toggle label="إخفاء لوحات الإدارة والعملاء والمندوب" desc="noindex" defaultChecked />
                <Toggle label="روابط canonical لكل صفحة" defaultChecked />
              </div>
              <div className="px-5 pb-5"><Field label="رمز التحقق من Google Search Console" dir="ltr" placeholder="اختياري" /></div>
            </Panel>
            <Panel title="فحص الصفحات">
              <ul className="divide-y">
                {pages.map(([n, p, s]) => (
                  <li key={p} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span><b className="text-forest">{n}</b> <span className="text-muted-foreground" dir="ltr">{p}</span></span>
                    {s === "pass" ? <Badge tone="sage">مكتملة</Badge> : <Badge tone="gold">تحتاج مراجعة</Badge>}
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}

        {tab === "aeo" && (
          <>
            <Panel title="البيانات المنظمة (Schema)">
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <Toggle label="Organization — بيانات الشركة" defaultChecked />
                <Toggle label="LocalBusiness — الموقع وساعات العمل" desc="يحتاج العنوان وساعات العمل الحقيقية" />
                <Toggle label="Product — صفحات المنتجات" defaultChecked />
                <Toggle label="FAQPage — الأسئلة الشائعة" defaultChecked />
                <Toggle label="BreadcrumbList — مسار التنقل" defaultChecked />
              </div>
            </Panel>
            <Panel title="إجابات مختصرة للأسئلة الشائعة" action={<button type="button" onClick={() => toast.success("تمت إضافة سؤال (تجريبي)")} className="text-xs font-bold text-primary">+ سؤال جديد</button>}>
              <div className="space-y-4 p-5">
                {["ما الحد الأدنى للطلب بالجملة؟", "هل يتوفر توصيل مبرد؟", "كيف أحصل على أسعار الجملة؟"].map((q) => (
                  <div key={q} className="rounded-xl border bg-surface p-4">
                    <Field label="السؤال" defaultValue={q} />
                    <div className="mt-3 grid"><Area label="الإجابة المختصرة (40–60 كلمة)" placeholder="اكتب إجابة مباشرة وواضحة" /></div>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}

        {tab === "geo" && (
          <>
            <Panel title="روبوتات الذكاء الاصطناعي">
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <Toggle label="GPTBot (ChatGPT)" defaultChecked />
                <Toggle label="Google-Extended (Gemini)" defaultChecked />
                <Toggle label="PerplexityBot" defaultChecked />
                <Toggle label="ClaudeBot" defaultChecked />
              </div>
            </Panel>
            <Panel title="ملف llms.txt — تعريف الموقع للذكاء الاصطناعي">
              <div className="grid gap-4 p-5">
                <Toggle label="نشر ملف llms.txt" defaultChecked />
                <Area label="ملخص النشاط" defaultValue="أطيب الزهور مورد ورد طبيعي بالجملة في السعودية، يخدم محلات الورد والفنادق وقاعات المناسبات والشركات، مع تخزين وتوصيل مبرد." />
                <Area label="حقائق أساسية يُستشهد بها" placeholder="مثال: سنة التأسيس، مدن التوصيل، عدد الأصناف — أدخل معلومات حقيقية فقط" />
              </div>
            </Panel>
            <Panel title="إشارات الثقة">
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <Toggle label="إظهار تاريخ آخر تحديث على الصفحات" defaultChecked />
                <Toggle label="ربط الحسابات الرسمية (sameAs)" desc="روابط التواصل الاجتماعي الرسمية" />
              </div>
            </Panel>
          </>
        )}
        <button type="submit" className="btn btn-primary">حفظ الإعدادات</button>
      </form>
    </>
  );
}
