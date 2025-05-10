import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Flashcard from '@/components/Flashcard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFlashcards } from '@/context/FlashcardContext';
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, RotateCcw, 
  Pause, Play, Filter, CheckCircle2, Award, 
  BookOpen, Clock, BarChart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Study = () => {
  const { getFlashcardsForStudy, rateFlashcard, selectedFolderId } = useFlashcards();
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [cardsCompleted, setCardsCompleted] = useState(0);
  const [studySessionComplete, setStudySessionComplete] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folderId = queryParams.get('folderId');
  
  console.log(`Study page loaded with folderId from URL: ${folderId}, selected folder: ${selectedFolderId}`);
  
  // Initialize study session
  useEffect(() => {
    initializeStudySession();
  }, [folderId]);
  
  const initializeStudySession = () => {
    console.log(`Initializing study session with folderId: ${folderId}`);
    const cards = getFlashcardsForStudy(10, folderId !== null ? folderId : undefined);
    console.log(`Retrieved ${cards.length} cards for study`);
    
    if (cards.length === 0) {
      toast({
        title: "No cards available",
        description: folderId 
          ? "There are no cards in this folder ready for study. Try adding more cards." 
          : "There are no cards ready for study. Try adding more cards.",
        variant: "destructive"
      });
    }
    
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setCardsCompleted(0);
    setStudyTime(0);
    setStudySessionComplete(false);
  };
  
  // Timer for study session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused && !studySessionComplete) {
      timer = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused, studySessionComplete]);
  
  const handleCardRate = (id: string, rating: 'easy' | 'medium' | 'hard') => {
    rateFlashcard(id, rating);
    
    // Move to next card
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setCardsCompleted(prev => prev + 1);
    } else {
      // End of study session
      setStudySessionComplete(true);
      toast({
        title: "Study session complete!",
        description: `You've completed all ${studyCards.length} flashcards in this session.`
      });
    }
  };
  
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };
  
  const handleNextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setCardsCompleted(prev => prev + 1);
    }
  };
  
  const resetSession = () => {
    initializeStudySession();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {studySessionComplete ? (
            <StudyComplete 
              totalCards={studyCards.length}
              studyTime={studyTime}
              onRestart={resetSession}
            />
          ) : (
            <>
              {/* Study Session Header */}
              <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">Study Session</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {folderId ? "Focusing on selected folder" : "Studying across all folders"}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 gap-1"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 gap-1"
                    onClick={resetSession}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
              
              {/* Study Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">
                    Progress: {cardsCompleted} of {studyCards.length} cards
                  </div>
                  <div className="text-sm text-gray-500">
                    Time: {formatTime(studyTime)}
                  </div>
                </div>
                <Progress 
                  value={(cardsCompleted / (studyCards.length || 1)) * 100} 
                  className="h-2"
                />
              </div>
              
              {/* Study Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cards Studied</p>
                      <p className="text-lg font-semibold">{cardsCompleted}/{studyCards.length}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Study Time</p>
                      <p className="text-lg font-semibold">{formatTime(studyTime)}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                      <BarChart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg. Time Per Card</p>
                      <p className="text-lg font-semibold">
                        {cardsCompleted > 0 
                          ? formatTime(Math.floor(studyTime / cardsCompleted)) 
                          : '00:00'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Flashcard Container */}
              {studyCards.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 mb-4">No cards available for study in this folder.</p>
                  <Button 
                    variant="outline" 
                    onClick={resetSession}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className={cn("transition-opacity duration-300", isPaused ? "opacity-50" : "opacity-100")}>
                  <Flashcard
                    id={studyCards[currentCardIndex].id}
                    front={studyCards[currentCardIndex].front}
                    back={studyCards[currentCardIndex].back}
                    category={studyCards[currentCardIndex].category}
                    onRate={handleCardRate}
                  />
                </div>
              )}
              
              {/* Navigation Controls */}
              {studyCards.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={handlePrevCard}
                    disabled={currentCardIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="text-sm text-gray-500">
                    Card {currentCardIndex + 1} of {studyCards.length}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="gap-1"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === studyCards.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Instructions */}
              <div className="mt-12 text-center text-sm text-gray-500">
                <p>Rate each card after reviewing to optimize your learning experience.</p>
                <p className="mt-1">Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs">Space</kbd> to flip the card</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Keep the StudyComplete component the same
const StudyComplete = ({ 
  totalCards, 
  studyTime,
  onRestart
}: { 
  totalCards: number;
  studyTime: number;
  onRestart: () => void;
}) => {
  return (
    <div className="text-center py-10">
      <div className="mb-8 inline-flex justify-center items-center w-24 h-24 rounded-full bg-primary/10 text-primary">
        <Award className="h-12 w-12" />
      </div>
      
      <h2 className="text-3xl font-display font-bold mb-4">Session Complete!</h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Great job! You've completed your study session.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
        <Card className="glass-card p-6">
          <div className="text-primary text-2xl font-bold mb-2">{totalCards}</div>
          <div className="text-gray-600 dark:text-gray-300">Cards Reviewed</div>
        </Card>
        
        <Card className="glass-card p-6">
          <div className="text-primary text-2xl font-bold mb-2">
            {Math.floor(studyTime / 60)}m {studyTime % 60}s
          </div>
          <div className="text-gray-600 dark:text-gray-300">Total Time</div>
        </Card>
        
        <Card className="glass-card p-6">
          <div className="text-primary text-2xl font-bold mb-2">
            {Math.floor(studyTime / totalCards)}s
          </div>
          <div className="text-gray-600 dark:text-gray-300">Per Card</div>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="default" 
          size="lg"
          className="gap-2"
          onClick={onRestart}
        >
          <RotateCcw className="h-4 w-4" />
          Start New Session
        </Button>
        <Button 
          variant="outline" 
          size="lg"
        >
          View Results
        </Button>
      </div>
    </div>
  );
};

export default Study;
