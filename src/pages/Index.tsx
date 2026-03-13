import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ScannerInput } from "@/components/ScannerInput";
import { ScanResult } from "@/components/ScanResult";
import { ScanHistory } from "@/components/ScanHistory";
import { detectPhishing, addToScanHistory, migrateLocalHistoryToDb, type DetectionResult } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, History, Zap, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [activeTab, setActiveTab] = useState("scan");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Migrate local history to database when user signs in
  useEffect(() => {
    if (user) {
      migrateLocalHistoryToDb().then((count) => {
        if (count > 0) {
          toast({
            title: "History synced!",
            description: `${count} scan${count > 1 ? 's' : ''} migrated to your account.`,
          });
          setHistoryRefresh(prev => prev + 1);
        }
      });
    }
  }, [user, toast]);

  const handleScan = useCallback(async (content: string, type: 'auto' | 'url' | 'email' | 'sms') => {
    setIsLoading(true);
    setResult(null);
    try {
      const detectionResult = await detectPhishing(content, type);
      setResult(detectionResult);
      await addToScanHistory(content, detectionResult, user?.uid ?? null);
      setHistoryRefresh(prev => prev + 1);


      if (detectionResult.label === 'phishing') {
        toast({ title: "⚠️ Phishing Detected!", description: "Do not interact with this content.", variant: "destructive" });
      } else if (detectionResult.label === 'suspicious') {
        toast({ title: "⚡ Suspicious Content", description: "Proceed with caution." });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: errorMessage || "Failed to analyze content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.uid]);

  const handleNewScan = () => { setResult(null); setActiveTab("scan"); };
  const handleRescan = (content: string) => { setActiveTab("scan"); setResult(null); setTimeout(() => handleScan(content, 'auto'), 100); };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 bg-secondary/50">
            <TabsTrigger value="scan" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><Shield className="w-4 h-4 mr-2" />Scanner</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"><History className="w-4 h-4 mr-2" />History</TabsTrigger>
          </TabsList>
          <TabsContent value="scan" className="space-y-8">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-center mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">Protect Yourself from <span className="gradient-text">Phishing Attacks</span></h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Paste any URL, email, or message to instantly detect phishing attempts.</p>
                    </motion.div>
                    <motion.div className="flex flex-wrap justify-center gap-3 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      {[{ icon: "🔗", text: "URL Analysis" }, { icon: "📧", text: "Email Detection" }, { icon: "💬", text: "SMS Scanning" }, { icon: "📱", text: "QR Codes" }, { icon: "🖼️", text: "Screenshots" }, { icon: "🤖", text: "AI-Powered" }].map((f, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-secondary/50 text-sm text-muted-foreground flex items-center gap-2"><span>{f.icon}</span>{f.text}</span>
                      ))}
                    </motion.div>
                  </div>
                  <ScannerInput onScan={handleScan} isLoading={isLoading} />
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 mt-8">
                      <div className="relative w-20 h-20">
                        <motion.div className="absolute inset-0 rounded-full border-4 border-primary/30" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                        <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-6 h-6 text-primary animate-pulse" /></div>
                      </div>
                      <p className="text-muted-foreground">Analyzing content...</p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanResult result={result} onNewScan={handleNewScan} />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="history"><ScanHistory onRescan={handleRescan} refreshTrigger={historyRefresh} /></TabsContent>
        </Tabs>
      </main>
      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>PhishGuard — AI-Powered Phishing Detection</p>
        </div>
      </footer>
    </div>
  );
}
