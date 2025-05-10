
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface FlashcardData {
  front: string;
  back: string;
  category?: string;
}

interface ImportFlashcardsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  flashcards: FlashcardData[];
  onImport: () => void;
}

const ImportFlashcardsDialog: React.FC<ImportFlashcardsDialogProps> = ({
  isOpen,
  onOpenChange,
  flashcards,
  onImport
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import AI Generated Flashcards</DialogTitle>
          <DialogDescription>
            The AI has generated {flashcards.length} potential flashcards. Review them before importing.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow mt-4">
          <div className="space-y-4">
            {flashcards.map((card, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="font-medium mb-2">Card {idx + 1}</div>
                <div className="mb-2">
                  <Label>Front:</Label>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded mt-1 text-sm">
                    {card.front}
                  </div>
                </div>
                <div>
                  <Label>Back:</Label>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded mt-1 text-sm">
                    {card.back}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onImport} className="ml-2">
            <Save className="h-4 w-4 mr-2" />
            Import Flashcards
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFlashcardsDialog;
