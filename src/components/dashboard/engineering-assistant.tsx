'use client';

import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Sparkles, User, PlayCircle, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface Message {
  role: 'user' | 'model';
  content: string;
  audioUrl?: string;
  audioLoading?: boolean;
  audioError?: boolean;
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
    // Auto-play audio for the last message if it's from the model and has a URL
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'model' && lastMessage.audioUrl && !lastMessage.audioLoading) {
      const audioIndex = messages.length - 1;
      const audio = audioRefs.current[audioIndex];
      if (audio) {
        // A small delay can help ensure the audio element is ready
        setTimeout(() => handlePlayAudio(audioIndex), 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  }

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
    const modelMessagePlaceholder: Message = { role: 'model', content: '', audioLoading: true };
    setMessages([...newMessages, modelMessagePlaceholder]);


    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectContext,
          // We only need to send the history, not the audio data
          history: newMessages.map(({ audioUrl, audioLoading, ...rest}) => rest), 
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
        audioLoading: true
      };

      // Update the placeholder with the actual content
      setMessages(prev => prev.map((msg, i) => i === newMessages.length ? assistantMessage : msg));

      // Generate speech
      try {
        const ttsResult = await textToSpeech({ text: result.reply });
        if (ttsResult.audio) {
            const finalAssistantMessage: Message = {
                ...assistantMessage,
                audioUrl: ttsResult.audio,
                audioLoading: false
            };
            setMessages(prev => prev.map((msg, i) => i === newMessages.length ? finalAssistantMessage : msg));
        } else {
            throw new Error("TTS generation returned empty audio.");
        }
      } catch (ttsError) {
          console.error("TTS generation failed:", ttsError);
          const messageWithError: Message = {
              ...assistantMessage,
              audioLoading: false,
              audioError: true,
          };
          setMessages(prev => prev.map((msg, i) => i === newMessages.length ? messageWithError : msg));
      }

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

                    {message.role === 'model' && message.content && (
                       <div className="absolute top-2 left-2 flex items-center gap-2">
                        {message.audioLoading ? (
                            <Loader2 className="animate-spin text-primary/50 h-4 w-4" />
                        ) : message.audioUrl && !message.audioError ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 group-hover:opacity-100" onClick={() => handlePlayAudio(index)}>
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <audio 
                                ref={el => audioRefs.current[index] = el}
                                src={message.audioUrl} 
                                className="hidden" 
                            />
                          </>
                        ) : null}
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
