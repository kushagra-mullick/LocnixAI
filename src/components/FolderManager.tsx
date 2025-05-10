import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Folder, Plus, PlusCircle, Share2, Trash2, Pencil, BookOpen } from 'lucide-react';
import { useFlashcards } from '@/context/FlashcardContext';
import { useToast } from '@/hooks/use-toast';
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/services/supabase';
import { Folder as FolderType } from '@/types/flashcard';
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
import { ShareDeckDialog } from './ShareDeckDialog';
import { useNavigate } from 'react-router-dom';

interface FolderManagerProps {
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
}

export const FolderManager: React.FC<FolderManagerProps> = ({ onSelectFolder, selectedFolderId }) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load folders
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setIsLoading(true);
        const data = await getFolders();
        setFolders(data);
      } catch (error) {
        console.error("Error loading folders:", error);
        toast({
          title: "Error",
          description: "Failed to load folders",
          variant: "destructive",
        });
        setFolders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFolders();
  }, [toast]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newFolder = await createFolder(newFolderName.trim(), newFolderDescription.trim() || undefined);
      setFolders([...folders, newFolder]);
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
      setNewFolderName('');
      setNewFolderDescription('');
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedFolder = await updateFolder(
        editingFolder.id,
        editingFolder.name.trim(),
        editingFolder.description?.trim() || undefined
      );
      
      setFolders(folders.map(folder => 
        folder.id === updatedFolder.id ? updatedFolder : folder
      ));
      
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
      
      setEditingFolder(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      await deleteFolder(folderToDelete.id);
      
      setFolders(folders.filter(folder => folder.id !== folderToDelete.id));
      
      if (selectedFolderId === folderToDelete.id) {
        onSelectFolder(null);
      }
      
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
      
      setFolderToDelete(null);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (folder: FolderType) => {
    setEditingFolder({ ...folder });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (folder: FolderType) => {
    setFolderToDelete(folder);
    setIsDeleteOpen(true);
  };
  
  const openShareDialog = (folder: FolderType) => {
    setEditingFolder(folder);
    setIsShareDialogOpen(true);
  };
  
  const handleStudyFolder = (folder: FolderType) => {
    console.log(`Navigating to study with folder ID: ${folder.id}`);
    navigate(`/study?folderId=${folder.id}`);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Folders
        </h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a folder to organize your flashcards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input 
                  id="name" 
                  value={newFolderName} 
                  onChange={(e) => setNewFolderName(e.target.value)} 
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  value={newFolderDescription} 
                  onChange={(e) => setNewFolderDescription(e.target.value)} 
                  placeholder="Enter folder description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        <div 
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedFolderId === null ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          onClick={() => onSelectFolder(null)}
        >
          <span className="font-medium">Uncategorized</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Navigating to general study page');
              navigate('/study');
            }}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading folders...</div>
        ) : folders.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No folders yet.</div>
        ) : (
          folders.map(folder => (
            <div 
              key={folder.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedFolderId === folder.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <div className="flex-grow" onClick={() => onSelectFolder(folder.id)}>
                <div className="font-medium">{folder.name}</div>
                {folder.description && (
                  <div className="text-sm text-gray-500 truncate">{folder.description}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStudyFolder(folder);
                  }}
                  title="Study this folder"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    openShareDialog(folder);
                  }}
                  title="Share this deck"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(folder);
                  }}
                  title="Edit folder"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(folder);
                  }}
                  title="Delete folder"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Edit Folder Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Update folder information.
            </DialogDescription>
          </DialogHeader>
          {editingFolder && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Folder Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingFolder.name} 
                  onChange={(e) => setEditingFolder({...editingFolder, name: e.target.value})} 
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingFolder.description || ''} 
                  onChange={(e) => setEditingFolder({...editingFolder, description: e.target.value})} 
                  placeholder="Enter folder description"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditFolder}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Folder Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? All flashcards within this folder will be moved to "Uncategorized".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Share Folder Dialog */}
      <ShareDeckDialog 
        open={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen} 
        folder={editingFolder} 
      />
    </div>
  );
};

export default FolderManager;
