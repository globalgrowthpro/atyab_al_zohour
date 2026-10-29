import { BarChart3, Handshake, Lock, SearchCheck, ClipboardList, FileText, Headset, LayoutDashboard, Package, Settings, Tags, Truck, Users } from "lucide-react";

export const adminNavigation = [
  ["/admin", "نظرة عامة", LayoutDashboard],
  ["/admin/orders", "الطلبات", ClipboardList],
  ["/admin/quotes", "عروض الأسعار", FileText],
  ["/admin/products", "المنتجات والمخزون", Package],
  ["/admin/pricing", "قوائم الأسعار", Tags],
  ["/admin/clients", "حسابات العملاء", Users],
  ["/admin/crm", "إدارة العملاء CRM", Handshake],
  ["/admin/couriers", "المندوبون", Truck],
  ["/admin/support", "تذاكر الدعم", Headset],
  ["/admin/reports", "التقارير", BarChart3],
  ["/admin/security", "الأمان", Lock],
  ["/admin/seo", "SEO · AEO · GEO", SearchCheck],
  ["/admin/settings", "الإعدادات", Settings],
] as const;