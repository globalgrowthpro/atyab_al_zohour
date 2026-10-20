// Sample admin data — demo only, nothing is saved or sent.
export type OrderStatus = "new" | "preparing" | "ready" | "shipping" | "delivered" | "cancelled";
export const orderStatusLabel: Record<OrderStatus, string> = {
  new: "طلب جديد",
  preparing: "قيد التجهيز",
  ready: "جاهز للتوصيل",
  shipping: "مع المندوب",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};
export const orderStatusTone: Record<OrderStatus, Tone> = {
  new: "rose",
  preparing: "gold",
  ready: "sage",
  shipping: "forest",
  delivered: "muted",
  cancelled: "danger",
};
export type Tone = "rose" | "gold" | "sage" | "forest" | "muted" | "danger";

export type AdminOrder = {
  id: string;
  client: string;
  city: string;
  date: string;
  items: number;
  total: number;
  status: OrderStatus;
  courier?: string | undefined;
};

export const adminOrders: AdminOrder[] = [
  { id: "ORD-1048", client: "متجر نسمة الورد", city: "الرياض", date: "2026-10-20", items: 6, total: 4850, status: "new" },
  { id: "ORD-1047", client: "فندق الواحة", city: "جدة", date: "2026-10-20", items: 12, total: 12400, status: "preparing" },
  { id: "ORD-1046", client: "قاعة الفخامة للمناسبات", city: "الرياض", date: "2026-10-19", items: 9, total: 8900, status: "ready", courier: "سالم القحطاني" },
  { id: "ORD-1045", client: "مقهى زهرة", city: "الدمام", date: "2026-10-19", items: 3, total: 1250, status: "shipping", courier: "خالد العتيبي" },
  { id: "ORD-1044", client: "متجر لمسة ورد", city: "الرياض", date: "2026-10-18", items: 5, total: 3600, status: "delivered", courier: "سالم القحطاني" },
  { id: "ORD-1043", client: "منتجع البحر الأحمر", city: "جدة", date: "2026-10-18", items: 15, total: 18750, status: "delivered", courier: "فهد الشهري" },
  { id: "ORD-1042", client: "شركة رؤية للفعاليات", city: "الخبر", date: "2026-10-17", items: 7, total: 5400, status: "cancelled" },
  { id: "ORD-1041", client: "متجر نسمة الورد", city: "الرياض", date: "2026-10-16", items: 4, total: 2900, status: "delivered", courier: "خالد العتيبي" },
];

export type QuoteStatus = "pending" | "sent" | "accepted" | "rejected";
export const quoteStatusLabel: Record<QuoteStatus, string> = {
  pending: "بانتظار التسعير",
  sent: "تم إرسال العرض",
  accepted: "مقبول",
  rejected: "مرفوض",
};
export const quoteStatusTone: Record<QuoteStatus, Tone> = { pending: "rose", sent: "gold", accepted: "sage", rejected: "danger" };
export type AdminQuote = { id: string; client: string; contact: string; date: string; items: number; note: string; status: QuoteStatus };
export const adminQuotes: AdminQuote[] = [
  { id: "QT-311", client: "قاعة الفخامة للمناسبات", contact: "أ. منيرة", date: "2026-10-20", items: 8, note: "حفل زفاف 400 ضيف — ورد أبيض ووردي", status: "pending" },
  { id: "QT-310", client: "فندق الواحة", contact: "أ. ماجد", date: "2026-10-19", items: 5, note: "توريد أسبوعي لبهو الفندق", status: "sent" },
  { id: "QT-309", client: "شركة رؤية للفعاليات", contact: "أ. ريم", date: "2026-10-18", items: 11, note: "مؤتمر سنوي — تنسيقات طاولات", status: "accepted" },
  { id: "QT-308", client: "مقهى زهرة", contact: "أ. نواف", date: "2026-10-16", items: 2, note: "ورد موسمي صغير للطاولات", status: "rejected" },
];

