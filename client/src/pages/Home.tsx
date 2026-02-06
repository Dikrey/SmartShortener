import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Copy,
  Link as LinkIcon,
  Rocket,
  Check,
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  History,
  Globe,
  Cpu,
  Gauge,
  QrCode,
  BarChart3,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Layers,
  LockKeyhole,
  RefreshCw,
  Eye,
} from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import QRCode from "react-qr-code";

import { StarshipCard } from "@/components/StarshipCard";
import { StarshipInput } from "@/components/StarshipInput";
import { StarshipButton } from "@/components/StarshipButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTypewriter } from "@/hooks/useTypewriter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const floatVariants = {
  hidden: { y: 0 },
  visible: {
    y: [-10, 10, -10],
    transition: {
      repeat: Infinity,
      duration: 5,
      ease: "easeInOut",
    },
  },
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [password, setPassword] = useState(""); // New state for password
  const [honeypotInput, setHoneypotInput] = useState(""); // New state for honeypot
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  // const typedUrl = useTypewriter(shortenedUrl, 40); // Temporarily disabled
  const [isCopied, setIsCopied] = useState(false);
  // const { scrollYProgress } = useScroll(); // Temporarily disabled
  // const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -50]); // Temporarily disabled
  // const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]); // Temporarily disabled

  const mutation = useMutation({
    mutationFn: async (data: {
      originalUrl: string;
      customCode?: string;
      expiration: string;
      password?: string;
      honeypot?: string;
    }) => {
      const res = await apiRequest("POST", "/api/shorten", data);
      return res.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.protocol}//${window.location.host}/${data.shortCode}`;
      setShortenedUrl(fullUrl);
      setHistory((prev) =>
        [
          {
            id: data.id,
            url: url,
            code: data.shortCode,
            time: new Date().toLocaleTimeString(),
            clicks: 0,
            createdAt: new Date(),
          },
          ...prev,
        ].slice(0, 5),
      );
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast({
        title: "WARP DRIVE ACTIVE",
        description: "Coordinates secured and compressed.",
      });
      setPassword(""); // Clear password after successful shorten
      setHoneypotInput(""); // Clear honeypot after successful shorten
    },
    onError: (error: any) => {
      toast({
        title: "TRANSMISSION FAILED",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    mutation.mutate({
      originalUrl: url,
      customCode: customCode || undefined,
      expiration,
      password: password || undefined, // Pass password if not empty
      honeypot: honeypotInput || undefined, // Pass honeypot if not empty
    });
  };

  const copyToClipboard = (urlToCopy: string, index?: number) => {
    navigator.clipboard.writeText(urlToCopy);
    toast({
      title: "COORDINATES COPIED",
      description: "Ready for galactic navigation.",
    });
    setIsCopied(true);
    if (index !== undefined) setCopiedIndex(index);
    setTimeout(() => {
      setIsCopied(false);
      setCopiedIndex(null);
    }, 2000);
  };

  const shareLink = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this shortened link",
          text: "Created with Starlink Command",
          url: url,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const generateQRCode = () => {
    setShowQRCode(true);
  };

  return (
    <div className="min-h-screen galaxy-flow-bg bg-gradient-to-br from-[#020617] via-[#0a0e27] to-[#0f172a] text-slate-200 overflow-y-auto overflow-x-hidden relative selection:bg-cyan-500/30 pb-20">
      {/* Enhanced Background FX */}
      <div className="star-field opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

    {showConfetti && <ReactConfetti width={width} height={height} colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#ffffff', '#f59e0b']} />} 

      {/* Enhanced Header with Parallax Effect */}
      <motion.header className="h-20 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-8 relative z-50">
        <div className="flex items-center gap-3">
          <motion.div
            variants={floatVariants}
            initial="hidden"
            animate="visible"
            className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
          >
            <Rocket className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <div>
            <span className="font-display tracking-[0.3em] uppercase text-sm text-cyan-400">
              Starlink Command
            </span>
            <div className="text-xs text-slate-500 font-mono">v4.2.0 PRO</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] font-mono text-slate-500 tracking-tighter">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400">SYSTEM: OPTIMAL</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-blue-400" />
            <span>REGION: EARTH_01</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>SSL: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-orange-400" />
            <span>CPU: 12%</span>
          </div>
        </div>
      </motion.header>

      <main className="max-w-[1400px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 mb-10">
        {/* Enhanced Left Sidebar with Analytics */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4">
                <BarChart3 className="w-3 h-3" /> Core Analytics
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Links Created",
                    val: "1,247",
                    change: "+12%",
                    color: "bg-cyan-500",
                  },
                  {
                    label: "Total Clicks",
                    val: "8.5K",
                    change: "+23%",
                    color: "bg-blue-500",
                  },
                  {
                    label: "Avg. CTR",
                    val: "6.8%",
                    change: "+5%",
                    color: "bg-purple-500",
                  },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="text-white font-mono">{stat.val}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.random() * 40 + 60}%` }}
                          transition={{ duration: 1.5, delay: i * 0.2 }}
                          className={`h-full ${stat.color}`}
                        />
                      </div>
                      <span className="text-xs text-green-400">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4">
                <Layers className="w-3 h-3" /> Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="text-xs text-slate-300">Bulk Shorten</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="text-xs text-slate-300">API Settings</span>
                  <Terminal className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group">
                  <span className="text-xs text-slate-300">Export Data</span>
                  <Download className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Enhanced Main Content with Tabs */}
        <div className="lg:col-span-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-sm border border-white/10">
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Create
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                >
                  <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                >
                  <LockKeyhole className="w-4 h-4 mr-2" /> Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6">
                <StarshipCard className="relative overflow-hidden group hover:shadow-cyan-500/50 hover:border-cyan-500/50 transition-all duration-300">
                  {/* Enhanced Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-50" />
                  <div className="absolute -top-24 -right-24 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Rocket className="w-64 h-64 rotate-45" />
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10"
                  >
                    <div className="mb-8 border-l-2 border-cyan-500 pl-4">
                      <h2 className="text-xl font-display uppercase tracking-widest text-white">
                        Transmisi Link Baru
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-1 italic">
                        Input destinasi koordinat untuk kompresi data.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div variants={itemVariants}>
                        <StarshipInput
                          label="Target Coordinates (URL)"
                          placeholder="https://galaxy.io/deep-space-data"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                        />
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants}>
                          <StarshipInput
                            label="Custom Alias"
                            placeholder="x-wing-01"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                          />
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className="space-y-2"
                        >
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Expiration
                          </label>
                          <Select
                            value={expiration}
                            onValueChange={setExpiration}
                          >
                            <SelectTrigger className="bg-black/40 border-white/10 h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              <SelectItem value="1h">1 HOUR</SelectItem>
                              <SelectItem value="1d">1 DAY</SelectItem>
                              <SelectItem value="1w">1 WEEK</SelectItem>
                              <SelectItem value="1m">1 MONTH</SelectItem>
                              <SelectItem value="never">INFINITE</SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>
                      </div>

                      {/* Password Input Field */}
                      <motion.div variants={itemVariants}>
                        <StarshipInput
                          label="Password (optional)"
                          placeholder="Secure transmission key"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          isPassword // Use the new prop
                        />
                      </motion.div>

                      {/* Honeypot field for anti-spam */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-9999px",
                          top: "-9999px",
                          opacity: 0,
                          pointerEvents: "none",
                        }}
                      >
                        <StarshipInput
                          label="Leave this field empty"
                          name="honeypot"
                          value={honeypotInput}
                          onChange={(e) => setHoneypotInput(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      <StarshipButton
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full py-6 group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20"
                      >
                        <AnimatePresence mode="wait">
                          {mutation.isPending ? (
                            <motion.div
                              key="loading"
                              initial={{ y: 20 }}
                              animate={{ y: 0 }}
                              className="flex items-center gap-3"
                            >
                              <Rocket className="w-5 h-5 animate-bounce" />
                              <span className="tracking-widest">
                                LAUNCHING TRANSMISSION...
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="idle"
                              initial={{ y: -20 }}
                              animate={{ y: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="tracking-widest">
                                ENGAGE WARP DRIVE
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </StarshipButton>
                    </form>

                    {/* Enhanced Output Display */}
                    <AnimatePresence>
                      {shortenedUrl && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl relative group/output backdrop-blur-sm"
                        >
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[10px] font-bold rounded">
                            WARP LINK READY
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 font-mono text-cyan-400 text-sm overflow-hidden truncate">
                              {shortenedUrl}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(shortenedUrl)}
                                className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                              >
                                {isCopied ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => shareLink(shortenedUrl)}
                                className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={generateQRCode}
                                className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                              >
                                <QrCode className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </StarshipCard>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <StarshipCard className="p-6">
                  <h3 className="text-lg font-display uppercase tracking-widest text-white mb-6">
                    Link Analytics
                  </h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">
                          Total Clicks
                        </span>
                        <span className="text-xl font-bold text-cyan-400">
                          8,547
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">
                          Unique Visitors
                        </span>
                        <span className="text-xl font-bold text-purple-400">
                          3,421
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-400">
                          Conversion Rate
                        </span>
                        <span className="text-xl font-bold text-green-400">
                          12.4%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "40%" }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </StarshipCard>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <StarshipCard className="p-6">
                  <h3 className="text-lg font-display uppercase tracking-widest text-white mb-6">
                    Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-white">
                            Password Protection
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Require password to access links
                          </p>
                        </div>
                        <button className="p-2 bg-white/10 rounded-lg">
                          <LockKeyhole className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-white">
                            Custom Domain
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Use your own domain for links
                          </p>
                        </div>
                        <button className="p-2 bg-white/10 rounded-lg">
                          <Globe className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-white">
                            API Access
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Generate API keys for developers
                          </p>
                        </div>
                        <button className="p-2 bg-white/10 rounded-lg">
                          <Terminal className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </StarshipCard>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Enhanced Right Sidebar with History */}
        <aside className="lg:col-span-3 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                <History className="w-3 h-3" /> Recent Logs
              </h3>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-[10px] text-slate-600 font-mono italic">
                      No data transmissions found.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="w-full text-[10px] font-mono">
                      <thead className="text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="text-left pb-2">CODE</th>
                          <th className="text-right pb-2">CLICKS</th>
                          <th className="text-right pb-2">TIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.map((log, i) => (
                          <tr
                            key={i}
                            className="group hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 text-cyan-500/70">
                              {log.code}
                            </td>
                            <td className="py-2 text-right text-slate-500">
                              {log.clicks || 0}
                            </td>
                            <td className="py-2 text-right text-slate-500">
                              {log.time}
                            </td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `${window.location.protocol}//${window.location.host}/${log.code}`,
                                    i,
                                  )
                                }
                                className="p-1 rounded hover:bg-white/10 transition-colors"
                              >
                                {copiedIndex === i ? (
                                  <Check className="w-3 h-3 text-green-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">
                  Traffic Status
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Semua link dienkripsi melalui protokol Quantum-Tunneling sebelum
                disimpan di core database.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400">
                  All Systems Operational
                </span>
              </div>
            </div>
          </motion.div>
        </aside>
      </main>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRCode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display uppercase tracking-widest text-white">
                  QR Code
                </h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg flex justify-center">
                <QRCode value={shortenedUrl} size={200} />
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">
                Scan this code to quickly access the link
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Footer */}
      <footer className="fixed bottom-0 w-full h-10 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-8 text-[10px] font-mono text-slate-600 z-50">
        <div className="flex items-center gap-4">
          <span className="animate-pulse mr-2">●</span>
          <span>SECTOR: 07-G // PROTOCOL: STAR-SHORT // v.4.2.0-PRO</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-400">STATUS: ONLINE</span>
          <span>PING: 12ms</span>
        </div>
      </footer>

      <style>{`
        .font-display { font-family: 'Orbitron', sans-serif; }
        /* Mencegah kedip saat scroll di mobile */
  html, body {
    overscroll-behavior-y: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Memastikan partikel tidak menghalangi klik */
  .star-field {
    pointer-events: none;
    z-index: 0;
  }
        .star-field div {
           background-image: radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
                             radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0));
           background-size: 200px 200px;
        }
      `}</style>
    </div>
  );
}
