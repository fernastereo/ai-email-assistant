import { useState } from 'react';
// import apiService from '../../services/api';
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


function Sidebar() {
  // const [emailContent, setEmailContent] = useState('');
  // const [generatedReply, setGeneratedReply] = useState('');
  // const [loading, setLoading] = useState(false);
  // const [selectedTone, setSelectedTone] = useState('formal');

  // useEffect(() => {
  //   // Escuchar mensajes del content script
  //   window.addEventListener('message', handleMessage);
    
  //   return () => {
  //     window.removeEventListener('message', handleMessage);
  //   };
  // }, []);

  // const handleMessage = (event: MessageEvent) => {
  //   const { type, data } = event.data;
    
  //   if (type === 'INIT_SIDEBAR') {
  //     setEmailContent(data.emailContent);
  //   } else if (type === 'EMAIL_CONTENT') {
  //     setEmailContent(data.content);
  //   }
  // };

  // const handleGenerateReply = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await apiService.generateReply(emailContent, selectedTone);
  //     setGeneratedReply(response.reply);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  //   setLoading(false);
  // };

  // const handleInsertReply = () => {
  //   window.parent.postMessage({
  //     type: 'INSERT_REPLY',
  //     data: { reply: generatedReply }
  //   }, '*');
  // };

  // const handleClose = () => {
  //   window.parent.postMessage({ type: 'CLOSE_SIDEBAR' }, '*');
  // };

  //de aqui para abajo es el componente creado en lovable
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateResponse = async () => {
    setIsGenerating(true);
    // Simular generación de respuesta
    setTimeout(() => {
      setGeneratedResponse(`Hola John,

Gracias por tu mensaje. Me parece perfecto programar la reunión para el viernes a las 2 PM. 

Confirmo mi disponibilidad y estaré preparado para revisar el progreso del proyecto y discutir los próximos pasos.

¿Podrías enviar la invitación del calendario con la agenda propuesta?

Saludos,`);
      setIsGenerating(false);
    }, 2000);
  };

  const emailSummary = "📧 Email de John Doe sobre reunión de seguimiento del proyecto para el viernes a las 2 PM";
  const emailSentiment = { type: "neutral", label: "Neutral", color: "bg-blue-100 text-blue-800" };
  const creditsUsed = 4;
  const creditsTotal = 20;

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
          <Button variant="ghost" size="sm">
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
                  <p>{emailSummary}</p>
                  <p className="text-muted-foreground">
                    Detalles completos: Solicitud de confirmación para reunión de seguimiento, 
                    revisar progreso y próximos pasos del proyecto...
                  </p>
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
                  <span className="truncate">{emailSummary}</span>
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
            <Badge className={emailSentiment.color}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {emailSentiment.label}
            </Badge>
            <Badge variant="secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Respuesta requerida
            </Badge>
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
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs">Smart Reply</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-auto p-2 flex-col gap-1"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">Summarize</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Select>
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
        
        {isGenerating ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-primary">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-xs">Generando respuesta...</span>
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

        {generatedResponse && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button size="sm" className="flex-1 h-7 text-xs">
              <CornerDownRight className="w-3 h-3 mr-1" />
              Insert
            </Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0">
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
            <span>{creditsUsed}/{creditsTotal} responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;