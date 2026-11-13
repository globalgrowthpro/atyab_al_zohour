import { supabase } from "@/integrations/supabase/client";

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(userPhone?: string): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Register subscription simulation / token
      const endpoint = `webpush://${window.location.hostname}/${Math.random().toString(36).slice(2, 10)}`;
      if (!import.meta.env["TEST"]) {
        await supabase.from("notification_subscriptions").upsert(
          {
            user_phone: userPhone || null,
            endpoint,
            user_agent: navigator.userAgent,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "endpoint" }
        );
      }
    }
    return permission;
  } catch (err) {
    console.warn("Notification permission request error:", err);
    return "denied";
  }
}

export function dispatchLocalNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  try {
    new Notification(title, {
      icon: "/nav-logo.png",
      badge: "/nav-logo.png",
      dir: "rtl",
      lang: "ar",
      ...options,
    });
    return true;
  } catch {
    return false;
  }
}
