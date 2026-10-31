import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";
import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Download,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  Plus,
  AlertTriangle,
  Snowflake,
  Sparkles,
  CheckCircle2,
  Truck,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  Printer,
  Copy,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Smartphone,
  Banknote,
} from "lucide-react";
import { QtyStepper } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { products, productImage } from "@/lib/catalog";
import { useClientTier, calculateTierPrice, CLIENT_TIERS, validateMoq } from "@/features/b2b/tier-pricing";
import { useFlowerBatches } from "@/features/inventory/batches";
import { whatsAppHubStore } from "@/features/whatsapp/service";
import { CLIENT_STORAGE_KEY, type ClientOrder } from "@/features/client/data";
import { sar } from "@/features/admin/data";
import { OrderReceiptModal } from "@/features/receipt/OrderReceiptModal";
import {
  openReceiptPrintWindow,
  downloadReceiptDocument,
  type ReceiptOrderData,
} from "@/features/receipt/receipt-pdf-template";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب وعرض السعر | أطياب الزهور" },
      { name: "description", content: "إتمام طلب الزهور وحجز الشحنات المبردة مع التوصيل السريع لجميع مناطق المملكة." },
      { property: "og:title", content: "إتمام الطلب | أطياب الزهور" },
      { property: "og:description", content: "إتمام وتأكيد طلب الزهور بالجملة." },
    ],
  }),
  component: QuotePage,
});

type PaymentMethod = "card" | "apple_pay" | "bank_transfer" | "credit_terms" | "cash_on_delivery";
type DeliveryMethod = "refrigerated_express" | "warehouse_pickup" | "cross_city";
type DeliverySlot = "morning" | "afternoon" | "evening";

interface CompletedOrderData {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  city: string;
  district: string;
  street: string;
  deliveryMethod: DeliveryMethod;
  deliverySlot: DeliverySlot;
  paymentMethod: PaymentMethod;
  total: number;
  items: Array<{ name: string; sku: string; qty: number; unit: string; price: number }>;
  whatsappSent: boolean;
  coldStockReserved: boolean;
}

