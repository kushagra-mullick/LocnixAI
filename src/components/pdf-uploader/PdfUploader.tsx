
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPdf } from './pdf-utils';
import FileUploader from './FileUploader';
import ApiSettings from './ApiSettings';
import PdfViewer from './PdfViewer';
import { 
  processWithOpenAI, 
  processWithAnthropic, 
  processWithPerplexity, 
  processWithGemini 
} from './llm-service';

interface PdfUploaderProps {
  onExtractComplete: (flashcards: any[]) => void;
  onClose: () => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onExtractComplete, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [provider, setProvider] = useState('openai');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const { toast } = useToast();

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Update default model when provider changes
  useEffect(() => {
    switch (provider) {
      case 'openai':
        setModel('gpt-4o');
        break;
      case 'anthropic':
        setModel('claude-3-haiku-20240307');
        break;
      case 'perplexity':
        setModel('llama-3.1-sonar-small-128k-online');
        break;
      case 'gemini':
        setModel('gemini-1.5-flash'); // Default to free Gemini model
        break;
      default:
        break;
    }
  }, [provider]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      handleExtractTextFromPdf(selectedFile);
    } else if (selectedFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleExtractTextFromPdf = (pdfFile: File) => {
    setIsLoading(true);
    setExtractedText('');
    setProgress(0);
    setError(null);
    
    extractTextFromPdf(
      pdfFile,
      (progress) => setProgress(progress),
      (text) => {
        setExtractedText(text);
        setIsLoading(false);
        toast({
          title: "PDF loaded successfully",
          description: "Your PDF is ready for AI processing."
        });
      },
      (error) => {
        setError(error);
        setIsLoading(false);
        toast({
          title: "PDF extraction failed",
          description: "There was an error extracting text from the PDF.",
          variant: "destructive"
        });
      }
    );
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setProgress(0);
    setError(null);
  };

  // Process PDF with selected LLM provider
  const processWithLLM = async () => {
    if (!file || !apiKey.trim()) {
      if (!apiKey.trim()) {
        toast({
          title: "API Key Required",
          description: "Please enter your API key to process the PDF.",
          variant: "destructive"
        });
        setShowApiKeyInput(true);
      }
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Convert PDF to base64 for API submission
          const base64Data = e.target?.result?.toString().split(',')[1] || '';
          
          let flashcards = [];
          
          switch (provider) {
            case 'openai':
              flashcards = await processWithOpenAI(apiKey, model, extractedText);
              break;
            case 'anthropic':
              flashcards = await processWithAnthropic(apiKey, model, extractedText);
              break;
            case 'perplexity':
              flashcards = await processWithPerplexity(apiKey, model, extractedText);
              break;
            case 'gemini':
              flashcards = await processWithGemini(apiKey, model, extractedText);
              break;
            default:
              throw new Error("Unsupported provider");
          }
          
          if (flashcards.length > 0) {
            onExtractComplete(flashcards);
            toast({
              title: "Flashcards created",
              description: `Successfully created ${flashcards.length} flashcards from your PDF.`
            });
          } else {
            throw new Error("Failed to create flashcards. No cards were generated.");
          }
        } catch (processError) {
          console.error('Error processing PDF with LLM:', processError);
          setError("Error processing with AI: " + (processError instanceof Error ? processError.message : "Unknown error"));
          toast({
            title: "Processing failed",
            description: "Failed to generate flashcards from the PDF content.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError("Failed to read the PDF file for AI processing.");
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error in LLM processing:', error);
      setIsProcessing(false);
      setError("Failed to process with AI. Please try again.");
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred during AI processing.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex justify-between items-center">
        <FileUploader 
          file={file} 
          isLoading={isLoading} 
          handleFileChange={handleFileChange} 
          handleReset={handleReset} 
        />
        
        <ApiSettings 
          provider={provider}
          setProvider={setProvider}
          model={model}
          setModel={setModel}
          apiKey={apiKey}
          setApiKey={setApiKey}
          showApiKeyInput={showApiKeyInput}
          setShowApiKeyInput={setShowApiKeyInput}
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {file && (
        <PdfViewer 
          previewUrl={previewUrl}
          isLoading={isLoading}
          extractedText={extractedText}
          error={error}
          progress={progress}
          isProcessing={isProcessing}
          onGenerateFlashcards={processWithLLM}
          apiKey={apiKey}
          provider={provider}
          showApiKeyInput={showApiKeyInput}
        />
      )}
    </div>
  );
};

export default PdfUploader;
