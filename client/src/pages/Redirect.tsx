import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ExternalLink, Loader2, Rocket, Zap } from "lucide-react";

import { useResolveUrl } from "@/hooks/use-urls";
import { RetroCard } from "@/components/RetroCard";
import { GlitchButton } from "@/components/GlitchButton";
import { Link } from "wouter";

export default function Redirect() {
  const [, params] = useRoute("/:code");
  const code = params?.code || "";
  const { data, isLoading, error } = useResolveUrl(code);
  const [countdown, setCountdown] = useState(3);
  const [warping, setWarping] = useState(false);
  
  useEffect(() => {
    if (data) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setWarping(true);
            setTimeout(() => {
              window.location.href = data.originalUrl;
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-primary">
        <div className="scanline" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          className="mb-8"
        >
          <Loader2 className="w-16 h-16 text-primary" />
        </motion.div>
        <h2 className="text-xl font-display animate-pulse text-center">
          DECODING NEURAL UPLINK...
        </h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="scanline" />
        <RetroCard title="SYSTEM CRITICAL" className="max-w-md w-full text-center z-10 glass-panel hud-border p-6">
          <div className="flex justify-center mb-6 pt-4">
            <AlertTriangle className="w-16 h-16 text-destructive animate-bounce" />
          </div>
          <h1 className="text-2xl font-display mb-4 text-destructive">COORDINATES LOST</h1>
          <p className="font-mono text-sm mb-8 text-destructive/70">
            THE TARGET SIGNAL HAS DEGRADED OR NEVER EXISTED IN THIS SECTOR.
          </p>
          <Link href="/">
            <GlitchButton className="w-full bg-destructive text-white hover:bg-destructive/80">
              RETURN TO COMMAND
            </GlitchButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline" />
      
      <AnimatePresence>
        {warping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-white flex items-center justify-center"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-1 bg-primary shadow-[0_0_20px_#00ffff]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RetroCard title="WARP DRIVE ENGAGED" className="max-w-xl w-full text-center z-10 glass-panel hud-border p-6">
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-center gap-2 text-primary/60 mb-4 font-hud text-[10px]">
            <Rocket className="w-4 h-4" />
            TARGET ACQUIRED
          </div>
          <p className="font-mono text-xs text-primary/40 mb-2 uppercase tracking-tighter">VECTOR:</p>
          <p className="font-mono text-primary break-all bg-primary/5 p-4 border border-primary/20 rounded">
            {data.originalUrl}
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center">
          <motion.div 
            key={countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-display text-primary glow-text mb-2"
          >
            {countdown}
          </motion.div>
          <p className="text-[10px] font-hud text-secondary animate-pulse flex items-center gap-2">
            <Zap className="w-3 h-3" />
            STABILIZING SINGULARITY
          </p>
        </div>

        <div className="space-y-4">
          <GlitchButton 
            onClick={() => {
              setWarping(true);
              setTimeout(() => {
                window.location.href = data.originalUrl;
              }, 500);
            }}
            className="w-full h-14"
          >
            INITIATE JUMP NOW <ExternalLink className="w-5 h-5 ml-2" />
          </GlitchButton>
          
          <Link href="/">
            <button className="text-[10px] font-hud text-primary/30 hover:text-primary/60 transition-colors uppercase">
              ABORT MISSION
            </button>
          </Link>
        </div>
      </RetroCard>
    </div>
  );
}
