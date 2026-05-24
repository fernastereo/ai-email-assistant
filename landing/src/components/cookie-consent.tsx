import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie_consent";

export type ConsentValue = "accepted" | "declined";

interface CookieConsentProps {
  onConsent: (value: ConsentValue) => void;
}

export function CookieConsent({ onConsent }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const handle = (value: ConsentValue) => {
    localStorage.setItem(STORAGE_KEY, value);
    onConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600 flex-1">
          We use cookies to analyze site traffic and improve your experience.
          By clicking "Accept" you consent to our use of analytics cookies.{" "}
          <a href="/privacy" className="underline hover:text-gray-900">
            Privacy Policy
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => handle("declined")}>
            Decline
          </Button>
          <Button size="sm" onClick={() => handle("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

export function getStoredConsent(): ConsentValue | null {
  return localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
}
