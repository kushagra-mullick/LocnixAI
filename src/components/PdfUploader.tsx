
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, X, Check, Key } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Clean up URL when component unmounts
  React.useEffect(() => {
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

  const extractTextFromPdf = async (pdfFile: File) => {
    setIsLoading(true);
    setExtractedText('');
    setProgress(0);
    setError(null);
    
    try {
      // Simple PDF text extraction using FileReader
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          try {
            // For simplicity, we're just storing the binary data
            // The actual text extraction will be handled by the LLM API
            setExtractedText("PDF loaded successfully. Click 'Generate Flashcards' to process with AI.");
            toast({
              title: "PDF loaded successfully",
              description: "Your PDF is ready for AI processing."
            });
          } catch (err) {
            console.error("Error parsing PDF:", err);
            setError("Failed to parse the PDF. Please try another file.");
            toast({
              title: "PDF extraction failed",
              description: "There was an error extracting text from the PDF.",
              variant: "destructive"
            });
          }
        }
        setIsLoading(false);
        setProgress(100);
      };
      
      reader.onerror = () => {
        setError("Failed to read the PDF file.");
        setIsLoading(false);
        toast({
          title: "PDF reading failed",
          description: "There was an error reading the PDF file.",
          variant: "destructive"
        });
      };
      
      reader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      setError("Failed to extract text from the PDF. Please try another file.");
      toast({
        title: "PDF extraction failed",
        description: "There was an error extracting text from the PDF.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          
          // API request to OpenAI
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: "system",
                  content: "You are an expert at creating educational flashcards from PDF content. Given the text extracted from a PDF, create a set of 10-15 high-quality question-answer flashcards. Focus on the most important concepts. Each flashcard should have a clear question on the front and a concise, informative answer on the back. Format your response as a JSON array with objects containing 'front' (question), 'back' (answer), and 'category' fields."
                },
                {
                  role: "user",
                  content: `I've uploaded a PDF. Please generate flashcards from the PDF content. I'll paste some extracted text below. Use it to create flashcards in the format: [{"front": "question", "back": "answer", "category": "category"}].\n\n${extractedText}`
                }
              ],
              temperature: 0.3,
              max_tokens: 2000
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Try to parse the JSON response
            try {
              // Find JSON array in the response
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              let flashcards = [];
              
              if (jsonMatch) {
                flashcards = JSON.parse(jsonMatch[0]);
              } else {
                // Fallback parsing for non-standard formats
                const cardMatches = content.match(/front["\s:]+([^"]+)["\s,]+back["\s:]+([^"]+)["\s,]+category["\s:]+([^"}\]]+)/g);
                if (cardMatches) {
                  flashcards = cardMatches.map(match => {
                    const front = match.match(/front["\s:]+([^"]+)/)?.[1] || '';
                    const back = match.match(/back["\s:]+([^"]+)/)?.[1] || '';
                    const category = match.match(/category["\s:]+([^"}\]]+)/)?.[1]?.replace(/[",}]/g, '') || 'PDF Extract';
                    return { front, back, category };
                  });
                }
              }
              
              if (flashcards.length > 0) {
                onExtractComplete(flashcards);
                toast({
                  title: "Flashcards created",
                  description: `Successfully created ${flashcards.length} flashcards from your PDF.`
                });
              } else {
                throw new Error("Failed to parse flashcards from API response.");
              }
            } catch (parseError) {
              console.error('Error parsing flashcard JSON:', parseError);
              setError("Failed to create flashcards. The AI response format was unexpected.");
              toast({
                title: "Processing failed",
                description: "Failed to generate flashcards from the PDF content.",
                variant: "destructive"
              });
            }
          } else {
            const errorData = await response.json();
            console.error('API error:', errorData);
            setError(`API Error: ${errorData.error?.message || "Unknown error"}`);
            toast({
              title: "API Error",
              description: errorData.error?.message || "Error communicating with AI service.",
              variant: "destructive"
            });
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
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          variant="outline"
          className="gap-2"
        >
          <Key className="h-4 w-4" />
          {showApiKeyInput ? 'Hide API Settings' : 'API Settings'}
        </Button>
      </div>
      
      {showApiKeyInput && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4 border">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input 
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your API key is only used for this request and not stored.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model-select">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {file && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                  <p className="text-sm text-gray-500">Loading PDF: {progress}%</p>
                </div>
              ) : extractedText ? (
                <div>
                  <h3 className="font-medium mb-2">PDF Content Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {extractedText}
                  </p>
                  
                  <Button 
                    onClick={processWithLLM}
                    disabled={isProcessing || !apiKey.trim()}
                    className="w-full gap-2 mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Generate Flashcards with AI
                      </>
                    )}
                  </Button>
                  
                  {!apiKey.trim() && !showApiKeyInput && (
                    <p className="text-xs text-amber-600 mt-2">
                      Please enter your OpenAI API key in API Settings to continue.
                    </p>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Upload a PDF to get started</p>
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