export function QuotePage() {
  const { lines, setQty, remove, clear } = useCart();
  const [tier] = useClientTier();
  const tierConfig = CLIENT_TIERS[tier];
  const { getProductSummary, reserveForQuote } = useFlowerBatches();

  const [step, setStep] = useState(0); // 0: Cart, 1: Details, 2: Review & Options, 3: Completed Order
  const [showClearModal, setShowClearModal] = useState(false);
  const [reserveColdStock, setReserveColdStock] = useState(true);

  // Customer Details Form State
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    street: "",
    notes: "",
  });

  // Delivery & Payment Choices State
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("refrigerated_express");
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>("morning");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Order Submission State
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderData | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const items = lines.flatMap(({ slug, qty }) => {
    const p = products.find((p) => p.slug === slug);
    return p ? [{ p, qty }] : [];
  });

  // Calculate pricing & VAT
  const baseSubtotal = items.reduce((acc, { p, qty }) => acc + (p.price ?? 0) * qty, 0);
  const tierSubtotal = items.reduce((acc, { p, qty }) => acc + calculateTierPrice(p.price ?? 0, tier) * qty, 0);
  const tierDiscountSavings = Math.max(0, baseSubtotal - tierSubtotal);
  const vatAmount = Math.round(tierSubtotal * 0.15); // 15% ZATCA
  const finalTotal = tierSubtotal + vatAmount;

  // MOQ check
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

  const deliverySlotLabels: Record<DeliverySlot, string> = {
    morning: "الفترة الصباحية (8:00 ص — 12:00 م)",
    afternoon: "فترة الظهيرة (1:00 م — 5:00 م)",
    evening: "الفترة المسائية (6:00 م — 10:00 م)",
  };

  const deliveryMethodLabels: Record<DeliveryMethod, { label: string; desc: string }> = {
    refrigerated_express: {
      label: "توصيل مبرد سريع (2°C — 4°C)",
      desc: "سيارات أسطولنا المبردة مع فحص النضارة عند باب منشأتك",
    },
    warehouse_pickup: {
      label: "استلام من المستودع المبرد",
      desc: "الاستلام المباشر من مركز التوزيع المبرد (حي السلي — الرياض)",
    },
    cross_city: {
      label: "شحن مبرد بين المدن (الشرقية / جدة / مكة)",
      desc: "شحن جوي وبري مبرد مع كود تتبع حراري مباشر",
    },
  };

  const paymentMethodLabels: Record<PaymentMethod, { label: string; icon: string }> = {
    card: { label: "بطاقة مدى / فيزا / ماستركارد", icon: "💳" },
    apple_pay: { label: "Apple Pay", icon: "🍏" },
    bank_transfer: { label: "تحويل بنكي (الراجحي / الأهلي)", icon: "🏦" },
    credit_terms: { label: "دفع آجل 30 يوماً (عقود B2B)", icon: "📄" },
    cash_on_delivery: { label: "الدفع عند الاستلام المبرد", icon: "💵" },
  };

  const receiptData: ReceiptOrderData | null = completedOrder
    ? {
        id: completedOrder.id,
        date: completedOrder.date,
        clientName: completedOrder.clientName,
        clientPhone: completedOrder.clientPhone,
        city: completedOrder.city,
        district: completedOrder.district,
        street: completedOrder.street,
        deliveryMethodLabel: deliveryMethodLabels[completedOrder.deliveryMethod].label,
        deliverySlotLabel: deliverySlotLabels[completedOrder.deliverySlot],
        paymentMethodLabel: paymentMethodLabels[completedOrder.paymentMethod].label,
        clientTierLabel: tierConfig.label,
        total: completedOrder.total,
        items: completedOrder.items,
      }
    : null;

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

  // Complete Order Online (Frontend Fulfillment Flow)
  async function completeOrder() {
    setIsSubmittingOrder(true);
    setError("");

    try {
      const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderDate = new Date().toISOString().split("T")[0]!;
      const nowFormatted = new Date().toISOString().replace("T", " ").slice(0, 16);

      // 1. Reserve flower batches in cold storage
      items.forEach(({ p, qty }) => {
        reserveForQuote(orderId, p.slug, qty);
      });

      // 2. Trigger WhatsApp Business Hub Instant Notification (Meta Cloud API)
      const whatsappResult = whatsAppHubStore.triggerAutomation("ORDER_PLACED", {
        recipientPhone: customer.phone.trim(),
        clientName: customer.name.trim(),
        orderId,
        totalAmount: finalTotal,
      });

      // 3. Persist order into client demo storage (for /dashboard/orders & /dashboard/track)
      const newClientOrder: ClientOrder = {
        id: orderId,
        date: orderDate,
        status: "received",
        city: customer.city.trim(),
        address: {
          district: customer.district.trim(),
          street: customer.street.trim(),
        },
        deliveryWindow: deliverySlotLabels[deliverySlot],
        total: finalTotal,
        items: items.map(({ p, qty }) => ({
          name: p.name,
          sku: p.sku,
          qty,
          unit: p.unit,
        })),
        events: [
          {
            label: "تم قبول الطلب",
            at: nowFormatted,
            detail: `تم اعتماد الطلب وتأكيد الحجز بنجاح عبر بوابة أطياب الزهور. طريقة الدفع: ${paymentMethodLabels[paymentMethod].label}.`,
          },
          {
            label: "حجز المستودع المبرد",
            at: nowFormatted,
            detail: "تم تخصيص وحجز الباقات من شحنات الزهور المبردة (2°C - 4°C).",
          },
        ],
      };

      try {
        const rawStorage = localStorage.getItem(CLIENT_STORAGE_KEY);
        const parsed = rawStorage
          ? JSON.parse(rawStorage)
          : {
              version: 1,
              profile: {
                name: customer.name.trim(),
                company: "",
                phone: customer.phone.trim(),
                email: customer.email.trim(),
                city: customer.city.trim(),
                district: customer.district.trim(),
                address: customer.street.trim(),
              },
              orders: [],
              tickets: [],
            };
        if (!Array.isArray(parsed.orders)) {
          parsed.orders = [];
        }
        parsed.orders.unshift(newClientOrder);
        localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        // Fallback gracefully if storage is restricted
      }

      // 4. Record Completed Order State
      const completedInfo: CompletedOrderData = {
        id: orderId,
        date: orderDate,
        clientName: customer.name.trim(),
        clientPhone: customer.phone.trim(),
        city: customer.city.trim(),
        district: customer.district.trim(),
        street: customer.street.trim(),
        deliveryMethod,
        deliverySlot,
        paymentMethod,
        total: finalTotal,
        items: items.map(({ p, qty }) => ({
          name: p.name,
          sku: p.sku,
          qty,
          unit: p.unit,
          price: calculateTierPrice(p.price ?? 0, tier),
        })),
        whatsappSent: Boolean(whatsappResult?.success),
        coldStockReserved: true,
      };

      setCompletedOrder(completedInfo);

      // 5. Empty the shopping cart
      clear();

      // 6. Transition to Step 3 (Completed Order Screen)
      setStep(3);
    } catch {
      setError("حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmittingOrder(false);
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

  function copyOrderId() {
    if (!completedOrder?.id) return;
    navigator.clipboard?.writeText(completedOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  return (
    <>
      <PageBanner
        title={step === 3 ? "تم اكتمال طلبك بنجاح" : "السلة وإتمام الطلب"}
        crumb={step === 3 ? "اكتمال الطلب" : "إتمام الطلب"}
        subtitle={step === 3 ? "شكراً لثقتكم بأطياب الزهور · تم تأكيد حجز الباقات والشحنة المبردة." : "راجع الأصناف والكميات وأكّد طلب الزهور المبرد."}
      />
      <section className="container-x py-8 sm:py-12">
        {step === 3 && completedOrder ? (
          /* STEP 3: ORDER COMPLETION SUCCESS SCREEN */
          <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-500">
            {/* Success Celebration Card */}
            <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/90 via-emerald-50/30 to-card p-6 sm:p-10 text-center shadow-soft">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-soft">
                <CheckCircle2 className="size-11" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <Sparkles className="size-3.5" />
                تم تأكيد وحجز الطلب بنجاح
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-foreground">
                شكراً لك، {completedOrder.clientName}! 🌸
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                تم استلام طلبك وجاري تجهيز باقات الزهور المستوردة بعناية فائقة في مستودع التبريد المركزي.
              </p>

              {/* Order ID Pill with Copy button */}
              <div className="mx-auto mt-6 flex max-w-sm items-center justify-between rounded-2xl border border-emerald-300 bg-white/90 p-3 shadow-2xs">
                <div className="text-right">
                  <span className="block text-[11px] font-bold text-muted-foreground">رقم الطلب المرجعي</span>
                  <span className="text-lg font-black font-mono text-emerald-800" dir="ltr">
                    #{completedOrder.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyOrderId}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-95 transition"
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span className="text-emerald-700">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Notification Badge */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100/70 px-4 py-2 text-xs font-bold text-emerald-900">
                <Smartphone className="size-4 text-emerald-700" />
                <span>
                  تم إرسال إشعار تأكيد فوري عبر واتساب إلى: <strong dir="ltr">{completedOrder.clientPhone}</strong>
                </span>
              </div>
            </div>

            {/* Live Progress Stepper */}
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4.5 text-forest" />
                  مراحل متابعة وتجهيز الطلب
                </h3>
                <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest">
                  سلسلة التبريد المستمر (2°C — 4°C)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-right">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>١. قبول الطلب</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-700">مكتمل وتم الاعتماد</p>
                </div>

                <div className="rounded-2xl border border-primary/40 bg-primary/5 p-3 text-right animate-pulse">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <Snowflake className="size-4 shrink-0 text-primary" />
                    <span>٢. المستودع المبرد</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">جاري التجهيز والفرز</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-right opacity-60">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs">
                    <Truck className="size-4 shrink-0" />
                    <span>٣. انطلاق التوصيل</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">سيارة مبردة مخصصة</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-right opacity-60">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-xs">
                    <Building2 className="size-4 shrink-0" />
                    <span>٤. الاستلام النهائي</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">فحص النضارة والتسليم</p>
                </div>
              </div>
            </div>

            {/* Order Summary & Delivery Details */}
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-6">
              <h3 className="text-base font-bold text-foreground border-b pb-3">تفاصيل الطلب والفاتورة</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
                  <p className="font-bold text-slate-800">بيانات التوصيل والاستلام:</p>
                  <p className="text-muted-foreground">
                    العميل: <strong className="text-foreground">{completedOrder.clientName}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    العنوان: <strong className="text-foreground">{completedOrder.city} · {completedOrder.district} · {completedOrder.street}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    طريقة التوصيل: <strong className="text-foreground">{deliveryMethodLabels[completedOrder.deliveryMethod].label}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    فترة التوصيل: <strong className="text-forest">{deliverySlotLabels[completedOrder.deliverySlot]}</strong>
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
                  <p className="font-bold text-slate-800">بيانات الدفع والفوترة:</p>
                  <p className="text-muted-foreground">
                    طريقة الدفع: <strong className="text-foreground">{paymentMethodLabels[completedOrder.paymentMethod].label}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    شريحة العميل: <strong className="text-forest">{tierConfig.label}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    تاريخ الطلب: <strong className="text-foreground">{completedOrder.date}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    الإجمالي المدفوع: <strong className="text-lg font-black text-rose">{sar(completedOrder.total)}</strong>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-t pt-4">
                <p className="font-bold text-xs text-muted-foreground">الأصناف المحجوزة:</p>
                <div className="divide-y rounded-2xl border bg-slate-50/50">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <span className="font-bold text-foreground">{item.name}</span>
                        <span className="mr-2 text-muted-foreground">({item.sku})</span>
                      </div>
                      <div className="font-bold font-mono">
                        {item.qty} {item.unit} · {item.price > 0 ? sar(item.price * item.qty) : "حسب الفاتورة"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Tax Invoice & PDF Receipt Section (Hidden per request - code preserved) */}
            <div className="hidden rounded-3xl border-2 border-forest/20 bg-gradient-to-l from-forest/5 via-emerald-50/40 to-white p-6 shadow-soft flex-col md:flex-row items-center justify-between gap-5" style={{ display: "none" }}>
              <div className="space-y-1.5 text-center md:text-start">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-forest text-gold shadow-2xs">
                    <Printer className="size-5" />
                  </span>
                  <h3 className="text-base font-black text-forest">
                    فاتورة ضريبية رسمية وإيصال استلام PDF معتمد
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  وثيقة إلكترونية رسمية مطابقة لاشتراطات هيئة الزكاة والضريبة والجمارك (ZATCA)، متضمنة رمز التحقق الرقمي (QR Code)، وختم مطابقة سلسلة التبريد المباشرة (2°C — 4°C)، مع إمكانية التحميل أو الطباعة الفورية.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="btn btn-outline text-xs font-bold flex-1 md:flex-none flex items-center justify-center gap-2 bg-white !py-3 shadow-2xs hover:bg-forest/5"
                >
                  <ExternalLink className="size-4 text-forest" />
                  <span>معاينة الفاتورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => receiptData && openReceiptPrintWindow(receiptData)}
                  className="btn btn-primary text-xs font-bold flex-1 md:flex-none flex items-center justify-center gap-2 !py-3 shadow-soft"
                >
                  <Printer className="size-4" />
                  <span>تحميل وطباعة PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => receiptData && downloadReceiptDocument(receiptData)}
                  className="btn btn-outline text-xs font-bold flex-1 md:flex-none flex items-center justify-center gap-2 bg-white !py-3"
                  title="تنزيل نسخة المستند الرقمي"
                >
                  <Download className="size-4" />
                  <span>تنزيل مستند</span>
                </button>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/dashboard/track"
                search={{ order: completedOrder.id }}
                className="btn btn-primary w-full sm:w-auto px-6 py-3 font-bold flex items-center justify-center gap-2 shadow-soft"
              >
                <Truck className="size-4" />
                تتبع مسار الطلب المباشر
              </Link>

              <Link
                to="/dashboard/orders"
                search={{ order: completedOrder.id }}
                className="btn btn-outline w-full sm:w-auto px-6 py-3 font-bold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="size-4" />
                عرض الطلب في حسابي
              </Link>

              <button
                type="button"
                onClick={() => (receiptData ? openReceiptPrintWindow(receiptData) : window.print())}
                className="btn btn-outline w-full sm:w-auto px-5 py-3 font-bold flex items-center justify-center gap-2"
              >
                <Printer className="size-4" />
                طباعة الإيصال
              </button>

              <Link
                to="/products"
                className="btn btn-rose w-full sm:w-auto px-6 py-3 font-bold flex items-center justify-center gap-2"
              >
                طلب زهور جديدة
              </Link>
            </div>
          </div>
        ) : !items.length ? (
          /* Empty Cart State */
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
          /* ACTIVE CHECKOUT & ORDER COMPLETION STEPS (0, 1, 2) */
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

            {/* MOQ Warning Alert */}
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
                  /* STEP 0: REVIEW CART ITEMS */
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
                              <span className="text-xs text-muted-foreground">تعديل الكمية ({p.unit}):</span>
                              <QtyStepper
                                min={p.moq}
                                value={qty}
                                onChange={(n) => setQty(p.slug, n)}
                              />
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {/* Clear Cart Confirmation Modal */}
                    {showClearModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
                          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
                            <Trash2 className="size-6" />
                          </div>
                          <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-foreground">هل أنت متأكد من إفراغ السلة؟</h3>
                            <p className="text-xs text-muted-foreground">
                              سيتم حذف جميع الأصناف والكميات المحفوظة في طلبك الحالي.
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
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
                  /* STEP 1: CUSTOMER & DELIVERY DETAILS FORM */
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
                  /* STEP 2: REVIEW, DELIVERY & PAYMENT SELECTION */
                  <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="space-y-4 rounded-3xl border bg-card p-6 shadow-soft">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h2 className="text-2xl font-bold">مراجعة طلب عرض السعر</h2>
                        <button className="btn btn-outline text-xs !py-1.5" onClick={() => go(1)}>
                          تعديل البيانات
                        </button>
                      </div>

                      <dl className="grid gap-4 break-words sm:grid-cols-2 text-sm">
                        {fields.map(([key, label]) => (
                          <div key={key}>
                            <dt className="text-xs text-muted-foreground">{label}</dt>
                            <dd className="font-bold mt-0.5">{customer[key] || "—"}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* Delivery Method Selection */}
                    <div className="space-y-3 rounded-3xl border bg-card p-6 shadow-soft">
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Truck className="size-4.5 text-forest" />
                        طريقة الاستلام والتوصيل المبرد
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(["refrigerated_express", "warehouse_pickup", "cross_city"] as DeliveryMethod[]).map((m) => (
                          <label
                            key={m}
                            className={`flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition ${
                              deliveryMethod === m
                                ? "border-forest bg-forest/5 shadow-xs"
                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-xs text-foreground">
                                {deliveryMethodLabels[m].label.split("(")[0]}
                              </span>
                              <input
                                type="radio"
                                name="deliveryMethod"
                                checked={deliveryMethod === m}
                                onChange={() => setDeliveryMethod(m)}
                                className="size-4 text-forest"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">{deliveryMethodLabels[m].desc}</p>
                          </label>
                        ))}
                      </div>

                      {/* Delivery Time Slot */}
                      <div className="pt-3 border-t">
                        <span className="block text-xs font-bold text-muted-foreground mb-2">
                          الفترة الزمنية المفضلة للتسليم:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(["morning", "afternoon", "evening"] as DeliverySlot[]).map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setDeliverySlot(slot)}
                              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                                deliverySlot === slot
                                  ? "border-forest bg-forest text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {deliverySlotLabels[slot]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3 rounded-3xl border bg-card p-6 shadow-soft">
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <CreditCard className="size-4.5 text-forest" />
                        طريقة الدفع وتأكيد الحجز
                      </h3>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {(["card", "apple_pay", "bank_transfer", "credit_terms", "cash_on_delivery"] as PaymentMethod[]).map((pm) => (
                          <label
                            key={pm}
                            className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition ${
                              paymentMethod === pm
                                ? "border-forest bg-forest/5 shadow-xs"
                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{paymentMethodLabels[pm].icon}</span>
                              <span className="text-xs font-bold text-foreground">
                                {paymentMethodLabels[pm].label}
                              </span>
                            </div>
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === pm}
                              onChange={() => setPaymentMethod(pm)}
                              className="size-4 text-forest"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Items List Preview */}
                    <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold text-sm text-foreground">أصناف الطلب المحجوزة</h4>
                        <button className="btn btn-outline text-xs !py-1" onClick={() => go(0)}>
                          تعديل المنتجات
                        </button>
                      </div>
                      <ul className="divide-y text-xs">
                        {items.map(({ p, qty }) => {
                          const uPrice = calculateTierPrice(p.price ?? 0, tier);
                          return (
                            <li key={p.slug} className="flex justify-between gap-4 py-2.5">
                              <span>{p.name} ({p.sku})</span>
                              <strong className="font-mono">
                                {qty} {p.unit}
                                {uPrice > 0 && ` (${sar(uPrice * qty)})`}
                              </strong>
                            </li>
                          );
                        })}
                      </ul>
                      {customer.notes && (
                        <p className="border-t pt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                          ملاحظات: {customer.notes}
                        </p>
                      )}
                    </div>

                    {/* Quote Download Disclaimer (Preserved for compatibility) */}
                    <div className="rounded-2xl bg-blush/60 p-4 text-xs leading-6 text-forest">
                      لم يتم إرسال الطلب. حمّل الملف وشاركه مع ممثل المبيعات عبر وسيلة التواصل
                      المتفق عليها. بيانات التواصل الرسمية لم تُضف للموقع بعد.
                    </div>
                  </div>
                )}

                {error && (
                  <p role="alert" className="rounded-xl border border-destructive p-4 text-destructive text-sm font-bold">
                    {error}
                  </p>
                )}
                {message && (
                  <p role="status" className="rounded-xl bg-accent p-4 text-primary text-sm font-bold">
                    {message}
                  </p>
                )}
              </div>

              {/* Sticky Summary Aside */}
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
                  <div className="space-y-2">
                    {/* Primary Order Completion Button */}
                    <button
                      type="button"
                      onClick={completeOrder}
                      disabled={isSubmittingOrder}
                      className="btn btn-primary w-full font-bold flex items-center justify-center gap-2 shadow-soft !py-3.5 text-sm"
                    >
                      {isSubmittingOrder ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>جاري تأكيد وحجز الطلب...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4.5" />
                          <span>تأكيد وإتمام الطلب ({sar(finalTotal)})</span>
                        </>
                      )}
                    </button>

                    {/* Download Quote Button (Hidden from UI per user request, code preserved) */}
                    <button className="hidden" style={{ display: "none" }} onClick={download}>
                      <Download className="size-3.5" />
                      تحميل طلب عرض السعر
                    </button>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </section>

      {/* Official ZATCA PDF & Print Receipt Modal */}
      <OrderReceiptModal
        order={receiptData}
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
      />
    </>
  );
}
