import { z } from "zod";
import type { ClientOrder } from "@/features/client/data";

export const courierStatuses = {
  assigned: "مهمة جديدة",
  accepted: "تم استلام المهمة",
  out_for_delivery: "في الطريق",
  delivered: "تم التسليم",
  failed: "تعذّر التسليم",
} as const;
export const failureReasons = {
  unavailable: "العميل غير متاح",
  address: "تعذّر الوصول للعنوان",
  vehicle: "مشكلة في المركبة",
  other: "سبب آخر",
} as const;
const taskSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  date: z.string(),
  slot: z.string(),
  customer: z.string(),
  city: z.string(),
  district: z.string(),
  street: z.string(),
  instruction: z.string(),
  status: z.enum(["assigned", "accepted", "out_for_delivery", "delivered", "failed"]),
  priority: z.enum(["normal", "high"]),
  items: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      qty: z.number().int().positive(),
      unit: z.string(),
    }),
  ),
  events: z.array(z.object({ at: z.string(), label: z.string(), note: z.string() })),
  recipient: z.string().optional(),
  failureReason: z.enum(["unavailable", "address", "vehicle", "other"]).optional(),
});
export const courierProfileSchema = z.object({
  name: z.string().trim().min(2, "أدخل اسم المندوب").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s()-]{7,25}$/, "أدخل رقم جوال صحيحاً")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "أدخل رقم جوال صحيحاً"),
  city: z.string().trim().min(2, "أدخل المدينة").max(120),
  vehicle: z.string().trim().max(120),
});
const stateSchema = z.object({
  version: z.literal(1),
  profile: z.object({ name: z.string(), phone: z.string(), city: z.string(), vehicle: z.string() }),
  tasks: z.array(taskSchema),
  support: z.array(
    z.object({
      id: z.string(),
      taskId: z.string(),
      subject: z.string(),
      message: z.string(),
      at: z.string(),
    }),
  ),
});
export type CourierTask = z.infer<typeof taskSchema>;
export type CourierData = z.infer<typeof stateSchema>;
export const COURIER_STORAGE_KEY = "atyab-courier-demo-v1";
export const taskActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("accept") }),
  z.object({ type: z.literal("depart") }),
  z.object({
    type: z.literal("deliver"),
    recipient: z.string().trim().min(2, "أدخل اسم المستلم").max(120),
    verified: z.literal(true, {
      errorMap: () => ({ message: "أكد مراجعة المنتجات والكميات قبل حفظ التسليم." }),
    }),
    note: z.string().trim().max(1000),
  }),
  z.object({
    type: z.literal("fail"),
    reason: z.enum(["unavailable", "address", "vehicle", "other"]),
    note: z.string().trim().min(5, "اكتب توضيحاً من 5 أحرف على الأقل").max(1000),
  }),
  z.object({ type: z.literal("retry") }),
]);
export type TaskAction = z.infer<typeof taskActionSchema>;
export function transitionTask(
  task: CourierTask,
  input: unknown,
  at = new Date().toISOString(),
): CourierTask {
  const action = taskActionSchema.parse(input);
  const transitions: Record<
    TaskAction["type"],
    { from: CourierTask["status"]; to: CourierTask["status"]; label: string }
  > = {
    accept: { from: "assigned", to: "accepted", label: "تم استلام المهمة" },
    depart: { from: "accepted", to: "out_for_delivery", label: "خرج للتوصيل" },
    deliver: { from: "out_for_delivery", to: "delivered", label: "تم التسليم" },
    fail: { from: "out_for_delivery", to: "failed", label: "تعذّر التسليم" },
    retry: { from: "failed", to: "out_for_delivery", label: "بدء محاولة توصيل جديدة" },
  };
  const transition = transitions[action.type];
  if (task.status !== transition.from)
    throw new Error("لا يمكن تنفيذ هذا الإجراء في حالة المهمة الحالية.");
  const { failureReason: previousReason, ...base } = task;
  void previousReason;
  const note =
    action.type === "deliver"
      ? `استلم: ${action.recipient}${action.note ? ` · ${action.note}` : ""}`
      : action.type === "fail"
        ? `${failureReasons[action.reason]} · ${action.note}`
        : "تحديث محلي تجريبي";
  return {
    ...base,
    status: transition.to,
    ...(action.type === "deliver" ? { recipient: action.recipient } : {}),
    ...(action.type === "fail" ? { failureReason: action.reason } : {}),
    events: [...task.events, { at, label: transition.label, note }],
  };
}
export function demoCourierData(): CourierData {
  const rows: {
    id: string;
    orderId: string;
    customer: string;
    district: string;
    street: string;
    slot: string;
    status: CourierTask["status"];
    priority: CourierTask["priority"];
  }[] = [
    {
      id: "TASK-201",
      orderId: "DEMO-D201",
      customer: "محل الورد · عميل تجريبي",
      district: "حي الورود",
      street: "طريق الملك عبدالله",
      slot: "10:00 – 12:00",
      status: "out_for_delivery",
      priority: "high",
    },
    {
      id: "TASK-202",
      orderId: "DEMO-D202",
      customer: "زهور الحي · عميل تجريبي",
      district: "حي المروج",
      street: "طريق الإمام سعود",
      slot: "12:00 – 14:00",
      status: "assigned",
      priority: "normal",
    },
    {
      id: "TASK-203",
      orderId: "DEMO-D203",
      customer: "تنسيقات الربيع · عميل تجريبي",
      district: "حي النزهة",
      street: "طريق عثمان بن عفان",
      slot: "13:00 – 15:00",
      status: "assigned",
      priority: "high",
    },
    {
      id: "TASK-204",
      orderId: "DEMO-D204",
      customer: "باقات الياسمين · عميل تجريبي",
      district: "حي الملك فهد",
      street: "شارع العليا",
      slot: "14:00 – 16:00",
      status: "accepted",
      priority: "normal",
    },
    {
      id: "TASK-205",
      orderId: "DEMO-D205",
      customer: "حديقة الزهور · عميل تجريبي",
      district: "حي الازدهار",
      street: "شارع الحسين بن علي",
      slot: "09:00 – 10:00",
      status: "delivered",
      priority: "normal",
    },
    {
      id: "TASK-206",
      orderId: "DEMO-D206",
      customer: "ورود المناسبات · عميل تجريبي",
      district: "حي التعاون",
      street: "طريق أبي بكر الصديق",
      slot: "09:00 – 11:00",
      status: "failed",
      priority: "normal",
    },
  ];
  return {
    version: 1,
    profile: {
      name: "مندوب تجريبي",
      phone: "",
      city: "الرياض",
      vehicle: "مركبة توصيل مبرّدة (مثال)",
    },
    tasks: rows.map((row, index) => ({
      ...row,
      date: "2026-10-20",
      city: "الرياض",
      instruction:
        index === 0
          ? "التسليم عند المدخل الرئيسي. حافظ على تبريد الزهور أثناء النقل."
          : "يرجى مراجعة الكميات مع المستلم قبل تأكيد التسليم.",
      items: [
        { sku: "RS-001", name: "ورد أحمر فاخر", qty: (index + 1) * 5, unit: "باقة" },
        { sku: "LL-001", name: "زنبق أبيض", qty: 5, unit: "باقة" },
      ],
      events: [
        {
          at: "2026-10-20T06:00:00Z",
          label: "تم إسناد المهمة",
          note: "مهمة توضيحية، ليست طلب توصيل فعلياً.",
        },
        ...(row.status !== "assigned"
          ? [{ at: "2026-10-20T06:30:00Z", label: "تم استلام المهمة", note: "حدث توضيحي" }]
          : []),
        ...(["out_for_delivery", "delivered", "failed"].includes(row.status)
          ? [{ at: "2026-10-20T07:00:00Z", label: "خرج للتوصيل", note: "حدث توضيحي" }]
          : []),
        ...(row.status === "delivered"
          ? [{ at: "2026-10-20T07:30:00Z", label: "تم التسليم", note: "استلم: مستلم تجريبي" }]
          : []),
        ...(row.status === "failed"
          ? [
              {
                at: "2026-10-20T07:45:00Z",
                label: "تعذّر التسليم",
                note: "العميل غير متاح — مثال تجريبي",
              },
            ]
          : []),
      ],
      ...(row.status === "delivered" ? { recipient: "مستلم تجريبي" } : {}),
      ...(row.status === "failed" ? { failureReason: "unavailable" as const } : {}),
    })),
    support: [],
  };
}
export interface CourierRepository {
  load(): Promise<CourierData>;
  save(data: CourierData): Promise<void>;
}
export const courierRepository: CourierRepository = {
  async load() {
    const raw = localStorage.getItem(COURIER_STORAGE_KEY);
    return raw ? stateSchema.parse(JSON.parse(raw)) : demoCourierData();
  },
  async save(data) {
    localStorage.setItem(COURIER_STORAGE_KEY, JSON.stringify(stateSchema.parse(data)));
  },
};
export function taskAsOrder(task: CourierTask): ClientOrder {
  return {
    id: task.orderId,
    date: task.date,
    city: task.city,
    address: { district: task.district, street: task.street },
    status:
      task.status === "delivered"
        ? "delivered"
        : task.status === "out_for_delivery" || task.status === "failed"
          ? "shipping"
          : task.status === "accepted"
            ? "ready"
            : "received",
    items: task.items,
    events: task.events.map((event) => ({ label: event.label, at: event.at, detail: event.note })),
  };
}
