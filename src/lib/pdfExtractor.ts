import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Initialize PDF.js worker
export function initPDFWorker() {
  try {
    const version = pdfjsLib.version;
    // Use a resilient approach with multiple fallbacks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Try different worker sources in order of preference
    const workerSources = [
      // Local/relative path (if available)
      `/pdf.worker.min.mjs`,
      // Fallback to node_modules if not bundled
      `/node_modules/pdfjs-dist/build/pdf.worker.min.mjs`,
      // CDN fallbacks
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`,
      `https://mozilla.github.io/pdf.js/build/pdf.worker.mjs`,
    ];

    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];

    console.log('PDF.js worker initialized');
  } catch (err) {
    console.warn('Error initializing PDF worker:', err);
  }
}

export interface ExtractionResult {
  text: string;
  pageCount: number;
  urls: string[];
  success: boolean;
  error?: string;
  usedOCR?: boolean;
}

/**
 * Extract text from PDF with comprehensive error handling and OCR fallback
 */
export async function extractPDFText(base64: string, maxPages = 10): Promise<ExtractionResult> {
  const result: ExtractionResult = {
    text: '',
    pageCount: 0,
    urls: [],
    success: false,
    usedOCR: false,
  };

  try {
    // Clean and validate base64
    const cleanBase64 = base64.includes('base64,') ? base64.split('base64,')[1] : base64;

    if (!cleanBase64 || cleanBase64.length === 0) {
      result.error = 'Invalid PDF data';
      return result;
    }

    // Decode base64 to bytes
    let bytes: Uint8Array;
    try {
      const binaryString = atob(cleanBase64);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
    } catch (decodeErr) {
      console.error(decodeErr);
      result.error = 'Invalid PDF format - base64 decoding failed';
      return result;
    }

    // Load PDF document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdf: any;
    try {
      const pdfPromise = pdfjsLib.getDocument({ data: bytes }).promise;
      const timeoutMs = 60000; // 60 second timeout for potentially heavy OCR
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PDF loading timeout')), timeoutMs)
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdf = await Promise.race([pdfPromise, timeoutPromise]) as any;
    } catch (loadErr) {
      const errMsg = loadErr instanceof Error ? loadErr.message : 'Unknown error';
      result.error = `PDF loading failed: ${errMsg}. The file may be corrupted or in an unsupported format.`;
      return result;
    }

    if (!pdf || !pdf.numPages || pdf.numPages === 0) {
      result.error = 'PDF has no pages or is corrupted';
      return result;
    }

    result.pageCount = pdf.numPages;

    // Extract text from pages
    let fullText = '';
    const pagesToProcess = Math.min(pdf.numPages, maxPages);
    let ocrUsed = false;

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);

        // Get text content
        const textContent = await page.getTextContent();

        // Join all text items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pageText = (textContent.items as Array<{ str?: string } | any>)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => {
            if (typeof item === 'object' && 'str' in item) {
              return item.str || '';
            }
            return '';
          })
          .join(' ');

        // If page text is very sparse, try OCR
        if (pageText.trim().length < 50) {
          console.log(`Page ${pageNum} has little text, attempting OCR...`);
          try {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;

              const dataUrl = canvas.toDataURL('image/png');
              const { data: { text: ocrText } } = await Tesseract.recognize(dataUrl, 'eng');

              if (ocrText && ocrText.trim().length > pageText.trim().length) {
                pageText += '\n[OCR] ' + ocrText;
                ocrUsed = true;
              }
            }
          } catch (ocrErr) {
            console.warn(`OCR failed for page ${pageNum}:`, ocrErr);
          }
        }

        fullText += pageText + '\n';
      } catch (pageErr) {
        console.warn(`Warning: Could not extract page ${pageNum}:`, pageErr);
        // Continue with next page
      }
    }

    result.usedOCR = ocrUsed;

    // Validate extracted text
    if (!fullText || fullText.trim().length === 0) {
      result.error = 'No text could be extracted from the PDF, even with OCR.';
      return result;
    }

    // Extract URLs from text
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    const urls = (fullText.match(urlRegex) || [])
      .filter(url => url.length > 10)
      .slice(0, 100);

    result.text = fullText;
    result.urls = [...new Set(urls)];
    result.success = true;

    return result;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    result.error = `PDF extraction failed: ${errMsg}`;
    console.error('PDF extraction error:', err);
    return result;
  }
}

/**
 * Check if a file is likely a valid PDF
 */
export function isValidPDFSignature(bytes: Uint8Array): boolean {
  // PDF files start with %PDF
  const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF in hex
  return bytes.length >= 4 &&
    bytes[0] === pdfSignature[0] &&
    bytes[1] === pdfSignature[1] &&
    bytes[2] === pdfSignature[2] &&
    bytes[3] === pdfSignature[3];
}
