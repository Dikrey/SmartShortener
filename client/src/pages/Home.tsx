import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Copy, Clock, CheckCircle2, Terminal } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { createUrlRequestSchema, type CreateUrlRequest } from "@shared/schema";
import { useCreateUrl } from "@/hooks/use-urls";
import { useToast } from "@/hooks/use-toast";
import { RetroCard } from "@/components/RetroCard";
import { RetroInput } from "@/components/RetroInput";
import { GlitchButton } from "@/components/GlitchButton";

export default function Home() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const { width, height } = useWindowSize();
  const { toast } = useToast();
  
  const createUrl = useCreateUrl();
  
  const form = useForm<CreateUrlRequest>({
    resolver: zodResolver(createUrlRequestSchema),
    defaultValues: {
      originalUrl: "",
      customCode: "",
      expiration: "never",
    },
  });

  const onSubmit = (data: CreateUrlRequest) => {
    // Treat empty string as undefined for optional fields
    const payload = {
      ...data,
      customCode: data.customCode || undefined,
    };
    
    createUrl.mutate(payload, {
      onSuccess: (data) => {
        const url = `${window.location.origin}/${data.shortCode}`;
        setShortUrl(url);
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const copyToClipboard = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "COPIED TO CLIPBOARD",
      description: "READY FOR DEPLOYMENT.",
      className: "font-mono border-2 border-primary bg-black text-primary rounded-none box-shadow-retro"
    });
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Scanline Overlay */}
      <div className="scanline" />
      
      {shortUrl && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} colors={['#39FF14', '#FF00FF', '#FFFF00']} />}

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 text-center z-20"
      >
        <h1 className="text-4xl md:text-6xl mb-2 text-shadow-retro">
          LINK SHORTENER<br/>
          <span className="text-secondary">9000</span>
        </h1>
        <p className="text-accent font-mono text-sm md:text-base tracking-widest">
          SYSTEM_READY // WAITING_FOR_INPUT
        </p>
      </motion.div>

      <div className="w-full max-w-2xl z-20 space-y-8">
        <RetroCard title="COMMAND CONSOLE">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <RetroInput
              {...form.register("originalUrl")}
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              label="TARGET_URL"
              error={form.formState.errors.originalUrl?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetroInput
                {...form.register("customCode")}
                placeholder="my-cool-link"
                label="CUSTOM_ALIAS (OPTIONAL)"
                error={form.formState.errors.customCode?.message}
              />

              <div className="space-y-2">
                <label className="block font-display text-xs text-primary uppercase tracking-widest mb-1">
                  {'>'} SELF_DESTRUCT_TIMER
                </label>
                <select
                  {...form.register("expiration")}
                  className="w-full bg-black border-2 border-primary/50 text-primary p-4 font-mono outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all appearance-none cursor-pointer"
                >
                  <option value="never">NEVER (PERMANENT)</option>
                  <option value="1m">1 MINUTE</option>
                  <option value="1h">1 HOUR</option>
                  <option value="1d">1 DAY</option>
                  <option value="1w">1 WEEK</option>
                  <option value="2w">2 WEEKS</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <GlitchButton 
                type="submit" 
                className="w-full"
                disabled={createUrl.isPending}
              >
                {createUrl.isPending ? (
                  <span className="animate-pulse">PROCESSING...</span>
                ) : (
                  <>INITIATE_SHORTENING <Terminal className="w-5 h-5" /></>
                )}
              </GlitchButton>
            </div>
          </form>
        </RetroCard>

        <AnimatePresence>
          {shortUrl && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <RetroCard variant="secondary" title="MISSION ACCOMPLISHED" className="mt-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full bg-black/50 border border-secondary/30 p-4 font-mono text-secondary break-all">
                    {shortUrl}
                  </div>
                  <GlitchButton 
                    variant="secondary"
                    onClick={copyToClipboard}
                    className="w-full md:w-auto whitespace-nowrap"
                  >
                    COPY_DATA <Copy className="w-4 h-4" />
                  </GlitchButton>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-secondary/70 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>LINK SECURED ON SERVER</span>
                </div>
              </RetroCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-16 text-muted-foreground font-mono text-xs text-center z-20">
        <p>SECURE CONNECTION ESTABLISHED v1.0.4</p>
        <p className="opacity-50 mt-1">NO LOGS KEPT. ANONYMITY GUARANTEED.</p>
      </footer>
    </div>
  );
}
