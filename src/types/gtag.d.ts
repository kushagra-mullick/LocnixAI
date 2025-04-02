
// Type definitions for Google Analytics gtag.js
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare function gtag(...args: any[]): void;
