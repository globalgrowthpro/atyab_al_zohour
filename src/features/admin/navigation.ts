import {
  BarChart3,
  Handshake,
  Lock,
  SearchCheck,
  ClipboardList,
  FileText,
  Headset,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Tags,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { type AppRole, type Permission, hasPermission } from "@/features/auth/context";

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
}

export const adminNavigationItems: AdminNavItem[] = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, permission: "portal:admin" },
  { to: "/admin/whatsapp", label: "واتساب للأعمال", icon: MessageSquare, permission: "manage:orders" },
  { to: "/admin/orders", label: "الطلبات", icon: ClipboardList, permission: "manage:orders" },
  { to: "/admin/quotes", label: "عروض الأسعار", icon: FileText, permission: "manage:orders" },
  { to: "/admin/products", label: "المنتجات وقوائم الأسعار", icon: Package, permission: "manage:products" },
  { to: "/admin/clients", label: "حسابات العملاء", icon: Users, permission: "manage:clients" },
  { to: "/admin/crm", label: "إدارة العملاء CRM", icon: Handshake, permission: "manage:clients" },
  { to: "/admin/couriers", label: "المندوبون", icon: Truck, permission: "manage:couriers" },
  { to: "/admin/support", label: "تذاكر الدعم", icon: Headset, permission: "manage:support" },
  { to: "/admin/reports", label: "التقارير", icon: BarChart3, permission: "view:reports" },
  { to: "/admin/security", label: "الأمان والصلاحيات", icon: Lock, permission: "manage:security" },
  { to: "/admin/seo", label: "SEO · AEO · GEO", icon: SearchCheck, permission: "manage:seo" },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings, permission: "manage:settings" },
];

export const adminNavigation = adminNavigationItems.map(
  (item) => [item.to, item.label, item.icon] as const
);

export function getAdminNavigationForRole(role?: AppRole | null) {
  return adminNavigationItems.filter((item) => hasPermission(role, item.permission));
}
