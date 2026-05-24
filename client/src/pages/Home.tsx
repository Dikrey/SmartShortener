import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Link as LinkIcon, Rocket, Check, Terminal, Activity,
  ShieldCheck, Zap, History, Globe, QrCode,
  BarChart3, Download, Share2, Sparkles, Layers,
  LockKeyhole, RefreshCw, Eye, Twitter, Linkedin, Trash2,
  Sun, Moon, X, TrendingUp, CalendarClock, Calendar,
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

const CHART_DATA = [42, 68, 55, 80, 63, 91, 75, 88, 70, 95, 82, 100];
const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [customDays, setCustomDays] = useState(7);
  const [password, setPassword] = useState("");
  const [honeypotInput, setHoneypotInput] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [history, setHistory] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("shortenedUrlHistory") || "[]"); } catch { return []; }
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
  const [chartVisible, setChartVisible] = useState(false);
  const [qrTarget, setQrTarget] = useState("");

  const heroTitle = useTypewriter("SMARTSHORTENER: ULTIMATE LINK COMPRESSION", 65);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(code);
  };

  useEffect(() => { generateCaptcha(); }, []);
  useEffect(() => {
    try { localStorage.setItem("shortenedUrlHistory", JSON.stringify(history)); } catch {}
  }, [history]);
  useEffect(() => { setTimeout(() => setChartVisible(true), 800); }, []);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/shorten", data);
      return res.json();
    },
    onSuccess: (data) => {
      const fullUrl = `${window.location.protocol}//${window.location.host}/${data.shortCode}`;
      setShortenedUrl(fullUrl);
      setHistory(prev => [{
        id: data.id, original: url, code: data.shortCode,
        time: new Date().toLocaleTimeString(), clicks: 0, createdAt: new Date(), fullUrl,
      }, ...prev].slice(0, 10));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast({ title: "Link Berhasil Dibuat!", description: "Tautan pendek Anda sudah siap.", variant: "success" });
      setPassword(""); setHoneypotInput(""); setUrl(""); setCustomCode("");
    },
    onError: (error: any) => {
      toast({ title: "Gagal Membuat Link", description: error.message || "Terjadi kesalahan.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) { toast({ title: "URL Diperlukan", description: "Masukkan URL yang ingin dipersingkat.", variant: "destructive" }); return; }
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setShowCaptchaError(true);
      toast({ title: "Verifikasi Gagal", description: "Kode verifikasi salah. Coba lagi.", variant: "destructive" });
      setCaptchaInput(""); generateCaptcha(); return;
    }
    setCaptchaInput(""); generateCaptcha(); setShowCaptchaError(false);
    mutation.mutate({
      originalUrl: url,
      customCode: customCode || undefined,
      expiration,
      customExpirationDays: expiration === "custom" ? customDays : undefined,
      password: password || undefined,
      honeypot: honeypotInput || undefined,
    });
  };

  const copyToClipboard = (urlToCopy: string, index?: number) => {
    navigator.clipboard.writeText(urlToCopy);
    toast({ title: "Tersalin!", description: "Tautan berhasil disalin ke clipboard.", variant: "success" });
    setIsCopied(true);
    if (index !== undefined) setCopiedIndex(index);
    setTimeout(() => { setIsCopied(false); setCopiedIndex(null); }, 2000);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast({ title: "Dihapus", description: "Riwayat tautan berhasil dihapus." });
  };

  const clearAllHistory = () => {
    if (window.confirm("Hapus semua riwayat tautan?")) {
      setHistory([]);
      toast({ title: "Riwayat Dihapus", description: "Semua riwayat telah dihapus." });
    }
  };

  const shareLink = (platform: string, shareUrl: string) => {
    const text = "Cek tautan pendek ini dari SmartShortener!";
    if (platform === "copy") { copyToClipboard(shareUrl); return; }
    let target = "";
    if (platform === "twitter") target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    else if (platform === "linkedin") target = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`;
    else if (platform === "whatsapp") target = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`;
    if (target) window.open(target, "_blank");
  };

  const faqData = [
    { q: "Siapa Developer Website ini?", a: "Developer Website ini adalah Raihan_official0307 X Visualcodepo. Kunjungi https://talk.visualcodepo.my.id untuk bertanya atau melaporkan bug." },
    { q: "Apa itu Starlink Command?", a: "Starlink Command adalah layanan pemendek URL canggih yang mengkompresi tautan panjang menjadi tautan pendek, dilengkapi QR Code, riwayat tautan, dan keamanan data." },
    { q: "Apakah Starlink Command gratis?", a: "Ya, fitur dasar sepenuhnya gratis. Fitur premium akan tersedia di masa mendatang." },
    { q: "Bagaimana cara kerja Kode QR?", a: "Setiap tautan pendek otomatis menghasilkan QR Code yang dapat dipindai atau diunduh untuk akses cepat." },
    { q: "Apakah tautan yang dipersingkat aman?", a: "Kami menggunakan enkripsi untuk mengamankan setiap tautan. Proteksi password juga tersedia untuk keamanan tambahan." },
    { q: "Bisakah saya melihat riwayat tautan?", a: "Ya, di tab Riwayat Anda dapat melihat 10 tautan terakhir yang dibuat di sesi browser ini." },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/40 to-cyan-50/30 dark:from-[#020617] dark:via-[#0a0e27] dark:to-[#0f172a] text-gray-900 dark:text-slate-200 overflow-y-auto overflow-x-hidden relative selection:bg-cyan-500/30 pb-20 transition-colors duration-300">

        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />
        {[...Array(4)].map((_, i) => (
          <motion.div key={i}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.05, 0.12, 0.05], rotate: [0, 180, 360] }}
            transition={{ duration: 20 + i * 4, repeat: Infinity, ease: "linear", delay: i * 5 }}
            className="absolute rounded-full hidden dark:block"
            style={{ width: `${100 + i * 50}px`, height: `${100 + i * 50}px`, top: `${5 + i * 22}%`, left: `${10 + i * 25}%`, background: `radial-gradient(circle, rgba(6,182,212,0.3), transparent)`, filter: "blur(30px)", zIndex: 0 }}
          />
        ))}

        {showConfetti && <ReactConfetti width={width} height={height} colors={["#06b6d4", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"]} />}
        <div className="scanline" />

        {/* ── HEADER ── */}
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 h-16 border-b border-gray-200 dark:border-white/5 bg-white/85 dark:bg-[#020617]/85 backdrop-blur-xl flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="p-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <Rocket className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </motion.div>
            <div>
              <div className="font-bold tracking-[0.18em] uppercase text-sm text-cyan-700 dark:text-cyan-400">Starlink Command</div>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">v4.2.0 PRO</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5 text-[10px] font-mono tracking-tighter">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-green-600 dark:text-green-400">SYSTEM: OPTIMAL</span></div>
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500"><Globe className="w-3 h-3 text-blue-500 dark:text-blue-400" /><span>REGION: EARTH_01</span></div>
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500"><ShieldCheck className="w-3 h-3 text-purple-500 dark:text-purple-400" /><span>SSL: ACTIVE</span></div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button onClick={toggleTheme} whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 transition-all"
                data-testid="button-theme-toggle">
                <AnimatePresence mode="wait">
                  {theme === "dark"
                    ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun className="w-4 h-4" /></motion.div>
                    : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon className="w-4 h-4" /></motion.div>
                  }
                </AnimatePresence>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent><p>{theme === "dark" ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}</p></TooltipContent>
          </Tooltip>
        </motion.header>

        {/* ── HERO ── */}
        <section className="relative z-10 text-center py-10 md:py-14 max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-mono mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            TRANSMISSION SYSTEM ONLINE
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white uppercase tracking-wide leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            {heroTitle}<motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-cyan-500 dark:text-cyan-400">_</motion.span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-sm md:text-base text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Kompresi tautan superior. Cepat, aman, dan futuristik untuk navigasi lintas platform.
          </motion.p>
        </section>

        {/* ── MAIN GRID ── */}
        <main className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-10">

          {/* ─ LEFT SIDEBAR ─ */}
          <aside className="lg:col-span-3 order-2 lg:order-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">

              {/* Core Analytics Card */}
              <div className="p-5 bg-white/90 dark:bg-slate-800/40 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none transition-colors">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-4">
                  <BarChart3 className="w-3 h-3" /> Core Analytics
                </h3>
                {/* Animated Bar Chart */}
                <div className="flex items-end gap-0.5 h-16 mb-3">
                  {CHART_DATA.map((val, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }}
                      animate={{ height: chartVisible ? `${val}%` : 0 }}
                      transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-600 to-cyan-400 dark:from-cyan-500 dark:to-cyan-300 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ minHeight: 2 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 dark:text-slate-500 mb-4">
                  {CHART_LABELS.filter((_, i) => i % 3 === 0).map(l => <span key={l}>{l}</span>)}
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Links Created", val: "1,247", change: "+12%", pct: 72, color: "from-cyan-500 to-cyan-400" },
                    { label: "Total Clicks", val: "8.5K", change: "+23%", pct: 85, color: "from-blue-500 to-blue-400" },
                    { label: "Avg. CTR", val: "6.8%", change: "+5%", pct: 54, color: "from-purple-500 to-purple-400" },
                  ].map((s, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-slate-400">{s.label}</span>
                        <span className="text-gray-900 dark:text-white font-mono font-semibold">{s.val}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: chartVisible ? `${s.pct}%` : 0 }} transition={{ duration: 1.2, delay: 0.6 + i * 0.15 }}
                            className={`h-full bg-gradient-to-r ${s.color} rounded-full`} />
                        </div>
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-mono shrink-0">{s.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-5 bg-white/90 dark:bg-slate-800/40 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none transition-colors">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-3">
                  <Layers className="w-3 h-3" /> Quick Actions
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Bulk Shorten", icon: LinkIcon, color: "text-cyan-600 dark:text-cyan-400" },
                    { label: "Export Data", icon: Download, color: "text-blue-600 dark:text-blue-400" },
                    { label: "API Settings", icon: Terminal, color: "text-purple-600 dark:text-purple-400" },
                  ].map(({ label, icon: Icon, color }, i) => (
                    <motion.button key={i} whileHover={{ x: 3 }}
                      className="w-full p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg flex items-center justify-between border border-gray-200 dark:border-white/5 transition-colors group">
                      <span className="text-xs text-gray-600 dark:text-slate-300">{label}</span>
                      <Icon className={`w-3 h-3 ${color} transition-colors`} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Trend Sparkline */}
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Trend Minggu Ini</span>
                  <span className="text-xs text-green-600 dark:text-green-400 font-mono font-bold">+18.3%</span>
                </div>
                <div className="flex items-end gap-1 h-10">
                  {[30, 50, 40, 70, 60, 85, 100].map((v, i) => (
                    <motion.div key={i} initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: chartVisible ? 1 : 0 }}
                      transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
                      style={{ height: `${v}%` }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-cyan-600 to-cyan-400 dark:from-cyan-400 dark:to-cyan-200 opacity-70" />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 dark:text-slate-500 mt-1">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </motion.div>
          </aside>

          {/* ─ MAIN CONTENT ─ */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 rounded-xl">
                  <TabsTrigger value="create" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm text-gray-500 dark:text-slate-400 transition-all"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Buat</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm text-gray-500 dark:text-slate-400 transition-all"><History className="w-3.5 h-3.5 mr-1.5" />Riwayat</TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-cyan-700 dark:data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm text-gray-500 dark:text-slate-400 transition-all"><LockKeyhole className="w-3.5 h-3.5 mr-1.5" />Pengaturan</TabsTrigger>
                </TabsList>

                {/* ── CREATE TAB ── */}
                <TabsContent value="create" className="mt-4">
                  <StarshipCard className="relative overflow-hidden group hover:shadow-md hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/10 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-blue-500/3 pointer-events-none" />
                    <div className="absolute -top-16 -right-16 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                      <Rocket className="w-48 h-48 rotate-45" />
                    </div>
                    <div className="relative z-10">
                      <div className="mb-5 border-l-2 border-cyan-500 pl-4">
                        <h2 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>Buat Tautan Pendek</h2>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono mt-0.5">Masukkan URL untuk dipersingkat</p>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <StarshipInput label="URL Target" placeholder="https://example.com/long-url" value={url} onChange={e => setUrl(e.target.value)} required data-testid="input-url" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <StarshipInput label="Alias Kustom (opsional)" placeholder="nama-kustom" value={customCode} onChange={e => setCustomCode(e.target.value)} data-testid="input-custom-code" />
                          <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-primary/80 uppercase tracking-wider">
                              <CalendarClock className="w-3.5 h-3.5" /> Kadaluarsa
                            </label>
                            <Select value={expiration} onValueChange={setExpiration}>
                              <SelectTrigger className="bg-sky-50 dark:bg-black/40 border-cyan-200 dark:border-white/10 text-gray-800 dark:text-slate-200 h-11" data-testid="select-expiration">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-200">
                                <SelectItem value="1h">1 Jam</SelectItem>
                                <SelectItem value="1d">1 Hari</SelectItem>
                                <SelectItem value="1w">1 Minggu</SelectItem>
                                <SelectItem value="2w">2 Minggu</SelectItem>
                                <SelectItem value="custom">Kustom (Hari)</SelectItem>
                                <SelectItem value="never">Selamanya</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Custom Expiration Days Input */}
                        <AnimatePresence>
                          {expiration === "custom" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <div className="flex-1">
                                  <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">Berapa Hari?</label>
                                  <input
                                    type="number" min={1} max={365} value={customDays}
                                    onChange={e => setCustomDays(Math.min(365, Math.max(1, Number(e.target.value))))}
                                    className="w-full bg-white dark:bg-black/40 border border-amber-300 dark:border-amber-500/30 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                                    data-testid="input-custom-days"
                                  />
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{customDays}</span>
                                  <div className="text-[10px] text-amber-500 dark:text-amber-500">hari</div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <StarshipInput label="Password (opsional)" placeholder="Min. 6 karakter" value={password} onChange={e => setPassword(e.target.value)} isPassword data-testid="input-password" />

                        {/* Honeypot (hidden from user) */}
                        <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
                          <StarshipInput label="Leave empty" name="honeypot" value={honeypotInput} onChange={e => setHoneypotInput(e.target.value)} tabIndex={-1} autoComplete="off" />
                        </div>

                        {/* CAPTCHA */}
                        <div className="space-y-3 p-4 bg-sky-50/80 dark:bg-white/[0.03] rounded-xl border border-cyan-200 dark:border-white/10">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-cyan-700 dark:text-primary/80 uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verifikasi Manusia
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 text-center font-mono text-xl md:text-2xl tracking-[0.3em] py-3 bg-white dark:bg-white/5 rounded-lg border border-cyan-300 dark:border-white/20 select-none text-gray-800 dark:text-slate-100 shadow-inner">
                              {captchaCode}
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" onClick={generateCaptcha} className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 transition-colors">
                                  <RefreshCw className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent><p>Ganti kode</p></TooltipContent>
                            </Tooltip>
                          </div>
                          <StarshipInput placeholder="Ketik kode di atas" value={captchaInput}
                            onChange={e => { setCaptchaInput(e.target.value); if (showCaptchaError) setShowCaptchaError(false); }}
                            isInvalid={showCaptchaError} error={showCaptchaError ? "Kode verifikasi salah." : undefined}
                            required data-testid="input-captcha" />
                        </div>

                        <StarshipButton type="submit" disabled={mutation.isPending} className="w-full py-4" data-testid="button-submit">
                          <AnimatePresence mode="wait">
                            {mutation.isPending
                              ? <motion.span key="loading" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2"><Rocket className="w-4 h-4 animate-bounce" />Memproses...</motion.span>
                              : <motion.span key="idle" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-300" />Persingkat URL</motion.span>
                            }
                          </AnimatePresence>
                        </StarshipButton>
                      </form>

                      {/* Result box */}
                      <AnimatePresence>
                        {shortenedUrl && (
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
                            className="mt-5 p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 rounded-xl relative">
                            <div className="absolute -top-3 left-5 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-bold rounded-full">LINK SIAP</div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                              <div className="flex-1 min-w-0">
                                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="block font-mono text-cyan-700 dark:text-cyan-400 text-sm hover:underline truncate">{shortenedUrl}</a>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {[
                                  { icon: isCopied ? Check : Copy, action: () => shareLink("copy", shortenedUrl), label: "Salin" },
                                  { icon: Twitter, action: () => shareLink("twitter", shortenedUrl), label: "Twitter" },
                                  { icon: Linkedin, action: () => shareLink("linkedin", shortenedUrl), label: "LinkedIn" },
                                  { icon: WhatsappIcon, action: () => shareLink("whatsapp", shortenedUrl), label: "WhatsApp" },
                                  { icon: QrCode, action: () => { setQrTarget(shortenedUrl); setShowQRCode(true); }, label: "QR Code" },
                                ].map(({ icon: Icon, action, label }, i) => (
                                  <Tooltip key={i}><TooltipTrigger asChild>
                                    <motion.button onClick={action} whileTap={{ scale: 0.9 }}
                                      className="p-2 bg-cyan-500/15 hover:bg-cyan-500 text-cyan-700 dark:text-cyan-400 hover:text-white rounded-lg transition-all">
                                      <Icon className="w-4 h-4" />
                                    </motion.button>
                                  </TooltipTrigger><TooltipContent><p>{label}</p></TooltipContent></Tooltip>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StarshipCard>
                </TabsContent>

                {/* ── HISTORY TAB ── */}
                <TabsContent value="history" className="mt-4">
                  <StarshipCard>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>Riwayat Transmisi</h3>
                      {history.length > 0 && (
                        <Tooltip><TooltipTrigger asChild>
                          <button onClick={clearAllHistory} className="p-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white rounded-lg transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger><TooltipContent><p>Hapus Semua</p></TooltipContent></Tooltip>
                      )}
                    </div>
                    {history.length === 0
                      ? <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                          <History className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-400 dark:text-slate-500 font-mono">Belum ada riwayat tautan.</p>
                        </div>
                      : <div className="space-y-2">
                          {history.map((item, i) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                              className="p-3.5 bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-xl flex items-center gap-3 border border-gray-200 dark:border-white/5 transition-colors"
                              data-testid={`card-history-${item.id}`}>
                              <div className="flex-1 overflow-hidden min-w-0">
                                <Tooltip><TooltipTrigger asChild>
                                  <a href={item.fullUrl} target="_blank" rel="noopener noreferrer" className="block text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 truncate font-mono text-sm font-medium">{item.fullUrl}</a>
                                </TooltipTrigger><TooltipContent><p className="max-w-xs break-all">{item.original}</p></TooltipContent></Tooltip>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{item.original.length > 45 ? item.original.slice(0, 42) + "..." : item.original}</p>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                {[
                                  { icon: copiedIndex === i ? Check : Copy, action: () => copyToClipboard(item.fullUrl, i), label: "Salin", cls: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white" },
                                  { icon: QrCode, action: () => { setQrTarget(item.fullUrl); setShowQRCode(true); }, label: "QR", cls: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500 hover:text-white" },
                                  { icon: Trash2, action: () => deleteHistoryItem(item.id), label: "Hapus", cls: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white" },
                                ].map(({ icon: Icon, action, label, cls }, j) => (
                                  <Tooltip key={j}><TooltipTrigger asChild>
                                    <button onClick={action} className={`p-1.5 rounded-lg transition-all ${cls}`}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger><TooltipContent><p>{label}</p></TooltipContent></Tooltip>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                    }
                  </StarshipCard>
                </TabsContent>

                {/* ── SETTINGS TAB ── */}
                <TabsContent value="settings" className="mt-4">
                  <StarshipCard>
                    <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Pengaturan</h3>
                    <div className="space-y-3">
                      {[
                        { icon: LockKeyhole, title: "Proteksi Password", desc: "Lindungi tautan dengan password", color: "text-purple-600 dark:text-purple-400" },
                        { icon: Globe, title: "Domain Kustom", desc: "Gunakan domain sendiri", color: "text-blue-600 dark:text-blue-400" },
                        { icon: Terminal, title: "Akses API", desc: "Buat API key untuk developer", color: "text-green-600 dark:text-green-400" },
                        { icon: theme === "dark" ? Sun : Moon, title: "Tema", desc: theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif", action: toggleTheme, color: "text-amber-600 dark:text-amber-400" },
                      ].map(({ icon: Icon, title, desc, action, color }, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                          className="p-4 bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center group cursor-pointer transition-colors"
                          onClick={action}>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h4>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <div className="p-2 bg-gray-200 dark:bg-white/10 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 rounded-lg transition-colors">
                            <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </StarshipCard>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Feature Cards */}
            <section className="mt-2">
              <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                Mengapa Starlink Command?
              </motion.h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Zap, title: "Sangat Cepat", desc: "Buat tautan pendek dalam hitungan detik.", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10", border: "hover:border-yellow-300 dark:hover:border-yellow-500/30" },
                  { icon: QrCode, title: "QR Code Otomatis", desc: "Setiap tautan dilengkapi QR Code siap pakai.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", border: "hover:border-blue-300 dark:hover:border-blue-500/30" },
                  { icon: ShieldCheck, title: "Keamanan Tinggi", desc: "Enkripsi dan proteksi password tersedia.", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/10", border: "hover:border-green-300 dark:hover:border-green-500/30" },
                  { icon: Share2, title: "Mudah Dibagikan", desc: "Bagikan ke sosial media dengan satu klik.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10", border: "hover:border-purple-300 dark:hover:border-purple-500/30" },
                ].map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className={`p-5 bg-white/90 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 ${f.border} rounded-xl flex items-start gap-4 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-all`}>
                    <div className={`p-2.5 ${f.bg} rounded-xl shrink-0`}><f.icon className={`w-5 h-5 ${f.color}`} /></div>
                    <div><h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h4><p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{f.desc}</p></div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="mt-6">
              <motion.h3 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white text-center mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                FAQ: Tanya Jawab
              </motion.h3>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqData.map((faq, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: i * 0.04 }}>
                    <AccordionItem value={`item-${i}`} className="border border-gray-200 dark:border-white/10 rounded-xl px-4 bg-white/70 dark:bg-white/[0.02]">
                      <AccordionTrigger className="text-sm font-medium text-gray-800 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-400 py-4 text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-gray-500 dark:text-slate-400 pb-4 leading-relaxed">{faq.a}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </section>
          </div>

          {/* ─ RIGHT SIDEBAR ─ */}
          <aside className="lg:col-span-3 order-3 space-y-4">
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-4">

              {/* Real-time data */}
              <div className="p-5 bg-white/90 dark:bg-slate-800/40 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none transition-colors">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 dark:text-cyan-500 uppercase tracking-widest mb-4">
                  <Activity className="w-3 h-3" /> Real-time Data
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Active Probes", val: "128", icon: Activity, color: "text-cyan-600 dark:text-cyan-400" },
                    { label: "Data Packets", val: "5.2M", icon: Globe, color: "text-blue-600 dark:text-blue-400" },
                    { label: "Threat Level", val: "LOW", icon: ShieldCheck, color: "text-green-600 dark:text-green-400" },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className={`flex items-center gap-2 text-gray-500 dark:text-slate-400`}><m.icon className={`w-3 h-3 ${m.color}`} />{m.label}</div>
                      <span className="font-mono text-gray-900 dark:text-white font-semibold">{m.val}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-end gap-0.5 h-12">
                    {[40, 65, 45, 80, 60, 90, 70, 88].map((v, i) => (
                      <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: chartVisible ? 1 : 0 }} transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                        style={{ height: `${v}%`, transformOrigin: "bottom" }} className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 opacity-60" />
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1 text-center">Aktivitas 8 jam terakhir</p>
                </div>
              </div>

              {/* Security notice */}
              <div className="p-5 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-transparent border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Transmisi Terenkripsi</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">Semua tautan dienkripsi sebelum disimpan. Keamanan data Anda adalah prioritas kami.</p>
                <div className="mt-3 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-xs text-green-600 dark:text-green-400 font-medium">Semua Sistem Normal</span></div>
              </div>

              {/* Theme Toggle */}
              <motion.button onClick={toggleTheme} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white/90 dark:bg-slate-800/40 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between group hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{theme === "dark" ? "Mode Gelap" : "Mode Terang"}</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-gray-300 dark:bg-cyan-500/30 relative">
                  <motion.div animate={{ x: theme === "dark" ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-cyan-400 shadow-sm" />
                </div>
              </motion.button>
            </motion.div>
          </aside>
        </main>

        {/* ── QR CODE MODAL ── */}
        <AnimatePresence>
          {showQRCode && qrTarget && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowQRCode(false)}>
              <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 max-w-xs w-full shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">QR Code</h3>
                  <button onClick={() => setShowQRCode(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-center">
                  <QRCode value={qrTarget} size={180} />
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 text-center font-mono truncate">{qrTarget}</p>
                <StarshipButton className="mt-4 w-full" onClick={() => setShowQRCode(false)} variant="outline">Tutup</StarshipButton>
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
