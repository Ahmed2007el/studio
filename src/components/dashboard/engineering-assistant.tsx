'use client';

import {
  chatWithEngineeringAssistant,
  type EngineeringAssistantInput,
} from '@/ai/flows/engineering-assistant';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Sparkles, User, Volume2, PlayCircle, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface Message {
  role: 'user' | 'model';
  content: string;
  audioUrl?: string;
  audioLoading?: boolean;
}

interface EngineeringAssistantProps {
  projectContext: any;
}

// Extend window type for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}


export default function EngineeringAssistant({
  projectContext,
}: EngineeringAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{[key: number]: HTMLAudioElement | null}>({});
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ar-SA'; // Set language to Arabic
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript); // Automatically send after transcription
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const handlePlayAudio = (index: number) => {
    const audio = audioRefs.current[index];
    if (audio) {
      // Pause all other audio elements
      Object.values(audioRefs.current).forEach(a => {
        if (a && a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      audio.play();
    }
  }

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } else {
      alert("متصفحك لا يدعم ميزة التعرف على الصوت.");
    }
  };


  const handleSend = async (textToSend?: string) => {
    const messageText = typeof textToSend === 'string' ? textToSend : input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const assistantInput: EngineeringAssistantInput = {
        projectContext,
        history: newMessages.map(({ audioUrl, audioLoading, ...rest}) => rest), // Remove audio fields for the API
      };
      // Add a placeholder for the model's response
      const modelMessagePlaceholder: Message = { role: 'model', content: '', audioLoading: true };
      setMessages([...newMessages, modelMessagePlaceholder]);

      const result = await chatWithEngineeringAssistant(assistantInput);
      const assistantMessage: Message = {
        role: 'model',
        content: result.reply,
        audioLoading: true
      };

      // Update the placeholder with the actual content
      setMessages(prev => prev.map((msg, i) => i === newMessages.length ? assistantMessage : msg));

      // Generate speech
      const ttsResult = await textToSpeech({ text: result.reply });
      const finalAssistantMessage: Message = {
        ...assistantMessage,
        audioUrl: ttsResult.audio,
        audioLoading: false
      };
      
      setMessages(prev => prev.map((msg, i) => i === newMessages.length ? finalAssistantMessage : msg));

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content:
          'عذراً، لقد واجهت خطأ. يرجى المحاولة مرة أخرى في وقت لاحق.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            المهندس المساعد
          </CardTitle>
          <CardDescription>
            اطرح أي سؤال حول مشروعك أو عن الهندسة المدنية بشكل عام.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-6 pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'model' && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarFallback>
                        <Sparkles className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-prose rounded-lg p-3 relative group ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <Loader2 className="animate-spin text-primary" />
                    )}

                    {message.role === 'model' && message.content && (
                       <div className="absolute top-2 left-2 flex items-center gap-2">
                        {message.audioLoading ? (
                            <Loader2 className="animate-spin text-primary/50 h-4 w-4" />
                        ) : message.audioUrl ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 group-hover:opacity-100" onClick={() => handlePlayAudio(index)}>
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <audio 
                                ref={el => audioRefs.current[index] = el}
                                src={message.audioUrl} 
                                autoPlay
                                className="hidden" 
                                onEnded={() => {
                                    // You can add logic here if needed when audio finishes
                                }}
                            />
                          </>
                        ) : (
                            <Volume2 className="text-muted-foreground/50 h-4 w-4" />
                        )}
                        </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="w-8 h-8 border">
                     <AvatarFallback>
                       <User />
                     </AvatarFallback>
                   </Avatar>
                  )}
                </div>
              ))}
               {loading && messages[messages.length-1]?.role === 'user' && (
                <div className="flex items-start gap-4">
                     <Avatar className="w-8 h-8 border">
                      <AvatarFallback>
                        <Sparkles className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-prose rounded-lg p-3 bg-muted">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                </div>
               )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex gap-2 w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "جاري الاستماع..." : "اكتب سؤالك أو استخدم المايكروفون..."}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading || isListening}
              className="flex-1"
            />
             <Button onClick={handleVoiceInput} disabled={loading} variant={isListening ? "destructive" : "outline"} size="icon">
                <Mic className="h-5 w-5" />
                <span className="sr-only">{isListening ? "إيقاف الاستماع" : "بدء الاستماع"}</span>
            </Button>
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : 'إرسال'}
            </Button>
          </div>
        </CardFooter>
    </Card>
  );
}
