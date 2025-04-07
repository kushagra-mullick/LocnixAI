
import React, { useEffect } from 'react';
import FileUploader from './FileUploader';
import ApiSettings from './ApiSettings';
import PdfViewer from './PdfViewer';
import { usePdfExtraction } from './hooks/usePdfExtraction';
import { useApiSettings } from './hooks/useApiSettings';
import { useFlashcardProcessing } from './hooks/useFlashcardProcessing';

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
    progress,
    error,
    handleFileChange,
    handleReset,
    cleanup,
    setError
  } = usePdfExtraction();
  
  const {
    apiKey,
    setApiKey,
    model,
    setModel,
    provider,
    setProvider,
    showApiKeyInput,
    setShowApiKeyInput,
    useSimulationMode,
    setUseSimulationMode
  } = useApiSettings();
  
  const { isProcessing, processWithLLM } = useFlashcardProcessing(
    extractedText,
    onExtractComplete,
    setError
  );

  // Show API settings if no API key is saved
  useEffect(() => {
    if (!localStorage.getItem('locnix_api_key') && !useSimulationMode) {
      setShowApiKeyInput(true);
    }
  }, []);

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleGenerateFlashcards = () => {
    processWithLLM(apiKey, provider, model, useSimulationMode);
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
          progress={progress}
          isProcessing={isProcessing}
          onGenerateFlashcards={handleGenerateFlashcards}
          apiKey={apiKey}
          provider={provider}
          showApiKeyInput={showApiKeyInput}
        />
      )}
    </div>
  );
};

export default PdfUploader;
