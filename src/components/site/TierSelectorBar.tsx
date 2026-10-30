import { useClientTier, CLIENT_TIERS, type ClientTier } from "@/features/b2b/tier-pricing";
import { Sparkles, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { sar } from "@/features/admin/data";

export function TierSelectorBar() {
  const [tier, setTier] = useClientTier();
  const current = CLIENT_TIERS[tier];

  return (
    <div className="border-b bg-forest/5 py-2 text-xs text-forest">
      <div className="container-x flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Sparkles className="size-3" />
          </span>
          <span className="font-semibold">شريحة تسعير الجملة:</span>
          <span className="rounded-md bg-white px-2 py-0.5 font-bold shadow-xs text-primary">
            {current.label}
          </span>
          {current.discountPercent > 0 && (
            <span className="hidden sm:inline font-bold text-rose">
              (خصم معتمد {current.discountPercent}% على كامل الكتالوج)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-muted-foreground">
            الحد الأدنى للطلب: <strong className="text-forest">{sar(current.minOrderSar)}</strong>
          </span>

          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-lg border bg-surface px-2.5 py-1 font-bold text-forest shadow-xs hover:bg-muted transition">
              <span>تغيير الشريحة</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1.5">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                حدد شريحة الحساب لاستعراض الأسعار المخصصة:
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(CLIENT_TIERS) as ClientTier[]).map((tKey) => {
                const t = CLIENT_TIERS[tKey];
                const active = tier === tKey;
                return (
                  <DropdownMenuItem
                    key={tKey}
                    onClick={() => setTier(tKey)}
                    className={`flex items-center justify-between gap-2 cursor-pointer py-2 ${
                      active ? "bg-primary/10 font-bold text-primary" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        خصم {t.discountPercent}% · حد أدنى {sar(t.minOrderSar)}
                      </p>
                    </div>
                    {active && <Check className="size-4 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

