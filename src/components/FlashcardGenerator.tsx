import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRightCircle, Brain, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { API_CONFIGURATION } from './pdf-uploader/services/api-config';

interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

const FlashcardGenerator = ({ onFlashcardsGenerated }: { onFlashcardsGenerated?: (flashcards: any[]) => void }) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic' | 'perplexity' | 'gemini'>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const { toast } = useToast();
  
  // Load saved API settings from localStorage on component mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('locnix_provider');
    const savedModel = localStorage.getItem('locnix_model');
    
    if (savedProvider) {
      console.log(`Found saved provider: ${savedProvider}`);
      setSelectedProvider(savedProvider as any);
    }
    if (savedModel) {
      console.log(`Found saved model: ${savedModel}`);
      setSelectedModel(savedModel);
    }
  }, []);
  
  // Save API settings to localStorage whenever they change
  useEffect(() => {
    if (selectedProvider) {
      localStorage.setItem('locnix_provider', selectedProvider);
      console.log(`Saved provider to localStorage: ${selectedProvider}`);
    }
    if (selectedModel) {
      localStorage.setItem('locnix_model', selectedModel);
      console.log(`Saved model to localStorage: ${selectedModel}`);
    }
  }, [selectedProvider, selectedModel]);
  
  const generateFlashcards = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty input",
        description: "Please provide some text to generate flashcards from.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setApiError(null);
    
    try {
      // Simulate progress while waiting for API response
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 100);
      
      let flashcardsData;
      const useSimulation = API_CONFIGURATION.useSimulationMode;
      
      if (useSimulation) {
        console.log("Using simulation mode");
        // Generate mock flashcards if simulation mode is enabled
        clearInterval(progressInterval);
        setGenerationProgress(100);
        
        // Generate smart mock flashcards based on input text
        flashcardsData = generateMockFlashcards(inputText);
        
        if (onFlashcardsGenerated) {
          onFlashcardsGenerated(flashcardsData);
        }
        
        toast({
          title: "Using AI simulation",
          description: "Generated simulated flashcards."
        });
        
        setIsGenerating(false);
        setInputText('');
        return;
      }
      
      console.log(`Using ${selectedProvider} API with model ${selectedModel}`);
      
      // Make API call based on selected provider
      try {
        // Use the centrally configured API key
        const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
        
        switch (selectedProvider) {
          case 'openai':
            flashcardsData = await generateWithOpenAI(inputText);
            break;
          case 'anthropic':
            flashcardsData = await generateWithAnthropic(inputText);
            break;
          case 'perplexity':
            flashcardsData = await generateWithPerplexity(inputText);
            break;
          case 'gemini':
            flashcardsData = await generateWithGemini(inputText);
            break;
          default:
            console.error("Invalid provider, falling back to simulation");
            flashcardsData = generateMockFlashcards(inputText);
        }
      
        clearInterval(progressInterval);
        setGenerationProgress(100);
        
        if (onFlashcardsGenerated) {
          onFlashcardsGenerated(flashcardsData);
        }
        
        toast({
          title: "Flashcards generated",
          description: `Successfully created ${flashcardsData.length} flashcards.`
        });
      } catch (apiError) {
        console.error('API error:', apiError);
        clearInterval(progressInterval);
        
        setApiError(apiError instanceof Error ? apiError.message : "Unknown API error");
        
        // Fall back to simulation if there was an API error
        console.log("API error - falling back to simulation mode");
        const mockFlashcards = generateMockFlashcards(inputText);
        
        if (onFlashcardsGenerated) {
          onFlashcardsGenerated(mockFlashcards);
        }
        
        toast({
          title: "API Error",
          description: "Error with AI provider. Used simulation mode as fallback.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('General error:', error);
      
      // General error handler
      setApiError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsGenerating(false);
      setInputText('');
    }
  };
  
  // Generate flashcards using OpenAI
  const generateWithOpenAI = async (text: string): Promise<GeneratedFlashcard[]> => {
    // Get the API key from central configuration
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    
    // Define the prompt for the OpenAI
    const prompt = `
      Create flashcards from the following text. 
      For each important concept or fact, create a flashcard with a question on the front and answer on the back.
      Return in this JSON format:
      [{"front": "...", "back": "...", "category": "..."}]
      Categories should be one of: Concept, Definition, Process, Example, Fact
      Text: ${text}
    `;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who creates high-quality flashcards for effective learning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `API request failed with status ${response.status}`;
      
      if (response.status === 429) {
        errorMessage = "API rate limit exceeded. Please try with a different API key or use the simulated mode.";
      } else if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      setApiError(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to get flashcards
    let flashcards;
    try {
      // Find JSON in the response (in case the AI wrapped it in text)
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }
    
    // Add IDs to the flashcards
    return flashcards.map((card: any, index: number) => ({
      ...card,
      id: `card-${Date.now()}-${index}`
    }));
  };
  
  // Generate flashcards using Anthropic Claude
  const generateWithAnthropic = async (text: string): Promise<GeneratedFlashcard[]> => {
    // Get the API key from central configuration
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    
    const prompt = `
      Create flashcards from the following text. 
      For each important concept or fact, create a flashcard with a question on the front and answer on the back.
      Return ONLY a JSON array with this format:
      [{"front": "...", "back": "...", "category": "..."}]
      Categories should be one of: Concept, Definition, Process, Example, Fact.
      Do not include any explanation or other text outside the JSON array.
      
      Text to create flashcards from:
      ${text}
    `;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 4000,
        system: "You are an expert educator who creates high-quality flashcards for effective learning. Always respond with properly formatted JSON.",
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `API request failed with status ${response.status}`;
      
      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      setApiError(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse the response to get flashcards
    let flashcards;
    try {
      // Find JSON in the response (in case the AI wrapped it in text)
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }
    
    // Add IDs to the flashcards
    return flashcards.map((card: any, index: number) => ({
      ...card,
      id: `card-${Date.now()}-${index}`
    }));
  };
  
  // Generate flashcards using Perplexity
  const generateWithPerplexity = async (text: string): Promise<GeneratedFlashcard[]> => {
    // Get the API key from central configuration
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    
    const prompt = `
      Create flashcards from the following text. 
      For each important concept or fact, create a flashcard with a question on the front and answer on the back.
      Return ONLY a JSON array with this format:
      [{"front": "...", "back": "...", "category": "..."}]
      Categories should be one of: Concept, Definition, Process, Example, Fact.
      Do not include any explanation or other text outside the JSON array.
      
      Text to create flashcards from:
      ${text}
    `;
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who creates high-quality flashcards for effective learning. Always respond with properly formatted JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `API request failed with status ${response.status}`;
      
      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      setApiError(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the response to get flashcards
    let flashcards;
    try {
      // Find JSON in the response (in case the AI wrapped it in text)
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }
    
    // Add IDs to the flashcards
    return flashcards.map((card: any, index: number) => ({
      ...card,
      id: `card-${Date.now()}-${index}`
    }));
  };
  
  // Generate flashcards using Google Gemini
  const generateWithGemini = async (text: string): Promise<GeneratedFlashcard[]> => {
    // Get the API key from central configuration
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    
    const prompt = `
      Create flashcards from the following text. 
      For each important concept or fact, create a flashcard with a question on the front and answer on the back.
      Return ONLY a JSON array with this format:
      [{"front": "...", "back": "...", "category": "..."}]
      Categories should be one of: Concept, Definition, Process, Example, Fact.
      Do not include any explanation or other text outside the JSON array.
      
      Text to create flashcards from:
      ${text}
    `;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "You are an expert educator who creates high-quality flashcards for effective learning. Always respond with properly formatted JSON."
              }
            ]
          },
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `API request failed with status ${response.status}`;
      
      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      setApiError(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Parse the response to get flashcards
    let flashcards;
    try {
      // Find JSON in the response (in case the AI wrapped it in text)
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(content);
      }
    } catch (error) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }
    
    // Add IDs to the flashcards
    return flashcards.map((card: any, index: number) => ({
      ...card,
      id: `card-${Date.now()}-${index}`
    }));
  };
  
  // Helper function to generate smart mock flashcards from input text
  const generateMockFlashcards = (text: string): GeneratedFlashcard[] => {
    // Split the text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Generate flashcards from important sentences (up to 7)
    return sentences.slice(0, Math.min(sentences.length, 7)).map((sentence, index) => {
      const words = sentence.trim().split(' ');
      
      // Find potentially important terms (longer words)
      const importantTerms = words.filter(word => word.length > 5).slice(0, 2);
      
      // Generate a question based on the sentence
      let question;
      if (importantTerms.length > 0) {
        question = `What is the significance of ${importantTerms.join(' and ')}?`;
      } else if (sentence.includes('is') || sentence.includes('are')) {
        question = sentence.replace(/(\w+)\s+(is|are)\s+/i, 'What $2 ').trim() + '?';
      } else {
        question = `What does the following statement explain: "${sentence.slice(0, 30)}..."?`;
      }
      
      const categories = ['Concept', 'Definition', 'Process', 'Example', 'Fact'];
      
      return {
        id: `mock-card-${Date.now()}-${index}`,
        front: question,
        back: sentence.trim(),
        category: categories[Math.floor(Math.random() * categories.length)]
      };
    });
  };

  const getModelOptions = () => {
    switch (selectedProvider) {
      case 'openai':
        return (
          <>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </>
        );
      case 'anthropic':
        return (
          <>
            <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
            <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
            <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
          </>
        );
      case 'perplexity':
        return (
          <>
            <SelectItem value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar (Small)</SelectItem>
            <SelectItem value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar (Large)</SelectItem>
            <SelectItem value="llama-3.1-sonar-huge-128k-online">Llama 3.1 Sonar (Huge)</SelectItem>
          </>
        );
      case 'gemini':
        return (
          <>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
          </>
        );
      default:
        return null;
    }
  };
  
  // Update the default model when provider changes
  React.useEffect(() => {
    switch (selectedProvider) {
      case 'openai':
        setSelectedModel('gpt-4o-mini');
        break;
      case 'anthropic':
        setSelectedModel('claude-3-haiku-20240307');
        break;
      case 'perplexity':
        setSelectedModel('llama-3.1-sonar-small-128k-online');
        break;
      case 'gemini':
        setSelectedModel('gemini-pro');
        break;
    }
  }, [selectedProvider]);
  
  return (
    <Card className="glass-card w-full max-w-3xl mx-auto p-6 md:p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Brain className="h-5 w-5" />
          <h3 className="text-xl">AI Flashcard Generator</h3>
          <Badge className="ml-2 bg-green-500 text-white">API Ready</Badge>
        </div>
        
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        
        <Textarea 
          placeholder="Paste your notes, textbook excerpts, or any learning material here..."
          className="min-h-32 text-base p-4 focus:ring-2 focus:ring-primary/50 transition-all"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        {/* AI Provider and Model Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ai-provider" className="block mb-1 text-gray-700 dark:text-gray-300">AI Provider</Label>
            <Select 
              value={selectedProvider} 
              onValueChange={(value: any) => setSelectedProvider(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="ai-model" className="block mb-1 text-gray-700 dark:text-gray-300">Model</Label>
            <Select 
              value={selectedModel} 
              onValueChange={setSelectedModel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {getModelOptions()}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <p className="text-sm">
            API Key is pre-configured. You can generate flashcards without needing to enter an API key.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={generateFlashcards}
            disabled={isGenerating || !inputText.trim()}
            className="w-full max-w-xs rounded-full py-6 shadow-md hover:shadow-lg transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Flashcards
                <ArrowRightCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="w-full mt-2">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Analyzing content and generating smart flashcards...
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FlashcardGenerator;
