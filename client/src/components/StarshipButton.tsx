import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StarshipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive" | "outline";
}

export function StarshipButton({
  className,
  children,
  variant = "primary",
  ...props
}: StarshipButtonProps) {
  const baseStyles =
    "relative group w-full inline-flex items-center justify-center px-5 py-3 font-semibold text-sm uppercase tracking-widest outline-none transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-lg";

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md hover:shadow-lg hover:shadow-cyan-500/30 dark:hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] hover:from-cyan-400 hover:to-blue-500",
    destructive:
      "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg hover:shadow-red-500/30 hover:from-red-400 hover:to-rose-500",
    outline:
      "border-2 border-cyan-500 dark:border-primary text-cyan-700 dark:text-primary bg-transparent hover:bg-cyan-500 dark:hover:bg-primary hover:text-white dark:hover:text-primary-foreground hover:shadow-lg hover:shadow-cyan-500/30 dark:hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)]",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {/* Grid overlay */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Shine effect */}
      <div className="absolute -left-full top-0 h-full w-1/2 origin-left -skew-x-[16deg] bg-gradient-to-r from-white/0 to-white/15 opacity-0 group-hover:opacity-100 group-hover:left-full transition-all duration-500" />
    </button>
  );
}
