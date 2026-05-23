import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Terminal, Eye, EyeOff } from "lucide-react";

interface StarshipInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  isInvalid?: boolean;
}

export const StarshipInput = forwardRef<HTMLInputElement, StarshipInputProps>(
  ({ className, label, error, isPassword, type, isInvalid, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const effectiveError = error || (isInvalid ? "Input tidak valid" : undefined);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-primary/80 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            type={isPassword && !showPassword ? "password" : type}
            className={cn(
              "w-full rounded-lg px-4 py-3 text-sm outline-none",
              "font-mono transition-all duration-300",
              "bg-sky-50 dark:bg-slate-900/70",
              "border border-cyan-200 dark:border-primary/20",
              "text-gray-900 dark:text-slate-200",
              "placeholder:text-gray-400 dark:placeholder:text-slate-500",
              "focus:border-cyan-500 dark:focus:border-primary",
              "focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] dark:focus:shadow-[0_0_15px_hsl(var(--primary)/0.3),0_0_25px_hsl(var(--primary)/0.15)_inset]",
              "focus:bg-white dark:focus:bg-slate-900/90",
              effectiveError && "border-red-400 dark:border-destructive text-red-700 dark:text-destructive focus:border-red-400 dark:focus:border-destructive focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {effectiveError && (
          <p className="text-red-600 dark:text-destructive text-xs font-medium mt-1 flex items-center gap-1">
            <span className="text-red-500">▸</span> {effectiveError}
          </p>
        )}
      </div>
    );
  }
);
StarshipInput.displayName = "StarshipInput";
