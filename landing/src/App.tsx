import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Thanks from "./pages/Thanks";
import NotFound from "./pages/NotFound";
import { analytics, logEvent, isProduction } from "./lib/firebaseConfig";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    if (analytics && isProduction) {
      logEvent(analytics, "page_view", {
        page_path: location.pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/thanks" element={<Thanks />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
