import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Upload, X, Loader2, Link, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Tesseract from 'tesseract.js';

interface ScreenshotScannerProps {
  open: boolean;
  onClose: () => void;
  onUrlsFound: (urls: string[]) => void;
}

export function ScreenshotScanner({ open, onClose, onUrlsFound }: ScreenshotScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedUrls, setExtractedUrls] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setError(null);
    setPreview(null);
    setExtractedUrls([]);
    setWarnings([]);
    setIsProcessing(false);
  }, []);

  const analyzeBrandColors = async (imageData: string, text: string): Promise<string[]> => {
    const findings: string[] = [];
    const lowerText = text.toLowerCase();

    // Create image to sample colors
    const img = new globalThis.Image();
    img.src = imageData;
    await new Promise(resolve => img.onload = resolve);

    // Draw to small canvas to get average/dominant color
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return findings;

    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    const data = ctx.getImageData(0, 0, 100, 100).data;

    // Simple color average
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const count = data.length / 4;
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    // Brand Color Checks (Heuristic)
    if (lowerText.includes('paypal')) {
      // PayPal should be blueish. If Red > Blue + Green, likely fake (or alert)
      if (r > b && r > g && r > 150) { // Very Red
        findings.push("⚠️ Visual Mismatch: 'PayPal' brand detected, but dominant color is Red. Official site uses Blue.");
      }
    }

    if (lowerText.includes('facebook') || lowerText.includes('meta')) {
      // Facebook is Blue. If detected Green/Orange, suspicious
      if (g > b * 1.5 && r > 100) {
        findings.push("⚠️ Visual Mismatch: 'Facebook' brand detected, but color scheme appears incorrect.");
      }
    }

    return findings;
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    setWarnings([]);
    setExtractedUrls([]);

    try {
      // Use local Tesseract OCR
      try {
        const { data: { text } } = await Tesseract.recognize(imageData, 'eng');

        // Check for Visual Brand Mismatches
        const brandWarnings = await analyzeBrandColors(imageData, text);
        setWarnings(brandWarnings);

        // Extract URLs from OCR text
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
        const httpUrls = (text.match(urlRegex) || []);

        // Also match bare domains (e.g. google.com)
        const bareDomainRegex = /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])\b/gi;
        const bareDomains = (text.match(bareDomainRegex) || [])
          .filter(d => d.includes('.') && !d.startsWith('http'));

        const allUrls = [...httpUrls, ...bareDomains]
          .filter(url => url.length > 4) // simple length check
          .slice(0, 20);

        const uniqueUrls = [...new Set(allUrls)];
        setExtractedUrls(uniqueUrls);

        if (uniqueUrls.length === 0) {
          setError("No URLs found in the image. Try a screenshot with clear, readable text containing URLs.");
        }
      } catch (ocrError) {
        console.error('Tesseract OCR error:', ocrError);
        setError("OCR processing failed. Try a screenshot with clearer text.");
      }
    } catch (err) {
      setError("Failed to process image. Please try again.");
      console.error("Image processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      await processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleFileUpload(file);
          return;
        }
      }
    }
  }, []);

  // Listen for paste events when dialog is open
  useState(() => {
    if (open) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  });

  const handleSelectUrl = (url: string) => {
    onUrlsFound([url]);
    onClose();
  };

  const handleScanAll = () => {
    onUrlsFound(extractedUrls);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { resetState(); onClose(); } }}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Screenshot Scanner
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />

              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center gap-4 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer",
                  "hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[200px] justify-center"
                )}
              >
                <div className="flex gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="p-3 rounded-full bg-secondary">
                    <Clipboard className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Drop, paste, or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Screenshot, email capture, or any image with URLs
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                💡 Tip: Use Ctrl+V (Cmd+V on Mac) to paste a screenshot directly
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="w-full max-h-[200px] object-contain bg-black/20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={resetState}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Processing State */}
              {isProcessing && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-muted-foreground">Extracting URLs with AI...</p>
                </div>
              )}

              {/* Error Display */}
              {error && !isProcessing && (
                <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              {/* Warning Display */}
              {warnings.length > 0 && !isProcessing && (
                <div className="space-y-2">
                  {warnings.map((warning, idx) => (
                    <div key={idx} className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">{warning}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted URLs */}
              {extractedUrls.length > 0 && !isProcessing && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Found {extractedUrls.length} URL{extractedUrls.length > 1 ? 's' : ''}:
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {extractedUrls.map((url, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg group"
                      >
                        <Link className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-mono truncate flex-1">{url}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleSelectUrl(url)}
                        >
                          Scan
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {extractedUrls.length > 1 && (
                    <Button onClick={handleScanAll} className="w-full">
                      Scan All {extractedUrls.length} URLs
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
