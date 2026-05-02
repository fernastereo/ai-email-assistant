import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bot, ExternalLink, Clock } from "lucide-react";
import { useState, useEffect } from "react";

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

export const Popup = () => {
  const [requestsToday, setRequestsToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_DAILY_LIMIT);
  const [defaultTone, setDefaultTone] = useState('formal');
  const [defaultLength, setDefaultLength] = useState('medium');

  useEffect(() => {
    const loadFromStorage = () => {
      chrome.storage.local.get(['usage', 'settings'], (result) => {
        const usage = result.usage as { requestsToday?: number } | undefined;
        const settings = result.settings as { defaultTone?: string; defaultLength?: string; dailyLimit?: number } | undefined;
        if (usage?.requestsToday != null) setRequestsToday(usage.requestsToday);
        if (settings?.defaultTone) setDefaultTone(settings.defaultTone);
        if (settings?.defaultLength) setDefaultLength(settings.defaultLength);
        if (settings?.dailyLimit != null) setDailyLimit(settings.dailyLimit);
      });
    };

    loadFromStorage();

    // Keep usage count in sync if storage changes while popup is open
    const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>) => {
      const newUsage = changes.usage?.newValue as { requestsToday?: number } | undefined;
      if (newUsage?.requestsToday != null) {
        setRequestsToday(newUsage.requestsToday);
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
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">Replie</h2>
            <p className="text-xs text-muted-foreground">AI Email Assistant</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">

        {/* Usage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Uso hoy
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
            Tono por defecto
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
            Se aplica al toolbar en el compose de Gmail.
          </p>
        </div>

        <Separator />

        {/* Default length */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Longitud de respuesta
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
          Abrir Gmail
        </Button>
      </div>
    </Card>
  );
};
