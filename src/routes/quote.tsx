import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Download, ShoppingCart, Trash2, ShoppingBag, Plus, AlertTriangle } from "lucide-react";
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
  const [showClearModal, setShowClearModal] = useState(false);
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
      <section className="container-x py-8 sm:py-12">
        {!items.length ? (
          <div className="rounded-3xl border bg-card p-8 sm:p-12 text-center shadow-soft">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <ShoppingCart className="size-8" />
            </div>
            <h2 className="text-2xl font-bold">سلة طلبك فارغة</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              أضف المنتجات والكميات لتجهيز طلب عرض السعر.
            </p>
            <Link to="/products" className="btn btn-primary mt-6">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            <ol aria-label="خطوات الطلب" className="mb-6 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
              {["١. مراجعة السلة", "٢. بيانات الطلب", "٣. مراجعة وتحميل"].map((label, i) => (
                <li
                  key={label}
                  aria-current={step === i ? "step" : undefined}
                  className={`rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5 transition-all ${
                    step === i
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </li>
              ))}
            </ol>
            <div className="grid items-start gap-8 lg:grid-cols-3">
              <div className="space-y-4 sm:space-y-5 lg:col-span-2">
                {step === 0 ? (
                  <>
                    {/* Header Bar: Title + Badges + Clear Cart Button */}
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:p-4 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                          <ShoppingBag className="size-4.5 sm:size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">منتجات الطلب</h2>
                            <span className="inline-flex items-center rounded-full bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                              {items.length} {items.length === 1 ? "صنف" : "أصناف"}
                            </span>
                          </div>
                          <p className="hidden text-xs text-muted-foreground sm:block">
                            تحقق من كميات الأصناف والحد الأدنى للطلب
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowClearModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-all hover:bg-destructive hover:text-white active:scale-95 shadow-2xs"
                        title="إفراغ جميع محتويات السلة"
                      >
                        <Trash2 className="size-3.5" />
                        <span>إفراغ السلة</span>
                      </button>
                    </div>

                    {/* Products List */}
                    <div className="space-y-3 sm:space-y-4">
                      {items.map(({ p, qty }) => (
                        <article
                          key={p.slug}
                          className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-soft transition-all hover:shadow-md"
                        >
                          {/* Top Row: Image + Details + Delete Button */}
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Product Thumbnail */}
                            <Link
                              to="/products/$slug"
                              params={{ slug: p.slug }}
                              className="shrink-0 overflow-hidden rounded-xl border border-border/60 bg-cream/40"
                            >
                              <img
                                src={productImage(p)}
                                alt={p.name}
                                className="size-20 sm:size-24 object-cover transition-transform duration-300 hover:scale-105"
                                loading="lazy"
                              />
                            </Link>

                            {/* Product Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <Link to="/products/$slug" params={{ slug: p.slug }} className="group">
                                  <h3 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                                    {p.name}
                                  </h3>
                                </Link>
                                <button
                                  type="button"
                                  aria-label={`حذف ${p.name}`}
                                  className="size-8 shrink-0 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-90 flex items-center justify-center -mt-1 -ml-1"
                                  onClick={() => remove(p.slug)}
                                  title="حذف هذا الصنف"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>

                              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                  {p.sku}
                                </span>
                                <span>·</span>
                                <span>الوحدة: <strong className="font-semibold text-foreground">{p.unit}</strong></span>
                              </div>

                              <p className="mt-1 text-xs text-muted-foreground">
                                الحد الأدنى: <span className="font-bold text-forest">{p.moq} {p.unit}</span>
                              </p>
                            </div>
                          </div>

                          {/* Bottom Row: Stepper and Unit Quantity Summary */}
                          <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span>إجمالي الكمية:</span>
                              <span className="font-bold text-foreground sm:text-sm">{qty} {p.unit}</span>
                            </div>

                            <div role="group" aria-label={`كمية ${p.name}`}>
                              <QtyStepper value={qty} min={p.moq} onChange={(n) => setQty(p.slug, n)} />
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {/* Add More Products Button */}
                    <div className="pt-2">
                      <Link
                        to="/products"
                        className="btn btn-outline inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-semibold hover:border-primary hover:text-primary transition-all"
                      >
                        <Plus className="size-4" />
                        <span>إضافة منتجات أخرى للطلب</span>
                      </Link>
                    </div>

                    {/* In-App Confirmation Modal for Clear Cart */}
                    {showClearModal && (
                      <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="clear-cart-title"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
                        onClick={() => setShowClearModal(false)}
                      >
                        <div
                          className="w-full max-w-sm overflow-hidden rounded-3xl border border-border/80 bg-card p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
                            <AlertTriangle className="size-7" />
                          </div>
                          <h3 id="clear-cart-title" className="text-xl font-bold text-foreground">
                            إفراغ سلة الطلب؟
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            هل أنت متأكد من حذف جميع المنتجات ({items.length} {items.length === 1 ? "صنف" : "أصناف"}) من السلة؟ لا يمكن التراجع عن هذا الإجراء.
                          </p>
                          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                            <button
                              type="button"
                              onClick={() => setShowClearModal(false)}
                              className="btn btn-outline flex-1 rounded-xl py-2.5 text-sm"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                clear();
                                setShowClearModal(false);
                              }}
                              className="btn bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1 rounded-xl py-2.5 text-sm font-bold shadow-xs"
                            >
                              نعم، إفراغ السلة
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
