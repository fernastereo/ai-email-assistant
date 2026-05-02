import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  FileText,
  Palette,
  Settings,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useState } from "react";

type Status = 'idle' | 'loading' | 'error' | 'no_email';

export const Popup = () => {
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toneOptions = [
    { id: "formal", label: "Formal", icon: "📄" },
    { id: "casual", label: "Casual", icon: "😊" },
    { id: "concise", label: "Conciso", icon: "⚡" },
    { id: "persuasive", label: "Persuasivo", icon: "🎯" }
  ];

  // Abre el sidebar y le pasa la acción a ejecutar via storage
  const openSidebarWithAction = async (action: string, tone?: string) => {
    setStatus('loading');
    setErrorMsg('');

    // Verificar que hay un email abierto antes de abrir el sidebar
    chrome.runtime.sendMessage({ type: 'GET_EMAIL_CONTENT' }, (response) => {
      if (!response?.success || !response.content) {
        setStatus('no_email');
        return;
      }

      // Guardar la acción pendiente para que el sidebar la ejecute al abrir
      chrome.storage.local.set({
        pendingAction: { action, tone: tone || 'formal' }
      }, () => {
        // Abrir el sidebar
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, () => {
          window.close();
        });
      });
    });
  };

  const handleGenerateReply = () => {
    const tone = typeof selectedTone === 'string' && selectedTone !== 'open'
      ? selectedTone
      : 'formal';
    openSidebarWithAction('GENERATE_REPLY', tone);
  };

  const handleSummarize = () => {
    openSidebarWithAction('SUMMARIZE_EMAIL');
  };

  const handleOpenGmail = () => {
    chrome.tabs.create({ url: 'https://mail.google.com' });
    window.close();
  };

  const isLoading = status === 'loading';

  return (
    <Card className="w-80 bg-ai-surface border-border shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-foreground">AI Email Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' })}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Selecciona cómo quieres responder
          </p>

          {/* Error / status messages */}
          {status === 'no_email' && (
            <p className="text-xs text-red-500 mb-2">
              No se detectó un email abierto. Abre un email en Gmail u Outlook primero.
            </p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              className="w-full justify-between h-auto p-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300"
              size="lg"
              disabled={isLoading}
              onClick={handleGenerateReply}
            >
              <div className="flex items-center gap-2">
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Sparkles className="w-4 h-4" />
                }
                <span className="font-medium">Generate Smart Reply</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-auto p-3 hover:bg-secondary transition-colors"
              size="lg"
              disabled={isLoading}
              onClick={handleSummarize}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Summarize Email</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Tone selector */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between h-auto p-3 hover:bg-secondary transition-colors"
                size="lg"
                onClick={() => setSelectedTone(selectedTone ? null : "open")}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>
                    {selectedTone && selectedTone !== 'open'
                      ? `Tono: ${toneOptions.find(t => t.id === selectedTone)?.label}`
                      : 'Change Tone'}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedTone ? 'rotate-90' : ''}`} />
              </Button>

              {selectedTone && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-ai-surface border border-border rounded-lg shadow-lg z-10">
                  {toneOptions.map((tone) => (
                    <Button
                      key={tone.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 hover:bg-secondary"
                      onClick={() => setSelectedTone(tone.id)}
                    >
                      <span className="mr-2">{tone.icon}</span>
                      <span>{tone.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-primary hover:bg-accent"
            size="sm"
            onClick={handleOpenGmail}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Gmail
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Powered by AI
          </p>
        </div>
      </div>
    </Card>
  );
};
