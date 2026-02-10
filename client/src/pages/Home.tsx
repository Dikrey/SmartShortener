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
  Github,
  Twitter,
  Linkedin,
  Trash2,
} from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import QRCode from "react-qr-code";
import { FaWhatsapp as WhatsappIcon } from 'react-icons/fa';

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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// New animation for background elements (subtle)
const bgOrbVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1, 1.5, 1],
    opacity: [0, 0.3, 0.1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
      delay: Math.random() * 5,
    },
  },
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [password, setPassword] = useState("");
  const [honeypotInput, setHoneypotInput] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const storedHistory = localStorage.getItem("shortenedUrlHistory");
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
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

  const heroTitle = useTypewriter("SMARTSHORTENER: ULTIMATE LINK COMPRESSION", 70);

  // Function to generate random CAPTCHA code
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) { // 6-character CAPTCHA
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    generateCaptcha(); // Generate CAPTCHA on initial mount
    // Effect to save history to localStorage whenever it changes
    try {
      localStorage.setItem("shortenedUrlHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

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
      const newHistoryEntry = {
        id: data.id,
        original: url,
        code: data.shortCode,
        time: new Date().toLocaleTimeString(),
        clicks: 0,
        createdAt: new Date(),
        fullUrl: fullUrl,
      };
      setHistory((prev) =>
        [
          newHistoryEntry,
          ...prev,
        ].slice(0, 10),
      );
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast({
        title: "WARP DRIVE ACTIVE",
        description: "Coordinates secured and compressed.",
      });
      setPassword("");
      setHoneypotInput("");
      setUrl("");
      setCustomCode("");
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
    if (!url) {
      toast({
        title: "INPUT REQUIRED",
        description: "Please provide a URL to shorten.",
        variant: "destructive",
      });
      return;
    }

    // CAPTCHA validation
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setShowCaptchaError(true);
      toast({
        title: "VERIFIKASI GAGAL",
        description: "Kode verifikasi tidak cocok. Coba lagi.",
        variant: "destructive",
      });
      setCaptchaInput(""); // Clear CAPTCHA input
      generateCaptcha(); // Generate new CAPTCHA
      return;
    }

    // Reset CAPTCHA on successful submission attempt (even if mutation fails later)
    setCaptchaInput("");
    generateCaptcha();
    setShowCaptchaError(false);

    mutation.mutate({
      originalUrl: url,
      customCode: customCode || undefined,
      expiration,
      password: password || undefined,
      honeypot: honeypotInput || undefined,
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

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updatedHistory = prev.filter((item) => item.id !== id);
      // localStorage.setItem("shortenedUrlHistory", JSON.stringify(updatedHistory)); // This is handled by the useEffect
      toast({
        title: "TRANSMISI DIHAPUS",
        description: "Entri riwayat berhasil dihapus.",
      });
      return updatedHistory;
    });
  };

  const clearAllHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua riwayat transmisi?")) {
      setHistory([]);
      // localStorage.removeItem("shortenedUrlHistory"); // This is handled by the useEffect setting history to empty array
      toast({
        title: "RIWAYAT DIHAPUS",
        description: "Semua entri riwayat berhasil dihapus.",
      });
    }
  };

  const shareLink = (platform: string, url: string) => {
    let shareUrl = "";
    const text = "Check out this shortened link from SmartShortener!";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent("Shortened Link")}&summary=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "copy":
        copyToClipboard(url);
        return;
      default:
        if (navigator.share) {
          navigator.share({
            title: "Shortened Link from Starlink Command",
            text: text,
            url: url,
          }).catch((error) => console.log('Error sharing', error));
        } else {
          copyToClipboard(url);
        }
        return;
    }
    window.open(shareUrl, "_blank");
  };

  const generateQRCode = () => {
    setShowQRCode(true);
  };

  const faqData = [
    {
    question: "Siapa Developer Website ini?",
    answer: "Developer Website ini adalah Raihan_official0307 X Visualcodepo seorang programmer. Anda bisa langsung mengunjungi website https://talk.visualcodepo.my.id untuk langsung bertanya dan di sana Anda bisa mengirim pesan atau melaporkan bug pada semua website/aplikasi yang saya buat."
    },
    {
      question: "Apa itu Starlink Command?",
      answer: "Starlink Command adalah layanan pemendek URL canggih yang dirancang untuk mengkompresi tautan panjang menjadi tautan pendek yang mudah dibagikan. Dilengkapi dengan fitur seperti Kode QR, riwayat tautan, dan keamanan transmisi data."
    },
    {
      question: "Apakah Starlink Command gratis?",
      answer: "Ya, Starlink Command menyediakan fitur dasar pemendekan URL secara gratis. Untuk fitur-fitur premium dan analitik yang lebih mendalam, Anda dapat mempertimbangkan untuk meng-upgrade akun Anda di masa mendatang."
    },
    {
      question: "Bagaimana cara kerja Kode QR?",
      answer: "Setelah Anda memendekkan URL, kami akan secara otomatis menghasilkan Kode QR untuk tautan pendek Anda. Anda dapat mengunduh atau memindai Kode QR ini dengan perangkat seluler untuk mengakses tautan secara cepat."
    },
    {
      question: "Apakah tautan yang dipersingkat aman?",
      answer: "Kami menggunakan protokol enkripsi canggih untuk mengamankan setiap tautan yang Anda buat. Fitur opsional seperti perlindungan sandi juga tersedia untuk keamanan ekstra."
    },
    {
      question: "Bisakah saya melihat riwayat tautan saya?",
      answer: "Ya, Anda dapat melihat daftar tautan yang baru saja Anda persingkat di sesi browser ini pada bagian 'Riwayat Transmisi'. Data ini disimpan secara lokal di browser Anda."
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen galaxy-flow-bg bg-gradient-to-br from-[#020617] via-[#0a0e27] to-[#0f172a] text-slate-200 overflow-y-auto overflow-x-hidden relative selection:bg-cyan-500/30 pb-20">
        {/* Enhanced Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        {/* Dynamic Orbs for background "wow" factor */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            variants={bgOrbVariants}
            initial="initial"
            animate="animate"
            className="absolute rounded-full bg-cyan-500/10"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(30px)',
              zIndex: 0,
            }}
          />
        ))}

      {showConfetti && <ReactConfetti width={width} height={height} colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#ffffff', '#f59e0b']} />} 

        {/* Enhanced Header with Parallax Effect - Increased z-index */}
        <motion.header className="h-20 border-b border-white/5 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 relative z-40">
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

        {/* Hero Section with Typewriter Effect */}
        <section className="relative z-10 text-center py-16 md:py-24 max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-wider leading-tight"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-4 text-md md:text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Kompresi tautan superior untuk navigasi antar-galaksi Anda. Cepat, aman, dan futuristik.
          </motion.p>
        </section>

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

          {/* Enhanced Main Content with Tabs - Increased z-index for mobile */}
          <div className="lg:col-span-6 space-y-8 relative z-20">
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
                    value="history" // Changed from analytics to history
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400"
                  >
                    <History className="w-4 h-4 mr-2" /> History
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
                        
                                              {/* CAPTCHA Verification Field */}
                                              <motion.div variants={itemVariants} className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                  <ShieldCheck className="w-3 h-3" /> Verifikasi Manusia
                                                </label>
                                                <div className="flex items-center gap-2">
                                                  <span className="flex-1 text-center font-mono text-xl md:text-2xl tracking-widest py-3 bg-white/5 rounded-lg border border-white/10 select-none">
                                                    {captchaCode}
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={generateCaptcha}
                                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                                                    aria-label="Refresh CAPTCHA"
                                                  >
                                                    <RefreshCw className="w-5 h-5 text-slate-400" />
                                                  </button>
                                                </div>
                                                <StarshipInput
                                                  label="Masukkan Kode Di Atas"
                                                  placeholder="Ketik kode di sini"
                                                  value={captchaInput}
                                                  onChange={(e) => {
                                                    setCaptchaInput(e.target.value);
                                                    if (showCaptchaError) setShowCaptchaError(false);
                                                  }}
                                                  isInvalid={showCaptchaError}
                                                  required
                                                />
                                                 {showCaptchaError && (
                                                  <p className="text-xs text-red-400 mt-1">Kode verifikasi salah. Coba lagi.</p>
                                                )}
                                              </motion.div>
                        
                                              <StarshipButton
                                                type="submit"
                                                disabled={mutation.isPending}
                                                className="w-full py-6 group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20"
                                              >                          <AnimatePresence mode="wait">
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
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => shareLink("copy", shortenedUrl)}
                                        className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                      >
                                        {isCopied ? (
                                          <Check className="w-5 h-5" />
                                        ) : (
                                          <Copy className="w-5 h-5" />
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy Link</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => shareLink("twitter", shortenedUrl)}
                                        className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                      >
                                        <Twitter className="w-5 h-5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Share on X (Twitter)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => shareLink("linkedin", shortenedUrl)}
                                        className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                    >
                                      <Linkedin className="w-5 h-5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Share on LinkedIn</p>
                                  </TooltipContent>
                                </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => shareLink("whatsapp", shortenedUrl)}
                                        className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                      >
                                        <WhatsappIcon className="w-5 h-5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Share on WhatsApp</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={generateQRCode}
                                        className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                      >
                                        <QrCode className="w-5 h-5" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Show QR Code</p>
                                    </TooltipContent>
                                  </Tooltip>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </StarshipCard>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <StarshipCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-display uppercase tracking-widest text-white">
                        Riwayat Transmisi
                      </h3>
                      {history.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={clearAllHistory}
                              className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all active:scale-95"
                              aria-label="Clear all history"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear All History</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {history.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                        <p className="text-sm text-slate-600 font-mono italic">
                          Belum ada transmisi data yang tercatat di sesi ini.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 bg-white/5 rounded-lg flex items-center justify-between group"
                          >
                            <div className="flex-1 overflow-hidden">
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                          <a href={item.fullUrl} target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:text-cyan-300 truncate font-mono text-sm">
                                              {item.fullUrl}
                                          </a>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>{item.original}</p>
                                  </TooltipContent>
                              </Tooltip>
                              <p className="text-xs text-slate-500 mt-1">
                                Original: <span className="font-mono">{item.original.length > 40 ? item.original.substring(0, 37) + "..." : item.original}</span>
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => copyToClipboard(item.fullUrl, i)}
                                        className="p-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                      >
                                        {copiedIndex === i ? (
                                          <Check className="w-4 h-4" />
                                        ) : (
                                          <Copy className="w-4 h-4" />
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copy Link</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => setShowQRCode(true)} // Open QR for this specific item
                                        className="p-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all active:scale-95"
                                      >
                                        <QrCode className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Show QR Code</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => deleteHistoryItem(item.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all active:scale-95"
                                        aria-label="Delete link"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Link</p>
                                    </TooltipContent>
                                  </Tooltip>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
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

            {/* Feature Showcase Section */}
            <section className="mt-12">
              <h3 className="text-xl font-display uppercase tracking-widest text-white text-center mb-8">
                Mengapa Memilih Starlink Command?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Zap,
                    title: "Warp Speed Shortening",
                    description: "Kompresi tautan dalam sekejap mata. Transmisi data hiper-cepat adalah prioritas kami."
                  },
                  {
                    icon: QrCode,
                    title: "Kode QR Otomatis",
                    description: "Setiap tautan pendek dilengkapi dengan Kode QR yang siap dipindai dan dibagikan secara instan."
                  },
                  {
                    icon: ShieldCheck,
                    title: "Keamanan Transmisi",
                    description: "Tautan Anda dienkripsi dan dilindungi, memastikan navigasi yang aman di seluruh galaksi."
                  },
                  {
                    icon: Share2,
                    title: "Berbagi Lintas Semesta",
                    description: "Bagikan tautan Anda dengan mudah ke berbagai platform sosial media, dari satu titik kendali."
                  }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl backdrop-blur-sm flex items-start space-x-4"
                  >
                    <feature.icon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                    <div>
                      <h4 className="text-md font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
                      </section>
            
                      {/* FAQ Section */}
                      <section className="mt-12">
                        <h3 className="text-xl font-display uppercase tracking-widest text-white text-center mb-8">
                          FAQ: Tanya Jawab Umum
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                          {faqData.map((faq, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.5 }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            >
                              <AccordionItem value={`item-${i}`} className="border-b border-white/10">
                                <AccordionTrigger className="text-white hover:text-cyan-400 text-left">
                                  {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-400">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            </motion.div>
                          ))}
                        </Accordion>
                      </section>
            
                    </div>

          {/* Original Right Sidebar with Analytics, now "Recent Logs" is gone as it's in the tab */}
          <aside className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* The "Recent Logs" sidebar content is now moved to the "History" tab */}
              {/* Keeping the Analytics and Quick Actions as they are general stats/features */}
              <div className="p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl backdrop-blur-sm">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4">
                  <BarChart3 className="w-3 h-3" /> Real-time Data Stream
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Active Probes", val: "128", trend: "up", icon: Activity },
                    { label: "Data Packets", val: "5.2M", trend: "up", icon: Globe },
                    { label: "Threat Level", val: "LOW", trend: "stable", icon: ShieldCheck },
                  ].map((metric, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <metric.icon className="w-3 h-3" /> {metric.label}
                      </div>
                      <span className="font-mono text-white">{metric.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">
                    Transmisi Terenkripsi
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Semua link dienkripsi melalui protokol Quantum-Tunneling sebelum
                  disimpan di core database. Keamanan data Anda adalah prioritas tertinggi.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400">
                    Semua Sistem Beroperasi Optimal
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
                    Kode QR Tautan Anda
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
                  Pindai kode ini untuk mengakses tautan dengan cepat.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        <footer className="fixed bottom-0 w-full h-10 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-4 md:px-8 text-[10px] font-mono text-slate-600 z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="animate-pulse mr-2">●</span>
            <span className="hidden md:inline">SECTOR: 07-G // PROTOCOL: STAR-SHORT // v.4.2.0-PRO</span>
            <span className="md:hidden">STAR-SHORT v4.2.0</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-green-400 hidden md:inline">STATUS: ONLINE</span>
            <span className="text-green-400 md:hidden">ONLINE</span>
            <span className="hidden md:inline">PING: 12ms</span>
          </div>
        </footer>

        <style>{`
          .font-display { font-family: 'Inter', sans-serif; }
          
          /* Improved mobile scrolling and touch interactions */
          html, body {
            -webkit-overflow-scrolling: touch;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          /* Enhanced mobile responsiveness */
          @media (max-width: 768px) {
            .main-content {
              padding-bottom: 3rem; /* Add space for fixed footer */
            }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}