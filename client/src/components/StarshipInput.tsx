import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Terminal, Eye, EyeOff } from "lucide-react";

interface StarshipInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean; // New prop
}

export const StarshipInput = forwardRef<HTMLInputElement, StarshipInputProps>(
  ({ className, label, error, isPassword, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full space-y-3">
        {label && (
          <label className="flex items-center gap-2 font-display text-sm text-primary/80 uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            type={isPassword && !showPassword ? "password" : type} // Conditionally set type
            className={cn(
              "w-full bg-slate-900/70 border border-primary/20 rounded-md px-4 py-3 font-mono text-slate-200 outline-none",
              "transition-all duration-300 ease-in-out",
              "placeholder:text-secondary/50",
              "focus:border-primary focus:shadow-[0_0_15px_hsl(var(--primary)/0.3),_0_0_25px_hsl(var(--primary)/0.2)_inset]",
              error && "border-destructive text-destructive focus:border-destructive focus:shadow-[0_0_15px_hsl(var(--destructive)/0.3)]",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-destructive text-xs font-mono mt-1">
            &gt; {error}
          </p>
        )}
      </div>
    );
  }
);
StarshipInput.displayName = "StarshipInput";
