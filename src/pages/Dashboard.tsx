import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useFlashcards } from '@/context/FlashcardContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Clock, LayoutGrid, Book, Trash2, Edit, 
  Brain, ArrowRight, Filter, ListFilter, Calendar, FileText,
  AlertCircle, MessageSquare
} from 'lucide-react';
import FlashcardGenerator from '@/components/FlashcardGenerator';
import PdfUploader from '@/components/PdfUploader';
import FlashcardAIChat from '@/components/FlashcardAIChat';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Flashcard } from '@/context/FlashcardContext';

const Dashboard = () => {
  const { flashcards, addFlashcard, addFlashcards, deleteFlashcard, updateFlashcard } = useFlashcards();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showPdfUploader, setShowPdfUploader] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('');
  const [editingCard, setEditingCard] = useState<null | { id: string, front: string, back: string, category?: string }>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddFlashcard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      toast({
        title: "Incomplete card",
        description: "Both the front and back of the card are required.",
        variant: "destructive"
      });
      return;
    }

    addFlashcard({
      front: newCardFront,
      back: newCardBack,
      category: newCardCategory || undefined
    });

    toast({
      title: "Flashcard created",
      description: "Your flashcard has been added to your collection."
    });

    setNewCardFront('');
    setNewCardBack('');
    setNewCardCategory('');
    setIsCreateDialogOpen(false);
  };

  const handleEditFlashcard = () => {
    if (!editingCard || !editingCard.front.trim() || !editingCard.back.trim()) {
      toast({
        title: "Incomplete card",
        description: "Both the front and back of the card are required.",
        variant: "destructive"
      });
      return;
    }

    updateFlashcard(editingCard.id, {
      front: editingCard.front,
      back: editingCard.back,
      category: editingCard.category
    });

    toast({
      title: "Flashcard updated",
      description: "Your flashcard has been successfully updated."
    });

    setEditingCard(null);
  };

  const handleOpenEditDialog = (card: any) => {
    setEditingCard({
      id: card.id,
      front: card.front,
      back: card.back,
      category: card.category || ''
    });
  };
  
  const handleConfirmDelete = () => {
    if (cardToDelete) {
      console.log("Deleting flashcard with ID:", cardToDelete);
      deleteFlashcard(cardToDelete);
      toast({
        title: "Flashcard deleted",
        description: "The flashcard has been removed from your collection."
      });
      setCardToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    console.log("Delete requested for flashcard ID:", id);
    setCardToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleGeneratedFlashcards = (generatedCards: any[]) => {
    const formattedCards = generatedCards.map(card => ({
      front: card.front,
      back: card.back,
      category: card.category
    }));
    addFlashcards(formattedCards);
    setShowGenerator(false);
  };

  const handlePdfFlashcardsGenerated = (flashcards: any[]) => {
    addFlashcards(flashcards);
    setShowPdfUploader(false);
    toast({
      title: "PDF Flashcards Added",
      description: `${flashcards.length} flashcards were created from your PDF.`
    });
  };

  const filteredFlashcards = flashcards.filter(card => 
    card.front.toLowerCase().includes(searchQuery.toLowerCase()) || 
    card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (card.category && card.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group flashcards by category
  const getFlashcardsByCategory = () => {
    const categories: Record<string, typeof flashcards> = {};
    
    filteredFlashcards.forEach(card => {
      const category = card.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(card);
    });
    
    return categories;
  };

  const categorizedFlashcards = getFlashcardsByCategory();

  // Get counts for statistics
  const totalCards = flashcards.length;
  const totalCategories = Object.keys(getFlashcardsByCategory()).length;
  const cardsReviewedToday = flashcards.filter(card => {
    if (!card.lastReviewed) return false;
    const today = new Date();
    const reviewDate = new Date(card.lastReviewed);
    return (
      reviewDate.getDate() === today.getDate() &&
      reviewDate.getMonth() === today.getMonth() &&
      reviewDate.getFullYear() === today.getFullYear()
    );
  }).length;

  // Add event listener for edit flashcard events
  useEffect(() => {
    const handleEditEvent = (e: CustomEvent) => {
      handleOpenEditDialog(e.detail);
    };

    document.addEventListener('editFlashcard', handleEditEvent as EventListener);
    
    return () => {
      document.removeEventListener('editFlashcard', handleEditEvent as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Your Flashcards</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage and organize your learning material
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => setShowPdfUploader(true)}
              >
                <FileText className="w-4 h-4" />
                Import PDF
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => setShowGenerator(true)}
              >
                <Brain className="w-4 h-4" />
                AI Generate
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => setShowAIChat(true)}
              >
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </Button>
              <Button 
                variant="default" 
                className="gap-2 shadow-md hover:shadow-lg"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Create Card
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Flashcards</p>
                  <p className="text-2xl font-semibold">{totalCards}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Categories</p>
                  <p className="text-2xl font-semibold">{totalCategories}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviewed Today</p>
                  <p className="text-2xl font-semibold">{cardsReviewedToday}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search flashcards by keyword, category..."
              className="pl-10 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm focus:ring-primary"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Flashcards Content */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="all" className="rounded-full">All Cards</TabsTrigger>
              <TabsTrigger value="categories" className="rounded-full">By Category</TabsTrigger>
              <TabsTrigger value="recent" className="rounded-full">Recently Added</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredFlashcards.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No flashcards found. Create your first flashcard or try a different search.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Flashcard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFlashcards.map(card => (
                    <FlashcardPreview 
                      key={card.id}
                      card={card}
                      onDelete={() => handleDeleteRequest(card.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-8">
              {Object.keys(categorizedFlashcards).length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No categories found. Create your first flashcard with a category.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Flashcard
                  </Button>
                </div>
              ) : (
                Object.entries(categorizedFlashcards).map(([category, cards]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{category}</h3>
                      <span className="text-sm text-gray-500">({cards.length} cards)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cards.map(card => (
                        <FlashcardPreview 
                          key={card.id}
                          card={card}
                          onDelete={() => handleDeleteRequest(card.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4">
              {filteredFlashcards.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No flashcards found. Create your first flashcard.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Flashcard
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...filteredFlashcards]
                    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
                    .slice(0, 12)
                    .map(card => (
                      <FlashcardPreview 
                        key={card.id}
                        card={card}
                        onDelete={() => handleDeleteRequest(card.id)}
                      />
                    ))
                  }
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Create Flashcard Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Flashcard</DialogTitle>
            <DialogDescription>
              Add a new flashcard to your collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front (Question)</Label>
              <Textarea 
                id="front" 
                placeholder="Enter your question or term"
                value={newCardFront}
                onChange={e => setNewCardFront(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back (Answer)</Label>
              <Textarea 
                id="back" 
                placeholder="Enter the answer or definition"
                value={newCardBack}
                onChange={e => setNewCardBack(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input 
                id="category" 
                placeholder="E.g., Mathematics, History, etc."
                value={newCardCategory}
                onChange={e => setNewCardCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFlashcard}>
              Create Flashcard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Flashcard Dialog */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Update your flashcard details.
            </DialogDescription>
          </DialogHeader>
          {editingCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-front">Front (Question)</Label>
                <Textarea 
                  id="edit-front" 
                  placeholder="Enter your question or term"
                  value={editingCard.front}
                  onChange={e => setEditingCard({...editingCard, front: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-back">Back (Answer)</Label>
                <Textarea 
                  id="edit-back" 
                  placeholder="Enter the answer or definition"
                  value={editingCard.back}
                  onChange={e => setEditingCard({...editingCard, back: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category (Optional)</Label>
                <Input 
                  id="edit-category" 
                  placeholder="E.g., Mathematics, History, etc."
                  value={editingCard.category}
                  onChange={e => setEditingCard({...editingCard, category: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCard(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditFlashcard}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this flashcard from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setCardToDelete(null);
              setShowDeleteAlert(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* AI Generator Dialog */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Flashcard Generator</DialogTitle>
            <DialogDescription>
              Paste your notes or text and our AI will create flashcards for you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FlashcardGenerator onFlashcardsGenerated={handleGeneratedFlashcards} />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* PDF Uploader Dialog */}
      <Dialog open={showPdfUploader} onOpenChange={setShowPdfUploader}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Import PDF to Create Flashcards</DialogTitle>
            <DialogDescription>
              Upload a PDF to extract content and automatically generate flashcards.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PdfUploader 
              onExtractComplete={handlePdfFlashcardsGenerated} 
              onClose={() => setShowPdfUploader(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* AI Chat Dialog */}
      <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 overflow-hidden">
          <FlashcardAIChat onClose={() => setShowAIChat(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FlashcardPreview = ({ card, onDelete }: { card: Flashcard; onDelete: () => void }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <Card 
      className="glass-card overflow-hidden h-60 flex flex-col relative group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {card.category && (
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
          {card.category}
        </div>
      )}
      
      <CardContent className="pt-12 pb-4 px-6 flex-grow">
        <div className="line-clamp-4 font-medium text-lg">
          {card.front}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Created {new Date(card.dateCreated).toLocaleDateString()}
        </div>
        
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              document.dispatchEvent(new CustomEvent('editFlashcard', { detail: card }));
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full text-red-500" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
      {/* Preview of back content on hover */}
      <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-6 flex flex-col transition-all duration-300 ${
        isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="font-medium text-sm text-gray-500 mb-2">Answer:</div>
        <p className="line-clamp-5 text-sm">{card.back}</p>
        <div className="mt-auto pt-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary">
            View Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Dashboard;
