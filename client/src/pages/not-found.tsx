import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { RetroCard } from "@/components/RetroCard";
import { GlitchButton } from "@/components/GlitchButton";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="scanline" />
      
      <RetroCard variant="danger" className="max-w-md w-full text-center z-10">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive animate-bounce" />
        </div>
        
        <h1 className="text-4xl font-display mb-4 text-destructive">404</h1>
        <p className="font-mono text-destructive mb-8">
          SECTOR NOT FOUND. THE VOID STARES BACK.
        </p>

        <Link href="/">
          <GlitchButton variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/20">
            EMERGENCY EVAC
          </GlitchButton>
        </Link>
      </RetroCard>
    </div>
  );
}
