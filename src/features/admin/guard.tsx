import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, hasPermission, getRoleLabel, type Permission } from "@/features/auth/context";

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
  fallbackMessage?: string;
}

/**
 * Route guard component for admin sub-routes.
 * Enforces role-based permissions preventing unauthorized direct URL navigation.
 */
export function RequirePermission({
  permission,
  children,
  fallbackMessage,
}: RequirePermissionProps) {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-8">
        <div className="flex items-center gap-3 text-sm font-bold text-forest">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>جاري التحقق من الصلاحيات الأمنية...</span>
        </div>
      </div>
    );
  }

  const isAllowed = isAuthenticated && hasPermission(role, permission);

  if (!isAllowed) {
    return (
      <section className="flex min-h-[400px] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-lift">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-forest">قسم محمي أمنياً</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            {fallbackMessage || "ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة."}
          </p>
          <div className="mt-3 rounded-xl border border-border bg-muted/30 p-2.5 text-xs">
            <span className="text-muted-foreground">دورك الحالي في المنصة: </span>
            <span className="font-bold text-forest">{getRoleLabel(role)}</span>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button asChild className="btn btn-primary w-full gap-2">
              <Link to="/admin">
                <span>العودة للأقسام المصرح لك بها</span>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

