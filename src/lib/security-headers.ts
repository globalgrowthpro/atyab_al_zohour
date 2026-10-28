// Security headers added to every server response.
// Framing is limited to this site and the Lovable editor (preview runs in an iframe),
// so frame-ancestors is used instead of X-Frame-Options: DENY.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:*",
  "frame-ancestors 'self' https://*.lovable.app https://*.lovable.dev https://lovable.dev https://*.lovableproject.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-site",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
};

export function withSecurityHeaders(response: Response): Response {
  const res = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!res.headers.has(k)) res.headers.set(k, v);
  }
  res.headers.delete("x-powered-by");
  return res;
}
