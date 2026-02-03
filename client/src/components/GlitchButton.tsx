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
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity" />
      <span className="relative z-10 flex items-center justify-center gap-2 glow-text">
        {children}
      </span>
      
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-primary/50" />
      <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-primary/50" />
      <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-primary/50" />
      <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-primary/50" />
    </button>
  );
}
