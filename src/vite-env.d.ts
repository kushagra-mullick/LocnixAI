
/// <reference types="vite/client" />

// Add module declarations for PDF.js
declare module 'pdfjs-dist' {
  export const version: string;
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export function getDocument(source: { data: ArrayBuffer }): { promise: PDFDocumentProxy };
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getTextContent(): Promise<PDFTextContent>;
}

interface PDFTextContent {
  items: Array<{ str: string; [key: string]: any }>;
}
