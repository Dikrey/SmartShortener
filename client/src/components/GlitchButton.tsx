import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlitchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function GlitchButton({ 
  className, 
  children, 
  variant = "primary",
  disabled,
  ...props 
}: GlitchButtonProps) {
  
  const baseStyles = "relative px-8 py-4 font-mono font-bold uppercase tracking-wider transition-transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  const variants = {
    primary: "bg-primary text-black hover:bg-primary/90 box-shadow-retro",
    secondary: "bg-secondary text-black hover:bg-secondary/90 shadow-[4px_4px_0px_#FFFF00]",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 group-hover:animate-pulse">
        {children}
      </span>
      
      {/* Glitch Effect Layers */}
      {!disabled && (
        <>
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          <span className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1s_infinite]" />
        </>
      )}
    </button>
  );
}
