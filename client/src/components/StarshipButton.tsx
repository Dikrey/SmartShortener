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
    "relative group w-full inline-flex items-center justify-center px-6 py-3 font-display text-lg uppercase tracking-widest outline-none transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-md";

  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:shadow-[0_0_25px_hsl(var(--primary)/0.7)]",
    destructive:
      "bg-destructive text-white hover:shadow-[0_0_25px_hsl(var(--destructive)/0.7)]",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_25px_hsl(var(--primary)/0.7)]",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {/* Grid overlay */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent" />
      
      <span className="relative z-10">{children}</span>

      {/* Shine effect */}
      <div className="absolute -left-full top-0 h-full w-1/2 origin-left-center -skew-x-[16deg] bg-gradient-to-r from-white/0 to-white/20 opacity-80 group-hover:left-full transition-all duration-500" />
    </button>
  );
}
