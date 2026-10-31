import { generateZatcaTlvBase64, generateDeterministicQrMatrix } from "./zatca";

export interface ReceiptItem {
  name: string;
  sku: string;
  qty: number;
  unit: string;
  price: number;
}

export interface ReceiptOrderData {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  city: string;
  district: string;
  street: string;
  deliveryMethodLabel: string;
  deliverySlotLabel: string;
  paymentMethodLabel: string;
  clientTierLabel: string;
  total: number;
  items: ReceiptItem[];
}

export function buildReceiptHtml(order: ReceiptOrderData): string {
  const baseSubtotal = order.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const vatRate = 0.15;
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
  const qrSvgModules = qrMatrix
    .map((row, r) =>
      row
        .map((cell, c) => (cell ? `<rect x="${c * 4}" y="${r * 4}" width="4" height="4" fill="#063321"/>` : ""))
        .join("")
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>فاتورة_أطياب_الزهور_${order.id}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Tajawal', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 20px 0;
      display: flex;
      justify-content: center;
      direction: rtl;
    }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      padding: 14mm 16mm;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @media print {
      body {
        background: none;
        padding: 0;
      }
      .sheet {
        box-shadow: none;
        width: 100%;
        min-height: auto;
        padding: 6mm 8mm;
      }
      .no-print {
        display: none !important;
      }
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #063321;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #063321;
      line-height: 1.2;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      margin-top: 3px;
    }
    .tax-meta {
      font-size: 10px;
      color: #334155;
      line-height: 1.5;
      text-align: left;
      direction: ltr;
    }
    .tax-meta strong {
      color: #063321;
    }
    .doc-ribbon {
      background: linear-gradient(135deg, #063321, #0b4d33);
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .doc-ribbon h1 {
      font-size: 14px;
      font-weight: 800;
    }
    .doc-ribbon span {
      font-size: 11px;
      font-weight: 600;
      background: rgba(255,255,255,0.18);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .info-card h2 {
      font-size: 11px;
      font-weight: 800;
      color: #063321;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin-bottom: 4px;
      line-height: 1.4;
    }
    .info-row .lbl {
      color: #64748b;
    }
    .info-row .val {
      font-weight: 700;
      color: #0f172a;
    }
    .badge-cold {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10.5px;
    }
    th {
      background: #063321;
      color: #ffffff;
      padding: 6px 8px;
      font-weight: 700;
      text-align: right;
    }
    th:first-child { border-top-right-radius: 6px; }
    th:last-child { border-top-left-radius: 6px; }
    td {
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .table-sku {
      font-family: monospace;
      color: #64748b;
      font-size: 9.5px;
    }
    .totals-wrap {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 14px;
      margin-bottom: 14px;
      align-items: start;
    }
    .zatca-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      gap: 12px;
      align-items: center;
      background: #fdfefe;
    }
    .qr-svg {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
    }
    .zatca-desc {
      font-size: 9px;
      color: #475569;
      line-height: 1.5;
    }
    .zatca-desc strong {
      color: #063321;
      font-size: 9.5px;
    }
    .calc-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      padding: 3px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .calc-row.grand {
      border-top: 2px solid #063321;
      border-bottom: none;
      padding-top: 6px;
      margin-top: 4px;
      font-size: 13px;
      font-weight: 900;
      color: #063321;
    }
    .stamps-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      margin-top: auto;
    }
    .stamp-seal {
      border: 2px solid #059669;
      color: #059669;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 9.5px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .terms-text {
      font-size: 8.5px;
      color: #94a3b8;
      max-width: 420px;
      line-height: 1.4;
    }
    .footer-bar {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #cbd5e1;
      font-size: 8.5px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    .print-actions {
      position: fixed;
      top: 16px;
      left: 16px;
      display: flex;
      gap: 8px;
      z-index: 1000;
    }
    .action-btn {
      background: #063321;
      color: #ffffff;
      border: none;
      padding: 9px 16px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: background 0.2s;
    }
    .action-btn:hover {
      background: #0b4d33;
    }
    .action-btn.secondary {
      background: #e2e8f0;
      color: #1e293b;
    }
    .action-btn.secondary:hover {
      background: #cbd5e1;
    }
  </style>
</head>
<body>

  <div class="print-actions no-print">
    <button class="action-btn" onclick="window.print()">🖨️ طباعة / حفظ كملف PDF</button>
    <button class="action-btn secondary" onclick="window.close()">إغلاق النافذة</button>
  </div>

  <div class="sheet">
    <div>
      <!-- Header -->
      <div class="header-banner">
        <div>
          <div class="brand-title">شركة أطياب الزهور للتجارة</div>
          <div class="brand-sub">سلسلة التبريد المباشرة للزهور المستوردة بالجملة · هولندا | كينيا | الإكوادور</div>
        </div>
        <div class="tax-meta">
          <div><strong>CR:</strong> 1010724918</div>
          <div><strong>VAT:</strong> 310293847500003</div>
          <div>Riyadh, Sulay Cold-Hub</div>
        </div>
      </div>

      <!-- Ribbon -->
      <div class="doc-ribbon">
        <h1>فاتورة ضريبية مبسطة وإيصال استلام رسمي (ZATCA e-Invoice)</h1>
        <span>مرجع: #${order.id}</span>
      </div>

      <!-- Metadata Cards -->
      <div class="info-grid">
        <div class="info-card">
          <h2>بيانات الطلب وسلسلة التبريد</h2>
          <div class="info-row">
            <span class="lbl">رقم الطلب:</span>
            <span class="val font-mono">#${order.id}</span>
          </div>
          <div class="info-row">
            <span class="lbl">تاريخ الإصدار:</span>
            <span class="val">${order.date}</span>
          </div>
          <div class="info-row">
            <span class="lbl">طريقة التوصيل:</span>
            <span class="val">${order.deliveryMethodLabel}</span>
          </div>
          <div class="info-row">
            <span class="lbl">فترة التسليم:</span>
            <span class="val">${order.deliverySlotLabel}</span>
          </div>
          <div class="info-row">
            <span class="lbl">معيار النضارة:</span>
            <span class="badge-cold">سلسلة تبريد معتمدة (2°C — 4°C)</span>
          </div>
        </div>

        <div class="info-card">
          <h2>بيانات العميل المستلم</h2>
          <div class="info-row">
            <span class="lbl">العميل / المنشأة:</span>
            <span class="val">${order.clientName}</span>
          </div>
          <div class="info-row">
            <span class="lbl">رقم الجوال:</span>
            <span class="val" dir="ltr">${order.clientPhone}</span>
          </div>
          <div class="info-row">
            <span class="lbl">شريحة B2B:</span>
            <span class="val">${order.clientTierLabel}</span>
          </div>
          <div class="info-row">
            <span class="lbl">طريقة الدفع:</span>
            <span class="val">${order.paymentMethodLabel}</span>
          </div>
          <div class="info-row">
            <span class="lbl">عنوان التوصيل:</span>
            <span class="val">${order.city} · ${order.district} · ${order.street}</span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">م</th>
            <th>الصنف والنوع</th>
            <th style="width: 80px;">الرمز (SKU)</th>
            <th style="width: 60px; text-align: center;">الكمية</th>
            <th style="width: 70px; text-align: center;">الوحدة</th>
            <th style="width: 80px; text-align: left;">سعر الوحدة</th>
            <th style="width: 90px; text-align: left;">المجموع</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item, i) => `
            <tr>
              <td style="text-align: center; font-weight: 700; color: #64748b;">${i + 1}</td>
              <td style="font-weight: 700; color: #0f172a;">${item.name}</td>
              <td class="table-sku">${item.sku}</td>
              <td style="text-align: center; font-weight: 800;">${item.qty}</td>
              <td style="text-align: center; color: #64748b;">${item.unit}</td>
              <td style="text-align: left; font-family: monospace;">${item.price > 0 ? (item.price).toFixed(2) + ' ر.س' : 'حسب التعاقد'}</td>
              <td style="text-align: left; font-weight: 800; font-family: monospace;">${item.price > 0 ? (item.price * item.qty).toFixed(2) + ' ر.س' : 'حسب التعاقد'}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <!-- Totals & ZATCA QR Box -->
      <div class="totals-wrap">
        <div class="zatca-box">
          <svg class="qr-svg" viewBox="0 0 100 100">
            ${qrSvgModules}
          </svg>
          <div class="zatca-desc">
            <strong>رمز التحقق الضريبي الرقمي (ZATCA QR)</strong><br/>
            فاتورة ضريبية إلكترونية معتمدة طبقاً للمواصفات الفنية لهيئة الزكاة والضريبة والجمارك في المملكة العربية السعودية.
          </div>
        </div>

        <div class="calc-card">
          <div class="calc-row">
            <span style="color: #64748b;">المجموع الأساسي:</span>
            <span style="font-family: monospace; font-weight: 700;">${baseSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</span>
          </div>
          ${
            discountSavings > 0
              ? `<div class="calc-row" style="color: #059669;">
            <span>خصم شريحة العميل (${order.clientTierLabel}):</span>
            <span style="font-family: monospace; font-weight: 700;">-${discountSavings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</span>
          </div>`
              : ""
          }
          <div class="calc-row">
            <span style="color: #64748b;">المجموع الخاضع للضريبة:</span>
            <span style="font-family: monospace; font-weight: 700;">${taxableAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</span>
          </div>
          <div class="calc-row">
            <span style="color: #64748b;">ضريبة القيمة المضافة (15% VAT):</span>
            <span style="font-family: monospace; font-weight: 700;">${vatAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</span>
          </div>
          <div class="calc-row grand">
            <span>الإجمالي النهائي المستحق:</span>
            <span style="font-family: monospace;">${order.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Security, Terms & Stamp Footer -->
    <div>
      <div class="stamps-wrap">
        <div class="stamp-seal">
          ❄️ معتمد لسلسلة التبريد (2°C — 4°C)
        </div>
        <div class="terms-text">
          * شروط النضارة والتوريد: يلتزم المشتري بفحص الزهور فور الاستلام وتخزينها في غرف التبريد بدرجة 2-4 مئوية. أي ملاحظات يجب إبلاغ خدمة العملاء بها خلال ساعتين من الاستلام.
        </div>
      </div>

      <div class="footer-bar">
        <span>أطياب الزهور للتجارة · هاتف: +966 50 123 4567 · info@atyabalzohour.com</span>
        <span>Developer: Mr. Hafez Rahim (+201007419344) · صفحة 1 من 1</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers clean native print dialog pre-configured to save as PDF
 */
export function openReceiptPrintWindow(order: ReceiptOrderData) {
  const html = buildReceiptHtml(order);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    // If popups are blocked, use hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(html);
    iframe.contentDocument?.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 2000);
    };
  }
}

/**
 * Downloads receipt as standalone HTML/PDF document
 */
export function downloadReceiptDocument(order: ReceiptOrderData) {
  const html = buildReceiptHtml(order);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `فاتورة_أطياب_الزهور_${order.id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

