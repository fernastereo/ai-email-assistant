import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Thanks from "./pages/Thanks";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { analytics, logEvent, isProduction } from "./lib/firebaseConfig";
import { useState, useEffect } from "react";
import { CookieConsent, getStoredConsent } from "./components/cookie-consent";
import type { ConsentValue } from "./components/cookie-consent";

const queryClient = new QueryClient();

function AnalyticsListener({ analyticsEnabled }: { analyticsEnabled: boolean }) {
  const location = useLocation();

  useEffect(() => {
    if (analytics && isProduction && analyticsEnabled) {
      logEvent(analytics, "page_view", {
        page_path: location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location, analyticsEnabled]);

  return null;
}

const App = () => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    getStoredConsent() === "accepted"
  );

  const handleConsent = (value: ConsentValue) => {
    setAnalyticsEnabled(value === "accepted");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsListener analyticsEnabled={analyticsEnabled} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CookieConsent onConsent={handleConsent} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
