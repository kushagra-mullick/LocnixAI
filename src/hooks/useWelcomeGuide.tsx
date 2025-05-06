
import { useState, useEffect } from 'react';

export const useWelcomeGuide = () => {
  const [showWelcome, setShowWelcome] = useState(true); // Default to true to show for new users
  
  useEffect(() => {
    // Check if the user has seen the welcome guide before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome === 'true') {
      // If they've seen it, don't show it
      setShowWelcome(false);
    } else {
      // If they haven't seen it (new user), show it
      setShowWelcome(true);
      // We'll set the localStorage only when they dismiss the dialog
      // This way, if they refresh before dismissing, they'll still see it
    }
  }, []);

  const openWelcomeGuide = () => {
    setShowWelcome(true);
  };
  
  const dismissWelcomeGuide = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return {
    showWelcome,
    setShowWelcome: dismissWelcomeGuide, // Replace the setter with our custom function
    openWelcomeGuide
  };
};
