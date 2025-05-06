
import * as pdfjs from 'pdfjs-dist';

// Initialize the PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
          
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          extractedText += pageText + '\n\n';
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
