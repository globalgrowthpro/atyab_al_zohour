import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageBanner } from "@/components/site/PageBanner";
import { siteConfig } from "@/lib/catalog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | أطيب الزهور" },
      { name: "description", content: "تواصل مع أطيب الزهور لطلبات الجملة والاستفسارات." },
      { property: "og:title", content: "تواصل معنا | أطيب الزهور" },
      { property: "og:description", content: "أرسل استفسارك أو طلبك وسنتواصل معك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageBanner title="تواصل معنا" crumb="تواصل معنا" subtitle="يسعدنا الرد على استفساراتكم وطلبات الجملة." />
      <section className="container-x grid gap-10 py-16 lg:grid-cols-3">
        <aside className="space-y-4">
          <Info icon={MapPin} label="الموقع" value={siteConfig.location} />
          {siteConfig.phone && <Info icon={Phone} label="الهاتف" value={siteConfig.phone} ltr />}
          {siteConfig.email && <Info icon={Mail} label="البريد الإلكتروني" value={siteConfig.email} ltr />}
        </aside>
        <form
          className="space-y-4 rounded-3xl border bg-card p-7 shadow-soft lg:col-span-2"
          onSubmit={(e) => { e.preventDefault(); toast.success("تم استلام رسالتك، سنتواصل معك قريباً."); e.currentTarget.reset(); }}
        >
          <h2 className="text-2xl">أرسل رسالة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required className="field" placeholder="الاسم الكامل" />
            <input className="field" placeholder="اسم المنشأة" />
            <input required type="tel" className="field" placeholder="رقم الجوال" dir="rtl" />
            <input type="email" className="field" placeholder="البريد الإلكتروني" />
          </div>
          <select className="field" defaultValue="">
            <option value="" disabled>نوع الاستفسار</option>
            <option>طلب جملة</option><option>عرض سعر</option><option>حساب شركة</option><option>أخرى</option>
          </select>
          <textarea required rows={5} className="field !h-auto py-3" placeholder="رسالتك" />
          <button type="submit" className="btn btn-primary">إرسال</button>
        </form>
      </section>
    </>
  );
}

function Info({ icon: Icon, label, value, ltr }: { icon: typeof Mail; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="grid size-12 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-6" /></div>
      <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-bold" dir={ltr ? "ltr" : undefined}>{value}</p></div>
    </div>
  );
}
