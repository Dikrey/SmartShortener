import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RetroCard } from "@/components/RetroCard";
import { GlitchButton } from "@/components/GlitchButton";
import { RetroInput } from "@/components/RetroInput";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Copy, Clock, Rocket, Shield, Activity, Globe, Terminal } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/shorten", data);
      return res.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}/${data.shortCode}`;
      setShortenedUrl(fullUrl);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast({
        title: "COORDINATES SECURED",
        description: "Warp link generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "SYSTEM ERROR",
        description: error.message || "Failed to initialize link.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    mutation.mutate({ originalUrl: url, customCode: customCode || undefined, expiration });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    toast({ title: "COPIED TO HUD", description: "Link stored in clipboard memory." });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden">
      {showConfetti && <ReactConfetti width={width} height={height} colors={['#00ffff', '#ff00ff', '#ffff00']} />}
      
      <div className="scanline" />
      
      {/* HUD Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-12 glass-panel p-4 hud-border z-30">
        <div className="flex items-center gap-4">
          <Activity className="text-primary animate-pulse" />
          <div>
            <h2 className="text-xs font-hud text-primary leading-none">SYSTEM STATUS</h2>
            <p className="text-[10px] text-primary/70">OPERATIONAL // SECTOR 7G</p>
          </div>
        </div>
        
        <div className="text-center hidden md:block">
          <h1 className="text-2xl font-display glow-text">GALACTIC LINKER</h1>
          <p className="text-[10px] tracking-[0.3em] text-primary/50">INTERSTELLAR RELAY PROTOCOL v2.0</p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs font-hud text-primary">{time.toLocaleTimeString()}</p>
            <p className="text-[10px] text-primary/70">{time.toLocaleDateString()}</p>
          </div>
          <Globe className="text-primary animate-spin-slow" />
        </div>
      </header>

      <main className="w-full max-w-2xl mt-8 z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RetroCard title="COMMAND CONSOLE" className="glass-panel hud-border p-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-hud text-primary/70">DESTINATION URL</label>
                  <RetroInput
                    placeholder="https://galactic-outpost.com/data"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="bg-background/50 border-primary/30 text-primary placeholder:text-primary/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-hud text-primary/70">CUSTOM ALIAS (OPTIONAL)</label>
                    <RetroInput
                      placeholder="e.g. secret-data"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      className="bg-background/50 border-primary/30 text-primary placeholder:text-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-hud text-primary/70">EXPIRATION TIMER</label>
                    <Select value={expiration} onValueChange={setExpiration}>
                      <SelectTrigger className="bg-background/50 border-primary/30 text-primary font-mono h-11">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#07070a] border-primary/30 text-primary font-mono">
                        <SelectItem value="1m">1 MINUTE</SelectItem>
                        <SelectItem value="1h">1 HOUR</SelectItem>
                        <SelectItem value="1d">1 DAY</SelectItem>
                        <SelectItem value="1w">1 WEEK</SelectItem>
                        <SelectItem value="2w">2 WEEKS</SelectItem>
                        <SelectItem value="never">INFINITE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <GlitchButton
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full h-12 text-sm font-hud group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {mutation.isPending ? "INITIALIZING..." : "GENERATE WARP LINK"}
                    <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </GlitchButton>
              </form>

              <AnimatePresence>
                {shortenedUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-8 border-t border-primary/20"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-hud">WARP LINK ESTABLISHED</span>
                      </div>
                      <div className="flex gap-2">
                        <RetroInput
                          readOnly
                          value={shortenedUrl}
                          className="flex-1 bg-primary/10 border-primary/50 text-primary font-mono"
                        />
                        <GlitchButton onClick={copyToClipboard} className="px-4">
                          <Copy className="w-4 h-4" />
                        </GlitchButton>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </RetroCard>
        </motion.div>

        {/* System Stats Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: "UPTIME", value: "99.99%", icon: Clock },
            { label: "TRAFFIC", value: "ENCRYPTED", icon: Shield },
            { label: "SERVER", value: "NODE_CORE", icon: Globe }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-3 hud-border flex flex-col items-center gap-1">
              <stat.icon className="w-3 h-3 text-primary/50" />
              <span className="text-[8px] font-hud text-primary/40">{stat.label}</span>
              <span className="text-[10px] font-mono text-primary">{stat.value}</span>
            </div>
          ))}
        </div>
      </main>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
