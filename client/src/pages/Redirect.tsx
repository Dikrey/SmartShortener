import { useEffect, useState, useCallback } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  AlertTriangle, ExternalLink, Loader2, Rocket, Zap,
  Shield, Fingerprint, CheckCircle2, XCircle, Activity,
  Globe, Eye, EyeOff, Volume2, VolumeX,
  Wifi, RefreshCw, Share2, QrCode, Scan, Radar,
  BarChart3, ArrowRight, Code, LockKeyhole, Sun, Moon,
  ChevronRight, Play, Hand, Brain,
} from "lucide-react";
import QRCode from "react-qr-code";

import { useResolveUrl } from "@/hooks/use-urls";
import { StarshipCard } from "@/components/StarshipCard";
import { StarshipButton } from "@/components/StarshipButton";
import { StarshipInput } from "@/components/StarshipInput";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useTheme } from "@/contexts/ThemeContext";

export default function Redirect() {
  const [, params] = useRoute("/:code");
  const code = params?.code || "";
  const { data, isLoading, error } = useResolveUrl(code);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const controls = useAnimation();

  // State
  const [countdown, setCountdown] = useState(10);
  const [warping, setWarping] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [redirectCancelled, setRedirectCancelled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCodeDisplay, setCaptchaCodeDisplay] = useState("");
  const [showCaptchaError, setShowCaptchaError] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showUrlPreview, setShowUrlPreview] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [fingerprintPressed, setFingerprintPressed] = useState(false);

  const isHuman = data?.isPasswordProtected
    ? passwordVerified && captchaVerified
    : captchaVerified;

  const verifyPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", api.urls.verifyPassword.path.replace(":code", code), { password });
      return res.json();
    },
    onSuccess: () => {
      setPasswordVerified(true);
      setPasswordError(null);
      toast({ title: "Akses Diberikan", description: "Password terverifikasi. Melanjutkan...", variant: "success" });
    },
    onError: (err: any) => {
      setPasswordError(err.message || "Password salah. Akses ditolak.");
      toast({ title: "Akses Ditolak", description: err.message || "Password tidak valid.", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (data && !data.isPasswordProtected) setPasswordVerified(true);
  }, [data]);

  const generateAlphanumericCaptcha = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let c = "";
    for (let i = 0; i < 6; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCodeDisplay(c);
    setCaptchaInput("");
    setShowCaptchaError(false);
  }, []);

  useEffect(() => {
    generateAlphanumericCaptcha();
    const questions = [
      { q: "Apa warna langit?", a: "biru" },
      { q: "Berapa hari dalam seminggu?", a: "7" },
      { q: "Berapa 2 + 2?", a: "4" },
      { q: "Hari apa setelah Senin?", a: "selasa" },
    ];
    const chosen = questions[Math.floor(Math.random() * questions.length)];
    setSecurityQuestion(chosen.q);
    (window as any).__secAnswer = chosen.a;
  }, [generateAlphanumericCaptcha]);

  // Security scan animation
  useEffect(() => {
    if (data && (!data.isPasswordProtected || passwordVerified) && !captchaVerified) {
      const interval = setInterval(() => {
        setSecurityLevel(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return Math.min(100, prev + Math.random() * 12);
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [data, passwordVerified, captchaVerified]);

  // Countdown timer after verification
  useEffect(() => {
    if (data && (!data.isPasswordProtected || passwordVerified) && captchaVerified && !redirectCancelled) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setWarping(true);
            setTimeout(() => { if (!redirectCancelled) window.location.href = data.originalUrl; }, 1000);
            return 0;
          }
          if (prev <= 3) { setGlitchActive(true); setTimeout(() => setGlitchActive(false), 200); }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data, passwordVerified, captchaVerified, redirectCancelled]);

  // ── VERIFICATION HANDLERS (all manual — no setTimeout) ──

  const startVerification = () => setVerificationStep(1);

  const confirmFingerprint = () => {
    setFingerprintPressed(true);
    setTimeout(() => { setFingerprintPressed(false); setVerificationStep(2); }, 600);
  };

  const advanceBiometric = () => setVerificationStep(3);
  const advanceNeural = () => setVerificationStep(4);

  const handleCaptchaVerification = () => {
    if (captchaInput.toUpperCase() === captchaCodeDisplay.toUpperCase()) {
      setVerificationStep(5);
    } else {
      setShowCaptchaError(true);
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 500);
      toast({ title: "Verifikasi Gagal", description: "Kode tidak cocok. Coba lagi.", variant: "destructive" });
      setCaptchaInput("");
      generateAlphanumericCaptcha();
    }
  };

  const handleSecurityVerification = () => {
    const correct = (window as any).__secAnswer || "";
    if (securityAnswer.toLowerCase().trim() === correct) {
      setVerificationStep(6);
      setCaptchaVerified(true);
      controls.start({ scale: [1, 1.15, 1] });
    } else {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 500);
      toast({ title: "Jawaban Salah", description: "Jawaban keamanan tidak tepat. Coba lagi.", variant: "destructive" });
    }
  };

  const handleCancelRedirect = () => { setRedirectCancelled(true); setWarping(false); };
  const handleResumeRedirect = () => { setRedirectCancelled(false); setCountdown(5); };

  const fetchUrlPreview = useCallback(() => {
    if (!data?.originalUrl) return;
    setTimeout(() => setUrlPreview(`https://picsum.photos/seed/${encodeURIComponent(data.originalUrl).slice(0, 8)}/800/400`), 1200);
  }, [data?.originalUrl]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Tersalin!", description: "Tautan berhasil disalin.", variant: "success" });
  };

  // ── SHARED WRAPPER CLASSES ──
  const pageBg = dark
    ? "bg-gradient-to-br from-[#020617] via-[#0a0e27] to-[#0f172a]"
    : "bg-gradient-to-br from-sky-50 via-blue-50/50 to-cyan-50/30";
  const cardBg = dark ? "bg-slate-800/60 border-white/10" : "bg-white border-gray-200";
  const cardShadow = dark ? "" : "shadow-xl";
  const textPrimary = dark ? "text-cyan-400" : "text-cyan-700";
  const textMuted = dark ? "text-slate-400" : "text-gray-500";
  const textBody = dark ? "text-slate-200" : "text-gray-800";
  const innerBg = dark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200";
  const progressTrack = dark ? "bg-white/10" : "bg-gray-200";

  // ── LOADING STATE ──
  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pageBg}`}>
        <div className="scanline" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, ease: "linear", repeat: Infinity }} className="mb-8">
          <Loader2 className={`w-16 h-16 ${textPrimary}`} />
        </motion.div>
        <h2 className={`text-xl font-bold uppercase tracking-widest ${textPrimary} animate-pulse mb-6`} style={{ fontFamily: "'Inter', sans-serif" }}>
          DECODING UPLINK...
        </h2>
        <div className="w-64">
          <div className={`h-2 ${progressTrack} rounded-full overflow-hidden`}>
            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          </div>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className={`mt-5 text-sm ${textMuted} font-mono`}>
          Establishing secure connection...
        </motion.p>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error || !data) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${pageBg}`}>
        <div className="scanline" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} ${cardShadow} border rounded-2xl p-8 max-w-md w-full text-center`}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }} className="inline-block mb-6">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-3 text-red-500 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>COORDINATES LOST</h1>
          <p className={`text-sm ${textMuted} mb-8 font-mono`}>Sinyal target telah melemah atau tidak pernah ada di sektor ini.</p>
          <div className="space-y-3">
            <Link href="/"><StarshipButton variant="destructive" className="w-full">KEMBALI KE COMMAND</StarshipButton></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FULL PAGE ──
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 pb-10 relative overflow-hidden ${pageBg} transition-colors duration-300`}>
      <div className="scanline" />

      {/* Background orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div key={i} animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.03, 0.1, 0.03] }}
          transition={{ duration: 15 + i * 4, repeat: Infinity, ease: "linear", delay: i * 5 }}
          className="absolute rounded-full hidden dark:block pointer-events-none"
          style={{ width: `${150 + i * 80}px`, height: `${150 + i * 80}px`, top: `${10 + i * 25}%`, left: `${5 + i * 30}%`, background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent)", filter: "blur(50px)" }}
        />
      ))}

      {/* Glitch flash */}
      <AnimatePresence>
        {glitchActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.15, 0] }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-red-500 pointer-events-none" />
        )}
      </AnimatePresence>

      {/* Header controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <motion.button onClick={() => setSoundEnabled(!soundEnabled)} whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-lg ${dark ? "bg-white/10 hover:bg-white/20 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"} transition-colors`}>
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </motion.button>
        <motion.button onClick={toggleTheme} whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-lg ${dark ? "bg-white/10 hover:bg-white/20 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"} transition-colors`}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Warp jump effect */}
      <AnimatePresence>
        {warping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5 }} className="w-full h-px bg-cyan-500" />
              {[...Array(20)].map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: [0, 1, 0], x: (Math.random() - 0.5) * 400 }}
                  transition={{ duration: 0.8, delay: i * 0.04 }}
                  className="absolute w-px h-24 bg-cyan-400"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                />
              ))}
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute text-white text-2xl font-bold tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
                INITIATING WARP JUMP...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl z-10">

        {/* ── PASSWORD GATE ── */}
        {data.isPasswordProtected && !passwordVerified ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`${cardBg} ${cardShadow} border rounded-2xl p-8 text-center`}>
            <div className="mb-6">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <LockKeyhole className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
              </motion.div>
              <h2 className={`text-xl font-bold uppercase tracking-wider mb-2 ${textBody}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                AKSES DIBATASI
              </h2>
              <p className={`text-sm ${textMuted}`}>Transmisi ini terenkripsi. Masukkan kunci untuk melanjutkan.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); verifyPasswordMutation.mutate(passwordInput); }} className="space-y-4">
              <div className="relative">
                <StarshipInput
                  label="Kunci Transmisi"
                  type={showPasswordText ? "text" : "password"}
                  placeholder="Masukkan password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  error={passwordError || undefined}
                  required
                />
                <button type="button" onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 bottom-3 flex items-center text-gray-400 hover:text-cyan-500 transition-colors">
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StarshipButton type="submit" disabled={verifyPasswordMutation.isPending} className="w-full">
                {verifyPasswordMutation.isPending ? "MEMVERIFIKASI..." : "BUKA KUNCI"}
              </StarshipButton>
            </form>
          </motion.div>
        ) : (

          /* ── MAIN CARD: WARP SIGNATURE DETECTED ── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`${cardBg} ${cardShadow} border rounded-2xl overflow-hidden`}>

            {/* Card header stripe */}
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

            <div className="p-6 md:p-8">
              {/* Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/20 text-xs font-mono text-cyan-700 dark:text-cyan-400 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  WARP SIGNATURE DETECTED
                </div>
                <div className={`flex items-center justify-center gap-2 text-sm font-mono ${textMuted} mb-3`}>
                  <Rocket className="w-4 h-4 text-cyan-500" />
                  TARGET ACQUIRED
                </div>
              </div>

              {/* Destination URL */}
              <div className="mb-5">
                <p className={`text-xs ${textMuted} uppercase tracking-wider font-mono mb-2`}>Destination Vector:</p>
                <div className={`p-3 rounded-xl font-mono text-sm break-all ${dark ? "bg-cyan-500/5 border border-cyan-500/20 text-cyan-300" : "bg-cyan-50 border border-cyan-200 text-cyan-800"}`}>
                  {data.originalUrl}
                </div>

                {/* URL Preview toggle */}
                <div className="mt-3">
                  <button onClick={() => { setShowUrlPreview(!showUrlPreview); if (!showUrlPreview && !urlPreview) fetchUrlPreview(); }}
                    className={`flex items-center gap-1.5 text-xs ${textPrimary} hover:opacity-80 transition-opacity font-mono`}>
                    <Eye className="w-3 h-3" />
                    {showUrlPreview ? "SEMBUNYIKAN" : "TAMPILKAN"} PREVIEW
                  </button>
                  <AnimatePresence>
                    {showUrlPreview && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mt-3 rounded-xl overflow-hidden border border-cyan-300/30 dark:border-cyan-500/20">
                        {urlPreview
                          ? <img src={urlPreview} alt="Preview" className="w-full" />
                          : <div className={`h-32 ${dark ? "bg-white/5" : "bg-gray-100"} flex items-center justify-center`}><Loader2 className="w-6 h-6 animate-spin text-cyan-500" /></div>
                        }
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Security scan progress */}
              <div className="mb-6 p-4 rounded-xl border bg-gradient-to-r from-green-50/80 to-cyan-50/80 dark:from-green-500/5 dark:to-cyan-500/5 border-green-200 dark:border-green-500/20">
                <div className="flex justify-between text-xs mb-2">
                  <span className={`${textMuted} font-mono flex items-center gap-1.5`}><Shield className="w-3 h-3 text-green-500" />Security Scan</span>
                  <span className={`font-mono font-bold ${dark ? "text-green-400" : "text-green-700"}`}>{Math.round(securityLevel)}%</span>
                </div>
                <div className={`h-2 ${progressTrack} rounded-full overflow-hidden`}>
                  <motion.div animate={{ width: `${securityLevel}%` }} transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                </div>
                {securityLevel >= 100 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${dark ? "text-green-400" : "text-green-700"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> SECURE CONNECTION VERIFIED
                  </motion.div>
                )}
              </div>

              {/* ── HUMAN VERIFICATION ── */}
              {!isHuman && (
                <div className={`mb-6 p-5 rounded-xl border ${innerBg}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <LockKeyhole className="w-5 h-5 text-cyan-500" />
                    <h3 className={`font-bold uppercase tracking-wider text-sm ${textBody}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                      Verifikasi Keamanan
                    </h3>
                  </div>

                  {/* Step progress indicator */}
                  <div className="flex items-center gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map(step => (
                      <div key={step} className="flex-1">
                        <div className={`h-1 rounded-full transition-all duration-500 ${
                          verificationStep > step ? "bg-green-500"
                          : verificationStep === step ? "bg-cyan-500 animate-pulse"
                          : dark ? "bg-white/10" : "bg-gray-200"
                        }`} />
                      </div>
                    ))}
                  </div>

                  {/* Step 0: Start */}
                  {verificationStep === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${dark ? "bg-cyan-500/10" : "bg-cyan-100"}`}>
                        <ShieldIcon className="w-8 h-8 text-cyan-500" />
                      </div>
                      <p className={`text-sm ${textMuted}`}>Selesaikan verifikasi keamanan untuk melanjutkan ke tujuan.</p>
                      <StarshipButton onClick={startVerification} className="w-full">
                        <Play className="w-4 h-4 mr-2" /> MULAI VERIFIKASI
                      </StarshipButton>
                    </motion.div>
                  )}

                  {/* Step 1: Fingerprint scan — MANUAL */}
                  {verificationStep === 1 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
                      <p className={`text-xs font-mono uppercase tracking-widest ${textPrimary}`}>Langkah 1/5 — Pindai Sidik Jari</p>
                      <div className="flex flex-col items-center">
                        <motion.button
                          onClick={confirmFingerprint}
                          disabled={fingerprintPressed}
                          whileHover={{ scale: fingerprintPressed ? 1 : 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={fingerprintPressed ? { scale: [1, 1.15, 0.9, 1] } : { scale: [0.97, 1.03, 0.97] }}
                          transition={fingerprintPressed ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
                          className="relative w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center cursor-pointer shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow"
                        >
                          <Fingerprint className="w-16 h-16 text-white" />
                          {!fingerprintPressed && (
                            <motion.div animate={{ y: ["-100%", "100%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                              <div className="w-full h-px bg-white/50" />
                            </motion.div>
                          )}
                          {fingerprintPressed && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ duration: 0.5 }}
                              className="absolute inset-0 rounded-full border-2 border-cyan-400" />
                          )}
                        </motion.button>
                        <p className={`text-sm ${textMuted} mt-3`}>
                          {fingerprintPressed ? "Memproses..." : "Tekan untuk memindai sidik jari"}
                        </p>
                        {!fingerprintPressed && (
                          <p className={`text-[10px] ${textMuted} mt-1 font-mono animate-pulse`}>
                            <Hand className="w-3 h-3 inline mr-1" />TAP THE SENSOR
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Biometric scan — MANUAL */}
                  {verificationStep === 2 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
                      <p className={`text-xs font-mono uppercase tracking-widest ${textPrimary}`}>Langkah 2/5 — Pemindaian Biometrik</p>
                      <div className="flex justify-center">
                        <div className="relative w-20 h-20">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                            className="w-full h-full rounded-full border-2 border-cyan-500 border-t-transparent" />
                          <div className="absolute inset-3 flex items-center justify-center">
                            <Scan className="w-8 h-8 text-cyan-500" />
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm ${textMuted}`}>Memindai data biometrik Anda...</p>
                      <StarshipButton onClick={advanceBiometric} className="w-full">
                        <ChevronRight className="w-4 h-4 mr-2" /> DATA TERKONFIRMASI — LANJUT
                      </StarshipButton>
                    </motion.div>
                  )}

                  {/* Step 3: Neural patterns — MANUAL */}
                  {verificationStep === 3 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
                      <p className={`text-xs font-mono uppercase tracking-widest ${textPrimary}`}>Langkah 3/5 — Analisis Pola Saraf</p>
                      <div className="flex justify-center">
                        <div className="relative w-20 h-20">
                          <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-2 border-purple-500 border-b-transparent" />
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                            className="absolute inset-2 rounded-full border border-cyan-500/50 border-t-transparent" />
                          <div className="absolute inset-4 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-purple-500" />
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm ${textMuted}`}>Menganalisis pola saraf...</p>
                      <StarshipButton onClick={advanceNeural} className="w-full">
                        <ChevronRight className="w-4 h-4 mr-2" /> POLA DIKENALI — LANJUT
                      </StarshipButton>
                    </motion.div>
                  )}

                  {/* Step 4: CAPTCHA */}
                  {verificationStep === 4 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <p className={`text-xs font-mono uppercase tracking-widest ${textPrimary} text-center`}>Langkah 4/5 — Kode Verifikasi</p>
                      <p className={`text-sm ${textMuted} text-center`}>Ketik kode di bawah ini:</p>
                      <div className="flex items-center gap-3">
                        <div className={`flex-1 text-center font-mono text-2xl tracking-[0.3em] py-3 ${dark ? "bg-white/5 border-white/20 text-slate-100" : "bg-gray-50 border-gray-300 text-gray-900"} rounded-lg border select-none shadow-inner`}>
                          {captchaCodeDisplay}
                        </div>
                        <button type="button" onClick={generateAlphanumericCaptcha}
                          className={`p-3 ${dark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors border ${dark ? "border-white/10" : "border-gray-200"}`}>
                          <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <StarshipInput
                        placeholder="Ketik kode di sini"
                        value={captchaInput}
                        onChange={(e) => { setCaptchaInput(e.target.value); if (showCaptchaError) setShowCaptchaError(false); }}
                        isInvalid={showCaptchaError}
                        error={showCaptchaError ? "Kode salah. Coba lagi." : undefined}
                      />
                      <StarshipButton onClick={handleCaptchaVerification} className="w-full">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> VERIFIKASI KODE
                      </StarshipButton>
                    </motion.div>
                  )}

                  {/* Step 5: Security question */}
                  {verificationStep === 5 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <p className={`text-xs font-mono uppercase tracking-widest ${textPrimary} text-center`}>Langkah 5/5 — Pertanyaan Keamanan</p>
                      <div className={`p-3 rounded-xl text-sm font-mono ${dark ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-300" : "bg-cyan-50 border-cyan-200 text-cyan-800"} border text-center`}>
                        {securityQuestion}
                      </div>
                      <StarshipInput
                        placeholder="Jawaban Anda..."
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSecurityVerification()}
                      />
                      <StarshipButton onClick={handleSecurityVerification} className="w-full">
                        <ArrowRight className="w-4 h-4 mr-2" /> VERIFIKASI AKHIR
                      </StarshipButton>
                    </motion.div>
                  )}

                  {/* Step 6: Verified */}
                  {verificationStep === 6 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-2">
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }} className="inline-block">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-green-500 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                        VERIFIKASI BERHASIL!
                      </h3>
                      <p className={`text-sm ${textMuted}`}>Semua sistem telah memverifikasi identitas Anda.</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── COUNTDOWN + REDIRECT ── */}
              {isHuman && !redirectCancelled && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col items-center">
                  <motion.div key={countdown} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className={`text-7xl font-bold mb-2 ${textPrimary}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    {countdown}
                  </motion.div>
                  <p className={`text-xs font-mono ${textMuted} flex items-center gap-1.5 mb-4`}>
                    <Zap className="w-3 h-3 text-yellow-500" /> Menstabilkan Warp Field...
                  </p>
                  <div className="flex gap-3 w-full">
                    <StarshipButton onClick={() => { setWarping(true); setTimeout(() => { window.location.href = data.originalUrl; }, 500); }} className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" /> JUMP NOW
                    </StarshipButton>
                    <button onClick={handleCancelRedirect}
                      className={`px-4 py-2 rounded-xl text-xs font-mono uppercase border ${dark ? "border-white/10 text-slate-400 hover:border-red-500/30 hover:text-red-400" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600"} transition-all`}>
                      BATALKAN
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Redirect cancelled */}
              {redirectCancelled && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`mb-6 p-4 rounded-xl border ${dark ? "bg-yellow-500/10 border-yellow-500/20" : "bg-yellow-50 border-yellow-300"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-yellow-500" />
                    <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wider">REDIRECT DIBATALKAN</h4>
                  </div>
                  <p className={`text-xs ${textMuted} mb-3`}>Lompatan warp telah dibatalkan.</p>
                  <StarshipButton onClick={handleResumeRedirect} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" /> LANJUTKAN REDIRECT
                  </StarshipButton>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {[
                    { icon: QrCode, label: "QR CODE", action: () => setShowQRCode(!showQRCode) },
                    { icon: Code, label: "SALIN LINK", action: () => copyToClipboard(`${window.location.protocol}//${window.location.host}/${code}`) },
                    { icon: Share2, label: "SHARE", action: () => {} },
                    { icon: BarChart3, label: "ANALITIK", action: () => {} },
                  ].map(({ icon: Icon, label, action }, i) => (
                    <button key={i} onClick={action}
                      className={`flex items-center gap-1.5 text-xs font-mono ${textPrimary} hover:opacity-70 transition-opacity`}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>
                <div className={`flex flex-wrap items-center justify-between text-xs font-mono ${textMuted} gap-2`}>
                  <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-green-500" /><span>SECURE</span></div>
                  <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-blue-500" /><span>EARTH_01</span></div>
                  <div className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-cyan-500" /><span>SIGNAL: STRONG</span></div>
                  <Link href="/">
                    <button className={`text-xs font-mono uppercase ${textMuted} hover:${textPrimary} transition-colors`}>ABORT</button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* QR Code modal */}
        <AnimatePresence>
          {showQRCode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowQRCode(false)}>
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`${cardBg} border rounded-2xl p-6 max-w-xs w-full ${cardShadow}`}
                onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold text-base ${textBody}`}>QR Code</h3>
                  <button onClick={() => setShowQRCode(false)} className={`p-1.5 rounded-lg ${dark ? "hover:bg-white/10 text-slate-400" : "hover:bg-gray-100 text-gray-500"} transition-colors`}>
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl flex justify-center">
                  <QRCode value={`${window.location.protocol}//${window.location.host}/${code}`} size={180} />
                </div>
                <p className={`text-xs ${textMuted} mt-3 text-center font-mono truncate`}>
                  {window.location.host}/{code}
                </p>
                <StarshipButton className="mt-4 w-full" onClick={() => setShowQRCode(false)} variant="outline">Tutup</StarshipButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Inline shield icon to avoid import conflict
function ShieldIcon({ className }: { className?: string }) {
  return <Shield className={className} />;
}
