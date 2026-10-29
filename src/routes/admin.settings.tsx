import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/lib/catalog";
import { Badge, PageTitle, Panel } from "@/features/admin/shared";
import { Field as FormField, Grid, Select, Toggle } from "@/features/admin/form";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

const templates = [
  ["تأكيد استلام الطلب", "يُرسل للعميل عند إنشاء طلب جديد"],
  ["تحديث حالة الطلب", "عند تغيير الحالة إلى قيد التجهيز أو مع المندوب أو تم التسليم"],
  ["عرض سعر جديد", "عند إرسال عرض سعر للعميل"],
  ["تفعيل الحساب", "عند موافقة الإدارة على حساب عميل جديد"],
  ["إعادة تعيين كلمة المرور", "رابط إعادة التعيين للمستخدم"],
  ["تنبيه نفاد المخزون", "يُرسل للإدارة عند نفاد منتج"],
] as const;

function Settings() {
  const [testTo, setTestTo] = useState("");
  const test = () => (testTo ? toast.success(`تم إرسال رسالة تجريبية إلى ${testTo} (تجريبي)`) : toast.error("أدخل بريداً لإرسال الرسالة التجريبية"));
  const save = (e: FormEvent) => { e.preventDefault(); toast.success("تم حفظ الإعدادات (تجريبي)"); };
  return (
    <>
      <PageTitle title="الإعدادات" desc="بيانات التواصل والطلب والتوصيل والبريد الإلكتروني (SMTP)." />
      <form onSubmit={save} className="space-y-6">
        <Panel title="بيانات التواصل">
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="رقم الجوال" defaultValue={siteConfig.phone} placeholder="لم يُضف بعد" />
            <Field label="البريد الإلكتروني" defaultValue={siteConfig.email} placeholder="لم يُضف بعد" />
            <Field label="الموقع" defaultValue={siteConfig.location} />
          </div>
        </Panel>
        <Panel title="الطلب والتوصيل">
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="آخر موعد لطلبات اليوم نفسه" defaultValue="12:00" type="time" />
            <Field label="مدن التوصيل" defaultValue="الرياض، جدة، الدمام، الخبر، مكة" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="size-4 accent-primary" />إظهار الأسعار للعملاء المعتمدين فقط</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="size-4 accent-primary" />مراجعة الحسابات الجديدة يدوياً</label>
          </div>
        </Panel>
        <div id="smtp" className="flex items-center gap-3 pt-2"><h2 className="text-lg font-extrabold text-forest">البريد الإلكتروني (SMTP)</h2><Badge tone="muted">غير متصل</Badge></div>
        <Panel title="خادم الإرسال">
          <Grid>
            <FormField label="خادم SMTP" placeholder="smtp.example.com" dir="ltr" />
            <FormField label="المنفذ" type="number" defaultValue={587} dir="ltr" />
            <Select label="التشفير" defaultValue="tls" options={[["tls", "STARTTLS"], ["ssl", "SSL/TLS"], ["none", "بدون"]]} />
            <FormField label="اسم المستخدم" dir="ltr" autoComplete="off" />
            <FormField label="كلمة المرور" type="password" dir="ltr" autoComplete="new-password" hint="تُحفظ بشكل آمن عند ربط الخادم." />
          </Grid>
        </Panel>
        <Panel title="بيانات المرسل">
          <Grid>
            <FormField label="اسم المرسل" defaultValue="أطيب الزهور" />
            <FormField label="بريد المرسل" type="email" placeholder="لم يُضف بعد" dir="ltr" />
            <FormField label="بريد الرد" type="email" placeholder="لم يُضف بعد" dir="ltr" />
            <FormField label="نسخة مخفية للإدارة" type="email" placeholder="اختياري" dir="ltr" />
          </Grid>
        </Panel>
        <Panel title="قوالب الإشعارات">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {templates.map(([t, d]) => <Toggle key={t} label={t} desc={d} defaultChecked />)}
          </div>
        </Panel>
        <Panel title="رسالة تجريبية">
          <div className="flex flex-wrap items-end gap-3 p-5">
            <div className="min-w-[240px] flex-1"><FormField label="أرسل إلى" type="email" dir="ltr" value={testTo} onChange={(e) => setTestTo(e.target.value)} /></div>
            <button type="button" onClick={test} className="btn btn-outline">إرسال تجربة</button>
          </div>
        </Panel>
        <button type="submit" className="btn btn-primary">حفظ الإعدادات</button>
      </form>
    </>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-bold text-forest">
      {label}
      <input {...rest} className="field mt-2" />
    </label>
  );
}
