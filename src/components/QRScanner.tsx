import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, Upload, X, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (content: string) => void;
}

export function QRScanner({ open, onClose, onScan }: QRScannerProps) {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountId = "qr-reader";

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop scanner:", e);
      }
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsScanning(true);
    
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(mountId);
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        () => {} // Ignore scan errors (no QR in frame)
      );
    } catch (err) {
      setError("Camera access denied or unavailable. Try uploading an image instead.");
      setIsScanning(false);
    }
  }, [onScan, onClose, stopScanner]);

  useEffect(() => {
    if (open && mode === 'camera') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => startCamera(), 100);
      return () => clearTimeout(timer);
    }
    return () => {
      stopScanner();
    };
  }, [open, mode, startCamera, stopScanner]);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setError(null);
      setIsScanning(false);
    }
  }, [open, stopScanner]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsScanning(true);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(mountId, false);
      }

      const result = await scannerRef.current.scanFile(file, true);
      onScan(result);
      onClose();
    } catch (err) {
      setError("No QR code found in the image. Please try another image.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const switchMode = async (newMode: 'camera' | 'upload') => {
    await stopScanner();
    setError(null);
    setIsScanning(false);
    setMode(newMode);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        {/* Mode Switcher */}
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          <Button
            variant={mode === 'camera' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => switchMode('camera')}
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={mode === 'upload' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => switchMode('upload')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Scanner Area */}
        <div className="relative min-h-[300px] bg-black/50 rounded-lg overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === 'camera' ? (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <div id={mountId} className="w-full h-full" />
                
                {isScanning && !error && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-primary rounded-lg">
                      <motion.div
                        className="absolute inset-x-0 h-0.5 bg-primary"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[300px] p-6"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-file-input"
                />
                
                {isScanning ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground">Scanning image...</p>
                  </div>
                ) : (
                  <label
                    htmlFor="qr-file-input"
                    className={cn(
                      "flex flex-col items-center gap-4 p-8 border-2 border-dashed border-border rounded-lg cursor-pointer",
                      "hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    )}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="font-medium text-foreground">Upload QR Code Image</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or GIF</p>
                    </div>
                  </label>
                )}
                
                {/* Hidden element for html5-qrcode file scanning */}
                <div id={mountId} className="hidden" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-4 bottom-4 p-3 bg-destructive/20 border border-destructive/50 rounded-lg"
            >
              <p className="text-sm text-destructive text-center">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Tips */}
        <p className="text-xs text-muted-foreground text-center">
          💡 Point camera at a QR code or upload an image containing one
        </p>
      </DialogContent>
    </Dialog>
  );
}
