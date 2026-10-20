import { z } from "zod";

export const orderStatus = {
  received: "تم قبول الطلب",
  preparing: "قيد التجهيز",
  ready: "جاهز للتوصيل",
  shipping: "مع مندوب التوصيل",
  delivered: "تم الاستلام",
  cancelled: "ملغي",
} as const;
export const profileSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسماً من حرفين على الأقل").max(120),
  company: z.string().trim().min(2, "أدخل اسم المنشأة").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s()-]{7,25}$/, "أدخل رقم جوال صحيحاً")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "أدخل رقم جوال صحيحاً"),
  email: z.string().trim().email("أدخل بريداً إلكترونياً صحيحاً").or(z.literal("")),
  city: z.string().trim().min(2, "أدخل مدينة التوصيل").max(120),
  district: z.string().trim().min(2, "أدخل الحي من حرفين على الأقل").max(120),
  address: z.string().trim().max(500),
});
const orderSchema = z.object({
  id: z.string(),
  date: z.string(),
  status: z.enum(["received", "preparing", "ready", "shipping", "delivered", "cancelled"]),
  city: z.string(),
  address: z.object({ district: z.string(), street: z.string() }).optional(),
  deliveryWindow: z.string().optional(),
  total: z.number().finite().nonnegative().optional(),
  items: z.array(
    z.object({
      name: z.string(),
      sku: z.string(),
      qty: z.number().int().positive(),
      unit: z.string(),
    }),
  ),
  events: z.array(z.object({ label: z.string(), at: z.string(), detail: z.string() })),
});
export const ticketInputSchema = z.object({
  subject: z.string().trim().min(4, "عنوان التذكرة يجب أن يكون 4 أحرف على الأقل").max(160),
  category: z.enum(["order", "delivery", "account", "other"]),
  orderId: z.string().max(80),
  message: z.string().trim().min(10, "اكتب تفاصيل لا تقل عن 10 أحرف").max(3000),
});
const stateSchema = z.object({
  version: z.literal(1),
  profile: z.object({
    name: z.string(),
    company: z.string(),
    phone: z.string(),
    email: z.string(),
    city: z.string(),
    district: z.string().default(""),
    address: z.string(),
  }),
  orders: z.array(orderSchema),
  tickets: z.array(
    ticketInputSchema.extend({
      id: z.string(),
      createdAt: z.string(),
      status: z.enum(["draft", "open", "pending", "closed"]),
      origin: z.enum(["local", "demo"]).default("local"),
      replies: z
        .array(
          z.object({ author: z.enum(["client", "support"]), message: z.string(), at: z.string() }),
        )
        .default([]),
    }),
  ),
});
export type ClientData = z.infer<typeof stateSchema>;
export type ClientOrder = z.infer<typeof orderSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type TicketInput = z.infer<typeof ticketInputSchema>;
export const deliverySteps = ["received", "preparing", "ready", "shipping", "delivered"] as const;
export function progressIndex(status: ClientOrder["status"]) {
  return deliverySteps.findIndex((step) => step === status);
}
export const emptyClientData = (): ClientData => ({
  version: 1,
  profile: { name: "", company: "", phone: "", email: "", city: "", district: "", address: "" },
  orders: [],
  tickets: [],
});
export const CLIENT_STORAGE_KEY = "atyab-client-demo-v1";

// Replace this adapter with authenticated API calls when the customer service is connected.
export interface ClientRepository {
  load(): Promise<ClientData>;
  save(data: ClientData): Promise<void>;
}
export const clientRepository: ClientRepository = {
  async load() {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    return raw ? stateSchema.parse(JSON.parse(raw)) : withDemonstrationData(emptyClientData());
  },
  async save(data) {
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(stateSchema.parse(data)));
  },
};

