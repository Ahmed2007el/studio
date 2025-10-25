'use client';

import { useState } from 'react';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import type { AnalysisStatus } from './main-dashboard';

const FormSchema = z.object({
  projectDescription: z.string().min(10, 'يرجى تقديم وصف لا يقل عن 10 أحرف.'),
});

type FormValues = z.infer<typeof FormSchema>;

interface ProjectAnalysisProps {
  onAnalysisStart: (description: string, location: string) => void;
  onAnalysisUpdate: (
    data: Partial<SuggestStructuralSystemAndCodesOutput>
  ) => void;
  onStatusUpdate: (status: AnalysisStatus) => void;
  onError: (error: string) => void;
  isAnalyzing: boolean;
}

export default function ProjectAnalysis({
  onAnalysisStart,
  onAnalysisUpdate,
  onStatusUpdate,
  onError,
  isAnalyzing,
}: ProjectAnalysisProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projectDescription: '',
    },
  });

  const examples = [
    'برج سكني من 15 طابقاً في الرياض',
    'فيلا من طابقين مع قبو في دبي',
    'جسر خرساني بطول 100 متر فوق نهر',
  ];

  const handleExampleClick = (description: string) => {
    form.setValue('projectDescription', description);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    onAnalysisStart(data.projectDescription, '');
    
    const initialStatus: AnalysisStatus = {
        structuralSystem: 'loading',
        buildingCodes: 'loading',
        executionMethod: 'loading',
        potentialChallenges: 'loading',
        keyFocusAreas: 'loading',
        academicReferences: 'loading'
    };
    onStatusUpdate(initialStatus);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDescription: data.projectDescription, projectLocation: '' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.statusText}`);
      }

      const result = await response.json();

      onAnalysisUpdate(result);

      const finalStatus: AnalysisStatus = {
        structuralSystem: 'complete',
        buildingCodes: 'complete',
        executionMethod: 'complete',
        potentialChallenges: 'complete',
        keyFocusAreas: 'complete',
        academicReferences: 'complete'
      };
      onStatusUpdate(finalStatus);

    } catch (error: any) {
      console.error(error);
      onError(error.message || 'حدث خطأ أثناء إنشاء التحليل. يرجى المحاولة مرة أخرى.');
      const errorStatus: AnalysisStatus = {
        structuralSystem: 'pending',
        buildingCodes: 'pending',
        executionMethod: 'pending',
        potentialChallenges: 'pending',
        keyFocusAreas: 'pending',
        academicReferences: 'pending'
      };
      onStatusUpdate(errorStatus);
    }
  };

  return (
    <Card className="w-full shadow-lg bg-white dark:bg-gray-950">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">
              صف مشروعك الهندسي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: مبنى سكني مكون من 5 طوابق في جدة، مع طابق سفلي لمواقف السيارات."
                      rows={4}
                      className="resize-none text-base text-center bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
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
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  onClick={() => handleExampleClick(ex)}
                >
                  {ex}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <Button
              type="submit"
              disabled={isAnalyzing}
              size="lg"
              className="w-full max-w-xs text-lg"
            >
              {isAnalyzing && <Loader2 className="animate-spin" />}
              {isAnalyzing ? 'جاري التحليل...' : 'ابدأ التحليل الهندسي'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
