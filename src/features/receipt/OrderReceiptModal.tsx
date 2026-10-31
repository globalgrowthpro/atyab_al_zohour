import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Snowflake,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { sar } from "@/features/admin/data";
import {
  type ReceiptOrderData,
  openReceiptPrintWindow,
  downloadReceiptDocument,
} from "./receipt-pdf-template";
import { generateZatcaTlvBase64, generateDeterministicQrMatrix } from "./zatca";

export function OrderReceiptModal({
  order,
  open,
  onOpenChange,
}: {
  order: ReceiptOrderData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!order) return null;

  const baseSubtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxableAmount = Math.round(order.total / 1.15);
  const vatAmount = Math.round(order.total - taxableAmount);
  const discountSavings = Math.max(0, baseSubtotal - taxableAmount);

  const zatcaPayload = generateZatcaTlvBase64({
    sellerName: "شركة أطياب الزهور للتجارة",
    vatNumber: "310293847500003",
    timestamp: `${order.date}T12:00:00Z`,
    totalWithVat: order.total,
    vatAmount: vatAmount,
  });

  const qrMatrix = generateDeterministicQrMatrix(zatcaPayload, 25);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-h-[92vh] max-w-4xl overflow-y-auto p-0 sm:rounded-3xl border-border shadow-2xl bg-slate-50/70"
      >
        {/* Modal Top Bar Actions */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-white/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
              <Printer className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                إيصال الطلب الرسمي والفاتورة الضريبية
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                نسخة إلكترونية معتمدة مطابقة لاشتراطات هيئة الزكاة والضريبة (ZATCA)
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openReceiptPrintWindow(order)}
              className="btn btn-primary text-xs font-bold flex items-center gap-1.5 px-4 py-2 shadow-xs"
            >
              <Printer className="size-3.5" />
              <span>تحميل / حفظ كـ PDF</span>
            </button>

            <button
              type="button"
              onClick={() => downloadReceiptDocument(order)}
              className="btn btn-outline text-xs font-bold flex items-center gap-1.5 px-3.5 py-2 bg-white"
            >
              <Download className="size-3.5" />
              <span>تنزيل نسخة المستند</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="btn btn-outline text-xs font-bold flex items-center gap-1.5 px-3 py-2 bg-white"
            >
              <Share2 className="size-3.5" />
              <span>{copiedLink ? "تم النسخ!" : "مشاركة"}</span>
            </button>
          </div>
        </div>

        {/* Scaled Printable A4 Sheet Preview */}
        <div className="p-4 sm:p-6 flex justify-center">
          <div
            id="order-receipt-print-area"
            className="w-full max-w-[760px] bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 text-foreground"
          >
            {/* Header Brand */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-forest pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-forest text-gold flex items-center justify-center font-black text-sm">
                    🌸
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-forest tracking-tight">
                    شركة أطياب الزهور للتجارة
                  </h1>
                </div>
                <p className="mt-1 text-xs text-muted-foreground font-medium">
                  سلسلة التبريد المباشرة للزهور المستوردة بالجملة · هولندا | كينيا | الإكوادور
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                    <Snowflake className="size-3 text-emerald-600" />
                    شحنة مبردة معتمدة (2°C — 4°C)
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                    ضمان النضارة 7 أيام
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-left font-mono text-xs space-y-0.5" dir="ltr">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">CR No:</span>
                  <strong className="text-foreground">1010724918</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">VAT No:</span>
                  <strong className="text-forest">310293847500003</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Hub:</span>
                  <span className="text-foreground">Riyadh Cold Hub</span>
                </div>
              </div>
            </div>

            {/* Document Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gradient-to-l from-forest via-forest to-emerald-950 p-3.5 text-white shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4.5 text-gold" />
                <span className="text-sm font-bold">
                  فاتورة ضريبية مبسطة وإيصال استلام رسمي
                </span>
              </div>
              <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-xs font-bold text-gold">
                رقم الطلب: #{order.id}
              </span>
            </div>

            {/* Two-Column Metadata */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Order Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
                <h3 className="font-bold text-forest flex items-center gap-1.5 border-b pb-2">
                  <Truck className="size-3.5 text-forest" />
                  بيانات الطلب والتوصيل
                </h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الإصدار:</span>
                  <span className="font-bold font-mono">{order.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">طريقة الاستلام:</span>
                  <span className="font-bold">{order.deliveryMethodLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الفترة المحددة:</span>
                  <span className="font-bold text-forest">{order.deliverySlotLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">كود شحنة التبريد:</span>
                  <span className="font-mono font-bold text-emerald-800">CC-KSA-9942</span>
                </div>
              </div>

              {/* Client Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 text-xs">
                <h3 className="font-bold text-forest flex items-center gap-1.5 border-b pb-2">
                  <Building2 className="size-3.5 text-forest" />
                  بيانات العميل المستلم
                </h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاسم / المنشأة:</span>
                  <strong className="text-foreground">{order.clientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الجوال:</span>
                  <span className="font-bold font-mono" dir="ltr">{order.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">شريحة العميل B2B:</span>
                  <span className="font-bold text-forest">{order.clientTierLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">طريقة الدفع:</span>
                  <span className="font-bold">{order.paymentMethodLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العنوان:</span>
                  <span className="font-medium text-slate-700">
                    {order.city} · {order.district} · {order.street}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-right border-collapse">
                <thead className="bg-forest text-white">
                  <tr>
                    <th className="p-2.5 text-center w-10">م</th>
                    <th className="p-2.5">الصنف والمواصفات</th>
                    <th className="p-2.5 w-24">الرمز (SKU)</th>
                    <th className="p-2.5 text-center w-16">الكمية</th>
                    <th className="p-2.5 text-center w-16">الوحدة</th>
                    <th className="p-2.5 text-left w-24">سعر الوحدة</th>
                    <th className="p-2.5 text-left w-24">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="p-2.5 text-center font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-foreground">{item.name}</td>
                      <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{item.sku}</td>
                      <td className="p-2.5 text-center font-bold font-mono">{item.qty}</td>
                      <td className="p-2.5 text-center text-muted-foreground">{item.unit}</td>
                      <td className="p-2.5 text-left font-mono" dir="ltr">
                        {item.price > 0 ? sar(item.price) : "حسب الفاتورة"}
                      </td>
                      <td className="p-2.5 text-left font-bold font-mono" dir="ltr">
                        {item.price > 0 ? sar(item.price * item.qty) : "حسب الفاتورة"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ZATCA QR & Financial Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
              {/* ZATCA QR Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
                <svg className="size-20 shrink-0" viewBox="0 0 100 100">
                  {qrMatrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c * 4}
                          y={r * 4}
                          width={4}
                          height={4}
                          fill="#063321"
                        />
                      ) : null
                    )
                  )}
                </svg>
                <div className="text-[11px] space-y-1">
                  <p className="font-bold text-forest">رمز التحقق الإلكتروني (ZATCA QR)</p>
                  <p className="text-muted-foreground leading-relaxed">
                    فاتورة ضريبية إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك.
                  </p>
                  <span className="inline-block font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    VERIFIED · معتمد رقمياً
                  </span>
                </div>
              </div>

              {/* Calculation Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الأساسي:</span>
                  <span className="font-mono font-bold">{sar(baseSubtotal)}</span>
                </div>
                {discountSavings > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>خصم شريحة ({order.clientTierLabel}):</span>
                    <span className="font-mono">-{sar(discountSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الخاضع للضريبة:</span>
                  <span className="font-mono font-bold">{sar(taxableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono font-bold">{sar(vatAmount)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-forest pt-2 text-sm font-black text-forest">
                  <span>الإجمالي النهائي المستحق:</span>
                  <span className="text-rose font-black">{sar(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Official Seal and Delivery Warranty Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4">
              <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-emerald-600 px-4 py-2 text-xs font-black text-emerald-800 bg-emerald-50/50">
                <span>❄️</span>
                <span>ختم مطابقة سلسلة التبريد المباشرة (2°C — 4°C)</span>
              </div>

              <div className="text-[10px] text-muted-foreground text-center sm:text-left leading-relaxed max-w-sm">
                يلتزم العميل باستلام الشحنة وتخزينها في غرف التبريد بدرجة 2°C إلى 4°C لضمان نضارة الزهور. المطور: م. حافظ رحيم (+201007419344).
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

