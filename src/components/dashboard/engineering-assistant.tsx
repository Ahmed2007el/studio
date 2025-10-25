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

export default function EngineeringAssistant({
  projectContext,
}: EngineeringAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
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
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'ar-SA';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript); // Only set the input, don't send automatically
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };
      }
    }
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    const modelMessagePlaceholder: Message = { role: 'model', content: '' };
    setMessages([...newMessages, modelMessagePlaceholder]);

    try {
      // Fetch text reply
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectContext, history: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const result = await response.json();
      const assistantMessage: Message = { role: 'model', content: result.reply };
      
      setMessages(prev => prev.map((msg, i) => i === newMessages.length ? assistantMessage : msg));

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        role: 'model',
        content: `عذراً، لقد واجهت خطأ: ${error.message}`,
      };
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
          اطرح أي سؤال حول مشروعك أو عن الهندسة المدنية بشكل عام. (ميزة الصوت تجريبية)
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
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
              placeholder="اكتب سؤالك أو استخدم الميكروفون..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              className="flex-1"
            />
             <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={handleToggleRecording}
                disabled={!recognitionRef.current || loading}
            >
                <Mic className="h-5 w-5" />
                <span className="sr-only">{isRecording ? "إيقاف التسجيل" : "بدء التسجيل"}</span>
            </Button>
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : 'إرسال'}
            </Button>
          </div>
        </CardFooter>
    </Card>
  );
}
