import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { siteConfig } from "@/lib/catalog";
import { PageTitle, Panel } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const save = (e: FormEvent) => { e.preventDefault(); toast.success("تم حفظ الإعدادات (تجريبي)"); };
  return (
    <>
      <PageTitle title="الإعدادات" desc="بيانات التواصل وإعدادات الطلب والتوصيل." />
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
