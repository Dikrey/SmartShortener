import { useEffect, useState, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence, useAnimation, useSpring } from "framer-motion";
import { 
  AlertTriangle, ExternalLink, Loader2, Rocket, Zap, 
  Shield, Fingerprint, CheckCircle2, XCircle, Activity,
  Globe, Lock, Eye, EyeOff, Volume2, VolumeX, Sparkles,
  Cpu, Wifi, RefreshCw, ChevronRight, Search, Share2,
  QrCode, Camera, Scan, Radar, AlertCircle, BarChart3,
  Download, Info, ArrowRight, Terminal, Code, LockKeyhole
} from "lucide-react";

import { useResolveUrl } from "@/hooks/use-urls";
import { StarshipCard } from "@/components/StarshipCard";
import { StarshipButton } from "@/components/StarshipButton";
import { StarshipInput } from "@/components/StarshipInput";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query"; 
import { api } from "@shared/routes"; 


export default function Redirect() {
  const [, params] = useRoute("/:code");
  const code = params?.code || "";
  const { data, isLoading, error } = useResolveUrl(code);
  const { toast } = useToast(); // Moved up
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // All useState declarations grouped together
  const [countdown, setCountdown] = useState(10);
  const [warping, setWarping] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanningComplete, setScanningComplete] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [redirectCancelled, setRedirectCancelled] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showUrlPreview, setShowUrlPreview] = useState(false);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

 
  const isHuman = data?.isPasswordProtected ? (passwordVerified && captchaVerified) : captchaVerified; // Depends on data, passwordVerified, captchaVerified
  const verifyPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", api.urls.verifyPassword.path.replace(":code", code), { password });
      return res.json();
    },
    onSuccess: () => {
      setPasswordVerified(true);
      setPasswordError(null);
      toast({
        title: "ACCESS GRANTED",
        description: "Password verified. Proceeding to human verification.",
        variant: "success",
      });
    },
    onError: (err: any) => {
      setPasswordError(err.message || "Incorrect password. Access denied.");
      toast({
        title: "ACCESS DENIED",
        description: err.message || "Incorrect password.",
        variant: "destructive",
      });
    },
  });


  useEffect(() => {
    if (data) {
      if (data.isPasswordProtected && !passwordVerified) {
        setShowPasswordPrompt(true);
      } else if (!data.isPasswordProtected) {
        setPasswordVerified(true); 
      }
    }
  }, [data, passwordVerified]); 

 
  useEffect(() => {
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
    
 
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
    
    const questions = [
      "What is the color of the sky?",
      "How many days in a week?",
      "What is 2 + 2?",
      "What comes after Monday?"
    ];
    setSecurityQuestion(questions[Math.floor(Math.random() * questions.length)]);
  }, []);


  useEffect(() => {
   
    if (data && (!data.isPasswordProtected || passwordVerified) && !captchaVerified) {
      const scanInterval = setInterval(() => {
        setSecurityLevel(prev => {
          if (prev >= 100) {
            clearInterval(scanInterval);
            setScanningComplete(true);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      
      return () => clearInterval(scanInterval);
    }
  }, [data, passwordVerified, captchaVerified]);

  useEffect(() => {

    if (data && (!data.isPasswordProtected || passwordVerified) && captchaVerified && !redirectCancelled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setWarping(true);
            setTimeout(() => {
              if (!redirectCancelled) {
                window.location.href = data.originalUrl;
              }
            }, 1000);
            return 0;
          }
 
          if (prev <= 3) {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [data, passwordVerified, captchaVerified, redirectCancelled]);


  const handleHumanVerification = () => {
    setVerificationStep(1);
    setTimeout(() => {
      setVerificationStep(2);
      setTimeout(() => {
        setVerificationStep(3);
      }, 1500);
    }, 1000);
  };

  const handleCaptchaVerification = () => {
    const [num1, num2] = captchaQuestion.split(' + ').map((n, i) => i === 0 ? parseInt(n) : parseInt(n.split(' =')[0]));
    const correctAnswer = num1 + num2;
    
    if (parseInt(captchaAnswer) === correctAnswer) {
      setVerificationStep(4);
      setTimeout(() => {
        setCaptchaVerified(true);
        controls.start({ scale: [1, 1.2, 1] });
      }, 1500);
    } else {

      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 500);
    }
  };

  const handleSecurityVerification = () => {
    const correctAnswers = {
      "What is the color of the sky?": "blue",
      "How many days in a week?": "7",
      "What is 2 + 2?": "4",
      "What comes after Monday?": "tuesday"
    };
    
    if (securityAnswer.toLowerCase() === (correctAnswers[securityQuestion as keyof typeof correctAnswers] || "")) {
      setCaptchaVerified(true);
      controls.start({ scale: [1, 1.2, 1] });
    } else {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 500);
    }
  };


  const handleCancelRedirect = () => {
    setRedirectCancelled(true);
    setWarping(false);
  };

  const handleResumeRedirect = () => {
    setRedirectCancelled(false);
    setCountdown(5);
  };

  const fetchUrlPreview = useCallback(async () => {
    if (!data?.originalUrl) return;
    
    try {
      setTimeout(() => {
        setUrlPreview("https://picsum.photos/seed/preview/800/600.jpg");
      }, 1500);
    } catch (error) {
      console.error("Failed to fetch URL preview:", error);
    }
  }, [data?.originalUrl]);


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {

      setTimeout(() => {
        setSearchResults([
          { code: "abc123", originalUrl: "https://example.com/page1" },
          { code: "def456", originalUrl: "https://example.com/page2" },
          { code: "ghi789", originalUrl: "https://example.com/page3" }
        ]);
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      console.error("Search failed:", error);
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);

  };

  const mainContent = (
    <>
      <div className="star-field">
        <div/>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
              x: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{
              duration: particle.speed,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>
      <div className="scanline" />
      {glitchActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-white pointer-events-none"
        />
      )}
    </>
  )

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`} ref={containerRef}>
        {mainContent}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          className="mb-8"
        >
          <Loader2 className={`w-16 h-16 ${darkMode ? 'text-primary' : 'text-blue-600'} animate-pulse`} />
        </motion.div>
        <h2 className={`text-xl font-display ${darkMode ? 'text-primary/80' : 'text-blue-600/80'} animate-pulse text-center tracking-widest`}>
          DECODING UPLINK...
        </h2>
        
     
        <div className="w-64 mt-8">
          <div className={`h-2 ${darkMode ? 'bg-white/10' : 'bg-gray-300'} rounded-full overflow-hidden`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary to-blue-500"
            />
          </div>
        </div>
     
        <div className="mt-6 text-center">
          <motion.div
            key={Math.floor(Math.random() * 1000)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-sm ${darkMode ? 'text-primary/60' : 'text-blue-600/60'} font-mono`}
          >
            {[
              "Initializing quantum tunnel...",
              "Calibrating navigation matrix...",
              "Scanning for anomalies...",
              "Establishing secure connection...",
              "Analyzing destination vector..."
            ][Math.floor(Math.random() * 5)]}
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`} ref={containerRef}>
        {mainContent}
        <StarshipCard title="SYSTEM CRITICAL" className={`max-w-md w-full text-center z-10 ${darkMode ? '' : 'bg-white shadow-lg'}`}>
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <AlertTriangle className="w-16 h-16 text-destructive" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-display mb-4 text-destructive/90">COORDINATES LOST</h1>
          <p className={`font-mono text-sm mb-8 ${darkMode ? 'text-destructive/70' : 'text-red-600/70'}`}>
            The target signal has degraded or never existed in this sector.
          </p>
          
          {/* Search for similar URLs */}
          <div className="mb-6">
            <div className="relative">
              <StarshipInput
                placeholder="Search for similar URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result, i) => (
                  <div key={i} className={`p-3 ${darkMode ? 'bg-white/5' : 'bg-gray-100'} rounded-lg border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <p className={`font-mono text-sm ${darkMode ? 'text-primary/90' : 'text-blue-900/90'} truncate`}>
                          {window.location.protocol}//{window.location.host}/{result.code}
                        </p>
                        <p className={`font-mono text-xs ${darkMode ? 'text-secondary/70' : 'text-gray-600/70'} truncate`}>
                          {result.originalUrl}
                        </p>
                      </div>
                      <button
                        onClick={() => window.location.href = `${window.location.protocol}//${window.location.host}/${result.code}`}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <Link href="/">
              <StarshipButton variant="destructive" className="w-full">
                RETURN TO COMMAND
              </StarshipButton>
            </Link>
            
            <Link href="/create">
              <StarshipButton variant="outline" className="w-full">
                CREATE NEW SHORT URL
              </StarshipButton>
            </Link>
          </div>
        </StarshipCard>
      </div>
    );
  }

  return (
    <div className={`min-h-screen galaxy-flow-bg flex flex-col items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`} ref={containerRef}>
      {mainContent}
      
      {/* Warp effect */}
      <AnimatePresence>
        {warping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full h-1 bg-primary"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 3 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-white text-2xl font-display"
                >
                  INITIATING WARP JUMP...
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

            
            {/* Warp effect */}
            <AnimatePresence>
              {warping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-full h-1 bg-primary"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 3 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-white text-2xl font-display"
                      >
                        INITIATING WARP JUMP...
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
      
            {/* Password Prompt or Main Content */}
            {data?.isPasswordProtected && !passwordVerified ? (
              <StarshipCard title="ACCESS RESTRICTED" className={`max-w-md w-full text-center z-10 group hover:shadow-cyan-500/50 hover:border-cyan-500/50 transition-all duration-300 ${darkMode ? '' : 'bg-white shadow-xl'}`}>
                <div className="mb-6">
                  <LockKeyhole className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-display mb-2 text-primary">PASSWORD REQUIRED</h3>
                  <p className="text-sm text-secondary">
                    This transmission is encrypted. Please provide the key to proceed.
                  </p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); verifyPasswordMutation.mutate(passwordInput); }} className="space-y-4">
                  <StarshipInput
                    label="TRANSMISSION KEY"
                    type="password"
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    error={passwordError || undefined}
                    required
                    isPassword // Use the isPassword prop
                  />
                  <StarshipButton type="submit" disabled={verifyPasswordMutation.isPending} className="w-full">
                    {verifyPasswordMutation.isPending ? "VERIFYING..." : "UNLOCK TRANSMISSION"}
                  </StarshipButton>
                </form>
              </StarshipCard>
            ) : (
              <StarshipCard title="WARP SIGNATURE DETECTED" className={`max-w-2xl w-full text-center z-10 group hover:shadow-cyan-500/50 hover:border-cyan-500/50 transition-all duration-300 ${darkMode ? '' : 'bg-white shadow-xl'}`}>
                {/* Theme toggle */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {darkMode ? <Sparkles className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Sound toggle */}
                <div className="absolute top-4 right-16">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
      
                {/* URL Information */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2 text-primary/70 mb-4 text-sm font-display tracking-widest">
                    <Rocket className="w-4 h-4" />
                    TARGET ACQUIRED
                  </div>
                  <p className="font-mono text-xs text-secondary mb-2 uppercase tracking-tighter">Destination Vector:</p>
                  <p className={`font-mono text-primary/90 break-all p-4 rounded-md ${darkMode ? 'bg-primary/5 border border-primary/20' : 'bg-blue-50 border border-blue-200'}`}>
                    {data.originalUrl}
                  </p>
                  
                  {/* URL Preview */}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setShowUrlPreview(!showUrlPreview);
                        if (!showUrlPreview && !urlPreview) {
                          fetchUrlPreview();
                        }
                      }}
                      className={`flex items-center justify-center gap-2 text-xs ${darkMode ? 'text-primary/70' : 'text-blue-700/70'} hover:text-primary transition-colors`}
                    >
                      <Camera className="w-3 h-3" />
                      {showUrlPreview ? 'HIDE' : 'SHOW'} PREVIEW
                    </button>
                    
                    <AnimatePresence>
                      {showUrlPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 rounded-lg overflow-hidden border border-primary/20"
                        >
                          {urlPreview ? (
                            <img src={urlPreview} alt="URL Preview" className="w-full" />
                          ) : (
                            <div className={`h-40 ${darkMode ? 'bg-primary/10' : 'bg-blue-100'} flex items-center justify-center`}>
                              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Security scan indicator */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-secondary">Security Scan:</p>
                      <p className="text-xs text-primary">{Math.round(securityLevel)}%</p>
                    </div>
                    <div className={`h-2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${securityLevel}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      />
                    </div>
                  </div>
                  
                  {/* URL Security Rating */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">SECURE CONNECTION</span>
                    <Info className="w-3 h-3 text-secondary/50 cursor-pointer" />
                  </div>
                </div>
      
                {/* Human Verification Section */}
                {!isHuman && (
                  <div className={`mb-8 p-4 ${darkMode ? 'bg-white/5' : 'bg-gray-100'} rounded-lg border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-center mb-4">
                      <LockKeyhole className="w-8 h-8 text-primary mr-2" />
                      <h3 className="text-lg font-display text-primary">ADVANCED SECURITY VERIFICATION</h3>
                    </div>
                    
                    {verificationStep === 0 && (
                      <div className="space-y-4">
                        <p className="text-sm text-secondary">
                          Please complete the security verification to proceed to the destination.
                        </p>
                        <StarshipButton onClick={handleHumanVerification} className="w-full">
                          <div className="flex items-center justify-center gap-2">
                            <Fingerprint className="w-4 h-4" />
                            BEGIN VERIFICATION
                          </div>
                        </StarshipButton>
                      </div>
                    )}
                    
                    {verificationStep === 1 && (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                          >
                            <Scan className="w-12 h-12 text-primary" />
                          </motion.div>
                        </div>
                        <p className="text-sm text-secondary">Scanning biometric data...</p>
                      </div>
                    )}
                    
                    {verificationStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                          >
                            <Radar className="w-12 h-12 text-primary" />
                          </motion.div>
                        </div>
                        <p className="text-sm text-secondary">Analyzing neural patterns...</p>
                      </div>
                    )}
                    
                    {verificationStep === 3 && (
                      <div className="space-y-4">
                        <p className="text-sm text-secondary mb-4">Solve the security challenge:</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-lg">{captchaQuestion}</span>
                          <StarshipInput
                            type="number"
                            value={captchaAnswer}
                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                            className="w-24 text-center"
                          />
                        </div>
                        <StarshipButton onClick={handleCaptchaVerification} className="w-full">
                          VERIFY
                        </StarshipButton>
                      </div>
                    )}
                    
                    {verificationStep === 4 && (
                      <div className="space-y-4">
                        <p className="text-sm text-secondary mb-4">Answer the security question:</p>
                        <p className="font-mono text-sm mb-2">{securityQuestion}</p>
                        <StarshipInput
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          placeholder="Your answer..."
                        />
                        <StarshipButton onClick={handleSecurityVerification} className="w-full">
                          FINAL VERIFICATION
                        </StarshipButton>
                      </div>
                    )}
                  </div>
                )}
      
                {/* Countdown and redirect controls */}
                {isHuman && !redirectCancelled && (
                  <div className="mb-8 flex flex-col items-center">
                    <motion.div 
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-7xl font-display text-primary glow-text mb-2"
                    >
                      {countdown}
                    </motion.div>
                    <p className="text-xs font-display text-secondary animate-pulse flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Stabilizing Warp Field...
                    </p>
                  </div>
                )}
      
                {/* Redirect cancelled state */}
                {redirectCancelled && (
                  <div className={`mb-8 p-4 ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-100'} rounded-lg border ${darkMode ? 'border-yellow-500/20' : 'border-yellow-300'}`}>
                    <div className="flex items-center justify-center mb-2">
                      <XCircle className="w-8 h-8 text-yellow-500 mr-2" />
                      <h3 className="text-lg font-display text-yellow-500">REDIRECT CANCELLED</h3>
                    </div>
                    <p className="text-sm text-secondary mb-4">
                      The warp jump has been aborted for your safety.
                    </p>
                    <StarshipButton onClick={handleResumeRedirect} className="w-full">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        RESUME REDIRECT
                      </div>
                    </StarshipButton>
                  </div>
                )}
      
                {/* Action buttons */}
                <div className="space-y-4">
                  {isHuman && !redirectCancelled && (
                    <StarshipButton
                      onClick={() => {
                        setWarping(true);
                        setTimeout(() => {
                          if (!redirectCancelled) {
                            window.location.href = data.originalUrl;
                          }
                        }, 500);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>JUMP NOW</span>
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </StarshipButton>
                  )}
                  
                  <div className="flex justify-between">
                    <Link href="/">
                      <button className="text-xs font-display text-secondary/50 hover:text-secondary transition-colors uppercase tracking-widest">
                        ABORT
                      </button>
                    </Link>
                    
                    {isHuman && (
                      <button 
                        onClick={handleCancelRedirect}
                        className="text-xs font-display text-secondary/50 hover:text-secondary transition-colors uppercase tracking-widest"
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Additional features */}
                <div className="mt-8 pt-4 border-t border-white/10">
                  <div className="flex justify-center gap-4 mb-4">
                    <button
                      onClick={() => setShowQRCode(!showQRCode)}
                      className={`flex items-center gap-2 text-xs ${darkMode ? 'text-primary/70' : 'text-blue-700/70'} hover:text-primary transition-colors`}
                    >
                      <QrCode className="w-3 h-3" />
                      QR CODE
                    </button>
                    <button
                      onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/${code}`)}
                      className={`flex items-center gap-2 text-xs ${darkMode ? 'text-primary/70' : 'text-blue-700/70'} hover:text-primary transition-colors`}
                    >
                      <Code className="w-3 h-3" />
                      COPY LINK
                    </button>
                    <button
                      className={`flex items-center gap-2 text-xs ${darkMode ? 'text-primary/70' : 'text-blue-700/70'} hover:text-primary transition-colors`}
                    >
                      <Share2 className="w-3 h-3" />
                      SHARE
                    </button>
                    <button
                      className={`flex items-center gap-2 text-xs ${darkMode ? 'text-primary/70' : 'text-blue-700/70'} hover:text-primary transition-colors`}
                    >
                      <BarChart3 className="w-3 h-3" />
                      ANALYTICS
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-secondary/70">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>SECURE CONNECTION</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      <span>REGION: EARTH_01</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3 h-3" />
                      <span>SIGNAL: STRONG</span>
                    </div>
                  </div>
                </div>
              </StarshipCard>
            )}      
   
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
              className={`${darkMode ? 'bg-slate-900' : 'bg-white'} ${darkMode ? 'border-white/10' : 'border-gray-200'} border rounded-xl p-6 max-w-sm w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-display uppercase tracking-widest text-white">QR CODE</h3>
                <button 
                  onClick={() => setShowQRCode(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <XCircle className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className={`${darkMode ? 'bg-white' : 'bg-gray-100'} p-4 rounded-lg flex justify-center`}>
              
                <div className="w-48 h-48 bg-black flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-white" />
                </div>
              </div>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'} mt-4 text-center`}>
                Scan this code to quickly access the link
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}