
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPdf } from '../pdf-utils';

export const usePdfExtraction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

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
  
  // Cleanup URL when component unmounts
  const cleanup = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return {
    file,
    previewUrl,
    extractedText,
    isLoading,
    progress,
    error,
    handleFileChange,
    handleReset,
    cleanup,
    setError
  };
};
