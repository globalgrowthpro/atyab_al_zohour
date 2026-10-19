/**
 * Production Node.js Server for cPanel ("Setup Node.js App" / CloudLinux Passenger)
 * and Hostinger hPanel Node.js Application Manager.
 *
 * Runs natively with standard Node.js (v18, v20, v22) without requiring extra runtime dependencies.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDir = path.join(__dirname, "dist", "client");
const serverModulePath = path.join(__dirname, "dist", "server", "server.js");

// Standard MIME types for static asset serving
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

// Dynamically import TanStack Start SSR entry
let ssrHandler = null;
try {
  if (fs.existsSync(serverModulePath)) {
    const mod = await import(`file://${serverModulePath}`);
    ssrHandler = mod.default || mod;
  }
} catch (err) {
  console.warn("Notice: SSR bundle not loaded or build not yet run:", err.message);
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // 1. Check if the requested file exists in dist/client
    let filePath = path.join(clientDir, pathname);
    let stat = null;
    try {
      stat = fs.statSync(filePath);
    } catch {}

    // If it's a directory, check for index.html inside it
    if (stat && stat.isDirectory()) {
      const subIndex = path.join(filePath, "index.html");
      try {
        if (fs.existsSync(subIndex)) {
          filePath = subIndex;
          stat = fs.statSync(filePath);
        }
      } catch {}
    }

    if (stat && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      if (pathname.startsWith("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }

      return fs.createReadStream(filePath).pipe(res);
    }

    // 2. Delegate to SSR Handler if available
    if (ssrHandler && typeof ssrHandler.fetch === "function") {
      const fullUrl = `http://${req.headers.host || "localhost"}${req.url}`;
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            for (const v of value) headers.append(key, v);
          } else {
            headers.set(key, value);
          }
        }
      }

      const webReq = new Request(fullUrl, {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
        duplex: "half",
      });

      const webRes = await ssrHandler.fetch(webReq);

      res.statusCode = webRes.status;
      webRes.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });

      const body = Buffer.from(await webRes.arrayBuffer());
      return res.end(body);
    }

    // 3. Fallback: serve root index.html for client-side routing
    const rootIndex = path.join(clientDir, "index.html");
    if (fs.existsSync(rootIndex)) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return fs.createReadStream(rootIndex).pipe(res);
    }

    res.statusCode = 404;
    res.end("Not Found: Run 'npm run build:cpanel' first to generate production assets.");
  } catch (err) {
    console.error("Server Error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Internal Server Error: " + err.message);
  }
});

// Port assigned by cPanel (Passenger) or Hostinger, defaulting to 3000
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`🌸 Atyab Al Zohour Server running at http://${HOST}:${PORT}`);
});
