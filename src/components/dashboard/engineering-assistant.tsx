'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Sparkles, User, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface Message {
  role: 'user' | 'model';
  content: string;
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: 'smooth',
            });
        }
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

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        setInput('');
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
    
    // Add a placeholder for the model's response
    const modelMessagePlaceholder: Message = { role: 'model', content: '' };
    setMessages([...newMessages, modelMessagePlaceholder]);


    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectContext,
          history: newMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const result = await response.json();

      const assistantMessage: Message = {
        role: 'model',
        content: result.reply,
      };

      // Update the placeholder with the actual content
      setMessages(prev => prev.map((msg, i) => i === newMessages.length ? assistantMessage : msg));

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content: `عذراً، لقد واجهت خطأ: ${error.message}`,
      };
       // Update the placeholder with the error message
       setMessages(prev => prev.map((msg, i) => i === newMessages.length ? errorMessage : msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            المهندس المساعد
          </CardTitle>
          <CardDescription>
            اطرح أي سؤال حول مشروعك أو عن الهندسة المدنية بشكل عام. (يعمل الآن بواسطة openai/gpt-3.5-turbo)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 p-4 min-h-0">
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
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