export function demonstrationOrders(): ClientOrder[] {
  const items = [
    { name: "ورد أحمر فاخر", sku: "RS-001", qty: 20, unit: "باقة" },
    { name: "زنبق أبيض", sku: "LL-001", qty: 5, unit: "باقة" },
  ];
  return [
    {
      id: "DEMO-1003",
      date: "2026-10-18",
      status: "shipping",
      city: "الرياض",
      items,
      events: [
        { label: "استلام الطلب", at: "2026-10-18 09:00", detail: "تم تسجيل الطلب التوضيحي." },
        {
          label: "التجهيز",
          at: "2026-10-18 11:00",
          detail: "تجهيز الأصناف وفحص الجودة — مثال فقط.",
        },
        {
          label: "خروج للتوصيل",
          at: "2026-10-19 08:00",
          detail: "حدث توصيل توضيحي؛ لا يمثل شحنة فعلية.",
        },
      ],
    },
    {
      id: "DEMO-1002",
      date: "2026-10-17",
      status: "preparing",
      city: "جدة",
      items: items.slice(0, 1),
      events: [
        { label: "استلام الطلب", at: "2026-10-17 09:00", detail: "تم تسجيل الطلب التوضيحي." },
        { label: "التجهيز", at: "2026-10-17 11:00", detail: "جارٍ تجهيز الطلب — مثال فقط." },
      ],
    },
    {
      id: "DEMO-1001",
      date: "2026-10-15",
      status: "delivered",
      city: "الرياض",
      items: items.slice(1),
      events: [
        { label: "استلام الطلب", at: "2026-10-15 09:00", detail: "طلب توضيحي." },
        { label: "التجهيز", at: "2026-10-15 11:00", detail: "تجهيز توضيحي." },
        { label: "خروج للتوصيل", at: "2026-10-16 08:00", detail: "حدث توضيحي." },
        { label: "التسليم", at: "2026-10-16 12:00", detail: "حالة توضيحية وليست إثبات تسليم." },
      ],
    },
    {
      id: "DEMO-1004",
      date: "2026-10-19",
      status: "ready",
      city: "الدمام",
      items: items.slice(0, 1),
      events: [
        { label: "تم قبول الطلب", at: "2026-10-19 08:00", detail: "حدث قبول توضيحي." },
        { label: "التجهيز", at: "2026-10-19 09:00", detail: "تجهيز وفحص الجودة — مثال." },
        {
          label: "جاهز للتوصيل",
          at: "2026-10-19 11:00",
          detail: "جاهز للتسليم للمندوب — حالة توضيحية.",
        },
      ],
    },
    {
      id: "DEMO-1005",
      date: "2026-10-19",
      status: "received",
      city: "الرياض",
      items: items.slice(1),
      events: [
        {
          label: "تم قبول الطلب",
          at: "2026-10-19 12:00",
          detail: "طلب مقبول بانتظار التجهيز — مثال فقط.",
        },
      ],
    },
  ];
}

export function withDemonstrationData(current: ClientData): ClientData {
  const tickets: ClientData["tickets"] = [
    {
      id: "DEMO-T103",
      subject: "استفسار عن موعد التوصيل",
      category: "delivery",
      orderId: "DEMO-1003",
      message: "هل يمكن تأكيد نافذة التوصيل للطلب؟ هذه محادثة توضيحية.",
      createdAt: "2026-10-19T07:00:00Z",
      status: "open",
      origin: "demo",
      replies: [
        {
          author: "support",
          message:
            "مثال رد الدعم: نراجع جدول الرحلات وسنؤكد الموعد بعد التنسيق. هذا رد توضيحي وليس تحديثاً فعلياً.",
          at: "2026-10-19T07:30:00Z",
        },
      ],
    },
    {
      id: "DEMO-T102",
      subject: "تعديل كميات الطلب",
      category: "order",
      orderId: "DEMO-1002",
      message: "أرغب في إضافة عشر باقات للطلب قبل التجهيز — مثال توضيحي.",
      createdAt: "2026-10-17T10:00:00Z",
      status: "pending",
      origin: "demo",
      replies: [
        {
          author: "support",
          message: "مثال رد الدعم: يرجى توضيح الصنف المطلوب لمراجعة توفره.",
          at: "2026-10-17T10:30:00Z",
        },
        {
          author: "client",
          message: "مثال رد العميل: ورد أحمر فاخر، رمز RS-001.",
          at: "2026-10-17T10:40:00Z",
        },
      ],
    },
    {
      id: "DEMO-T101",
      subject: "إرشادات حفظ الزهور",
      category: "other",
      orderId: "DEMO-1001",
      message: "ما إرشادات حفظ الزهور بعد الاستلام؟ محادثة نموذجية.",
      createdAt: "2026-10-16T11:00:00Z",
      status: "closed",
      origin: "demo",
      replies: [
        {
          author: "support",
          message: "مثال رد الدعم: راجع إرشادات التخزين الخاصة بكل صنف في صفحة المنتج.",
          at: "2026-10-16T11:30:00Z",
        },
        { author: "client", message: "مثال رد العميل: شكراً للتوضيح.", at: "2026-10-16T11:45:00Z" },
      ],
    },
  ];
  return {
    ...current,
    orders: [
      ...current.orders,
      ...demonstrationOrders().filter(
        (o) => !current.orders.some((existing) => existing.id === o.id),
      ),
    ],
    tickets: [
      ...current.tickets,
      ...tickets.filter((t) => !current.tickets.some((existing) => existing.id === t.id)),
    ],
  };
}
