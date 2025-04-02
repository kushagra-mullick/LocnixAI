
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Google Analytics
const initGoogleAnalytics = () => {
  const script = document.createElement('script');
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-L9RMLPPQPJ";
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]): void {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-L9RMLPPQPJ');
  
  // Make gtag available globally
  window.gtag = gtag;
};

// Initialize Google Analytics
initGoogleAnalytics();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);
root.render(<App />);
