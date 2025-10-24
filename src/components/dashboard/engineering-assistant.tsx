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
import { Loader2, Sparkles, User, Volume2, PlayCircle } from 'lucide-react';
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

export default function EngineeringAssistant({
  projectContext,
}: EngineeringAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{[key: number]: HTMLAudioElement | null}>({});

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const handlePlayAudio = (index: number) => {
    const audio = audioRefs.current[index];
    if (audio) {
      audio.play();
    }
  }


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const assistantInput: EngineeringAssistantInput = {
        projectContext,
        history: newMessages,
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
              placeholder="اكتب سؤالك هنا..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'إرسال'}
            </Button>
          </div>
        </CardFooter>
    </Card>
  );
}
