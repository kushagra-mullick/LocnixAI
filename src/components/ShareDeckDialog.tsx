
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Check, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createSharedDeck, getSharedDecks, updateSharedDeck } from '@/services/supabase';
import { Folder, SharedDeck } from '@/types/flashcard';

interface ShareDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
}

export const ShareDeckDialog: React.FC<ShareDeckDialogProps> = ({ 
  open, 
  onOpenChange,
  folder 
}) => {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingShare, setExistingShare] = useState<SharedDeck | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const checkExistingShare = async () => {
      if (!folder) return;
      
      try {
        setDeckName(folder.name);
        setDescription(folder.description || '');
        
        // Check if folder is already shared
        const sharedDecks = await getSharedDecks();
        const existingDeck = sharedDecks.find(deck => deck.folder_id === folder.id);
        
        if (existingDeck) {
          setExistingShare(existingDeck);
          setDeckName(existingDeck.name);
          setDescription(existingDeck.description || '');
          setIsPublic(existingDeck.is_public);
          
          const shareUrl = `${window.location.origin}/shared/${existingDeck.share_code}`;
          setShareUrl(shareUrl);
        } else {
          setExistingShare(null);
          setShareUrl('');
        }
      } catch (error) {
        console.error("Error checking existing shares:", error);
      }
    };
    
    if (folder) {
      checkExistingShare();
    }
  }, [folder]);

  const handleShareDeck = async () => {
    if (!folder) return;
    
    if (!deckName.trim()) {
      toast({
        title: "Error",
        description: "Deck name is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (existingShare) {
        // Update existing share
        result = await updateSharedDeck(
          existingShare.id, 
          deckName.trim(), 
          description.trim() || undefined,
          isPublic
        );
      } else {
        // Create new share
        result = await createSharedDeck(
          deckName.trim(),
          folder.id,
          description.trim() || undefined,
          isPublic
        );
      }
      
      if (result) {
        setExistingShare(result);
        const shareUrl = `${window.location.origin}/shared/${result.share_code}`;
        setShareUrl(shareUrl);
        
        toast({
          title: "Success",
          description: existingShare 
            ? "Deck sharing settings updated successfully" 
            : "Deck shared successfully",
        });
      } else {
        throw new Error("Failed to share deck - no result returned");
      }
    } catch (error) {
      console.error("Error sharing deck:", error);
      toast({
        title: "Error",
        description: "Failed to share deck",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: "Copied",
      description: "Share link copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Deck</DialogTitle>
          <DialogDescription>
            {existingShare 
              ? "Update sharing settings for this deck." 
              : "Create a sharable link for this deck of flashcards."}
          </DialogDescription>
        </DialogHeader>
        
        {folder && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deckName">Deck Name</Label>
              <Input 
                id="deckName" 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)} 
                placeholder="Enter deck name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter deck description"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isPublic" 
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="isPublic">Make deck publicly discoverable</Label>
            </div>
            
            {shareUrl && (
              <div className="mt-4">
                <Label>Share Link</Label>
                <div className="flex mt-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button 
                    className="ml-2 flex items-center gap-2" 
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleShareDeck}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {existingShare ? "Update Sharing" : "Share Deck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
