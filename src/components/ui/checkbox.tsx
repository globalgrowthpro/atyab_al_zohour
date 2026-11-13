import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean | "indeterminate";
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState<boolean | "indeterminate">(defaultChecked);
    const checked = isControlled ? controlledChecked : internalChecked;

    const isChecked = checked === true;
    const isIndeterminate = checked === "indeterminate";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const nextChecked = !isChecked;
      if (!isControlled) {
        setInternalChecked(nextChecked);
      }
      onCheckedChange?.(nextChecked);
      props.onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (disabled) return;
        const nextChecked = !isChecked;
        if (!isControlled) {
          setInternalChecked(nextChecked);
        }
        onCheckedChange?.(nextChecked);
      }
      props.onKeyDown?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        id={id}
        aria-checked={isIndeterminate ? "mixed" : isChecked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-state={isChecked ? "checked" : isIndeterminate ? "indeterminate" : "unchecked"}
        className={cn(
          "peer inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          isChecked || isIndeterminate
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-transparent border-input hover:border-primary/60",
          className
        )}
        {...props}
      >
        {isChecked && <Check className="size-3 stroke-[2.5]" />}
        {isIndeterminate && <Minus className="size-3 stroke-[2.5]" />}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
