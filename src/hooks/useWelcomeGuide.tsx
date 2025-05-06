
import { useState, useEffect } from 'react';

export const useWelcomeGuide = () => {
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if this is the user's first visit
    const isFirstVisit = localStorage.getItem('locnix_welcomed') !== 'true';
    
    if (isFirstVisit) {
      setShowWelcomeGuide(true);
    }
  }, []);
  
  const dismissWelcomeGuide = () => {
    localStorage.setItem('locnix_welcomed', 'true');
    setShowWelcomeGuide(false);
  };
  
  const resetWelcomeGuide = () => {
    localStorage.removeItem('locnix_welcomed');
  };
  
  return {
    showWelcomeGuide,
    setShowWelcomeGuide,
    dismissWelcomeGuide,
    resetWelcomeGuide
  };
};
