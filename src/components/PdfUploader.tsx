import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText, X, Check, Brain } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Flashcard } from '@/context/FlashcardContext';
import { supabase } from '@/integrations/supabase/client';

// Set worker path
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
  const [processingMethod, setProcessingMethod] = useState<'standard' | 'ai'>('standard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Clean up the URL when component unmounts
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
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
    
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let fullText = '';
      let potentialFlashcardContent: string[] = [];
      
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
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
      }
      
      // Remove duplicates and very similar content
      const uniqueContent = Array.from(new Set(potentialFlashcardContent));
      
      setExtractedText(fullText);
      setUsefulContent(uniqueContent);
      
      toast({
        title: "Content extracted",
        description: `Found ${uniqueContent.length} potential flashcard concepts in your PDF.`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast({
        title: "PDF extraction failed",
        description: "There was an error extracting text from the PDF.",
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processPdfContent = async () => {
    if (usefulContent.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      let generatedFlashcards;
      
      if (processingMethod === 'ai') {
        // Use AI to generate better flashcards
        try {
          const { data, error } = await supabase.functions.invoke('flashcard-ai-chat', {
            body: { 
              message: "Create high-quality flashcards from this PDF content. Make sure to use question/answer format, identify key concepts, and organize by topic/category:",
              pdfContent: usefulContent.slice(0, Math.min(usefulContent.length, 30)).join("\n\n")
            },
          });
          
          if (error) throw error;
          
          // Parse AI response to extract flashcards
          try {
            // The AI should return formatted content we can parse
            const responseText = data.response;
            const flashcardMatches = responseText.match(/Q:[^\n]*\nA:[^\n]*/g);
            
            if (flashcardMatches && flashcardMatches.length > 0) {
              generatedFlashcards = flashcardMatches.map((match: string, index: number) => {
                const [question, answer] = match.split('\nA:');
                let category = 'AI Generated';
                
                // Try to extract category from response
                if (responseText.includes('Category:')) {
                  const categoryMatch = match.match(/Category:([^\n]*)/);
                  if (categoryMatch && categoryMatch[1]) {
                    category = categoryMatch[1].trim();
                  }
                }
                
                return {
                  front: question.replace('Q:', '').trim(),
                  back: answer.trim(),
                  category,
                  difficulty: 'medium'
                };
              });
            } else {
              // Fallback: if the AI response doesn't match expected format,
              // extract sentences and create Q&A pairs
              const sentences = responseText
                .split(/[.!?]+/)
                .map(s => s.trim())
                .filter(s => s.length > 20);
              
              generatedFlashcards = sentences.slice(0, 10).map((sentence: string) => {
                const words = sentence.split(' ');
                const keyTerms = words.filter(word => word.length > 5).slice(0, 2).join(', ');
                return {
                  front: `What is important about ${keyTerms}?`,
                  back: sentence,
                  category: 'AI Generated',
                  difficulty: 'medium'
                };
              });
            }
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            throw new Error('Failed to parse AI response');
          }
        } catch (aiError) {
          console.error('Error using AI for flashcards:', aiError);
          toast({
            title: "AI Processing Failed",
            description: "Falling back to standard processing method.",
            variant: "destructive"
          });
          // Fallback to standard method
          generatedFlashcards = processWithStandardMethod();
        }
      } else {
        // Standard method (without AI)
        generatedFlashcards = processWithStandardMethod();
      }
      
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
  
  // Standard method for generating flashcards (no AI)
  const processWithStandardMethod = () => {
    return usefulContent
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
        
        <div className="flex items-center space-x-2">
          {file && !isLoading && (
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={processingMethod === 'standard' ? "default" : "outline"}
                size="sm"
                className="rounded-none"
                onClick={() => setProcessingMethod('standard')}
              >
                Standard
              </Button>
              <Button
                variant={processingMethod === 'ai' ? "default" : "outline"}
                size="sm"
                className="rounded-none flex items-center gap-1"
                onClick={() => setProcessingMethod('ai')}
              >
                <Brain className="h-3 w-3" />
                AI-Enhanced
              </Button>
            </div>
          )}
          
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
      </div>
      
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
          
          {/* Extracted Text Preview */}
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
