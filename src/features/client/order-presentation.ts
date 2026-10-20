import { type ClientOrder, progressIndex } from "./data";

export function formatOrderDate(value: string) {
  const date = new Date(value.slice(0, 10) + "T12:00:00Z");
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ar-SA", {
        calendar: "gregory",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }).format(date);
}
export function orderQuantity(order: ClientOrder) {
  const units = order.items.reduce<Record<string, number>>((result, item) => {
    result[item.unit] = (result[item.unit] ?? 0) + item.qty;
    return result;
  }, {});
  return Object.entries(units)
    .map(([unit, qty]) => `${qty} ${unit}`)
    .join("، ");
}
export function orderAddress(order: ClientOrder) {
  const demo = order.id.startsWith("DEMO-");
  const address =
    order.address ??
    (demo
      ? {
          district:
            order.city === "جدة"
              ? "حي الروضة"
              : order.city === "الدمام"
                ? "حي الشاطئ"
                : "حي الورود",
          street:
            order.city === "جدة"
              ? "شارع الأمير سعود الفيصل"
              : order.city === "الدمام"
                ? "طريق الخليج"
                : "طريق الملك عبدالله",
        }
      : undefined);
  return {
    city: order.city,
    district: address?.district ?? "غير محدد",
    street: address?.street ?? "غير محدد",
    example: demo,
  };
}
export function orderAmount(order: ClientOrder) {
  return order.total === undefined
    ? "بانتظار التسعير"
    : `${new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(order.total)} ر.س`;
}

export type Coordinate = [number, number];
// Public geographic coordinates for a static demonstration, never a customer's address or live GPS.
export const demoRoutes: Record<string, Coordinate[]> = {
  الرياض: [
    [24.7086, 46.6753],
    [24.7111, 46.6753],
    [24.7111, 46.6825],
    [24.7144, 46.6825],
    [24.7144, 46.69],
    [24.719, 46.69],
    [24.719, 46.699],
  ],
  جدة: [
    [21.5602, 39.159],
    [21.5655, 39.159],
    [21.5655, 39.166],
    [21.57, 39.166],
    [21.57, 39.174],
    [21.575, 39.174],
  ],
  الدمام: [
    [26.4345, 50.103],
    [26.439, 50.103],
    [26.439, 50.111],
    [26.443, 50.111],
    [26.443, 50.119],
    [26.449, 50.119],
  ],
};
export function orderMapState(
  order: Pick<ClientOrder, "city" | "status">,
  customRoute?: Coordinate[],
) {
  const route =
    customRoute && customRoute.length >= 2
      ? customRoute
      : (demoRoutes[order.city] ?? demoRoutes["الرياض"]!);
  const stage = progressIndex(order.status);
  const index = stage >= 4 ? route.length - 1 : stage === 3 ? Math.floor(route.length * 0.6) : 0;
  return {
    route,
    position: route[index]!,
    traveled: route.slice(0, index + 1),
    location:
      stage >= 4
        ? "وصل إلى نقطة الاستلام"
        : stage === 3
          ? "مع المندوب في الطريق"
          : stage === 2
            ? "جاهز في مركز التجهيز"
            : "في مركز التجهيز",
    stage,
    index,
  };
}
