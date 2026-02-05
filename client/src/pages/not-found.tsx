import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { 
  AlertTriangle, Search, ExternalLink, Copy, Check, 
  Globe, Wifi, WifiOff, RefreshCw, Zap, 
  Activity, Database, ArrowLeft, Compass, Radar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StarshipCard } from "@/components/StarshipCard";
import { StarshipButton } from "@/components/StarshipButton";
import { StarshipInput } from "@/components/StarshipInput";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function NotFound() {
  const [match, params] = useRoute("/:code");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [recentUrls, setRecentUrls] = useState<any[]>([]);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [urlExists, setUrlExists] = useState<boolean | null>(null);
  const [suggestedUrls, setSuggestedUrls] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Get the attempted URL
  const attemptedUrl = params?.code 
    ? `${window.location.protocol}//${window.location.host}/${params.code}` 
    : window.location.href;
  
  // Fetch recent URLs on mount
  useEffect(() => {
    const fetchRecentUrls = async () => {
      try {
        const res = await apiRequest("GET", "/api/recent");
        const data = await res.json();
        setRecentUrls(data.slice(0, 5)); // Limit to 5 most recent
      } catch (error) {
        console.error("Failed to fetch recent URLs:", error);
      }
    };
    
    fetchRecentUrls();
  }, []);
  
  // Check if URL exists
  useEffect(() => {
    if (params?.code) {
      const checkUrl = async () => {
        setIsCheckingUrl(true);
        try {
          const res = await apiRequest("GET", `/api/check/${params.code}`);
          const data = await res.json();
          setUrlExists(data.exists);
          
          // Generate suggestions if URL doesn't exist
          if (!data.exists) {
            generateSuggestions(params.code);
          }
        } catch (error) {
          console.error("Failed to check URL:", error);
          setUrlExists(false);
          generateSuggestions(params.code);
        } finally {
          setIsCheckingUrl(false);
        }
      };
      
      checkUrl();
    }
  }, [params?.code]);
  
  // Generate similar URL suggestions
  const generateSuggestions = (code: string) => {
    const suggestions = [
      `${code.slice(0, -1)}${Math.floor(Math.random() * 10)}`,
      `${code.slice(0, -2)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
      `${code}_${Math.floor(Math.random() * 1000)}`,
      `${code}${Math.random() > 0.5 ? '1' : '2'}`
    ];
    setSuggestedUrls(suggestions);
  };
  
  // Search for short URLs
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await apiRequest("GET", `/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Copy URL to clipboard
  const copyToClipboard = (url: string, index?: number) => {
    navigator.clipboard.writeText(url);
    toast({ 
      title: "COORDINATES COPIED", 
      description: "URL ready for navigation." 
    });
    setCopiedIndex(index !== undefined ? index : -1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  // Navigate to URL
  const navigateToUrl = (url: string) => {
    window.location.href = url;
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="star-field"><div/></div>
      <div className="scanline" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-destructive/20"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        ))}
      </div>
      
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 z-10">
        {/* Left side: Error message and attempted URL */}
        <StarshipCard title="ERROR 404" className="text-center">
          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-display mb-4 text-destructive/90">PAGE NOT FOUND</h1>
          <p className="font-mono text-destructive/70 mb-6">
            SECTOR NOT FOUND. THE VOID STARES BACK.
          </p>
          
          {/* Attempted URL display */}
          <div className="mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-xs text-destructive/70 mb-1 font-mono">ATTEMPTED COORDINATES:</p>
            <p className="font-mono text-sm text-destructive/90 break-all">{attemptedUrl}</p>
            
            <div className="mt-3 flex items-center justify-center">
              {isCheckingUrl ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-destructive" />
                  <span className="text-xs text-destructive/70">SCANNING SECTOR...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {urlExists !== null && (
                    <>
                      {urlExists ? (
                        <>
                          <Wifi className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">SIGNAL DETECTED</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-4 h-4 text-destructive" />
                          <span className="text-xs text-destructive">NO SIGNAL</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Suggested URLs if not found */}
          {!urlExists && suggestedUrls.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-destructive/70 mb-2 font-mono">SUGGESTED COORDINATES:</p>
              <div className="space-y-2">
                {suggestedUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                    <span className="font-mono text-sm text-destructive/90 flex-1 truncate">
                      {window.location.protocol}//{window.location.host}/{url}
                    </span>
                    <button 
                      onClick={() => navigateToUrl(`${window.location.protocol}//${window.location.host}/${url}`)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-destructive/70" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Link href="/">
            <StarshipButton variant="destructive" className="w-full">
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                EMERGENCY EVAC
              </div>
            </StarshipButton>
          </Link>
        </StarshipCard>
        
        {/* Right side: Search and recent URLs */}
        <div className="space-y-6">
          {/* URL Search */}
          <StarshipCard title="SECTOR SEARCH" className="text-center">
            <div className="mb-4">
              <div className="relative">
                <StarshipInput
                  placeholder="Search for short URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            </div>
            
            {/* Search results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2"
                >
                  {searchResults.map((result, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <p className="font-mono text-sm text-primary/90 truncate">
                            {window.location.protocol}//{window.location.host}/{result.code}
                          </p>
                          <p className="font-mono text-xs text-secondary/70 truncate">
                            {result.originalUrl}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/${result.code}`, i)}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                          >
                            {copiedIndex === i ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-secondary/70" />
                            )}
                          </button>
                          <button
                            onClick={() => navigateToUrl(result.originalUrl)}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-secondary/70" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="mt-4 text-center">
                <p className="text-sm text-secondary/70">No matching sectors found</p>
              </div>
            )}
          </StarshipCard>
          
          {/* Recent URLs */}
          <StarshipCard title="RECENT SECTORS" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-primary mr-2" />
              <span className="text-xs text-primary/70 font-mono">DATABASE RECORDS</span>
            </div>
            
            {recentUrls.length > 0 ? (
              <div className="space-y-2">
                {recentUrls.map((url, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-left">
                        <p className="font-mono text-sm text-primary/90 truncate">
                          {window.location.protocol}//{window.location.host}/{url.code}
                        </p>
                        <p className="font-mono text-xs text-secondary/70 truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/${url.code}`, i + 100)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          {copiedIndex === i + 100 ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-secondary/70" />
                          )}
                        </button>
                        <button
                          onClick={() => navigateToUrl(url.originalUrl)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-secondary/70" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Database className="w-8 h-8 text-secondary/50 mx-auto mb-2" />
                <p className="text-sm text-secondary/70">No recent sectors</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link href="/">
                <button className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Compass className="w-4 h-4 text-primary/70" />
                  <span className="text-sm text-primary/70">EXPLORE ALL SECTORS</span>
                </button>
              </Link>
            </div>
          </StarshipCard>
        </div>
      </div>
      
      {/* Radar animation in corner */}
      <div className="absolute bottom-8 right-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          className="relative"
        >
          <Radar className="w-16 h-16 text-primary/20" />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-primary/30"
          />
        </motion.div>
      </div>
    </div>
  );
}