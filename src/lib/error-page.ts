// Standalone HTML returned when the server cannot render a page (e.g. while the
// server is waking up or restarting). It retries automatically a few times so
// a short hiccup heals itself without the visitor doing anything.
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>جارٍ تحميل الصفحة…</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" />
    <style>
      body { font: 15px/1.6 Tajawal, system-ui, sans-serif; background: #FBF7F0; color: #2E2E2E; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; background: #fff; border: 1px solid #E5E7EB; border-radius: 1rem; box-shadow: 0 10px 30px -12px rgba(11,77,51,.18); }
      .spin { width: 2.5rem; height: 2.5rem; margin: 0 auto 1rem; border-radius: 50%; border: 3px solid #E8EFEA; border-top-color: #0B4D33; animation: s 0.9s linear infinite; }
      @keyframes s { to { transform: rotate(360deg); } }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #0B4D33; }
      p { color: #6B7280; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.55rem 1.1rem; border-radius: 0.6rem; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #0B4D33; color: #fff; }
      .secondary { background: #fff; color: #0B4D33; border-color: #D1D5DB; }
      .hidden { display: none; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spin" id="spin"></div>
      <h1 id="title">جارٍ تحميل الصفحة…</h1>
      <p id="msg">لحظات من فضلك، نعيد المحاولة تلقائيًا.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">إعادة المحاولة</button>
        <a class="secondary" href="/">الرئيسية</a>
      </div>
    </div>
    <script>
      (function () {
        var KEY = "atyab:auto-retry";
        var MAX = 4;
        var now = Date.now();
        var state = { n: 0, t: now };
        try { state = JSON.parse(sessionStorage.getItem(KEY) || "") || state; } catch (e) {}
        if (now - state.t > 60000) state = { n: 0, t: now };
        if (state.n < MAX) {
          state.n += 1; state.t = now;
          try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
          setTimeout(function () { location.reload(); }, 1500 * state.n);
        } else {
          try { sessionStorage.removeItem(KEY); } catch (e) {}
          document.getElementById("spin").className = "hidden";
          document.getElementById("title").textContent = "تعذّر تحميل الصفحة";
          document.getElementById("msg").textContent = "حدث خطأ ما. حاول التحديث أو العودة للرئيسية.";
        }
      })();
    </script>
  </body>
</html>`;
}
