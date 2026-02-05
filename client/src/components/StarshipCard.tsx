import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StarshipCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function StarshipCard({ children, className, title }: StarshipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-lg p-6 md:p-8",
        className
      )}
    >
      {/* Corner Brackets */}
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/50" 
      />
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/50" 
      />
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/50" 
      />
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/50" 
      />

      {title && (
        <div className="mb-6">
          <h2 className="text-lg font-display text-primary glow-text uppercase tracking-widest">{title}</h2>
          <div className="h-px w-1/4 bg-primary/30 mt-2" />
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
