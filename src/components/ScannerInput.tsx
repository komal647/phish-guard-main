import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Link, Mail, MessageSquare, Loader2, Sparkles, QrCode, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { QRScanner } from "./QRScanner";
import { ScreenshotScanner } from "./ScreenshotScanner";
import { PDFScanner } from "./PDFScanner";

interface ScannerInputProps {
  onScan: (content: string, type: 'auto' | 'url' | 'email' | 'sms') => void;
  isLoading: boolean;
}

export function ScannerInput({ onScan, isLoading }: ScannerInputProps) {
  const [content, setContent] = useState("");
  const [inputType, setInputType] = useState<'auto' | 'url' | 'email' | 'sms'>('auto');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [screenshotScannerOpen, setScreenshotScannerOpen] = useState(false);
  const [pdfScannerOpen, setPdfScannerOpen] = useState(false);

  const handleScan = () => {
    if (content.trim()) {
      onScan(content.trim(), inputType);
    }
  };

  const handleQRScan = (scannedContent: string) => {
    setContent(scannedContent);
    // Auto-detect URL type for QR codes
    if (scannedContent.startsWith('http://') || scannedContent.startsWith('https://')) {
      setInputType('url');
    }
  };

  const placeholders = {
    auto: "Paste a URL, email, or message to scan for phishing...",
    url: "Paste a URL to analyze (e.g., https://suspicious-site.com/login)",
    email: "Paste email content including headers if available...",
    sms: "Paste SMS or chat message to check for scams..."
  };

  const typeIcons = {
    auto: Sparkles,
    url: Link,
    email: Mail,
    sms: MessageSquare
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Input Type Selector */}
      <Tabs value={inputType} onValueChange={(v) => setInputType(v as typeof inputType)}>
        <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
          {(['auto', 'url', 'email', 'sms'] as const).map((type) => {
            const Icon = typeIcons[type];
            return (
              <TabsTrigger
                key={type}
                value={type}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {type === 'auto' ? 'Auto Detect' : type.toUpperCase()}
                </span>
                <span className="sm:hidden">
                  {type === 'auto' ? 'Auto' : type.toUpperCase()}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Input Area */}
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholders[inputType]}
          maxLength={10000}
          className={cn(
            "min-h-[160px] resize-none bg-card/50 border-border/50 text-foreground",
            "placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20",
            "font-mono text-sm pr-24"
          )}
        />

        {/* Scanner Buttons */}
        <div className="absolute top-3 right-3 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setPdfScannerOpen(true)}
            title="Upload Email PDF"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setScreenshotScannerOpen(true)}
            title="Scan Screenshot"
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setQrScannerOpen(true)}
            title="Scan QR Code"
          >
            <QrCode className="w-4 h-4" />
          </Button>
        </div>

        {/* Character count */}
        <div className={cn("absolute bottom-3 right-3 text-xs", content.length >= 10000 ? "text-destructive" : "text-muted-foreground/50")}>
          {content.length} / 10000 chars
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Screenshot Scanner Modal */}
      <ScreenshotScanner
        open={screenshotScannerOpen}
        onClose={() => setScreenshotScannerOpen(false)}
        onUrlsFound={(urls) => {
          if (urls.length === 1) {
            setContent(urls[0]);
            setInputType('url');
          } else if (urls.length > 1) {
            setContent(urls.join('\n'));
            setInputType('auto');
          }
        }}
      />

      {/* PDF Scanner Modal */}
      <PDFScanner
        open={pdfScannerOpen}
        onClose={() => setPdfScannerOpen(false)}
        onEmailExtracted={(emailContent, urls) => {
          setContent(emailContent);
          setInputType('email');
          // Auto-trigger scan after extraction
        }}
      />

      {/* Scan Button */}
      <Button
        onClick={handleScan}
        disabled={!content.trim() || isLoading}
        size="lg"
        className={cn(
          "w-full text-primary-foreground border-transparent relative overflow-hidden transition-all duration-300",
          isLoading ? "bg-primary/30" : "bg-primary hover:bg-primary/90 glow-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isLoading && <div className="absolute inset-0 animate-matrix opacity-70" />}
        <div className="relative z-10 flex items-center justify-center">
          {isLoading ? (
            <>
              <Shield className="w-5 h-5 mr-3 animate-pulse" />
              <span className="tracking-[0.2em] uppercase text-sm font-semibold text-primary">Decrypting...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Scan for Phishing
            </>
          )}
        </div>
      </Button>

      {/* Quick tips */}
      <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded bg-secondary/30">📄 Upload email PDFs for complete analysis</span>
        <span className="px-2 py-1 rounded bg-secondary/30">💡 Include headers for spoofing detection</span>
        <span className="px-2 py-1 rounded bg-secondary/30">📧 From, Subject, Reply-To for best results</span>
      </div>
    </motion.div>
  );
}
