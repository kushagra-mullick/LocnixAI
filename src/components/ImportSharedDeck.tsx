
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importSharedDeck, getSharedDeckByCode } from '@/services/supabase';

const ImportSharedDeck: React.FC = () => {
  const [shareCode, setShareCode] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deckDetails, setDeckDetails] = useState<{ name: string; description?: string; card_count: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  
  const { toast } = useToast();

  const handleLookupDeck = async () => {
    if (!shareCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a share code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Extract share code from URL if needed
      const codeToUse = shareCode.includes('/') 
        ? shareCode.split('/').pop() || ''
        : shareCode;
      
      const { deck, flashcards } = await getSharedDeckByCode(codeToUse);
      
      setDeckDetails({
        name: deck.name,
        description: deck.description,
        card_count: flashcards.length
      });
      
      setFolderName(`${deck.name} (Imported)`);
    } catch (error) {
      console.error("Error looking up shared deck:", error);
      toast({
        title: "Error",
        description: "Failed to find shared deck with that code",
        variant: "destructive",
      });
      setDeckDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportDeck = async () => {
    if (!shareCode.trim() || !folderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter both share code and folder name",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Extract share code from URL if needed
      const codeToUse = shareCode.includes('/') 
        ? shareCode.split('/').pop() || ''
        : shareCode;
      
      await importSharedDeck(codeToUse, folderName);
      
      setImportSuccess(true);
      
      toast({
        title: "Success",
        description: "Deck imported successfully",
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setShareCode('');
        setFolderName('');
        setDeckDetails(null);
        setImportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error importing shared deck:", error);
      toast({
        title: "Error",
        description: "Failed to import shared deck",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Import Shared Deck
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Shared Deck</DialogTitle>
          <DialogDescription>
            Enter the share code or URL to import a shared flashcard deck.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shareCode">Share Code or URL</Label>
            <div className="flex gap-2">
              <Input 
                id="shareCode" 
                value={shareCode} 
                onChange={(e) => setShareCode(e.target.value)} 
                placeholder="Enter share code or URL"
                disabled={isLoading || deckDetails !== null}
              />
              <Button 
                onClick={handleLookupDeck} 
                disabled={isLoading || deckDetails !== null}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
              </Button>
            </div>
          </div>
          
          {deckDetails && (
            <>
              <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-medium mb-1">{deckDetails.name}</h3>
                {deckDetails.description && (
                  <p className="text-sm text-gray-500 mb-2">{deckDetails.description}</p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Flashcards:</span> {deckDetails.card_count}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="folderName">Save As (Folder Name)</Label>
                <Input 
                  id="folderName" 
                  value={folderName} 
                  onChange={(e) => setFolderName(e.target.value)} 
                  placeholder="Enter folder name"
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          {deckDetails && (
            <Button 
              onClick={handleImportDeck} 
              disabled={isImporting || importSuccess || !folderName.trim()}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : importSuccess ? (
                <Check className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isImporting ? "Importing..." : importSuccess ? "Imported!" : "Import Deck"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSharedDeck;
