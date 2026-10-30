import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/site/SiteHeader";
import { TierSelectorBar } from "@/components/site/TierSelectorBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileBottomNav } from "@/components/site/MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl">404</h1>
        <h2 className="mt-4 text-xl">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link to="/" className="btn btn-primary mt-6">العودة للرئيسية</Link>
      </div>
    </div>
  );
}

const RELOAD_KEY = "atyab:chunk-reload";

// Errors caused by a stale page after the preview/server refreshed its files.
function isStaleAssetError(error: unknown) {
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /dynamically imported module|Importing a module script failed|module script|ChunkLoadError|Loading chunk|Failed to fetch/i.test(msg);
}

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 15000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage unavailable */
  }
  window.location.reload();
  return true;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const [recovering, setRecovering] = useState(true);

  useEffect(() => {
    if (isStaleAssetError(error) && reloadOnce()) return;
    // One silent retry for transient failures before showing the message.
    const t = window.setTimeout(() => {
      try {
        const key = "atyab:soft-retry";
        const last = Number(sessionStorage.getItem(key) || 0);
        if (Date.now() - last > 15000) {
          sessionStorage.setItem(key, String(Date.now()));
          router.invalidate();
          reset();
          return;
        }
      } catch {
        /* storage unavailable */
      }
      setRecovering(false);
    }, 600);
    return () => window.clearTimeout(t);
  }, [error, reset, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        {recovering ? (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
            <h1 className="text-xl text-primary">جارٍ تحميل الصفحة…</h1>
            <p className="mt-2 text-sm text-muted-foreground">لحظات من فضلك.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl text-primary">تعذّر تحميل الصفحة</h1>
            <p className="mt-2 text-sm text-muted-foreground">حدث خطأ ما. حاول التحديث أو العودة للرئيسية.</p>
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={() => { router.invalidate(); reset(); }} className="btn btn-primary">إعادة المحاولة</button>
              <a href="/" className="btn btn-outline">الرئيسية</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "أطيب الزهور | توريد الورود بالجملة" },
      { name: "description", content: "أطيب الزهور — توريد الورود الطبيعية بالجملة للشركات في السعودية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Playfair+Display:wght@600&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { pathname } = useLocation();
  const isPanel =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/courier" ||
    pathname.startsWith("/courier/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  useEffect(() => {
    // Page rendered fine: reset the server error page's auto-retry counter.
    try {
      sessionStorage.removeItem("atyab:auto-retry");
    } catch {
      /* storage unavailable */
    }
    // Vite fires this when a page file can no longer be fetched after an update.
    const onPreloadError = (event: Event) => {
      event.preventDefault();
      reloadOnce();
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {!isPanel && (
          <>
            <SiteHeader />
            <TierSelectorBar />
          </>
        )}
        <main className="min-h-[60vh] pb-24 md:pb-0">
          <Outlet />
        </main>
        {!isPanel && <SiteFooter />}
        {!isPanel && <MobileBottomNav />}
        <Toaster position="top-center" richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}
