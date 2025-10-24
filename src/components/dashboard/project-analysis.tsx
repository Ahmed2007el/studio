'use client';

import { suggestStructuralSystemAndCodes } from '@/ai/flows/project-type-and-code-suggestion';
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
import type { AnalysisStatus, AnalysisStep } from './main-dashboard';

const FormSchema = z.object({
  projectDescription: z.string().min(5, 'يرجى تقديم وصف موجز للمشروع.'),
});

type FormValues = z.infer<typeof FormSchema>;

interface ProjectAnalysisProps {
  onAnalysisStart: (description: string) => void;
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

  const runAnalysisStep = async (
    description: string,
    step: AnalysisStep,
    currentStatus: AnalysisStatus,
    currentData: Partial<SuggestStructuralSystemAndCodesOutput>
  ): Promise<[Partial<SuggestStructuralSystemAndCodesOutput>, AnalysisStatus]> => {
      
    const result = await suggestStructuralSystemAndCodes({
      projectDescription: description,
      projectLocation: '',
      analysisFocus: step,
      context: currentData,
    });
    
    const nextStatus = { ...currentStatus };
    const steps: AnalysisStep[] = ['structuralSystem', 'buildingCodes', 'executionMethod', 'potentialChallenges', 'keyFocusAreas'];
    const currentIndex = steps.indexOf(step);
    nextStatus[step] = 'complete';
    if (currentIndex + 1 < steps.length) {
      nextStatus[steps[currentIndex + 1]] = 'loading';
    }
    
    return [{...currentData, ...result}, nextStatus];
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    onAnalysisStart(data.projectDescription);
    let currentData: Partial<SuggestStructuralSystemAndCodesOutput> = {};
    let currentStatus: AnalysisStatus = {
        structuralSystem: 'loading',
        buildingCodes: 'pending',
        executionMethod: 'pending',
        potentialChallenges: 'pending',
        keyFocusAreas: 'pending',
      };

    try {
      const steps: AnalysisStep[] = ['structuralSystem', 'buildingCodes', 'executionMethod', 'potentialChallenges', 'keyFocusAreas'];

      for (const step of steps) {
        onStatusUpdate(currentStatus);
        const [newData, nextStatus] = await runAnalysisStep(data.projectDescription, step, currentStatus, currentData);
        currentData = newData;
        currentStatus = nextStatus;
        onAnalysisUpdate(newData);
      }
      onStatusUpdate(currentStatus);


    } catch (error) {
      console.error(error);
      onError('حدث خطأ أثناء إنشاء التحليل. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <Card className="w-full shadow-lg">
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
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 text-gray-700"
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