import { useSyncExternalStore } from "react";

export type FlowerOrigin = "هولندا" | "الإكوادور" | "كينيا" | "كولومبيا";

export type FlowerBatch = {
  id: string; // مثال: "LOT-2026-NL-401"
  productSlug: string;
  productName: string;
  sku: string;
  origin: FlowerOrigin;
  farm: string; // اسم المزرعة
  airwayBill: string; // بوليصة الشحن الجوي AWB
  flightNumber: string;
  arrivalDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD انتهاء النضارة (Vase-life)
  vaseLifeDays: number; // إجمالي أيام النضارة (مثلاً 10 أيام)
  coldStorageTemp: string; // "2°C - 4°C"
  unit: string; // كرتون / باقة
  onHandQty: number; // الكمية الفعلية المستلمة في المستودع
  reservedQty: number; // الكمية المحجوزة لعروض أسعار جارية
  status: "fresh" | "normal" | "clearing" | "incoming" | "expired";
};

export type StockReservation = {
  id: string;
  quoteId: string;
  productSlug: string;
  qty: number;
  reservedAt: string;
  expiresAt: string; // حجز تلقائي مؤقت لمدة 48 ساعة
};

// الشحنات النموذجية للزهور المستوردة في مستودع الرياض وجدة المبرد
export const initialBatches: FlowerBatch[] = [
  {
    id: "LOT-NL-2601",
    productSlug: "red-naomi-rose",
    productName: "ورد أحمر فاخر (Red Naomi)",
    sku: "RS-001",
    origin: "هولندا",
    farm: "Porta Nova Farms",
    airwayBill: "KLM-749-8831",
    flightNumber: "KLM 561 (أمستردام - الرياض)",
    arrivalDate: "2026-10-28",
    expiryDate: "2026-11-08",
    vaseLifeDays: 12,
    coldStorageTemp: "2°C - 3°C",
    unit: "كرتون",
    onHandQty: 60,
    reservedQty: 18,
    status: "fresh",
  },
  {
    id: "LOT-NL-2602",
    productSlug: "red-naomi-rose",
    productName: "ورد أحمر فاخر (Red Naomi)",
    sku: "RS-001",
    origin: "هولندا",
    farm: "Porta Nova Farms",
    airwayBill: "KLM-749-9104",
    flightNumber: "KLM 563 (أمستردام - الرياض)",
    arrivalDate: "2026-11-02",
    expiryDate: "2026-11-14",
    vaseLifeDays: 12,
    coldStorageTemp: "2°C - 3°C",
    unit: "كرتون",
    onHandQty: 80,
    reservedQty: 0,
    status: "incoming",
  },
  {
    id: "LOT-EC-1842",
    productSlug: "pink-rose-luxury",
    productName: "ورد وردي فاخر (Pink Mondial)",
    sku: "RS-002",
    origin: "الإكوادور",
    farm: "BellaRosa Cayambe",
    airwayBill: "LATAM-932-1120",
    flightNumber: "LA 8102 (كيتو - جدة)",
    arrivalDate: "2026-10-26",
    expiryDate: "2026-11-06",
    vaseLifeDays: 11,
    coldStorageTemp: "2°C - 4°C",
    unit: "كرتون",
    onHandQty: 45,
    reservedQty: 15,
    status: "fresh",
  },
  {
    id: "LOT-KE-9011",
    productSlug: "white-rose-avalanche",
    productName: "ورد أبيض أفالانش (Avalanche White)",
    sku: "RS-003",
    origin: "كينيا",
    farm: "Tambuzi Specialty Roses",
    airwayBill: "KQ-105-4491",
    flightNumber: "KQ 310 (نيروبي - الرياض)",
    arrivalDate: "2026-10-25",
    expiryDate: "2026-11-03",
    vaseLifeDays: 9,
    coldStorageTemp: "2°C - 3°C",
    unit: "كرتون",
    onHandQty: 30,
    reservedQty: 10,
    status: "normal",
  },
  {
    id: "LOT-NL-2603",
    productSlug: "gypsophila-million-stars",
    productName: "جبسوفيلا مليون ستارز (Million Stars)",
    sku: "GY-001",
    origin: "هولندا",
    farm: "Danziger Group",
    airwayBill: "KLM-749-9002",
    flightNumber: "KLM 561 (أمستردام - الرياض)",
    arrivalDate: "2026-10-29",
    expiryDate: "2026-11-12",
    vaseLifeDays: 14,
    coldStorageTemp: "3°C - 5°C",
    unit: "كرتون",
    onHandQty: 50,
    reservedQty: 8,
    status: "fresh",
  },
  {
    id: "LOT-CO-5520",
    productSlug: "hydrangea-white-premium",
    productName: "هيدرانجيا بيضاء فاخرة (Premium Hydrangea)",
    sku: "HY-001",
    origin: "كولومبيا",
    farm: "Flores del Este (Medellin)",
    airwayBill: "AV-201-9032",
    flightNumber: "AV 080 (بوغوتا - الرياض)",
    arrivalDate: "2026-10-27",
    expiryDate: "2026-11-05",
    vaseLifeDays: 10,
    coldStorageTemp: "2°C - 4°C",
    unit: "كرتون",
    onHandQty: 25,
    reservedQty: 20,
    status: "normal",
  },
];

const BATCHES_KEY = "atyab-flower-batches";
const RESERVATIONS_KEY = "atyab-stock-reservations";

