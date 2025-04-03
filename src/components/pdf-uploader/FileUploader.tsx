
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

interface FileUploaderProps {
  file: File | null;
  isLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  file,
  isLoading,
  handleFileChange,
  handleReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex space-x-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        id="pdf-upload"
      />
      
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
  );
};

export default FileUploader;
