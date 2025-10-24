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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Building, Landmark, ListChecks, AlertTriangle, Construction } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  projectDescription: z
    .string()
    .min(5, 'يرجى تقديم وصف موجز للمشروع.'),
  projectLocation: z
    .string()
    .min(3, 'يرجى تحديد موقع المشروع.'),
});

type FormValues = z.infer<typeof FormSchema>;

interface ProjectAnalysisProps {
  onAnalysisComplete: (data: SuggestStructuralSystemAndCodesOutput) => void;
  initialData: SuggestStructuralSystemAndCodesOutput | null;
}

export default function ProjectAnalysis({
  onAnalysisComplete,
  initialData,
}: ProjectAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projectDescription: '',
      projectLocation: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const result = await suggestStructuralSystemAndCodes(data);
      onAnalysisComplete(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'فشل التحليل',
        description: 'حدث خطأ أثناء تحليل المشروع. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
        أدخل فكرة عامة عن مشروعك للحصول على تحليل مبدئي للأنظمة الإنشائية، أكواد البناء، وخطط التنفيذ.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المشروع</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: مبنى سكني من 5 طوابق مع قبو..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موقع المشروع</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: الرياض، السعودية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? 'جاري التحليل...' : 'تحليل المشروع'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {initialData && (
        <div className="p-6 pt-0">
            <h3 className="mb-4 text-lg font-medium font-headline">نتائج التحليل</h3>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                        <Building className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base font-semibold">النظام الإنشائي المقترح</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{initialData.suggestedStructuralSystem}</p>
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                        <Landmark className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base font-semibold">أكواد البناء المطبقة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{initialData.applicableBuildingCodes}</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                        <Construction className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base font-semibold">طريقة التنفيذ المثلى</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{initialData.executionMethod}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <CardTitle className="text-base font-semibold">التحديات المحتملة</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground">{initialData.potentialChallenges}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                        <ListChecks className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base font-semibold">نقاط التركيز الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{initialData.keyFocusAreas}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </Card>
  );
}
