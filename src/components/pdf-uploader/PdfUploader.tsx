
import React, { useEffect } from 'react';
import FileUploader from './FileUploader';
import ApiSettings from './ApiSettings';
import PdfViewer from './PdfViewer';
import { usePdfExtraction } from './hooks/usePdfExtraction';
import { useApiSettings } from './hooks/useApiSettings';
import { useFlashcardProcessing } from './hooks/useFlashcardProcessing';
import { API_CONFIGURATION } from './services/api-config';

interface PdfUploaderProps {
  onExtractComplete: (flashcards: any[]) => void;
  onClose: () => void;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({ onExtractComplete, onClose }) => {
  const {
    file,
    previewUrl,
    extractedText,
    isLoading,
    progress: pdfProgress,
    error,
    handleFileChange,
    handleReset,
    cleanup,
    setError
  } = usePdfExtraction();
  
  const {
    apiKey,
    model,
    setModel,
    provider,
    setProvider,
    showAdvancedSettings,
    setShowAdvancedSettings,
    useSimulationMode,
    setUseSimulationMode
  } = useApiSettings();
  
  const { isProcessing, progress: processingProgress, processWithLLM } = useFlashcardProcessing(
    extractedText,
    onExtractComplete,
    setError
  );

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleGenerateFlashcards = () => {
    // Save model and provider settings before processing
    localStorage.setItem('locnix_provider', provider);
    localStorage.setItem('locnix_model', model);
    
    console.log("Processing with settings:", { 
      provider, 
      model, 
      apiKeyExists: Boolean(apiKey), 
      useSimulationMode 
    });
    
    processWithLLM(apiKey, provider, model, useSimulationMode);
  };

  // Determine which progress to display
  const displayProgress = isProcessing ? processingProgress : pdfProgress;

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
          showAdvancedSettings={showAdvancedSettings}
          setShowAdvancedSettings={setShowAdvancedSettings}
          useSimulationMode={useSimulationMode}
          setUseSimulationMode={setUseSimulationMode}
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
          progress={displayProgress}
          isProcessing={isProcessing}
          onGenerateFlashcards={handleGenerateFlashcards}
          apiKey={apiKey}
          provider={provider}
          showApiKeyInput={false}
        />
      )}
    </div>
  );
};

export default PdfUploader;
