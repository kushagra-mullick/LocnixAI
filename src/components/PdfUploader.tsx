import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, X, Check } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { Flashcard } from '@/types/flashcard';

// Configure the workerSrc property of the PDF.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfUploaderProps {
  onExtractComplete: (flashcards: Omit<Flashcard, 'id' | 'dateCreated' | 'lastReviewed' | 'nextReviewDate'>[]) => void;
  onClose: () => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onExtractComplete, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [usefulContent, setUsefulContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      extractTextFromPdf(selectedFile);
    } else if (selectedFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  };

  // Helper function to check if a text segment is likely useful content
  const isUsefulContent = (text: string): boolean => {
    // Ignore very short segments
    if (text.length < 20) return false;
    
    // Ignore headers, footers, page numbers, etc.
    if (/^page \d+$/i.test(text.trim())) return false;
    if (/^\d+$/.test(text.trim())) return false;
    
    // Ignore navigation elements, URLs, email addresses
    if (/^(http|www|mailto|@)/.test(text.trim())) return false;
    
    // Ignore lines that are likely metadata or formatting
    if (/^(title:|author:|date:|copyright|all rights reserved)/i.test(text.trim())) return false;
    
    // A real content line probably has some sentence structure
    const hasSentenceStructure = /[A-Z][^.!?]*[.!?]/.test(text);
    
    // Ensure content is meaningful (has some alphabetical chars and not just symbols)
    const hasMeaningfulContent = /[a-zA-Z]{3,}/.test(text) && text.trim().split(' ').length > 3;
    
    return hasSentenceStructure && hasMeaningfulContent;
  };

  const extractTextFromPdf = async (pdfFile: File) => {
    setIsLoading(true);
    setExtractedText('');
    setUsefulContent([]);
    setProgress(0);
    setError(null);
    
    try {
      console.log('Starting PDF extraction...');
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Check if PDF.js is properly loaded
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        throw new Error("PDF.js library not properly loaded");
      }
      
      // Ensure worker is properly configured
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        console.warn("Worker source not configured. Setting it now.");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }
      
      // Load the PDF document with better error handling
      const loadingTask = pdfjsLib.getDocument({data: arrayBuffer});
      
      // Add error handler to the loading task
      loadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
        console.error("Password protected PDF detected");
        setError("This PDF is password protected. Please try another file.");
        setIsLoading(false);
      };
      
      const pdf: PDFDocumentProxy = await loadingTask.promise;
      
      console.log(`PDF loaded, pages: ${pdf.numPages}`);
      const totalPages = pdf.numPages;
      
      if (totalPages === 0) {
        throw new Error("PDF has no pages");
      }
      
      let fullText = '';
      let potentialFlashcardContent: string[] = [];
      
      for (let i = 1; i <= totalPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          if (!textContent || !textContent.items || textContent.items.length === 0) {
            console.warn(`Page ${i} has no text content`);
            continue;
          }
          
          let pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n\n';
          
          // Split the text into paragraphs and filter for useful content
          const paragraphs = pageText.split(/\n{2,}/)
            .filter(para => para.trim().length > 0);
          
          // Process each paragraph to identify useful content
          paragraphs.forEach(paragraph => {
            // Split into sentences
            const sentences = paragraph.split(/(?<=[.!?])\s+/)
              .filter(sentence => sentence.trim().length > 0);
            
            sentences.forEach(sentence => {
              if (isUsefulContent(sentence)) {
                potentialFlashcardContent.push(sentence.trim());
              }
            });
          });
          
          setProgress(Math.round((i / totalPages) * 100));
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          continue; // Skip problematic page and continue with others
        }
      }
      
      if (potentialFlashcardContent.length === 0 && fullText.trim().length > 0) {
        // If we have text but no flashcard content, try less strict filtering
        const sentences = fullText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
        potentialFlashcardContent = sentences.slice(0, Math.min(sentences.length, 15));
      }
      
      // Remove duplicates and very similar content
      const uniqueContent = Array.from(new Set(potentialFlashcardContent));
      
      setExtractedText(fullText);
      setUsefulContent(uniqueContent);
      
      if (uniqueContent.length === 0 && fullText.trim().length === 0) {
        throw new Error("No text could be extracted from this PDF file. It might be scanned or image-based.");
      }
      
      console.log(`Extraction complete. Found ${uniqueContent.length} potential flashcard concepts.`);
      
      toast({
        title: "Content extracted",
        description: `Found ${uniqueContent.length} potential flashcard concepts in your PDF.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      setError(error instanceof Error ? error.message : "Failed to extract text from the PDF. Please try another file.");
      toast({
        title: "PDF extraction failed",
        description: error instanceof Error ? error.message : "There was an error extracting text from the PDF.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setUsefulContent([]);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processPdfContent = async () => {
    if (usefulContent.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Generate flashcards from the useful content
      const generatedFlashcards = usefulContent
        .slice(0, Math.min(usefulContent.length, 20)) // Limit to 20 flashcards max
        .map((content) => {
          // For each content piece, create a question-answer pair
          
          // Method 1: For definition-like content, use "What is X?" format
          const definitionMatch = content.match(/([^.,:;]+)(?:is|are|refers to|means|defined as)([^.]*\.)/i);
          
          // Method 2: For fact-based content, use the content as answer and create a question
          const words = content.trim().split(' ');
          const keyTerms = words.filter(word => word.length > 4).slice(0, 3);
          const termsQuestion = `What ${
            content.includes(" is ") ? "is" : "are"
          } the key points about ${keyTerms.join(", ")}?`;
          
          let front, back;
          
          if (definitionMatch && definitionMatch[1] && definitionMatch[2]) {
            // If it looks like a definition, format accordingly
            const term = definitionMatch[1].trim();
            front = `What is ${term}?`;
            back = content;
          } else {
            // Otherwise use the content-based question
            front = termsQuestion;
            back = content;
          }
          
          return {
            front,
            back,
            category: 'PDF Extract',
            difficulty: 'medium'
          } as Omit<Flashcard, 'id' | 'dateCreated' | 'lastReviewed' | 'nextReviewDate'>;
        });
      
      onExtractComplete(generatedFlashcards);
      
      toast({
        title: "Flashcards created",
        description: `Successfully created ${generatedFlashcards.length} flashcards from your PDF.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error processing PDF content:', error);
      toast({
        title: "Processing failed",
        description: "Failed to generate flashcards from the PDF content.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex justify-between items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-upload"
        />
        
        <div className="flex space-x-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            {file ? 'Change PDF' : 'Select PDF'}
          </Button>
          
          {file && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="text-red-500"
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
        
        <Button
          onClick={processPdfContent}
          disabled={usefulContent.length === 0 || isProcessing}
          className="gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Generate Flashcards
            </>
          )}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {file && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* PDF Preview */}
          <Card className="glass-card overflow-hidden h-96">
            <CardContent className="p-0 h-full">
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              )}
            </CardContent>
          </Card>
          
          {/* Extracted Text Preview - Now showing useful content only */}
          <Card className="glass-card overflow-hidden h-96">
            <CardContent className="p-4 h-full overflow-auto">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">Extracting text: {progress}%</p>
                </div>
              ) : usefulContent.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">Extracted Concepts ({usefulContent.length})</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {usefulContent.map((content, index) => (
                      <div key={index} className="p-2 border-b border-gray-200 dark:border-gray-700">
                        {content}
                      </div>
                    ))}
                  </div>
                </div>
              ) : extractedText ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <p>No useful content detected in this PDF.</p>
                  <p className="text-xs mt-2">Try a different PDF with more textual content.</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Extracted concepts will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
