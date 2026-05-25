import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Thanks from "./pages/Thanks";
import Privacy from "./pages/Privacy";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import { analytics, logEvent, isProduction } from "./lib/firebaseConfig";
import { useState, useEffect } from "react";
import { CookieConsent, getStoredConsent } from "./components/cookie-consent";
import type { ConsentValue } from "./components/cookie-consent";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient();

// Bridges Clerk session to the Chrome extension via postMessage.
// The landing-bridge.js content script listens on the other end.
function TokenBridge() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  const broadcast = async () => {
    const token = await getToken();
    const email = user?.primaryEmailAddress?.emailAddress ?? null;
    window.postMessage({ type: 'REPLIE_TOKEN_RESPONSE', token, email }, '*');
  };

  // Respond to explicit token requests from the content script
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type !== 'REPLIE_GET_TOKEN') return;
      if (isSignedIn === null || isSignedIn === undefined) return;
      if (isSignedIn) {
        await broadcast();
      } else {
        window.postMessage({ type: 'REPLIE_SESSION_CLEARED' }, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isSignedIn, getToken, user]);

  // Proactively broadcast whenever auth state settles (covers late-loading Clerk)
  useEffect(() => {
    if (isSignedIn === null || isSignedIn === undefined) return;
    if (isSignedIn) {
      broadcast();
    } else {
      window.postMessage({ type: 'REPLIE_SESSION_CLEARED' }, '*');
    }
  }, [isSignedIn]);

  return null;
}

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
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <TokenBridge />
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
              <Route path="/sign-in/*" element={<SignIn />} />
              <Route path="/sign-up/*" element={<SignUp />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <CookieConsent onConsent={handleConsent} />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;
