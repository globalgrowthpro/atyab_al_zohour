import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { siteConfig } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-forest-foreground">
      <div className="gold-rule" />
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-block rounded-2xl bg-cream p-3">
            <img src={logo.url} alt="أطيب الزهور" className="h-20 w-auto" loading="lazy" />
          </div>
          <p className="max-w-sm leading-8 opacity-85">
            أطيب الزهور — توريد الورود الطبيعية بالجملة للمحلات والفنادق والشركات ومنظمي المناسبات في المملكة العربية السعودية.
          </p>
        </div>
        <FooterCol title="روابط سريعة" links={[["/", "الرئيسية"], ["/products", "المنتجات"], ["/offers", "عروض الجملة"], ["/about", "من نحن"], ["/contact", "تواصل معنا"]]} />
        <FooterCol title="خدماتنا" links={[["/services", "توريد الجملة"], ["/services", "حلول الفنادق والمطاعم"], ["/services", "المناسبات والأعراس"], ["/quote", "طلب عرض سعر"], ["/register", "حساب شركة"]]} />
        <div>
          <h4 className="mb-4 text-lg !text-gold">تواصل معنا</h4>
          <ul className="space-y-3 opacity-90">
            <li className="flex items-center gap-2"><MapPin className="size-4 text-gold" />{siteConfig.location}</li>
            {siteConfig.phone && <li className="flex items-center gap-2" dir="ltr"><Phone className="size-4 text-gold" />{siteConfig.phone}</li>}
            {siteConfig.email && <li className="flex items-center gap-2"><Mail className="size-4 text-gold" />{siteConfig.email}</li>}
            <li><Link to="/contact" className="underline underline-offset-4 hover:text-gold">نموذج التواصل</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-foreground/15">
        <div className="container-x flex flex-col gap-3 py-5 text-sm opacity-80 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} أطيب الزهور. جميع الحقوق محفوظة.</p>
          <div className="flex flex-wrap gap-4">
            <span>سياسة الخصوصية</span><span>الشروط والأحكام</span><span>سياسة التوصيل</span><span>سياسة الإرجاع والمطالبات</span>
          </div>
          <p dir="ltr">Developed by {siteConfig.developer}</p>
        </div>
      </div>
    </footer>
  );
}

type To = "/" | "/products" | "/offers" | "/about" | "/contact" | "/services" | "/quote" | "/register";
function FooterCol({ title, links }: { title: string; links: [To, string][] }) {
  return (
    <div>
      <h4 className="mb-4 text-lg !text-gold">{title}</h4>
      <ul className="space-y-2.5 opacity-90">
        {links.map(([to, l]) => (
          <li key={l}><Link to={to} className="hover:text-gold">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
