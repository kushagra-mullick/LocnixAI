
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSharedDeckByCode, importSharedDeck } from '@/services/supabase';
import { Flashcard as FlashcardType } from '@/types/flashcard';
import { ArrowLeft, Download, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

const SharedDeck = () => {
  const { code } = useParams<{ code: string }>();
  const [deck, setDeck] = useState<any | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [folderName, setFolderName] = useState('');
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadSharedDeck = async () => {
      if (!code) return;
      
      try {
        setIsLoading(true);
        const { deck, flashcards } = await getSharedDeckByCode(code);
        
        setDeck(deck);
        setFlashcards(flashcards);
        setFolderName(`${deck.name} (Imported)`);
      } catch (error) {
        console.error("Error loading shared deck:", error);
        setError("The shared deck could not be found or may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSharedDeck();
  }, [code]);

  const handleImportDeck = async () => {
    if (!code || !folderName.trim() || !isAuthenticated) return;
    
    setIsImporting(true);
    
    try {
      await importSharedDeck(code, folderName);
      setImportSuccess(true);
      
      toast({
        title: "Success",
        description: "Deck imported successfully",
      });
    } catch (error) {
      console.error("Error importing deck:", error);
      toast({
        title: "Error",
        description: "Failed to import deck",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading shared deck...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-primary mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Deck Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{deck?.name}</h1>
          {deck?.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">{deck.description}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <div className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
              {flashcards.length} flashcards
            </div>
          </div>
        </div>
        
        {isAuthenticated ? (
          <div className="mb-8 p-6 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <h2 className="text-xl font-semibold mb-4">Import this deck</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folderName">Save As (Folder Name)</Label>
                <Input 
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="mt-1"
                  disabled={isImporting || importSuccess}
                />
              </div>
              <Button 
                onClick={handleImportDeck} 
                className="flex items-center gap-2"
                disabled={isImporting || importSuccess || !folderName.trim()}
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
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 text-center">
            <p className="mb-4">Sign in to import this deck to your collection</p>
            <Button asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        )}
        
        <h2 className="text-xl font-semibold mb-4">Preview Flashcards</h2>
        
        {flashcards.length === 0 ? (
          <p className="text-gray-500">This deck has no flashcards yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map(card => (
              <Card key={card.id} className="overflow-hidden h-auto">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Front:</h3>
                    <p className="text-gray-700 dark:text-gray-300">{card.front}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Back:</h3>
                    <p className="text-gray-700 dark:text-gray-300">{card.back}</p>
                  </div>
                  {card.category && (
                    <div className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full w-fit">
                      {card.category}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedDeck;
