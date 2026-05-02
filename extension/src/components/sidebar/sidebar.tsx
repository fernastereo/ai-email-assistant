import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  X,
  Sparkles,
  FileText,
  Palette,
  Edit3,
  Copy,
  CornerDownRight,
  RotateCcw,
  Save,
  Expand,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";

interface SentimentAnalysis {
  sentiment: string;
  urgency: string;
  tone: string;
}

interface UsageData {
  requestsToday: number;
  lastReset: string;
}

function Sidebar() {
  const [emailContent, setEmailContent] = useState('');
  const [emailSummary, setEmailSummary] = useState('');
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<UsageData>({ requestsToday: 0, lastReset: '' });
  const DAILY_LIMIT = 20;

  // Al montar: obtener email y usage
  useEffect(() => {
    fetchEmailContent();
    fetchUsage();
  }, []);

  const fetchEmailContent = () => {
    chrome.runtime.sendMessage({ type: 'GET_EMAIL_CONTENT' }, (response) => {
      if (response?.success && response.content) {
        setEmailContent(response.content);
      }
    });
  };

  const fetchUsage = () => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (response?.success) {
        chrome.storage.local.get(['usage'], (result) => {
          if (result.usage) setUsage(result.usage as UsageData);
        });
      }
    });
  };

  const handleGenerateResponse = async () => {
    if (!emailContent) {
      setError('No se detectó contenido de email. Abre un email primero.');
      return;
    }
    setError('');
    setIsGenerating(true);
    chrome.runtime.sendMessage(
      {
        type: 'GENERATE_REPLY',
        data: { emailContent, tone: selectedTone, customPrompt: customPrompt || undefined }
      },
      (response) => {
        setIsGenerating(false);
        if (response?.success && response.reply) {
          setGeneratedResponse(response.reply);
          fetchUsage();
        } else {
          setError(response?.error || 'Error al generar respuesta.');
        }
      }
    );
  };

  const handleSummarize = () => {
    if (!emailContent) {
      setError('No se detectó contenido de email. Abre un email primero.');
      return;
    }
    setError('');
    setIsSummarizing(true);
    chrome.runtime.sendMessage(
      { type: 'SUMMARIZE_EMAIL', data: { emailContent } },
      (response) => {
        setIsSummarizing(false);
        if (response?.success && response.summary) {
          setEmailSummary(response.summary);
          // Analizar sentimiento en paralelo
          chrome.runtime.sendMessage(
            { type: 'ANALYZE_SENTIMENT', data: { emailContent } },
            (sentimentResponse) => {
              if (sentimentResponse?.success && sentimentResponse.analysis) {
                try {
                  const parsed = JSON.parse(sentimentResponse.analysis);
                  setSentiment(parsed);
                } catch {
                  // respuesta no parseable, ignorar
                }
              }
            }
          );
        } else {
          setError(response?.error || 'Error al resumir email.');
        }
      }
    );
  };

  const handleCopy = () => {
    if (!generatedResponse) return;
    navigator.clipboard.writeText(generatedResponse);
  };

  const handleInsert = () => {
    if (!generatedResponse) return;
    chrome.runtime.sendMessage(
      { type: 'INSERT_REPLY', data: { reply: generatedResponse } },
      (response) => {
        if (!response?.success) {
          setError('No se pudo insertar. Asegúrate de tener el compose box abierto.');
        }
      }
    );
  };

  const handleClose = () => {
    window.close();
  };

  const sentimentBadgeColor = () => {
    if (!sentiment) return 'bg-blue-100 text-blue-800';
    switch (sentiment.sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const sentimentLabel = sentiment
    ? `${sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)} · ${sentiment.urgency}`
    : 'Sin analizar';

  const displaySummary = emailSummary
    || (emailContent ? emailContent.slice(0, 100) + '...' : 'Abre un email para comenzar');

  return (
    <div className="w-80 bg-ai-surface border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground">
              <Bot className="w-3 h-3" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">AI Email Assistant</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Email Analysis */}
      <div className="p-4 border-b border-border">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">EMAIL ANALIZADO</Label>
            <div className="mt-1 p-2 bg-secondary rounded text-xs">
              {isExpanded ? (
                <div className="space-y-2">
                  <p>{displaySummary}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 p-0 text-xs"
                    onClick={() => setIsExpanded(false)}
                  >
                    Collapse
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="truncate">{displaySummary}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() => setIsExpanded(true)}
                  >
                    <Expand className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={sentimentBadgeColor()}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {sentimentLabel}
            </Badge>
            {emailContent && (
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                Respuesta requerida
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">ACCIONES DE IA</Label>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 flex-col gap-1"
            onClick={handleGenerateResponse}
            disabled={isGenerating || isSummarizing}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs">Smart Reply</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 flex-col gap-1"
            onClick={handleSummarize}
            disabled={isGenerating || isSummarizing}
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">Summarize</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Select value={selectedTone} onValueChange={setSelectedTone}>
            <SelectTrigger className="h-8">
              <div className="flex items-center gap-2">
                <Palette className="w-3 h-3" />
                <SelectValue placeholder="Tone Selector" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">📄 Formal</SelectItem>
              <SelectItem value="casual">😊 Casual</SelectItem>
              <SelectItem value="concise">⚡ Conciso</SelectItem>
              <SelectItem value="persuasive">🎯 Persuasivo</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-1">
            <Label className="text-xs">Custom Prompt</Label>
            <div className="relative">
              <Input
                placeholder="Ej: Hazlo más amigable"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="pr-8 text-xs h-8"
              />
              <Edit3 className="absolute right-2 top-2 w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 p-4 space-y-3">
        <Label className="text-xs font-medium text-muted-foreground">RESPUESTA GENERADA</Label>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {(isGenerating || isSummarizing) ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-xs">
                {isGenerating ? 'Generando respuesta...' : 'Resumiendo email...'}
              </span>
            </div>
          </div>
        ) : (
          <Textarea
            placeholder="La respuesta generada aparecerá aquí..."
            value={generatedResponse}
            onChange={(e) => setGeneratedResponse(e.target.value)}
            className="min-h-[120px] text-xs resize-none"
          />
        )}

        {generatedResponse && !isGenerating && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={handleCopy}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleInsert}>
              <CornerDownRight className="w-3 h-3 mr-1" />
              Insert
            </Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleGenerateResponse}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <Button variant="ghost" size="sm" className="h-6 p-0 text-xs text-muted-foreground">
            <Save className="w-3 h-3 mr-1" />
            Save as Template
          </Button>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{usage.requestsToday}/{DAILY_LIMIT} responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
