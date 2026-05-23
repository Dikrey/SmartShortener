import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Link as LinkIcon, Rocket, Check, Terminal, Activity,
  ShieldCheck, Zap, History, Globe, Cpu, Gauge, QrCode,
  BarChart3, Download, Share2, ExternalLink, Sparkles, Layers,
  LockKeyhole, RefreshCw, Eye, Github, Twitter, Linkedin, Trash2,
  Sun, Moon, Menu, X,
} from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import QRCode from "react-qr-code";
import { FaWhatsapp as WhatsappIcon } from "react-icons/fa";

import { StarshipCard } from "@/components/StarshipCard";
import { StarshipInput } from "@/components/StarshipInput";
import { StarshipButton } from "@/components/StarshipButton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTypewriter } from "@/hooks/useTypewriter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [password, setPassword] = useState("");
  const [honeypotInput, setHoneypotInput] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("shortenedUrlHistory");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroTitle = useTypewriter("SMARTSHORTENER: ULTIMATE LINK COMPRESSION", 65);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(code);
  };

  useEffect(() => {
    generateCaptcha();
    try { localStorage.setItem("shortenedUrlHistory", JSON.stringify(history)); } catch {}
  }, [history]);

  const mutation = useMutation({
    mutationFn: async (data: {
      originalUrl: string; customCode?: string; expiration: string;
      password?: string; honeypot?: string;
    }) => {
      const res = await apiRequest("POST", "/api/shorten", data);
      return res.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.protocol}//${window.location.host}/${data.shortCode}`;
      setShortenedUrl(fullUrl);
      setHistory(prev => [{
        id: data.id, original: url, code: data.shortCode,
        time: new Date().toLocaleTimeString(), clicks: 0,
        createdAt: new Date(), fullUrl,
      }, ...prev].slice(0, 10));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast({ title: "✅ Link Berhasil Dibuat!", description: "Tautan pendek Anda sudah siap digunakan." });
      setPassword(""); setHoneypotInput(""); setUrl(""); setCustomCode("");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Gagal Membuat Link",
        description: error.message || "Terjadi kesalahan. Coba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({ title: "URL Diperlukan", description: "Masukkan URL yang ingin dipersingkat.", variant: "destructive" });
      return;
    }
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setShowCaptchaError(true);
      toast({ title: "Verifikasi Gagal", description: "Kode verifikasi salah. Coba lagi.", variant: "destructive" });
      setCaptchaInput(""); generateCaptcha(); return;
    }
    setCaptchaInput(""); generateCaptcha(); setShowCaptchaError(false);
    mutation.mutate({ originalUrl: url, customCode: customCode || undefined, expiration, password: password || undefined, honeypot: honeypotInput || undefined });
  };

  const copyToClipboard = (urlToCopy: string, index?: number) => {
    navigator.clipboard.writeText(urlToCopy);
    toast({ title: "Tersalin!", description: "Tautan berhasil disalin ke clipboard." });
    setIsCopied(true);
    if (index !== undefined) setCopiedIndex(index);
    setTimeout(() => { setIsCopied(false); setCopiedIndex(null); }, 2000);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      toast({ title: "Dihapus", description: "Riwayat tautan berhasil dihapus." });
      return updated;
    });
  };

  const clearAllHistory = () => {
    if (window.confirm("Hapus semua riwayat tautan?")) {
      setHistory([]);
      toast({ title: "Riwayat Dihapus", description: "Semua riwayat telah dihapus." });
    }
  };

  const shareLink = (platform: string, shareUrl: string) => {
    const text = "Cek tautan pendek ini dari SmartShortener!";
    let target = "";
    if (platform === "copy") { copyToClipboard(shareUrl); return; }
    else if (platform === "twitter") target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    else if (platform === "linkedin") target = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`;
    else if (platform === "whatsapp") target = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`;
    if (target) window.open(target, "_blank");
  };

  const faqData = [
    { question: "Siapa Developer Website ini?", answer: "Developer Website ini adalah Raihan_official0307 X Visualcodepo. Kunjungi https://talk.visualcodepo.my.id untuk bertanya atau melaporkan bug." },
    { question: "Apa itu Starlink Command?", answer: "Starlink Command adalah layanan pemendek URL canggih yang mengkompresi tautan panjang menjadi tautan pendek, dilengkapi QR Code, riwayat tautan, dan keamanan data." },
    { question: "Apakah Starlink Command gratis?", answer: "Ya, fitur dasar sepenuhnya gratis. Fitur premium akan tersedia di masa mendatang." },
    { question: "Bagaimana cara kerja Kode QR?", answer: "Setiap tautan pendek otomatis menghasilkan QR Code yang dapat dipindai atau diunduh untuk akses cepat." },
    { question: "Apakah tautan yang dipersingkat aman?", answer: "Kami menggunakan enkripsi untuk mengamankan setiap tautan. Proteksi password juga tersedia untuk keamanan tambahan." },
    { question: "Bisakah saya melihat riwayat tautan?", answer: "Ya, di tab Riwayat Anda dapat melihat 10 tautan terakhir yang dibuat di sesi browser ini." },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/40 to-cyan-50/30 dark:from-[#020617] dark:via-[#0a0e27] dark:to-[#0f172a] text-gray-900 dark:text-slate-200 overflow-y-auto overflow-x-hidden relative selection:bg-cyan-500/30 pb-20 transition-colors duration-400">

        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.07),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />
        {/* Animated orbs (dark mode only) */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 1.4, 0.8], opacity: [0, 0.15, 0.05, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 18 + i * 3, repeat: Infinity, ease: "linear", delay: i * 4 }}
            className="absolute rounded-full bg-cyan-500/20 dark:bg-cyan-500/10 hidden dark:block"
            style={{
              width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
              top: `${10 + i * 20}%`, left: `${15 + i * 22}%`,
              filter: "blur(40px)", zIndex: 0,
            }}
          />
        ))}

        {showConfetti && <ReactConfetti width={width} height={height} colors={["#06b6d4", "#3b82f6", "#8b5cf6", "#ffffff", "#f59e0b"]} />}
        <div className="scanline" />

        {/* ── HEADER ── */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 h-16 md:h-18 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="p-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 shadow-sm dark:shadow-cyan-500/10"
            >
              <Rocket className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </motion.div>
            <div>
              <span className="font-bold tracking-[0.2em] uppercase text-sm text-cyan-700 dark:text-cyan-400">
                Starlink Command
              </span>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">v4.2.0 PRO</div>
            </div>
          </div>

          {/* Desktop Status Bar */}
          <div className="hidden md:flex items-center gap-6 text-[10px] font-mono tracking-tighter">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 dark:text-green-400">SYSTEM: OPTIMAL</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
              <Globe className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <span>REGION: EARTH_01</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
              <ShieldCheck className="w-3 h-3 text-purple-500 dark:text-purple-400" />
              <span>SSL: ACTIVE</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-slate-300 transition-all duration-200 border border-gray-200 dark:border-white/10"
                  data-testid="button-theme-toggle"
                >
                  <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent><p>{theme === "dark" ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}</p></TooltipContent>
            </Tooltip>
          </div>
        </motion.header>

        {/* ── HERO ── */}
        <section className="relative z-10 text-center py-10 md:py-16 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-mono mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            TRANSMISSION SYSTEM ONLINE
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white uppercase tracking-wide leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {heroTitle}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-cyan-500 dark:text-cyan-400"
            >_</motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-4 text-sm md:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Kompresi tautan superior. Cepat, aman, dan futuristik untuk navigasi lintas platform.
          </motion.p>
        </section>

        {/* ── MAIN LAYOUT ── */}
        <main className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-10">

          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-5 hidden lg:block">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
              {/* Analytics */}
              <div className="p-5 bg-white/80 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl backdrop-blur-sm shadow-sm dark:shadow-none transition-colors">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-4">
                  <BarChart3 className="w-3 h-3" /> Core Analytics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Links Created", val: "1,247", change: "+12%", color: "bg-cyan-500" },
                    { label: "Total Clicks", val: "8.5K", change: "+23%", color: "bg-blue-500" },
                    { label: "Avg. CTR", val: "6.8%", change: "+5%", color: "bg-purple-500" },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-slate-400">{stat.label}</span>
                        <span className="text-gray-900 dark:text-white font-mono font-semibold">{stat.val}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${60 + i * 12}%` }}
                            transition={{ duration: 1.5, delay: i * 0.2 }}
                            className={`h-full ${stat.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-mono">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-5 bg-white/80 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl backdrop-blur-sm shadow-sm dark:shadow-none transition-colors">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-4">
                  <Layers className="w-3 h-3" /> Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Bulk Shorten", icon: LinkIcon },
                    { label: "API Settings", icon: Terminal },
                    { label: "Export Data", icon: Download },
                  ].map(({ label, icon: Icon }, i) => (
                    <button key={i} className="w-full p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between group border border-gray-200 dark:border-transparent">
                      <span className="text-xs text-gray-600 dark:text-slate-300">{label}</span>
                      <Icon className="w-3 h-3 text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6 relative z-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-1 rounded-xl">
                  <TabsTrigger value="create" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm text-gray-500 dark:text-slate-400 transition-all">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Buat
                  </TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm text-gray-500 dark:text-slate-400 transition-all">
                    <History className="w-3.5 h-3.5 mr-1.5" /> Riwayat
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm text-gray-500 dark:text-slate-400 transition-all">
                    <LockKeyhole className="w-3.5 h-3.5 mr-1.5" /> Pengaturan
                  </TabsTrigger>
                </TabsList>

                {/* ── CREATE TAB ── */}
                <TabsContent value="create" className="mt-4">
                  <StarshipCard className="relative overflow-hidden group hover:shadow-cyan-500/20 dark:hover:shadow-cyan-500/20 hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-blue-500/3 opacity-50 dark:from-cyan-500/5 dark:to-blue-500/5" />
                    <div className="absolute -top-20 -right-20 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                      <Rocket className="w-56 h-56 rotate-45" />
                    </div>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10">
                      <div className="mb-6 border-l-2 border-cyan-500 dark:border-cyan-500 pl-4">
                        <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Buat Tautan Pendek
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-1">
                          Masukkan URL untuk dipersingkat
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <motion.div variants={itemVariants}>
                          <StarshipInput
                            label="URL Target"
                            placeholder="https://example.com/long-url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            required
                            data-testid="input-url"
                          />
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <motion.div variants={itemVariants}>
                            <StarshipInput
                              label="Alias Kustom (opsional)"
                              placeholder="nama-kustom"
                              value={customCode}
                              onChange={e => setCustomCode(e.target.value)}
                              data-testid="input-custom-code"
                            />
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-primary/80 uppercase tracking-wider">
                              <Terminal className="w-3.5 h-3.5" /> Kadaluarsa
                            </label>
                            <Select value={expiration} onValueChange={setExpiration}>
                              <SelectTrigger className="bg-sky-50 dark:bg-black/40 border-cyan-200 dark:border-white/10 text-gray-800 dark:text-slate-200 h-11 focus:ring-1 focus:ring-cyan-400 dark:focus:ring-primary/50" data-testid="select-expiration">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-200">
                                <SelectItem value="1h">1 Jam</SelectItem>
                                <SelectItem value="1d">1 Hari</SelectItem>
                                <SelectItem value="1w">1 Minggu</SelectItem>
                                <SelectItem value="2w">2 Minggu</SelectItem>
                                <SelectItem value="never">Selamanya</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                          <StarshipInput
                            label="Password (opsional)"
                            placeholder="Min. 6 karakter"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            isPassword
                            data-testid="input-password"
                          />
                        </motion.div>

                        {/* Honeypot (hidden) */}
                        <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
                          <StarshipInput label="Leave empty" name="honeypot" value={honeypotInput} onChange={e => setHoneypotInput(e.target.value)} tabIndex={-1} autoComplete="off" />
                        </div>

                        {/* CAPTCHA */}
                        <motion.div variants={itemVariants} className="space-y-3 p-4 bg-sky-50/80 dark:bg-white/[0.03] rounded-xl border border-cyan-200 dark:border-white/10">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-primary/80 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verifikasi Manusia
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 text-center font-mono text-xl md:text-2xl tracking-[0.3em] py-3 bg-white dark:bg-white/5 rounded-lg border border-cyan-300 dark:border-white/20 select-none text-gray-800 dark:text-slate-100 shadow-inner">
                              {captchaCode}
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" onClick={generateCaptcha} className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors border border-gray-200 dark:border-white/10" aria-label="Refresh CAPTCHA">
                                  <RefreshCw className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent><p>Ganti kode</p></TooltipContent>
                            </Tooltip>
                          </div>
                          <StarshipInput
                            placeholder="Ketik kode di atas"
                            value={captchaInput}
                            onChange={e => { setCaptchaInput(e.target.value); if (showCaptchaError) setShowCaptchaError(false); }}
                            isInvalid={showCaptchaError}
                            error={showCaptchaError ? "Kode verifikasi salah. Coba lagi." : undefined}
                            required
                            data-testid="input-captcha"
                          />
                        </motion.div>

                        <StarshipButton
                          type="submit"
                          disabled={mutation.isPending}
                          className="w-full py-4"
                          data-testid="button-submit"
                        >
                          <AnimatePresence mode="wait">
                            {mutation.isPending ? (
                              <motion.span key="loading" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                                <Rocket className="w-4 h-4 animate-bounce" />
                                Memproses...
                              </motion.span>
                            ) : (
                              <motion.span key="idle" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-300" />
                                Persingkat URL
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </StarshipButton>
                      </form>

                      {/* Result */}
                      <AnimatePresence>
                        {shortenedUrl && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-6 p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 rounded-xl relative"
                          >
                            <div className="absolute -top-3 left-5 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold rounded-full shadow-md">
                              ✅ LINK SIAP
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                              <div className="flex-1 font-mono text-cyan-700 dark:text-cyan-400 text-sm overflow-hidden min-w-0">
                                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block">
                                  {shortenedUrl}
                                </a>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {[
                                  { icon: isCopied ? Check : Copy, action: () => shareLink("copy", shortenedUrl), label: "Salin" },
                                  { icon: Twitter, action: () => shareLink("twitter", shortenedUrl), label: "Twitter" },
                                  { icon: Linkedin, action: () => shareLink("linkedin", shortenedUrl), label: "LinkedIn" },
                                  { icon: WhatsappIcon, action: () => shareLink("whatsapp", shortenedUrl), label: "WhatsApp" },
                                  { icon: QrCode, action: () => setShowQRCode(true), label: "QR Code" },
                                ].map(({ icon: Icon, action, label }, i) => (
                                  <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                      <motion.button
                                        onClick={action}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 bg-cyan-500/15 hover:bg-cyan-500 text-cyan-700 dark:text-cyan-400 hover:text-white rounded-lg transition-all"
                                      >
                                        <Icon className="w-4 h-4" />
                                      </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{label}</p></TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </StarshipCard>
                </TabsContent>

                {/* ── HISTORY TAB ── */}
                <TabsContent value="history" className="mt-4">
                  <StarshipCard>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Riwayat Transmisi
                      </h3>
                      {history.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={clearAllHistory} className="p-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white rounded-lg transition-all" aria-label="Hapus semua">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Hapus Semua</p></TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {history.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl"
                      >
                        <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 dark:text-slate-500 font-mono">Belum ada riwayat tautan.</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-3.5 bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-xl flex items-center gap-3 group border border-gray-200 dark:border-white/5 transition-colors"
                            data-testid={`card-history-${item.id}`}
                          >
                            <div className="flex-1 overflow-hidden min-w-0">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a href={item.fullUrl} target="_blank" rel="noopener noreferrer" className="block text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 truncate font-mono text-sm font-medium">
                                    {item.fullUrl}
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent><p className="max-w-xs break-all">{item.original}</p></TooltipContent>
                              </Tooltip>
                              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                                {item.original.length > 45 ? item.original.slice(0, 42) + "..." : item.original}
                              </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              {[
                                { icon: copiedIndex === i ? Check : Copy, action: () => copyToClipboard(item.fullUrl, i), label: "Salin", style: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white" },
                                { icon: QrCode, action: () => setShowQRCode(true), label: "QR Code", style: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500 hover:text-white" },
                                { icon: Trash2, action: () => deleteHistoryItem(item.id), label: "Hapus", style: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white" },
                              ].map(({ icon: Icon, action, label, style }, j) => (
                                <Tooltip key={j}>
                                  <TooltipTrigger asChild>
                                    <button onClick={action} className={`p-1.5 rounded-lg transition-all ${style}`} data-testid={`button-${label.toLowerCase()}-${item.id}`}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>{label}</p></TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </StarshipCard>
                </TabsContent>

                {/* ── SETTINGS TAB ── */}
                <TabsContent value="settings" className="mt-4">
                  <StarshipCard>
                    <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Pengaturan
                    </h3>
                    <div className="space-y-3">
                      {[
                        { icon: LockKeyhole, title: "Proteksi Password", desc: "Lindungi tautan dengan password" },
                        { icon: Globe, title: "Domain Kustom", desc: "Gunakan domain sendiri untuk tautan" },
                        { icon: Terminal, title: "Akses API", desc: "Buat API key untuk developer" },
                        { icon: Sun, title: "Tema", desc: theme === "dark" ? "Mode gelap aktif — klik untuk mode terang" : "Mode terang aktif — klik untuk mode gelap", action: toggleTheme },
                      ].map(({ icon: Icon, title, desc, action }, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center group cursor-pointer transition-colors"
                          onClick={action}
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h4>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <div className="p-2 bg-gray-200 dark:bg-white/10 group-hover:bg-cyan-500/20 rounded-lg transition-colors">
                            <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </StarshipCard>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Feature Showcase */}
            <section className="mt-8">
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Mengapa Starlink Command?
              </motion.h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Zap, title: "Sangat Cepat", description: "Buat tautan pendek dalam hitungan detik.", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10" },
                  { icon: QrCode, title: "QR Code Otomatis", description: "Setiap tautan dilengkapi QR Code siap pakai.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10" },
                  { icon: ShieldCheck, title: "Keamanan Tinggi", description: "Enkripsi dan proteksi password tersedia.", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/10" },
                  { icon: Share2, title: "Mudah Dibagikan", description: "Bagikan ke sosial media dengan satu klik.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="p-5 bg-white/80 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl flex items-start gap-4 hover:shadow-md dark:hover:shadow-none hover:border-cyan-300 dark:hover:border-white/20 transition-all"
                  >
                    <div className={`p-2.5 ${feature.bg} rounded-xl shrink-0`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="mt-8">
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center mb-6"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                FAQ: Tanya Jawab
              </motion.h3>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqData.map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <AccordionItem value={`item-${i}`} className="border border-gray-200 dark:border-white/10 rounded-xl px-4 bg-white/60 dark:bg-white/[0.02]">
                      <AccordionTrigger className="text-sm font-medium text-gray-800 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-400 py-4 text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 dark:text-slate-400 pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3 space-y-5 hidden lg:block">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
              {/* Real-time stats */}
              <div className="p-5 bg-white/80 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl backdrop-blur-sm shadow-sm dark:shadow-none">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-4">
                  <Activity className="w-3 h-3" /> Real-time Data
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Active Probes", val: "128", icon: Activity },
                    { label: "Data Packets", val: "5.2M", icon: Globe },
                    { label: "Threat Level", val: "LOW", icon: ShieldCheck },
                  ].map((metric, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                        <metric.icon className="w-3 h-3" /> {metric.label}
                      </div>
                      <span className="font-mono text-gray-900 dark:text-white font-semibold">{metric.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security notice */}
              <div className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-transparent border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Transmisi Terenkripsi</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">
                  Semua tautan dienkripsi sebelum disimpan. Keamanan data Anda adalah prioritas kami.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Semua Sistem Normal</span>
                </div>
              </div>

              {/* Theme Quick Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between group hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                    {theme === "dark" ? "Mode Gelap" : "Mode Terang"}
                  </span>
                </div>
                <div className="w-10 h-5 rounded-full bg-gray-300 dark:bg-cyan-500/30 relative transition-colors">
                  <motion.div
                    animate={{ x: theme === "dark" ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-cyan-400 shadow-sm"
                  />
                </div>
              </motion.button>
            </motion.div>
          </aside>
        </main>

        {/* ── QR CODE MODAL ── */}
        <AnimatePresence>
          {showQRCode && shortenedUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowQRCode(false)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-xs w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">QR Code</h3>
                  <button onClick={() => setShowQRCode(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-center">
                  <QRCode value={shortenedUrl} size={180} />
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 text-center font-mono truncate">{shortenedUrl}</p>
                <StarshipButton className="mt-4" onClick={() => setShowQRCode(false)} variant="outline">
                  Tutup
                </StarshipButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FOOTER ── */}
        <footer className="fixed bottom-0 w-full h-9 bg-white/90 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 flex items-center justify-between px-4 md:px-8 text-[10px] font-mono z-30 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-green-500 animate-pulse">●</span>
            <span className="text-gray-400 dark:text-slate-600 hidden md:inline">STAR-SHORT // PROTOCOL: ACTIVE // v4.2.0-PRO</span>
            <span className="text-gray-400 dark:text-slate-600 md:hidden">STAR-SHORT v4.2.0</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-600 dark:text-green-400 font-semibold">ONLINE</span>
            <span className="text-gray-400 dark:text-slate-600 hidden md:inline">PING: 12ms</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