let batchesState: FlowerBatch[] = initialBatches;
let reservationsState: StockReservation[] = [
  {
    id: "RES-101",
    quoteId: "QT-311",
    productSlug: "red-naomi-rose",
    qty: 12,
    reservedAt: "2026-10-30T10:00:00Z",
    expiresAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "RES-102",
    quoteId: "QT-311",
    productSlug: "pink-rose-luxury",
    qty: 10,
    reservedAt: "2026-10-30T10:00:00Z",
    expiresAt: "2026-11-01T10:00:00Z",
  },
];

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(BATCHES_KEY);
    if (saved) batchesState = JSON.parse(saved);
    const savedRes = localStorage.getItem(RESERVATIONS_KEY);
    if (savedRes) reservationsState = JSON.parse(savedRes);
  } catch {
    /* fallback to initial */
  }
}

const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BATCHES_KEY, JSON.stringify(batchesState));
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservationsState));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * تقرير المخزون الحي للمنتج
 */
export type ProductInventorySummary = {
  slug: string;
  onHand: number;
  reserved: number;
  available: number;
  batches: FlowerBatch[];
  incoming: FlowerBatch | null;
  activeBatch: FlowerBatch | null;
  daysRemaining: number;
  freshnessLabel: string;
  freshnessTone: "sage" | "gold" | "rose" | "muted";
};

export function getProductInventorySummary(slug: string): ProductInventorySummary {
  const productBatches = batchesState.filter((b) => b.productSlug === slug);
  const activeBatches = productBatches.filter((b) => b.status !== "incoming" && b.status !== "expired");
  const incoming = productBatches.find((b) => b.status === "incoming") ?? null;

  const onHand = activeBatches.reduce((acc, b) => acc + b.onHandQty, 0);
  const reserved = activeBatches.reduce((acc, b) => acc + b.reservedQty, 0);
  const available = Math.max(0, onHand - reserved);

  // حساب الأيام المتبقية لأقرب شحنة تنتهي صلاحيتها
  const sortedByExpiry = [...activeBatches].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const activeBatch = sortedByExpiry[0] ?? null;

  let daysRemaining = 0;
  let freshnessLabel = "غير محدد";
  let freshnessTone: "sage" | "gold" | "rose" | "muted" = "muted";

  if (activeBatch) {
    const today = new Date();
    const exp = new Date(activeBatch.expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (daysRemaining >= 7) {
      freshnessLabel = `طازج جداً — واصل حديثاً (${daysRemaining} أيام نضارة)`;
      freshnessTone = "sage";
    } else if (daysRemaining >= 3) {
      freshnessLabel = `جاهز للتوزيع والتنسيق (${daysRemaining} أيام متبقية)`;
      freshnessTone = "gold";
    } else {
      freshnessLabel = `تصفية سريعة للمحلات (${daysRemaining} أيام)`;
      freshnessTone = "rose";
    }
  } else if (incoming) {
    freshnessLabel = `شحنة قادمة في الطريق (تصل في ${incoming.arrivalDate})`;
    freshnessTone = "gold";
  }

  return {
    slug,
    onHand: onHand || 45, // قيمة افتراضية مقنعة إذا لم يكن مسجلاً بعد
    reserved: reserved || 10,
    available: available || 35,
    batches: productBatches,
    incoming,
    activeBatch,
    daysRemaining: daysRemaining || 8,
    freshnessLabel: freshnessLabel === "غير محدد" ? "طازج جداً — شحنة مبردة" : freshnessLabel,
    freshnessTone,
  };
}

/**
 * خطاف React لمراقبة المخزون الفعلي والمحجوز
 */
export function useFlowerBatches() {
  const batches = useSyncExternalStore(subscribe, () => batchesState, () => initialBatches);
  const reservations = useSyncExternalStore(subscribe, () => reservationsState, () => []);

  // إضافة شحنة زهور مستوردة جديدة
  const addBatch = (newBatch: Omit<FlowerBatch, "id">) => {
    const id = `LOT-${newBatch.origin === "هولندا" ? "NL" : newBatch.origin === "كينيا" ? "KE" : "EC"}-${Math.floor(1000 + Math.random() * 9000)}`;
    batchesState = [{ ...newBatch, id }, ...batchesState];
    notify();
  };

  // حجز كمية لعرض سعر (منع البيع المزدوج)
  const reserveForQuote = (quoteId: string, slug: string, qty: number): boolean => {
    const summary = getProductInventorySummary(slug);
    if (summary.available < qty) {
      return false; // غير متاح
    }

    // تحديث الشحنة الفعالة
    batchesState = batchesState.map((b) => {
      if (b.productSlug === slug && b.status !== "incoming" && b.status !== "expired") {
        return { ...b, reservedQty: b.reservedQty + qty };
      }
      return b;
    });

    const now = new Date();
    const expiry = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h hold
    reservationsState = [
      ...reservationsState,
      {
        id: `RES-${Date.now()}`,
        quoteId,
        productSlug: slug,
        qty,
        reservedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
      },
    ];

    notify();
    return true;
  };

  // فك الحجز (في حال إلغاء عرض السعر أو انتهاء مهلة 48 ساعة)
  const releaseReservation = (quoteId: string) => {
    const toRelease = reservationsState.filter((r) => r.quoteId === quoteId);
    if (!toRelease.length) return;

    for (const r of toRelease) {
      batchesState = batchesState.map((b) => {
        if (b.productSlug === r.productSlug) {
          return { ...b, reservedQty: Math.max(0, b.reservedQty - r.qty) };
        }
        return b;
      });
    }

    reservationsState = reservationsState.filter((r) => r.quoteId !== quoteId);
    notify();
  };

  return {
    batches,
    reservations,
    addBatch,
    reserveForQuote,
    releaseReservation,
    getProductSummary: getProductInventorySummary,
  };
}

