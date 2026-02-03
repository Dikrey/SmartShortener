import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RetroCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: "primary" | "secondary" | "accent" | "danger";
}

export function RetroCard({ children, className, title, variant = "primary" }: RetroCardProps) {
  const borderColor = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    danger: "border-destructive",
  }[variant];

  const shadowColor = {
    primary: "shadow-[8px_8px_0px_rgba(57,255,20,0.5)]",
    secondary: "shadow-[8px_8px_0px_rgba(255,0,255,0.5)]",
    accent: "shadow-[8px_8px_0px_rgba(255,255,0,0.5)]",
    danger: "shadow-[8px_8px_0px_rgba(255,0,0,0.5)]",
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className={cn(
        "relative bg-black border-2 p-6 md:p-8",
        borderColor,
        shadowColor,
        className
      )}
    >
      {/* Corner decorations */}
      <div className={cn("absolute -top-1 -left-1 w-3 h-3 bg-current", borderColor.replace("border-", "bg-"))} />
      <div className={cn("absolute -top-1 -right-1 w-3 h-3 bg-current", borderColor.replace("border-", "bg-"))} />
      <div className={cn("absolute -bottom-1 -left-1 w-3 h-3 bg-current", borderColor.replace("border-", "bg-"))} />
      <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 bg-current", borderColor.replace("border-", "bg-"))} />

      {title && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black px-4 py-1 border-2 border-inherit text-center">
          <h3 className={cn("text-xs md:text-sm whitespace-nowrap", borderColor.replace("border-", "text-"))}>
            {title}
          </h3>
        </div>
      )}

      {children}
    </motion.div>
  );
}
