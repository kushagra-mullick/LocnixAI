
import * as pdfjs from 'pdfjs-dist';

// Initialize the PDF.js worker - using a different approach that works with Vite
const pdfWorkerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export const extractTextFromPdf = async (
  pdfFile: File,
  onProgress: (progress: number) => void,
  onSuccess: (text: string) => void,
  onError: (error: string) => void
) => {
  try {
    const fileReader = new FileReader();
    
    fileReader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read the PDF file");
        }
        
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        const loadingTask = pdfjs.getDocument({ data: typedArray });
        
        // Provide initial progress
        onProgress(10);
        
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        let extractedText = '';
        
        // Extract text from each page
        for (let i = 1; i <= numPages; i++) {
          // Update progress based on page number
          onProgress(10 + Math.floor((i / numPages) * 80));
          
          try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            
            extractedText += pageText + '\n\n';
          } catch (pageError) {
            console.error(`Error extracting text from page ${i}:`, pageError);
            // Continue with other pages even if one fails
          }
        }
        
        // Final progress
        onProgress(100);
        onSuccess(extractedText);
        
      } catch (error) {
        console.error("PDF extraction error:", error);
        onError("Failed to extract text from the PDF. Please try a different file.");
      }
    };
    
    fileReader.onerror = () => {
      onError("Failed to read the PDF file");
    };
    
    fileReader.readAsArrayBuffer(pdfFile);
    
  } catch (error) {
    console.error("PDF extraction error:", error);
    onError("Failed to process the PDF file");
  }
};
