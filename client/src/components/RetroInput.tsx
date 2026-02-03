import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RetroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const RetroInput = forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block font-display text-xs text-primary uppercase tracking-widest mb-1">
            {'>'} {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              "w-full bg-black border-2 border-primary/50 text-primary p-4 font-mono outline-none",
              "focus:border-primary focus:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all",
              "placeholder:text-primary/30",
              error && "border-destructive text-destructive focus:border-destructive placeholder:text-destructive/30",
              className
            )}
            {...props}
          />
          {/* Scanline decoration on focus */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-focus-within:opacity-100 bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.1)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10" />
        </div>
        {error && (
          <p className="text-destructive text-xs font-mono mt-1 animate-pulse">
            [ERROR]: {error}
          </p>
        )}
      </div>
    );
  }
);
RetroInput.displayName = "RetroInput";
