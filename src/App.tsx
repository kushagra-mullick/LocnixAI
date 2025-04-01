
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FlashcardProvider } from "./context/FlashcardContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Study from "./pages/Study";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import FeaturesPage from "./pages/FeaturesPage";
import HelpCenter from "./pages/HelpCenter";
import Tutorials from "./pages/Tutorials";
import Community from "./pages/Community";
import AIChat from "./pages/AIChat";
import { Helmet } from "react-helmet";

const queryClient = new QueryClient();

// JSON-LD structured data for better SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Locnix.ai",
  "description": "AI-powered flashcard platform for faster learning and better retention",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "featureList": [
    "AI-Generated Flashcards",
    "Spaced Repetition",
    "Performance Analytics",
    "Collaborative Learning"
  ]
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <AuthProvider>
          <FlashcardProvider>
            <Toaster />
            <Sonner />
            {/* Add Helmet for dynamic metadata and structured data */}
            <Helmet>
              <script type="application/ld+json">
                {JSON.stringify(structuredData)}
              </script>
            </Helmet>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study" element={<Study />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/community" element={<Community />} />
                <Route path="/ai-chat" element={<AIChat />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FlashcardProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
