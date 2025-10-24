'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  chatWithEngineeringAssistant,
  type EngineeringAssistantInput,
} from '@/ai/flows/engineering-assistant';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Sparkles, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface EngineeringAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectContext: any;
}

export default function EngineeringAssistant({
  open,
  onOpenChange,
  projectContext,
}: EngineeringAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
      const result = await chatWithEngineeringAssistant(assistantInput);
      const assistantMessage: Message = {
        role: 'model',
        content: result.reply,
      };
      setMessages([...newMessages, assistantMessage]);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">
            المهندس المساعد
          </SheetTitle>
          <SheetDescription>
            اطرح أي سؤال حول مشروعك أو عن الهندسة المدنية بشكل عام.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
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
                    className={`max-w-prose rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
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
               {loading && (
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
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'إرسال'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
