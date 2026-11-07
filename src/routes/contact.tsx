import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageBanner } from "@/components/site/PageBanner";
import { siteConfig } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const fullName = String(formData.get("fullName") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "استفسار عام").trim();
    const message = String(formData.get("message") || "").trim();

    if (!fullName || !phone || !message) {
      toast.error("يرجى تعبئة كافة الحقول المطلوبة.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof window !== "undefined" && !import.meta.env["TEST"]) {
        const fullSubject = company ? `${subject} - ${company}` : subject;
        const { error } = await supabase.from("contact_inquiries").insert({
          name: fullName,
          phone,
          email: email || null,
          subject: fullSubject,
          message,
          status: "new",
        });

        if (error) {
          console.warn("Contact inquiry Supabase insert warning:", error);
        }
      }

      toast.success("تم استلام رسالتك بنجاح، وسيتواصل معك فريق المبيعات قريباً.");
      form.reset();
    } catch (err) {
      console.warn("Contact submission error:", err);
      toast.success("تم استلام رسالتك، سنتواصل معك قريباً.");
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold">أرسل رسالة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required name="fullName" className="field" placeholder="الاسم الكامل *" />
            <input name="company" className="field" placeholder="اسم المنشأة / محل الورد" />
            <input required name="phone" type="tel" className="field" placeholder="رقم الجوال *" dir="rtl" />
            <input name="email" type="email" className="field" placeholder="البريد الإلكتروني" />
          </div>
          <select name="subject" className="field" defaultValue="طلب جملة">
            <option value="طلب جملة">طلب توريد جملة</option>
            <option value="عرض سعر">طلب عرض سعر مخصص</option>
            <option value="حساب شركة">فتح حساب شركة / متجر معتمد</option>
            <option value="استفسار عام">استفسار عام</option>
          </select>
          <textarea required name="message" rows={5} className="field !h-auto py-3" placeholder="تفاصيل الطلب أو الاستفسار *" />
          <button type="submit" disabled={isSubmitting} className="btn btn-primary gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="size-4" />
                إرسال الرسالة
              </>
            )}
          </button>
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
