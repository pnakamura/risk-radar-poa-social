import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Upload, FileText, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { AIRiskResponse, AIWebhookResponse } from '@/types/aiRiskResponse';

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAIResponse?: (data: AIRiskResponse) => void;
}

const AIAssistantModal = ({ open, onOpenChange, onAIResponse }: AIAssistantModalProps) => {
  console.log('AIAssistantModal rendering - open:', open);
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const WEBHOOK_URL = 'https://postgres-n8n.wuzmwk.easypanel.host/webhook/d695f3b9-1889-4277-a4e2-289851d9564f';

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Erro ao acessar microfone",
        description: "Permita o acesso ao microfone para gravar áudio.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const sendToAI = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      let payload: any = {
        timestamp: new Date().toISOString(),
        source: 'risk_registration_form'
      };

      if (activeTab === 'text' && textInput.trim()) {
        payload.type = 'text';
        payload.content = textInput.trim();
      } else if (activeTab === 'audio' && audioBlob) {
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:audio/webm;base64, prefix
          };
          reader.readAsDataURL(audioBlob);
        });
        
        payload.type = 'audio';
        payload.content = base64Audio;
        payload.mimeType = 'audio/webm';
      } else if (activeTab === 'file' && selectedFile) {
        const base64File = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data prefix
          };
          reader.readAsDataURL(selectedFile);
        });
        
        payload.type = 'file';
        payload.content = base64File;
        payload.fileName = selectedFile.name;
        payload.mimeType = selectedFile.type;
      } else {
        throw new Error('Nenhum conteúdo foi fornecido');
      }

      console.log('🚀 Tentando enviar para webhook:', WEBHOOK_URL);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));

      // Primeira tentativa com configuração padrão
      let response;
      try {
        response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('✅ Resposta recebida:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (fetchError) {
        console.warn('⚠️ Primeira tentativa falhou:', fetchError);
        
        // Segunda tentativa com mode: 'no-cors' para contornar CORS
        console.log('🔄 Tentando com mode: no-cors...');
        
        try {
          response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          console.log('✅ Segunda tentativa (no-cors) executada');
          
          // Com no-cors, não conseguimos ler a resposta, então assumimos sucesso
          setSubmitStatus('success');
          toast({
            title: "Enviado com sucesso! (modo compatibilidade)",
            description: "Sua solicitação foi enviada para a IA usando modo de compatibilidade. Verifique o sistema N8N.",
          });

          // Reset form
          setTextInput('');
          setAudioBlob(null);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Não fechar modal no modo no-cors pois não temos dados
          return;
          
        } catch (secondError) {
          console.error('❌ Segunda tentativa também falhou:', secondError);
          
          // Terceira tentativa sem alguns headers
          console.log('🔄 Tentando sem headers Accept...');
          
          try {
            response = await fetch(WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            console.log('✅ Terceira tentativa - resposta:', response.status, response.statusText);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

          } catch (thirdError) {
            console.error('❌ Todas as tentativas falharam');
            console.error('Erro original:', fetchError);
            console.error('Segundo erro:', secondError);
            console.error('Terceiro erro:', thirdError);
            
            // Fornecer informações detalhadas sobre o erro
            let errorMessage = "Falha na comunicação com o webhook";
            let debugInfo = "";
            
            if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
              errorMessage = "Erro de conectividade - possível problema de CORS ou URL inacessível";
              debugInfo = `\n\nDebug:\n- URL: ${WEBHOOK_URL}\n- Erro: ${fetchError.message}\n- Verifique se o N8N está rodando e acessível`;
            } else if (fetchError instanceof Error) {
              errorMessage = fetchError.message;
              debugInfo = `\n\nDetalhes técnicos: ${fetchError.name}`;
            }
            
            throw new Error(errorMessage + debugInfo);
          }
        }
      }

      // Se chegou aqui, uma das tentativas foi bem-sucedida
      const responseText = await response.text();
      console.log('📄 Resposta do servidor:', responseText);

      // Tentar processar a resposta JSON
      let aiData = null;
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('🔍 JSON parseado:', jsonResponse);
        
        // A resposta do N8N é um array, pegar o primeiro item
        if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
          aiData = jsonResponse[0];
          console.log('✅ Dados da IA extraídos:', aiData);
        } else if (jsonResponse && typeof jsonResponse === 'object') {
          aiData = jsonResponse;
        }
      } catch (parseError) {
        console.warn('⚠️ Erro ao fazer parse da resposta JSON:', parseError);
      }

      setSubmitStatus('success');
      
      if (aiData && onAIResponse) {
        // Chamar callback com os dados da IA
        onAIResponse(aiData);
        
        toast({
          title: "IA processou com sucesso!",
          description: "Os dados foram automaticamente preenchidos no formulário.",
        });
        
        // Fechar modal após sucesso
        onOpenChange(false);
      } else {
        toast({
          title: "Enviado com sucesso!",
          description: "Sua solicitação foi enviada para a IA.",
        });
      }

      // Reset form
      setTextInput('');
      setAudioBlob(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('💥 Erro final:', error);
      setSubmitStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (activeTab === 'text') return textInput.trim().length > 0;
    if (activeTab === 'audio') return audioBlob !== null;
    if (activeTab === 'file') return selectedFile !== null;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Assistente de IA para Riscos
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-lg">Envie informações para análise de IA</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Áudio
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Arquivo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descreva o risco ou situação:</label>
                  <Textarea
                    placeholder="Descreva detalhadamente o risco que precisa ser analisado, incluindo contexto, possíveis impactos e quaisquer informações relevantes..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={2000}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {textInput.length}/2000 caracteres
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="audio" className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Grave um áudio explicando o risco ou situação
                  </p>
                  
                  {!audioBlob ? (
                    <Button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      size="lg"
                      className="w-full h-16"
                    >
                      <Mic className={`w-6 h-6 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                      {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Áudio gravado com sucesso!
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setAudioBlob(null)}
                        variant="outline"
                        size="sm"
                      >
                        Gravar Novamente
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Envie um arquivo (documento, imagem, planilha, etc.)
                  </p>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    
                    {!selectedFile ? (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                        >
                          Selecionar Arquivo
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, XLS, TXT, imagens até 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Remover Arquivo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={sendToAI}
                disabled={!canSubmit() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para IA
                  </>
                )}
              </Button>
              
              {submitStatus === 'success' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantModal;