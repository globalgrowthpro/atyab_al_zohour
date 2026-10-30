import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Download, ShoppingCart, Trash2, ShoppingBag, Plus, AlertTriangle, Snowflake, Sparkles, CheckCircle2 } from "lucide-react";
import { QtyStepper } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { products, productImage } from "@/lib/catalog";
import { useClientTier, calculateTierPrice, CLIENT_TIERS, validateMoq } from "@/features/b2b/tier-pricing";
import { useFlowerBatches } from "@/features/inventory/batches";
import { sar } from "@/features/admin/data";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "طلب عرض سعر | أطيب الزهور" },
      { name: "description", content: "طلب عرض سعر — أطيب الزهور لتوريد الورود بالجملة وحجز الشحنات المبردة." },
      { property: "og:title", content: "طلب عرض سعر | أطيب الزهور" },
      { property: "og:description", content: "طلب عرض سعر — أطيب الزهور." },
    ],
  }),
  component: QuotePage,
});

export function QuotePage() {
  const { lines, setQty, remove, clear } = useCart();
  const [tier] = useClientTier();
  const tierConfig = CLIENT_TIERS[tier];
  const { getProductSummary, reserveForQuote } = useFlowerBatches();

  const [step, setStep] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const [reserveColdStock, setReserveColdStock] = useState(true);
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

  // Calculate pricing & VAT (handling fixtures where p.price might be undefined)
  const baseSubtotal = items.reduce((acc, { p, qty }) => acc + (p.price ?? 0) * qty, 0);
  const tierSubtotal = items.reduce((acc, { p, qty }) => acc + calculateTierPrice(p.price ?? 0, tier) * qty, 0);
  const tierDiscountSavings = Math.max(0, baseSubtotal - tierSubtotal);
  const vatAmount = Math.round(tierSubtotal * 0.15); // 15% ZATCA
  const finalTotal = tierSubtotal + vatAmount;

  // MOQ check: only enforce financial minimum if baseSubtotal > 0 (real catalog items)
  const moqCheck = validateMoq(
    items.map(({ p, qty }) => ({
      slug: p.slug,
      name: p.name,
      qty,
      unit: p.unit,
      moq: p.moq || 1,
      basePrice: p.price ?? 0,
    })),
    tier
  );

  const hasFinancialMoqWarning = baseSubtotal > 0 && !moqCheck.isValid;

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

    if (hasFinancialMoqWarning) {
      setError(`لم يتم استيفاء الحد الأدنى للطلب (${sar(moqCheck.minOrderSar)}).`);
      return;
    }

    if (reserveColdStock) {
      const qId = `QT-KSA-${Date.now()}`;
      items.forEach(({ p, qty }) => {
        reserveForQuote(qId, p.slug, qty);
      });
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
        `شريحة العميل المعتمدة: ${tierConfig.label}`,
        `حالة حجز المخزون المبرد: ${reserveColdStock ? "محجوز مؤقتاً لمدة 48 ساعة" : "غير محجوز مسبقاً"}`,
        "",
        ...fields.map(([key, label]) => `${label}: ${customer[key].trim() || "—"}`),
        "",
        ...items.map(({ p, qty }) => {
          const uPrice = calculateTierPrice(p.price ?? 0, tier);
          return `${p.sku} | ${p.name} | ${qty} ${p.unit}${uPrice > 0 ? ` | سعر الشريحة: ${uPrice} ر.س` : ""}`;
        }),
        "",
        `إجمالي الكميات: ${summary}`,
        ...(tierSubtotal > 0
          ? [
              `المجموع الفرعي (شريحة ${tierConfig.label.split("—")[0]}): ${sar(tierSubtotal)}`,
              `ضريبة القيمة المضافة (15% ZATCA): ${sar(vatAmount)}`,
              `الإجمالي التقديري مع الضريبة: ${sar(finalTotal)}`,
            ]
          : []),
        "الأسعار والتوفر والتوصيل المبرد تخضع لتأكيد المبيعات وفحص الجودة.",
        `ملاحظات: ${customer.notes.trim() || "—"}`,
      ].join("\n");

      const url = URL.createObjectURL(
        new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" })
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
    if (next > 0 && hasFinancialMoqWarning) {
      setError(`يرجى استيفاء الحد الأدنى للطلب (${sar(moqCheck.minOrderSar)}) قبل المتابعة.`);
      return;
    }
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

            {/* MOQ Warning Alert if subtotal is below minimum order requirement */}
            {hasFinancialMoqWarning && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs">
                <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">تنبيه الحد الأدنى لطلب الجملة (MOQ):</p>
                  <p className="mt-1">
                    الحد الأدنى لقيمة الطلب لشريحة (<strong>{tierConfig.label}</strong>) هو <strong>{sar(moqCheck.minOrderSar)}</strong>. إجمالي طلبك الحالي هو <strong>{sar(moqCheck.currentSubtotal)}</strong> (متبقي <strong>{sar(moqCheck.remainingSar)}</strong> لإتاحة إرسال الطلب).
                  </p>
                </div>
              </div>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-3">
              <div className="space-y-4 sm:space-y-5 lg:col-span-2">
                {step === 0 ? (
                  <>
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

                    <div className="space-y-3 sm:space-y-4">
                      {items.map(({ p, qty }) => {
                        const inv = getProductSummary(p.slug);
                        const itemTierPrice = calculateTierPrice(p.price ?? 0, tier);

                        return (
                          <article
                            key={p.slug}
                            className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-3.5 sm:p-5 shadow-soft transition-all hover:shadow-md"
                          >
                            <div className="flex items-start gap-3 sm:gap-4">
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
                                  <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[11px]">
                                    {p.sku}
                                  </span>
                                  <span>·</span>
                                  <span>الوحدة: <strong className="font-semibold text-foreground">{p.unit}</strong></span>
                                  {itemTierPrice > 0 && (
                                    <>
                                      <span>·</span>
                                      <span>سعر الشريحة: <strong className="text-rose font-bold">{itemTierPrice} ر.س</strong></span>
                                    </>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="text-muted-foreground">
                                    الحد الأدنى: <span className="font-bold text-forest">{p.moq} {p.unit}</span>
                                  </span>
                                  {inv.available > 0 && (
                                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-primary text-[11px] font-bold">
                                      <Snowflake className="size-3" /> متاح بالمستودع: {inv.available} {p.unit}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>إجمالي الكمية:</span>
                                <span className="font-bold text-foreground sm:text-sm">{qty} {p.unit}</span>
                                {itemTierPrice > 0 && (
                                  <span className="font-bold text-rose ms-2">({itemTierPrice * qty} ر.س)</span>
                                )}
                              </div>

                              <div role="group" aria-label={`كمية ${p.name}`}>
                                <QtyStepper value={qty} min={p.moq} onChange={(n) => setQty(p.slug, n)} />
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <Link
                        to="/products"
                        className="btn btn-outline inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-semibold hover:border-primary hover:text-primary transition-all"
                      >
                        <Plus className="size-4" />
                        <span>إضافة منتجات أخرى للطلب</span>
                      </Link>
                    </div>

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
                    <h2 className="text-2xl font-bold">بيانات العميل</h2>
                    <p className="text-sm text-muted-foreground">
                      * حقل مطلوب. تُستخدم البيانات لتجهيز الملف وحجز الشحنات المبردة.
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

                    {/* Cold storage hold option */}
                    <label className="flex items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reserveColdStock}
                        onChange={(e) => setReserveColdStock(e.target.checked)}
                        className="size-4 rounded text-primary mt-0.5"
                      />
                      <div className="text-xs leading-relaxed">
                        <p className="font-bold text-forest">حجز الكميات في المستودع المبرد مؤقتاً لمدة 48 ساعة</p>
                        <p className="text-muted-foreground">
                          يحمي طلبك من نفاد الكمية للمحلات الأخرى أثناء مراجعة عرض السعر.
                        </p>
                      </div>
                    </label>

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
                    <h2 className="text-2xl font-bold">مراجعة طلب عرض السعر</h2>
                    <dl className="grid gap-4 break-words sm:grid-cols-2">
                      {fields.map(([key, label]) => (
                        <div key={key}>
                          <dt className="text-sm text-muted-foreground">{label}</dt>
                          <dd className="font-bold">{customer[key] || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    <ul className="divide-y">
                      {items.map(({ p, qty }) => {
                        const uPrice = calculateTierPrice(p.price ?? 0, tier);
                        return (
                          <li key={p.slug} className="flex justify-between gap-4 py-3 text-sm">
                            <span>{p.name}</span>
                            <strong>
                              {qty} {p.unit}
                              {uPrice > 0 && ` (${uPrice * qty} ر.س)`}
                            </strong>
                          </li>
                        );
                      })}
                    </ul>
                    {customer.notes && (
                      <p className="whitespace-pre-wrap break-words text-sm">ملاحظات: {customer.notes}</p>
                    )}
                    <p className="rounded-2xl bg-blush/60 p-4 leading-7 text-forest text-sm">
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
                  <p role="alert" className="rounded-xl border border-destructive p-4 text-destructive text-sm">
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" className="rounded-xl bg-accent p-4 text-primary text-sm font-bold">
                    {message}
                  </p>
                )}
              </div>

              <aside className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft lg:sticky lg:top-40">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="text-xl font-bold">ملخص الطلب</h2>
                  <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest">
                    {tierConfig.label.split("—")[0]}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>عدد الأصناف</span>
                  <strong>{items.length}</strong>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الكميات حسب وحدة البيع</p>
                  <p className="mt-2 font-bold">{summary}</p>
                </div>

                {tierSubtotal > 0 && (
                  <div className="space-y-1.5 border-t pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع الأساسي:</span>
                      <span className="font-mono">{sar(baseSubtotal)}</span>
                    </div>
                    {tierDiscountSavings > 0 && (
                      <div className="flex justify-between text-primary font-bold">
                        <span>خصم الشريحة ({tierConfig.discountPercent}%):</span>
                        <span className="font-mono">-{sar(tierDiscountSavings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span>المجموع قبل الضريبة:</span>
                      <span className="font-mono">{sar(tierSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>ضريبة القيمة المضافة (15% ZATCA):</span>
                      <span className="font-mono">{sar(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-rose pt-1.5 border-t">
                      <span>الإجمالي التقديري:</span>
                      <span>{sar(finalTotal)}</span>
                    </div>
                  </div>
                )}

                <div className="gold-rule" />
                <p className="text-xs leading-6 text-muted-foreground">
                  القيمة المالية تُحدد بدقة في عرض السعر. الأسعار والتوفر وسلسلة التبريد تخضع لتأكيد فريق المبيعات.
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
