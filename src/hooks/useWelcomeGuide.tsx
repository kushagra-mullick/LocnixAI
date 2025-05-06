
import { useState, useEffect } from 'react';

export const useWelcomeGuide = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Check if the user has seen the welcome guide before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // If not, show the welcome guide
      setShowWelcome(true);
      // Remember that the user has seen the welcome guide
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const openWelcomeGuide = () => {
    setShowWelcome(true);
  };

  return {
    showWelcome,
    setShowWelcome,
    openWelcomeGuide
  };
};
