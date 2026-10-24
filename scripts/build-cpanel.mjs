import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const clientDir = path.join(distDir, "client");
const serverDir = path.join(distDir, "server");
const outputDir = path.join(rootDir, "dist-cpanel");

console.log("🌸 Starting cPanel & hPanel Build Process...");

// Step 1: Run standard Vite build
console.log("\n📦 [1/5] Building client and server bundles with Vite...");
execSync("npx vite build", { cwd: rootDir, stdio: "inherit" });

// Step 2: Dynamically import server entry to prerender static pages
console.log("\n⚡ [2/5] Prerendering static HTML for all routes...");
const serverModulePath = path.join(serverDir, "server.js");
const { default: server } = await import(`file://${serverModulePath}`);

const routes = [
  "/",
  "/about",
  "/products",
  "/categories",
  "/offers",
  "/services",
  "/contact",
  "/quote",
  "/login",
  "/register",
  "/dashboard",
  "/dashboard/orders",
  "/dashboard/track",
  "/dashboard/support",
  "/dashboard/profile",
  "/courier",
  "/courier/tasks",
  "/courier/map",
  "/courier/support",
  "/courier/profile",
  // Product details pages
  "/products/red-naomi-rose",
  "/products/pink-rose",
  "/products/white-oriental-lily",
  "/products/pink-carnation",
  "/products/mixed-chrysanthemum",
  "/products/gypsophila-xlence",
  "/products/eucalyptus",
  "/products/seasonal-peony-tulip",
  "/products/florist-supplies-kit",
];

for (const route of routes) {
  try {
    const req = new Request(`http://localhost${route}`);
    const res = await server.fetch(req);
    const html = await res.text();

    const targetSubdir =
      route === "/" ? clientDir : path.join(clientDir, ...route.split("/").filter(Boolean));
    fs.mkdirSync(targetSubdir, { recursive: true });
    fs.writeFileSync(path.join(targetSubdir, "index.html"), html, "utf-8");
    console.log(
      `  ✓ Prerendered: ${route} -> ${path.relative(clientDir, path.join(targetSubdir, "index.html"))}`,
    );
  } catch (err) {
    console.error(`  ✗ Failed to prerender ${route}:`, err.message);
  }
}

// Step 3: Copy client assets to dist-cpanel directory
console.log("\n📁 [3/5] Packaging static files into 'dist-cpanel/'...");
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.cpSync(clientDir, outputDir, { recursive: true });

// Step 4: Generate production .htaccess for cPanel & hPanel (Apache / LiteSpeed)
console.log("\n🔒 [4/5] Generating production .htaccess for Apache / LiteSpeed...");

const htaccessContent = `# =======================================================================
# Atyab Al Zohour - Production .htaccess for cPanel & Hostinger hPanel
# =======================================================================

# 1. Default Directory Index (Critical for cPanel / LiteSpeed / Apache)
DirectoryIndex index.html index.htm

# 2. UTF-8 Encoding
AddDefaultCharset UTF-8
AddCharset UTF-8 .html .css .js .mjs .json .svg

# 3. MIME Types for Modern Web Formats
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType image/svg+xml .svg
  AddType image/webp .webp
  AddType font/woff .woff
  AddType font/woff2 .woff2
  AddType application/json .json
</IfModule>

# 4. Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# 5. Gzip & Deflate Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# 6. Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"

  # HTML files (no-cache so updates propagate immediately)
  ExpiresByType text/html "access plus 0 seconds"

  # Static Assets with content hash (1 year)
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(js|mjs|css|png|jpg|jpeg|webp|svg|woff|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

# 7. Rewrite Engine (HTTPS & SPA Fallback)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite real files or directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Check if route subfolder has an index.html (e.g. /about -> /about/index.html)
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteRule ^(.*)$ $1/index.html [L]

  # Single Page Application (SPA) Fallback
  RewriteRule ^ index.html [L]
</IfModule>
`;

fs.writeFileSync(path.join(outputDir, ".htaccess"), htaccessContent, "utf-8");
fs.writeFileSync(path.join(clientDir, ".htaccess"), htaccessContent, "utf-8");

console.log("  ✓ Created: dist-cpanel/.htaccess");

// Step 5: Verify dist-cpanel ready
const files = fs.readdirSync(outputDir);
console.log(`\n🎉 [5/6] Static files packaged into 'dist-cpanel/'.`);
console.log(`   Contents: ${files.join(", ")}`);

// Step 6: Create dist-cpanel.zip for 1-click cPanel File Manager upload
console.log(`\n📦 [6/6] Creating 'dist-cpanel.zip' for 1-click cPanel File Manager upload...`);
const zipFile = path.join(rootDir, "dist-cpanel.zip");
try {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path dist-cpanel\\* -DestinationPath dist-cpanel.zip -Force"`,
      { cwd: rootDir, stdio: "inherit" },
    );
  } else {
    execSync(`zip -r dist-cpanel.zip dist-cpanel/*`, { cwd: rootDir, stdio: "inherit" });
  }
  const zipSize = (fs.statSync(zipFile).size / (1024 * 1024)).toFixed(2);
  console.log(`  ✓ Created: dist-cpanel.zip (${zipSize} MB)`);
} catch (e) {
  console.log(`  ⚠ Notice: Could not create zip archive automatically (${e.message})`);
}

console.log(`\n🚀 All build files are ready!`);
console.log(`   1. Fast upload: Drag & drop 'dist-cpanel.zip' into 'public_html/' and click 'Extract'.`);
console.log(`   2. Or folder: Upload all contents of 'dist-cpanel/' into 'public_html/'.`);
console.log(`   3. Node.js SSR: Run 'node server.js' via cPanel Setup Node.js App.`);

