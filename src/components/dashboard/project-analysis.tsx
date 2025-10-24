'use client';

import {
  suggestStructuralSystemAndCodes,
} from '@/ai/flows/project-type-and-code-suggestion';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
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
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  projectDescription: z
    .string()
    .min(5, 'يرجى تقديم وصف موجز للمشروع.'),
});

type FormValues = z.infer<typeof FormSchema>;

interface ProjectAnalysisProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (data: SuggestStructuralSystemAndCodesOutput, description: string) => void;
  initialData: SuggestStructuralSystemAndCodesOutput | null;
  onError: (error: string) => void;
}

export default function ProjectAnalysis({
  onAnalysisStart,
  onAnalysisComplete,
  initialData,
  onError,
}: ProjectAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projectDescription: '',
    },
  });

  const examples = [
    "برج سكني من 15 طابقاً في الرياض",
    "فيلا من طابقين مع قبو في دبي",
    "جسر خرساني بطول 100 متر فوق نهر"
  ];

  const handleExampleClick = (description: string) => {
    form.setValue('projectDescription', description);
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    onAnalysisStart();
    try {
      const result = await suggestStructuralSystemAndCodes({projectDescription: data.projectDescription, projectLocation: ''});
      onAnalysisComplete(result, data.projectDescription);
    } catch (error) {
      console.error(error);
      onError('حدث خطأ أثناء إنشاء التحليل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
             <CardTitle className="font-headline text-2xl text-center">صف مشروعك الهندسي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="جسر خرساني بطول 100 متر فوق نهر"
                      rows={4}
                      className="resize-none text-base text-center"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center text-sm text-muted-foreground">
                أو جرب أحد الأمثلة:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                {examples.map((ex, i) => (
                    <Button key={i} type="button" variant="outline" size="sm" className="bg-gray-100 text-gray-700" onClick={() => handleExampleClick(ex)}>
                        {ex}
                    </Button>
                ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Button type="submit" disabled={loading} size="lg" className="w-full max-w-xs text-lg">
              {loading && <Loader2 className="animate-spin" />}
              {loading ? 'جاري التحليل...' : 'ابدأ التحليل الهندسي'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
