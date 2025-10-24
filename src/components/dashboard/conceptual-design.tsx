'use client';

import {
  generatePreliminaryDesigns,
  type GeneratePreliminaryDesignsOutput,
  type GeneratePreliminaryDesignsInput,
} from '@/ai/flows/generate-preliminary-designs';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
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
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const FormSchema = z.object({
  buildingCode: z.enum(['ACI', 'BS', 'UPC']),
});

type FormValues = z.infer<typeof FormSchema>;

interface ConceptualDesignProps {
  projectAnalysis: SuggestStructuralSystemAndCodesOutput & {
    projectDescription: string;
    projectLocation: string;
  };
  onDesignComplete: (data: GeneratePreliminaryDesignsOutput) => void;
  initialData: GeneratePreliminaryDesignsOutput | null;
}

export default function ConceptualDesign({
  projectAnalysis,
  onDesignComplete,
  initialData,
}: ConceptualDesignProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    // Pre-fill building code if AI suggestion is one of the valid options
    const suggested = projectAnalysis.applicableBuildingCodes;
    if (suggested.includes('ACI')) {
      form.setValue('buildingCode', 'ACI');
    } else if (suggested.includes('BS')) {
      form.setValue('buildingCode', 'BS');
    } else if (suggested.includes('UPC')) {
      form.setValue('buildingCode', 'UPC');
    }
  }, [projectAnalysis, form]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    const input: GeneratePreliminaryDesignsInput = {
      projectDescription: projectAnalysis.projectDescription,
      location: projectAnalysis.projectLocation,
      buildingCode: data.buildingCode,
    };
    try {
      const result = await generatePreliminaryDesigns(input);
      onDesignComplete(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Design Generation Failed',
        description: 'An error occurred while generating the design. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const designResults = initialData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Conceptual Design</CardTitle>
        <CardDescription>
          Generate preliminary designs and load calculations based on the
          selected building code.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="buildingCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building Code</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a building code" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACI">ACI (American Concrete Institute)</SelectItem>
                      <SelectItem value="BS">BS (British Standards)</SelectItem>
                      <SelectItem value="UPC">UPC (Uniform Plumbing Code)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? 'Generating...' : 'Generate Design'}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {(loading || designResults) && (
         <div className="p-6 pt-0">
         <h3 className="mb-4 text-lg font-medium font-headline">Design & Load Results</h3>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <ResultCard title="Structural System" value={designResults?.structuralSystemSuggestion} loading={loading} />
           <ResultCard title="Column Cross-Section" value={designResults?.columnCrossSection} loading={loading} />
           <ResultCard title="Beam Cross-Section" value={designResults?.beamCrossSection} loading={loading} />
           <ResultCard title="Foundation Design" value={designResults?.foundationDesign} loading={loading} />
           <ResultCard title="Dead Load" value={designResults?.deadLoad} loading={loading} />
           <ResultCard title="Live Load" value={designResults?.liveLoad} loading={loading} />
           <ResultCard title="Wind Load" value={designResults?.windLoad} loading={loading} />
           <ResultCard title="Seismic Load" value={designResults?.seismicLoad} loading={loading} />
         </div>
       </div>
      )}
    </Card>
  );
}


function ResultCard({ title, value, loading }: { title: string; value?: string; loading: boolean }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !value ? (
            <Skeleton className="h-6 w-3/4" />
          ) : (
            <p className="text-lg font-bold">{value}</p>
          )}
        </CardContent>
      </Card>
    );
  }
