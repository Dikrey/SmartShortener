import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";

import { useResolveUrl } from "@/hooks/use-urls";
import { RetroCard } from "@/components/RetroCard";
import { GlitchButton } from "@/components/GlitchButton";
import { Link } from "wouter";

export default function Redirect() {
  const [match, params] = useRoute("/:code");
  const code = params?.code || "";
  const { data, isLoading, error } = useResolveUrl(code);
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    if (data) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = data.originalUrl;
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
          <Loader2 className="w-16 h-16 text-secondary" />
        </motion.div>
        <h2 className="text-xl md:text-2xl font-display animate-pulse text-center">
          ESTABLISHING UPLINK...
        </h2>
        <div className="mt-4 w-64 h-2 bg-black border border-primary p-0.5">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5 }}
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="scanline" />
        <RetroCard variant="danger" title="SYSTEM FAILURE" className="max-w-md w-full text-center z-10">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="w-16 h-16 text-destructive animate-pulse" />
          </div>
          <h1 className="text-2xl font-display mb-4 text-destructive">LINK LOST</h1>
          <p className="font-mono text-sm mb-8 text-destructive/80">
            THE REQUESTED COORDINATES ARE INVALID OR HAVE EXPIRED FROM THE MAINFRAME.
          </p>
          <Link href="/">
            <GlitchButton variant="secondary" className="w-full">
              RETURN TO BASE
            </GlitchButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline" />
      
      <RetroCard title="TARGET LOCKED" className="max-w-xl w-full text-center z-10">
        <div className="mb-8">
          <p className="font-mono text-sm text-muted-foreground mb-2">DESTINATION:</p>
          <p className="font-mono text-accent break-all bg-accent/10 p-4 border border-accent/30">
            {data.originalUrl}
          </p>
        </div>

        <div className="mb-8 flex flex-col items-center">
          <div className="text-6xl font-display text-secondary mb-2">
            {countdown}
          </div>
          <p className="text-xs font-mono text-secondary animate-pulse">
            AUTO-JUMP INITIATED
          </p>
        </div>

        <GlitchButton 
          onClick={() => window.location.href = data.originalUrl}
          className="w-full"
        >
          JUMP NOW <ExternalLink className="w-5 h-5" />
        </GlitchButton>
        
        <div className="mt-6">
           <Link href="/" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors underline decoration-dotted">
              CANCEL JUMP
           </Link>
        </div>
      </RetroCard>
    </div>
  );
}
