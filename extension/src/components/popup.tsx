import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bot, ExternalLink, Clock, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/chrome-extension";

export interface AuthProps {
  isSignedIn: boolean
  user: { primaryEmailAddress?: { emailAddress: string } | null } | null
  getToken: () => Promise<string | null>
}

const DEFAULT_DAILY_LIMIT = 20;

const TONES = [
  { value: 'formal',     label: '📄 Formal' },
  { value: 'casual',     label: '😊 Casual' },
  { value: 'concise',    label: '⚡ Conciso' },
  { value: 'persuasive', label: '🎯 Persuasivo' },
];

const LENGTHS = [
  { value: 'short',  label: '▪ Corta' },
  { value: 'medium', label: '▪▪ Media' },
  { value: 'long',   label: '▪▪▪ Larga' },
];

export const Popup = ({ auth }: { auth: AuthProps }) => {
  const { user, isSignedIn, getToken } = auth;
  const [requestsToday, setRequestsToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_DAILY_LIMIT);
  const [defaultTone, setDefaultTone] = useState('formal');
  const [defaultLength, setDefaultLength] = useState('medium');
  const [syncedEmail, setSyncedEmail] = useState<string | null>(null);
  const [syncedIn, setSyncedIn] = useState(false);

  const signedIn = isSignedIn || syncedIn;
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? syncedEmail;

  // Sync JWT to chrome.storage so background.js can attach it to API requests
  useEffect(() => {
    if (isSignedIn) {
      getToken().then((token) => {
        if (token) chrome.storage.local.set({ authToken: token });
      });
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    chrome.storage.local.get(['usage', 'settings', 'authToken', 'authEmail'], (result) => {
      const usage = result.usage as { requestsToday?: number } | undefined;
      const settings = result.settings as { defaultTone?: string; defaultLength?: string; dailyLimit?: number } | undefined;
      if (usage?.requestsToday != null) setRequestsToday(usage.requestsToday);
      if (settings?.defaultTone) setDefaultTone(settings.defaultTone);
      if (settings?.defaultLength) setDefaultLength(settings.defaultLength);
      if (settings?.dailyLimit != null) setDailyLimit(settings.dailyLimit);
      if (result.authToken) {
        setSyncedIn(true);
        setSyncedEmail((result.authEmail as string | undefined) ?? null);
      }
    });

    const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>) => {
      const newUsage = changes.usage?.newValue as { requestsToday?: number } | undefined;
      if (newUsage?.requestsToday != null) setRequestsToday(newUsage.requestsToday);

      if ('authToken' in changes) {
        const token = changes.authToken?.newValue as string | undefined;
        setSyncedIn(!!token);
        if (!token) setSyncedEmail(null);
      }
      if ('authEmail' in changes) {
        setSyncedEmail((changes.authEmail?.newValue as string | undefined) ?? null);
      }
    };
    chrome.storage.onChanged.addListener(onStorageChanged);
    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  const saveSetting = (key: string, value: string) => {
    chrome.storage.local.get(['settings'], (result) => {
      const settings = (result.settings as Record<string, unknown>) || {};
      settings[key] = value;
      chrome.storage.local.set({ settings });
    });
  };

  const handleToneChange = (tone: string) => {
    setDefaultTone(tone);
    saveSetting('defaultTone', tone);
  };

  const handleLengthChange = (length: string) => {
    setDefaultLength(length);
    saveSetting('defaultLength', length);
  };

  const handleOpenGmail = () => {
    chrome.tabs.create({ url: 'https://mail.google.com' });
    window.close();
  };

  const usagePercent = Math.min((requestsToday / dailyLimit) * 100, 100);
  const usageColor = usagePercent >= 90 ? '#d93025' : usagePercent >= 70 ? '#f29900' : '#137333';

  return (
    <Card className="w-72 bg-ai-surface border-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">Replie</h2>
              {signedIn
                ? <p className="text-xs text-muted-foreground">{displayEmail}</p>
                : <p className="text-xs text-muted-foreground">AI Email Assistant</p>
              }
            </div>
          </div>
          {isSignedIn
            ? <UserButton />
            : signedIn
              ? <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
                  onClick={() => chrome.tabs.create({ url: 'https://replie.email' })}>
                  <LogIn className="w-3 h-3" />
                  Account
                </Button>
              : <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
                  onClick={() => chrome.tabs.create({ url: 'https://replie.email/sign-in' })}>
                  <LogIn className="w-3 h-3" />
                  Login
                </Button>
          }
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">

        {/* Usage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Usage today
            </Label>
            <span className="text-xs font-medium" style={{ color: usageColor }}>
              {requestsToday} / {dailyLimit}
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${usagePercent}%`, background: usageColor }}
            />
          </div>
        </div>

        <Separator />

        {/* Default tone */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Default tone
          </Label>
          <Select value={defaultTone} onValueChange={handleToneChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Applied to the toolbar in the Gmail compose.
          </p>
        </div>

        <Separator />

        {/* Default length */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Response length
          </Label>
          <Select value={defaultLength} onValueChange={handleLengthChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LENGTHS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Open Gmail */}
        <Button
          variant="ghost"
          className="w-full justify-start text-primary hover:bg-accent"
          size="sm"
          onClick={handleOpenGmail}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Gmail
        </Button>
      </div>
    </Card>
  );
};
