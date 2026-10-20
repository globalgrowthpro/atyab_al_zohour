import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Download, ShoppingCart, Trash2 } from "lucide-react";
import { QtyStepper } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { products, productImage } from "@/lib/catalog";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "طلب عرض سعر | أطيب الزهور" },
      { name: "description", content: "طلب عرض سعر — أطيب الزهور لتوريد الورود بالجملة." },
      { property: "og:title", content: "طلب عرض سعر | أطيب الزهور" },
      { property: "og:description", content: "طلب عرض سعر — أطيب الزهور." },
    ],
  }),
  component: QuotePage,
});

export function QuotePage() {
  const { lines, setQty, remove, clear } = useCart();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    street: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const items = lines.flatMap(({ slug, qty }) => {
    const p = products.find((p) => p.slug === slug);
    return p ? [{ p, qty }] : [];
  });
  const totals = items.reduce<Record<string, number>>((acc, { p, qty }) => {
    acc[p.unit] = (acc[p.unit] ?? 0) + qty;
    return acc;
  }, {});
  const summary = Object.entries(totals)
    .map(([unit, qty]) => `${qty} ${unit}`)
    .join("، ");
  const fields = [
    ["name", "الاسم الكامل", "text", "name", true],
    ["phone", "رقم الجوال", "tel", "tel", true],
    ["email", "البريد الإلكتروني", "email", "email", false],
    ["city", "المدينة", "text", "address-level2", true],
    ["district", "الحي", "text", "address-level3", true],
    ["street", "الشارع", "text", "address-line1", true],
  ] as const;
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const phone = customer.phone.trim();
    if (
      !customer.name.trim() ||
      !customer.city.trim() ||
      !customer.district.trim() ||
      !customer.street.trim() ||
      !/^[+\d\s()-]{7,25}$/.test(phone) ||
      phone.replace(/\D/g, "").length < 7
    ) {
      setError("أكمل الاسم والعنوان (المدينة والحي والشارع) وأدخل رقم جوال صحيحاً.");
      return;
    }
    setError("");
    setStep(2);
  }
  function download() {
    try {
      const text = [
        "أطيب الزهور — طلب عرض سعر",
        "مسودة جاهزة للمشاركة — لم تُرسل للشركة",
        "",
        ...fields.map(([key, label]) => `${label}: ${customer[key].trim() || "—"}`),
        "",
        ...items.map(({ p, qty }) => `${p.sku} | ${p.name} | ${qty} ${p.unit}`),
        "",
        `إجمالي الكميات: ${summary}`,
        "الأسعار والتوفر والتوصيل تخضع لتأكيد المبيعات.",
        `ملاحظات: ${customer.notes.trim() || "—"}`,
      ].join("\n");
      const url = URL.createObjectURL(
        new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "atyab-quote-request.txt";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
      setMessage("تم تجهيز الملف للتحميل. لم يُرسل للشركة؛ شاركه مع ممثل المبيعات.");
    } catch {
      setError("تعذّر تجهيز الملف. حاول التحميل مرة أخرى.");
    }
  }
  function go(next: number) {
    setStep(next);
    setError("");
    setMessage("");
  }
  return (
    <>
      <PageBanner
        title="السلة وطلب عرض سعر"
        crumb="طلب عرض سعر"
        subtitle="راجع المنتجات والكميات وجهّز تفاصيل طلب الجملة."
      />
      <section className="container-x py-12">
        {!items.length ? (
          <div className="rounded-3xl border bg-card p-12 text-center shadow-soft">
            <ShoppingCart className="mx-auto mb-5 size-12 text-primary" />
            <h2 className="text-2xl">سلة طلبك فارغة</h2>
            <p className="mt-3 text-muted-foreground">
              أضف المنتجات والكميات لتجهيز طلب عرض السعر.
            </p>
            <Link to="/products" className="btn btn-primary mt-6">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <ol aria-label="خطوات الطلب" className="mb-8 flex flex-wrap gap-3 text-sm font-bold">
              {["١. مراجعة السلة", "٢. بيانات الطلب", "٣. مراجعة وتحميل"].map((label, i) => (
                <li
                  key={label}
                  aria-current={step === i ? "step" : undefined}
                  className={`rounded-full px-5 py-3 ${step === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {label}
                </li>
              ))}
            </ol>
            <div className="grid items-start gap-8 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                {step === 0 ? (
                  <>
                    <div className="flex justify-between gap-3">
                      <h2 className="text-2xl">منتجات الطلب</h2>
                      <button
                        className="text-sm text-destructive underline"
                        onClick={() => {
                          if (window.confirm("هل تريد إفراغ السلة؟")) clear();
                        }}
                      >
                        إفراغ السلة
                      </button>
                    </div>
                    {items.map(({ p, qty }) => (
                      <article
                        key={p.slug}
                        className="flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-5 shadow-soft"
                      >
                        <Link to="/products/$slug" params={{ slug: p.slug }}>
                          <img
                            src={productImage(p)}
                            alt={p.name}
                            className="size-24 rounded-xl object-cover"
                          />
                        </Link>
                        <div className="min-w-40 flex-1">
                          <Link to="/products/$slug" params={{ slug: p.slug }}>
                            <h3 className="text-lg">{p.name}</h3>
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {p.sku} · الوحدة: {p.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            الحد الأدنى: {p.moq} {p.unit}
                          </p>
                        </div>
                        <div role="group" aria-label={`كمية ${p.name}`}>
                          <QtyStepper value={qty} min={p.moq} onChange={(n) => setQty(p.slug, n)} />
                        </div>
                        <button
                          aria-label={`حذف ${p.name}`}
                          className="rounded-full p-3 text-destructive hover:bg-muted"
                          onClick={() => remove(p.slug)}
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </article>
                    ))}
                    <Link to="/products" className="btn btn-outline">
                      إضافة منتجات أخرى
                    </Link>
                  </>
                ) : step === 1 ? (
                  <form
                    id="quote-details"
                    onSubmit={review}
                    className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft"
                  >
                    <h2 className="text-2xl">بيانات العميل</h2>
                    <p className="text-sm text-muted-foreground">
                      * حقل مطلوب. تُستخدم البيانات لتجهيز الملف فقط ولا تُرسل إلى خادم.
                    </p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {fields.map(([key, label, type, autocomplete, required]) => (
                        <label key={key} className="block space-y-2">
                          <span>
                            {label}
                            {required ? " *" : " (اختياري)"}
                          </span>
                          <input
                            className="field"
                            type={type}
                            autoComplete={autocomplete}
                            required={required}
                            maxLength={key === "phone" ? 25 : 160}
                            value={customer[key]}
                            onChange={(e) => setCustomer((c) => ({ ...c, [key]: e.target.value }))}
                          />
                        </label>
                      ))}
                    </div>
                    <label className="block space-y-2">
                      <span>ملاحظات الطلب</span>
                      <textarea
                        className="field !h-auto py-3"
                        rows={4}
                        maxLength={2000}
                        value={customer.notes}
                        onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))}
                      />
                    </label>
                    <button type="button" className="btn btn-outline" onClick={() => go(0)}>
                      العودة للسلة
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft">
                    <h2 className="text-2xl">مراجعة طلب عرض السعر</h2>
                    <dl className="grid gap-4 break-words sm:grid-cols-2">
                      {fields.map(([key, label]) => (
                        <div key={key}>
                          <dt className="text-sm text-muted-foreground">{label}</dt>
                          <dd className="font-bold">{customer[key] || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <ul className="divide-y">
                      {items.map(({ p, qty }) => (
                        <li key={p.slug} className="flex justify-between gap-4 py-3">
                          <span>{p.name}</span>
                          <strong>
                            {qty} {p.unit}
                          </strong>
                        </li>
                      ))}
                    </ul>
                    {customer.notes && (
                      <p className="whitespace-pre-wrap break-words">ملاحظات: {customer.notes}</p>
                    )}
                    <p className="rounded-2xl bg-blush/60 p-4 leading-7 text-forest">
                      لم يتم إرسال الطلب. حمّل الملف وشاركه مع ممثل المبيعات عبر وسيلة التواصل
                      المتفق عليها. بيانات التواصل الرسمية لم تُضف للموقع بعد.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn btn-outline" onClick={() => go(1)}>
                        تعديل البيانات
                      </button>
                      <button className="btn btn-outline" onClick={() => go(0)}>
                        تعديل المنتجات
                      </button>
                    </div>
                  </div>
                )}
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-destructive p-4 text-destructive"
                  >
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" className="rounded-xl bg-accent p-4 text-primary">
                    {message}
                  </p>
                )}
              </div>
              <aside className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft lg:sticky lg:top-40">
                <h2 className="text-xl">ملخص الطلب</h2>
                <div className="flex justify-between">
                  <span>عدد الأصناف</span>
                  <strong>{items.length}</strong>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الكميات حسب وحدة البيع</p>
                  <p className="mt-2 font-bold">{summary}</p>
                </div>
                <div className="gold-rule" />
                <p className="text-sm leading-7 text-muted-foreground">
                  القيمة المالية تُحدد في عرض السعر. الأسعار والتوفر ورسوم التوصيل تحتاج تأكيد فريق
                  المبيعات.
                </p>
                {step === 0 ? (
                  <button className="btn btn-primary w-full" onClick={() => go(1)}>
                    متابعة لبيانات الطلب
                  </button>
                ) : step === 1 ? (
                  <button type="submit" form="quote-details" className="btn btn-primary w-full">
                    مراجعة الطلب
                  </button>
                ) : (
                  <button className="btn btn-rose w-full" onClick={download}>
                    <Download className="size-4" />
                    تحميل طلب عرض السعر
                  </button>
                )}
              </aside>
            </div>
          </>
        )}
      </section>
    </>
  );
}
