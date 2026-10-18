import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";

export function PageBanner({ title, subtitle, crumb }: { title: string; subtitle?: string; crumb: string }) {
  return (
    <section className="relative overflow-hidden bg-forest">
      <img src={hero} alt="" className="absolute inset-0 size-full object-cover opacity-35" width={1920} height={1088} />
      <div className="absolute inset-0 bg-gradient-to-l from-forest via-forest/85 to-forest/30" />
      <div className="container-x relative py-16 md:py-20">
        <nav className="mb-3 text-sm text-forest-foreground/75">
          <Link to="/" className="hover:text-gold">الرئيسية</Link> <span className="mx-1.5">/</span> <span className="text-gold">{crumb}</span>
        </nav>
        <h1 className="text-4xl md:text-5xl !text-forest-foreground">{title}</h1>
        {subtitle && <p className="mt-4 max-w-xl text-lg leading-8 text-forest-foreground/85">{subtitle}</p>}
      </div>
    </section>
  );
}
