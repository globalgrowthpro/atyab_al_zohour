import { describe, expect, it } from "vitest";
import {
  hasPermission,
  getRoleDestination,
  getRoleLabel,
  type AppRole,
  type Permission,
} from "@/features/auth/context";
import { getAdminNavigationForRole, adminNavigationItems } from "@/features/admin/navigation";

describe("Role-Based Access Control (RBAC) System", () => {
  describe("Super Admin (المدير العام)", () => {
    const role: AppRole = "superadmin";

    it("has unrestricted access to all system permissions", () => {
      const permissions: Permission[] = [
        "manage:all",
        "manage:security",
        "manage:roles",
        "manage:settings",
        "manage:pricing",
        "manage:clients",
        "manage:orders",
        "manage:products",
        "manage:couriers",
        "manage:support",
        "manage:seo",
        "view:reports",
        "portal:admin",
        "portal:courier",
        "portal:client",
      ];

      for (const perm of permissions) {
        expect(hasPermission(role, perm)).toBe(true);
      }
    });

    it("routes to /admin upon login", () => {
      expect(getRoleDestination(role)).toBe("/admin");
    });

    it("sees all 14 admin navigation items including security", () => {
      const nav = getAdminNavigationForRole(role);
      expect(nav.length).toBe(adminNavigationItems.length);
      expect(nav.some((n) => n.to === "/admin/security")).toBe(true);
    });

    it("has proper localized label", () => {
      expect(getRoleLabel(role)).toContain("المدير العام");
    });
  });

  describe("Admin (مدير النظام)", () => {
    const role: AppRole = "admin";

    it("has operational management access but is blocked from security governance", () => {
      expect(hasPermission(role, "manage:settings")).toBe(true);
      expect(hasPermission(role, "manage:pricing")).toBe(true);
      expect(hasPermission(role, "manage:orders")).toBe(true);
      expect(hasPermission(role, "manage:clients")).toBe(true);
      expect(hasPermission(role, "manage:products")).toBe(true);
      expect(hasPermission(role, "manage:couriers")).toBe(true);
      expect(hasPermission(role, "manage:support")).toBe(true);
      expect(hasPermission(role, "manage:seo")).toBe(true);
      expect(hasPermission(role, "view:reports")).toBe(true);
      expect(hasPermission(role, "portal:admin")).toBe(true);

      // Blocked from superadmin-only permissions
      expect(hasPermission(role, "manage:security")).toBe(false);
      expect(hasPermission(role, "manage:roles")).toBe(false);
      expect(hasPermission(role, "manage:all")).toBe(false);
    });

    it("does not show security link in navigation", () => {
      const nav = getAdminNavigationForRole(role);
      expect(nav.some((n) => n.to === "/admin/security")).toBe(false);
    });

    it("routes to /admin", () => {
      expect(getRoleDestination(role)).toBe("/admin");
    });
  });

  describe("Manager (مدير العمليات)", () => {
    const role: AppRole = "manager";

    it("can manage daily operations but cannot modify system pricing or settings", () => {
      expect(hasPermission(role, "manage:orders")).toBe(true);
      expect(hasPermission(role, "manage:clients")).toBe(true);
      expect(hasPermission(role, "manage:couriers")).toBe(true);
      expect(hasPermission(role, "manage:support")).toBe(true);
      expect(hasPermission(role, "manage:products")).toBe(true);
      expect(hasPermission(role, "view:reports")).toBe(true);
      expect(hasPermission(role, "portal:admin")).toBe(true);

      // Blocked from financial config & system settings
      expect(hasPermission(role, "manage:pricing")).toBe(false);
      expect(hasPermission(role, "manage:settings")).toBe(false);
      expect(hasPermission(role, "manage:security")).toBe(false);
    });

    it("routes to /admin", () => {
      expect(getRoleDestination(role)).toBe("/admin");
    });
  });

  describe("SEO Specialist (مسؤول السيو والتسويق)", () => {
    const role: AppRole = "seo";

    it("can manage SEO and catalog content but cannot access orders, pricing or security", () => {
      expect(hasPermission(role, "manage:seo")).toBe(true);
      expect(hasPermission(role, "manage:products")).toBe(true);
      expect(hasPermission(role, "view:reports")).toBe(true);
      expect(hasPermission(role, "portal:admin")).toBe(true);

      // Blocked from operations, pricing and security
      expect(hasPermission(role, "manage:orders")).toBe(false);
      expect(hasPermission(role, "manage:clients")).toBe(false);
      expect(hasPermission(role, "manage:pricing")).toBe(false);
      expect(hasPermission(role, "manage:security")).toBe(false);
      expect(hasPermission(role, "manage:settings")).toBe(false);
    });

    it("routes directly to /admin/seo upon login", () => {
      expect(getRoleDestination(role)).toBe("/admin/seo");
    });

    it("filters navigation down to relevant marketing and content sections", () => {
      const nav = getAdminNavigationForRole(role);
      const paths = nav.map((n) => n.to);
      expect(paths).toContain("/admin/seo");
      expect(paths).toContain("/admin/products");
      expect(paths).toContain("/admin/reports");
      expect(paths).not.toContain("/admin/orders");
      expect(paths).not.toContain("/admin/pricing");
      expect(paths).not.toContain("/admin/security");
    });
  });

  describe("Courier (كابتن التوصيل)", () => {
    const role: AppRole = "courier";

    it("can access courier portal but is blocked from admin and client areas", () => {
      expect(hasPermission(role, "portal:courier")).toBe(true);
      expect(hasPermission(role, "portal:admin")).toBe(false);
      expect(hasPermission(role, "manage:orders")).toBe(false);
      expect(hasPermission(role, "manage:security")).toBe(false);
    });

    it("routes to /courier", () => {
      expect(getRoleDestination(role)).toBe("/courier");
    });
  });

  describe("B2B Client (عميل تجاري)", () => {
    const role: AppRole = "client";

    it("can access client dashboard but is blocked from admin and courier portals", () => {
      expect(hasPermission(role, "portal:client")).toBe(true);
      expect(hasPermission(role, "portal:admin")).toBe(false);
      expect(hasPermission(role, "portal:courier")).toBe(false);
      expect(hasPermission(role, "manage:orders")).toBe(false);
    });

    it("routes to /dashboard", () => {
      expect(getRoleDestination(role)).toBe("/dashboard");
    });
  });

  describe("Security Isolation & Anti-Tampering (الأمان ومنع التصعيد)", () => {
    it("denies all permissions to unauthenticated or null roles", () => {
      const allPermissions: Permission[] = [
        "manage:all",
        "manage:security",
        "manage:roles",
        "manage:settings",
        "manage:pricing",
        "manage:clients",
        "manage:orders",
        "manage:products",
        "manage:couriers",
        "manage:support",
        "manage:seo",
        "view:reports",
        "portal:admin",
        "portal:courier",
        "portal:client",
      ];

      for (const p of allPermissions) {
        expect(hasPermission(null, p)).toBe(false);
        expect(hasPermission(undefined, p)).toBe(false);
      }
    });

    it("restricts manage:roles strictly to superadmin", () => {
      const otherRoles: AppRole[] = ["admin", "manager", "seo", "sales", "inventory", "courier", "client"];
      for (const r of otherRoles) {
        expect(hasPermission(r, "manage:roles")).toBe(false);
        expect(hasPermission(r, "manage:security")).toBe(false);
      }
      expect(hasPermission("superadmin", "manage:roles")).toBe(true);
      expect(hasPermission("superadmin", "manage:security")).toBe(true);
    });

    it("prevents clients and couriers from accessing any admin sub-route permissions", () => {
      const restrictedForClientsAndCouriers: Permission[] = [
        "portal:admin",
        "manage:orders",
        "manage:pricing",
        "manage:settings",
        "manage:security",
        "manage:roles",
        "manage:seo",
        "manage:clients",
        "manage:couriers",
      ];

      for (const p of restrictedForClientsAndCouriers) {
        expect(hasPermission("client", p)).toBe(false);
        expect(hasPermission("courier", p)).toBe(false);
      }
    });

    it("prevents SEO role from viewing financial and order management", () => {
      expect(hasPermission("seo", "manage:orders")).toBe(false);
      expect(hasPermission("seo", "manage:pricing")).toBe(false);
      expect(hasPermission("seo", "manage:clients")).toBe(false);
      expect(hasPermission("seo", "manage:couriers")).toBe(false);
      expect(hasPermission("seo", "manage:settings")).toBe(false);
      expect(hasPermission("seo", "manage:security")).toBe(false);
    });
  });
});

