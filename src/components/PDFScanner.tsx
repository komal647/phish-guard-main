import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { cn } from "@/lib/utils";
import { extractPDFText, initPDFWorker } from "@/lib/pdfExtractor";
import Tesseract from 'tesseract.js';

// Initialize PDF worker on load
initPDFWorker();

// Interface defined later


// Extract text from image using Tesseract OCR with improved error handling
async function extractTextFromImage(base64: string): Promise<string> {
  try {
    // Validate base64 data
    if (!base64 || base64.length === 0) {
      throw new Error('Invalid image data');
    }

    // Get image source URL or use base64 directly
    const imageSource = base64.includes('data:') ? base64 : `data:image/png;base64,${base64}`;
    
    try {
      // Add timeout for OCR
      const ocrPromise = Tesseract.recognize(imageSource, 'eng');
      const timeoutPromise = new Promise<Tesseract.RecognizeResult>((_, reject) =>
        setTimeout(() => reject(new Error('OCR processing timeout')), 60000)
      );
      
      const { data: { text } } = await Promise.race([ocrPromise, timeoutPromise]) as Tesseract.RecognizeResult;
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text detected in image');
      }
      
      return text;
    } catch (ocrErr) {
      console.error('OCR recognition error:', ocrErr);
      throw new Error(`OCR failed: ${ocrErr instanceof Error ? ocrErr.message : 'Unknown error'}`);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown image extraction error';
    console.error('Image extraction error:', err);
    throw new Error(`Failed to extract image: ${errorMsg}`);
  }
}

function extractUrlsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)];
}

interface PDFScannerProps {
  open: boolean;
  onClose: () => void;
  onEmailExtracted: (emailContent: string, urls: string[]) => void;
}

export function PDFScanner({ open, onClose, onEmailExtracted }: PDFScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or image file (PNG, JPG, WebP)");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum 10MB allowed.");
      return;
    }

    setIsProcessing(true);

    try {
      // Convert file to base64
      console.log(`Processing ${file.type} file: ${file.name} (${file.size} bytes)`);
      const base64 = await fileToBase64(file);
      
      let extractedText = '';
      let urls: string[] = [];

      try {
        console.log('Starting local extraction...');
        
        if (file.type === 'application/pdf') {
          console.log('Extracting PDF text...');
          const pdfResult = await extractPDFText(base64);
          
          if (!pdfResult.success) {
            setError(`PDF Error: ${pdfResult.error || 'Unknown error'}`);
            return;
          }
          
          extractedText = pdfResult.text;
          urls = pdfResult.urls;
          console.log(`Extracted ${extractedText.length} characters from ${pdfResult.pageCount} pages`);
        } else {
          console.log('Running OCR on image...');
          extractedText = await extractTextFromImage(base64);
          urls = extractUrlsFromText(extractedText);
        }
        
        console.log(`Found ${urls.length} URLs`);
        
        if (!extractedText || extractedText.trim().length === 0) {
          setError("Could not extract text from the file. The file may be encrypted, corrupted, or contain only images. Please try another file.");
          return;
        }

        onEmailExtracted(extractedText, urls);
        onClose();
      } catch (localErr) {
        const errorMsg = localErr instanceof Error ? localErr.message : "Failed to extract text from file";
        console.error('Local extraction error:', localErr);
        setError(`Extraction failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error("File processing error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to process document";
      setError(`Processing error: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  }, [onEmailExtracted, onClose]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Upload Email Document
          </DialogTitle>
          <DialogDescription>
            Upload a PDF or screenshot of an email to analyze it for phishing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50",
              isProcessing && "pointer-events-none opacity-50"
            )}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Analyzing {fileName}...
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Extracting email content and headers
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <FileUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    Drop your email document here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            )}

            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Tips */}
          <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
              For best results:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-5">
              <li>• Print/save the full email including headers</li>
              <li>• Include the sender's email address</li>
              <li>• Capture any links or buttons visible</li>
              <li>• Include the subject line if possible</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            onClick={onClose} 
            className="w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
