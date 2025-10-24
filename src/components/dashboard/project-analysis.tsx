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
    .min(50, 'Please provide a more detailed project description.'),
  projectLocation: z
    .string()
    .min(3, 'Please specify the project location.'),
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
        title: 'Analysis Failed',
        description: 'An error occurred while analyzing the project. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Project Analysis</CardTitle>
        <CardDescription>
          Provide details about your project to get AI-powered suggestions for
          structural systems and building codes.
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
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A 10-story residential building with two basement levels, featuring a concrete frame and a glass facade..."
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the type of structure, dimensions, materials, and
                    key features.
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
                  <FormLabel>Project Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dubai, UAE" {...field} />
                  </FormControl>
                  <FormDescription>
                    The city and country where the project is located.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? 'Analyzing...' : 'Analyze Project'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {initialData && (
        <div className="p-6 pt-0">
            <h3 className="mb-4 text-lg font-medium font-headline">Analysis Results</h3>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Suggested Structural System</CardTitle>
                        <Building className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{initialData.suggestedStructuralSystem}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Applicable Building Codes</CardTitle>
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
