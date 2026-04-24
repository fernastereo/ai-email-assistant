// import ChromeUtils from "@/utils/chrome"

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
  ChevronRight 
} from "lucide-react";
import { useState } from "react";

export const Popup = () => {
  const [selectedTone, setSelectedTone] = useState<string | null>(null);

  // const getCurrentEmailContent = async () => {
  //   if (ChromeUtils.isExtension()) {
  //     const tab : chrome.tabs.Tab = await ChromeUtils.getCurrentTab();
  //     if (tab && (tab.url.includes('mail.google.com') || tab.url.includes('outlook'))) {
  //       const response = await ChromeUtils.sendMessageToTab(tab.id, {
  //         type: 'GET_EMAIL_CONTENT'
  //       });
        
  //       if (response.success && response.content) {
  //         setEmailContent(response.content);
  //       }
  //     }
  //   }
  // };
  
  // const handleInsertReply = async (replyText) => {
  //   if (ChromeUtils.isExtension()) {
  //     const tab = await ChromeUtils.getCurrentTab();
  //     const response = await ChromeUtils.sendMessageToTab(tab.id, {
  //       type: 'INSERT_REPLY',
  //       reply: replyText
  //     });
      
  //     if (response.success) {
  //       window.close(); // Cerrar popup
  //     }
  //   }
  // };
  
  // // En useEffect
  // useEffect(() => {
  //   getCurrentEmailContent(); // Agregar esta línea
  // }, []);

  const toneOptions = [
    { id: "formal", label: "Formal", icon: "📄" },
    { id: "casual", label: "Casual", icon: "😊" },
    { id: "concise", label: "Conciso", icon: "⚡" },
    { id: "persuasive", label: "Persuasivo", icon: "🎯" }
  ];

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
          <Button variant="ghost" size="sm">
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

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              className="w-full justify-between h-auto p-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Generate Smart Reply</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-between h-auto p-3 hover:bg-secondary transition-colors"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Summarize Email</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full justify-between h-auto p-3 hover:bg-secondary transition-colors"
                size="lg"
                onClick={() => setSelectedTone(selectedTone ? null : "open")}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Change Tone</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedTone ? 'rotate-90' : ''}`} />
              </Button>

              {/* Tone Submenu */}
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
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Gmail/Outlook
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Powered by AI
          </p>
        </div>
      </div>
    </Card>
  );
};