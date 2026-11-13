import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  rangeClassName?: string;
  thumbClassName?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue = [0],
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      rangeClassName,
      thumbClassName,
      ...props
    },
    ref
  ) => {
    const currentValue = (value && value.length > 0 ? value[0] : defaultValue[0]) ?? min;
    const percentage = Math.max(0, Math.min(100, ((currentValue - min) / (max - min || 1)) * 100));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = Number(e.target.value);
      onValueChange?.([num]);
    };

    return (
      <div
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-rose/20">
          <div
            className={cn("absolute h-full bg-rose transition-all start-0", rangeClassName)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentValue}
        />
        <div
          className={cn(
            "pointer-events-none absolute size-4.5 rounded-full border-2 border-rose bg-background shadow-xs -translate-x-1/2 rtl:translate-x-1/2 transition-transform hover:scale-110",
            thumbClassName
          )}
          style={{ insetInlineStart: `${percentage}%` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";