export type ClientStatus = "pending" | "active" | "suspended";
export const clientStatusLabel: Record<ClientStatus, string> = { pending: "بانتظار الموافقة", active: "مفعّل", suspended: "موقوف" };
export const clientStatusTone: Record<ClientStatus, Tone> = { pending: "rose", active: "sage", suspended: "danger" };
export type PriceTier = "A" | "B" | "C";
export const tierLabel: Record<PriceTier, string> = { A: "فئة أ — كبار العملاء", B: "فئة ب — عملاء دائمون", C: "فئة ج — أساسية" };
export const tierDiscount: Record<PriceTier, number> = { A: 15, B: 8, C: 0 };
export type AdminClient = { id: string; name: string; type: string; city: string; cr: string; orders: number; tier: PriceTier; status: ClientStatus; joined: string };
export const adminClients: AdminClient[] = [
  { id: "CL-21", name: "متجر نسمة الورد", type: "محل ورد", city: "الرياض", cr: "1010xxxxxx", orders: 42, tier: "A", status: "active", joined: "2025-03-12" },
  { id: "CL-22", name: "فندق الواحة", type: "فندق", city: "جدة", cr: "4030xxxxxx", orders: 28, tier: "A", status: "active", joined: "2025-05-02" },
  { id: "CL-23", name: "مقهى زهرة", type: "مقهى", city: "الدمام", cr: "2050xxxxxx", orders: 9, tier: "C", status: "active", joined: "2026-01-18" },
  { id: "CL-24", name: "قاعة الفخامة للمناسبات", type: "قاعة مناسبات", city: "الرياض", cr: "1010xxxxxx", orders: 14, tier: "B", status: "active", joined: "2025-09-07" },
  { id: "CL-25", name: "شركة رؤية للفعاليات", type: "شركة فعاليات", city: "الخبر", cr: "2051xxxxxx", orders: 6, tier: "B", status: "suspended", joined: "2025-11-21" },
  { id: "CL-26", name: "متجر بتلات", type: "محل ورد", city: "مكة", cr: "4031xxxxxx", orders: 0, tier: "C", status: "pending", joined: "2026-10-19" },
  { id: "CL-27", name: "مطعم ريحان", type: "مطعم", city: "الرياض", cr: "1010xxxxxx", orders: 0, tier: "C", status: "pending", joined: "2026-10-20" },
];

export type CourierStatus = "available" | "on-route" | "off";
export const courierStatusLabel: Record<CourierStatus, string> = { available: "متاح", "on-route": "في جولة", off: "خارج الدوام" };
export const courierStatusTone: Record<CourierStatus, Tone> = { available: "sage", "on-route": "gold", off: "muted" };
export type AdminCourier = { id: string; name: string; zone: string; vehicle: string; today: number; done: number; rating: number; status: CourierStatus };
export const adminCouriers: AdminCourier[] = [
  { id: "CR-01", name: "سالم القحطاني", zone: "الرياض — الشمال", vehicle: "فان مبرد", today: 7, done: 4, rating: 4.9, status: "on-route" },
  { id: "CR-02", name: "خالد العتيبي", zone: "الشرقية", vehicle: "فان مبرد", today: 5, done: 5, rating: 4.7, status: "available" },
  { id: "CR-03", name: "فهد الشهري", zone: "جدة", vehicle: "شاحنة صغيرة مبردة", today: 6, done: 2, rating: 4.8, status: "on-route" },
  { id: "CR-04", name: "عبدالله الزهراني", zone: "الرياض — الجنوب", vehicle: "فان مبرد", today: 0, done: 0, rating: 4.6, status: "off" },
];

export type TicketStatus = "open" | "answered" | "closed";
export const ticketStatusLabel: Record<TicketStatus, string> = { open: "مفتوحة", answered: "تم الرد", closed: "مغلقة" };
export const ticketStatusTone: Record<TicketStatus, Tone> = { open: "rose", answered: "gold", closed: "muted" };
export type AdminTicket = { id: string; client: string; subject: string; date: string; status: TicketStatus };
export const adminTickets: AdminTicket[] = [
  { id: "TK-91", client: "فندق الواحة", subject: "تأخر طلب ORD-1047", date: "2026-10-20", status: "open" },
  { id: "TK-90", client: "متجر نسمة الورد", subject: "طلب تعديل كمية الورد الأحمر", date: "2026-10-19", status: "answered" },
  { id: "TK-89", client: "مقهى زهرة", subject: "تحديث عنوان التوصيل", date: "2026-10-17", status: "closed" },
];

export const weeklySales = [
  { day: "السبت", total: 9800 },
  { day: "الأحد", total: 14200 },
  { day: "الاثنين", total: 11800 },
  { day: "الثلاثاء", total: 16900 },
  { day: "الأربعاء", total: 13400 },
  { day: "الخميس", total: 21500 },
  { day: "الجمعة", total: 7200 },
];

export const sar = (n: number) => `${n.toLocaleString("en-US")} ر.س`;
