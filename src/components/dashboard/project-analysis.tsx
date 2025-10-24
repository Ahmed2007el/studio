'use client';

import {
  suggestStructuralSystemAndCodes,
  type SuggestStructuralSystemAndCodesOutput,
} from '@/ai/flows/project-type-and-code-suggestion';
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
import { Loader2, Building, Landmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  projectDescription: z
    .string()
    .min(50, 'يرجى تقديم وصف أكثر تفصيلاً للمشروع.'),
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
          قدّم تفاصيل حول مشروعك للحصول على اقتراحات مدعومة بالذكاء الاصطناعي للأنظمة الإنشائية وأكواد البناء.
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
                      placeholder="مثال: مبنى سكني مكون من 10 طوابق مع طابقين سفليين..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    قدم وصفاً عاماً للمشروع ومكوناته.
                  </FormDescription>
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
                    <Input placeholder="مثال: دبي، الإمارات" {...field} />
                  </FormControl>
                  <FormDescription>
                    اذكر المدينة والدولة.
                  </FormDescription>
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
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">النظام الإنشائي المقترح</CardTitle>
                        <Building className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{initialData.suggestedStructuralSystem}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">أكواد البناء المطبقة</CardTitle>
                        <Landmark className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{initialData.applicableBuildingCodes}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </Card>
  );
}
