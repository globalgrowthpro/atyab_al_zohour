# دليل رفع ونشر الموقع على cPanel و Hostinger hPanel

تم تجهيز طريقتين لنشر موقع **أطيب الزهور**:

---

## 🌟 الطريقة الأولى (الأسهل والأسرع): النشر كموقع ثابت SPA في `public_html`

هذه الطريقة تعمل على **جميع خطط الاستضافة المشتركة** في cPanel و Hostinger hPanel بدون الحاجة لتفعيل Node.js.

### خطوات الرفع السريع (بنقرة واحدة):
1. قم بتشغيل أمر البناء:
   ```bash
   npm run build:cpanel
   ```
2. سينتج ملف مضغوط جاهز اسمه **`dist-cpanel.zip`** ومجلد **`dist-cpanel/`** يحتويان على:
   - ملف **`.htaccess`** مجهز بالكامل (إعادة التوجيه إلى HTTPS، توجيه SPA، وضغط Gzip، والتخزين المؤقت).
   - ملفات HTML تم إنشاؤها مسبقاً (Prerendered) لجميع الـ 29 مساراً وصفحات المنتجات لضمان أسرع تحميل وأفضل أرشفة لمحركات البحث (SEO).
   - مجلد **`assets/`** لملفات الـ CSS والصور والأكواد.
3. افتح **File Manager** (مدير الملفات) في cPanel أو Hostinger hPanel.
4. ادخل إلى مجلد **`public_html`**.
5. اسحب ملف **`dist-cpanel.zip`** وافلته داخل `public_html/`.
6. اضغط بالزر الأيمن على الملف ثم اضغط **Extract** (استخراج).
   *(مبروك! موقعك الآن يعمل بكامل كفاءته وسرعته).*

---

## 🚀 الطريقة الثانية: النشر كتطبيق Node.js (SSR)

إذا كان لديك خيار **Setup Node.js App** في cPanel أو خيار Node.js في Hostinger:

1. قم بتشغيل أمر البناء:
   ```bash
   npm run build:cpanel
   ```
2. ادخل إلى **cPanel** > قسم **Software** > اضغط **Setup Node.js App**.
3. انقر على **Create Application**:
   - **Node.js version**: اختر 18 أو 20 أو 22.
   - **Application mode**: `Production`
   - **Application root**: المجلد الذي سترفع إليه المشروع (مثلاً `atyab_app`).
   - **Application startup file**: اكتب `server.js`.
4. ارفع ملفات المشروع التالية إلى مجلد التطبيق:
   - مجلد `dist/` بالكامل
   - ملف `server.js`
   - ملف `package.json`
5. اضغط **Run NPM Install** (أو شغّل `npm install --omit=dev`).
6. اضغط **Restart Application**.

---

## 🛠️ أوامر مفيدة في المشروع

- `npm run dev` : تشغيل خادم التطوير المحلي.
- `npm run build:cpanel` : بناء المشروع وتجهيز مجلد `dist-cpanel/` الجاهز للرفع بنقرة واحدة.
- `npm run start:cpanel` : تشغيل خادم Node.js المحلي للتجربة قبل الرفع.
