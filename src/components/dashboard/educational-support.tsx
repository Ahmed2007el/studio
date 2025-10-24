'use client';

import {
  explainEngineeringConcepts,
} from '@/ai/flows/explain-engineering-concepts';
import type { ExplainEngineeringConceptsOutput } from '@/ai/flows/explain-engineering-concepts'
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const FormSchema = z.object({
  topic: z.string().min(5, 'يرجى تحديد موضوع واضح.'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.string().min(10, 'يرجى وصف هدفك بمزيد من التفصيل.'),
});

type FormValues = z.infer<typeof FormSchema>;

export default function EducationalSupport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainEngineeringConceptsOutput | null>(null);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      level: 'beginner',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await explainEngineeringConcepts(data);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'فشل الطلب',
        description: 'حدث خطأ أثناء جلب المعلومات. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          اسأل عن أي مفهوم في الهندسة المدنية للحصول على شرح مفصل ومراجع وأفكار لمشاريع.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموضوع</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: قوى القص وعزوم الانحناء"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مستوى التفصيل</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    dir="rtl"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مستوى" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الهدف/السؤال</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: أريد أن أفهم كيفية رسم مخططات قوى القص."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? 'جاري التفكير...' : 'الحصول على الشرح'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {(loading || result) && (
        <div className="p-6 pt-0">
          <h3 className="mb-4 text-lg font-medium font-headline">إجابة المساعد الذكي</h3>
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-20 w-full" />
             </div>
          ) : (
            result && (
              <Accordion type="multiple" defaultValue={['explanation']} className="w-full">
                <AccordionItem value="explanation">
                  <AccordionTrigger className="font-headline">الشرح</AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none text-base">
                    {result.explanation.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="references">
                  <AccordionTrigger className="font-headline">المراجع الأكاديمية</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pr-5">
                      {result.references.map((ref, i) => (
                        <li key={i}>{ref}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="project-ideas">
                  <AccordionTrigger className="font-headline">أفكار لمشاريع التخرج</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-2 pr-5">
                      {result.projectIdeas.map((idea, i) => (
                        <li key={i}>{idea}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          )}
        </div>
      )}
    </Card>
  );
}
