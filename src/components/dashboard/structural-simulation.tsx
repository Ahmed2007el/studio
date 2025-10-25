'use client';

import { useState } from 'react';
import type { ConceptualDesignOutput } from './conceptual-design';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

export interface StructuralSimulationOutput {
    summary: string;
    analysisResults: {
        element: string;
        moment: number;
        shear: number;
        axial: number;
    }[];
}

interface StructuralSimulationProps {
  designData: ConceptualDesignOutput & { projectDescription: string };
  onSimulationComplete: (data: StructuralSimulationOutput) => void;
  initialData: StructuralSimulationOutput | null;
}

const chartConfig = {
  moment: {
    label: "العزم (kNm)",
    color: "hsl(var(--chart-1))",
  },
  shear: {
    label: "القص (kN)",
    color: "hsl(var(--chart-2))",
  },
  axial: {
    label: "القوة المحورية (kN)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;


export default function StructuralSimulation({
  designData,
  onSimulationComplete,
  initialData
}: StructuralSimulationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSimulation = async () => {
    setLoading(true);
    const input = {
      ...designData,
    };

    try {
        const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to run simulation');
        }

        const result: StructuralSimulationOutput = await response.json();
        onSimulationComplete(result);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'فشلت المحاكاة',
        description: error.message || 'حدث خطأ أثناء المحاكاة. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = initialData?.analysisResults;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">محاكاة إنشائية</CardTitle>
        <CardDescription>
          قم بإجراء تحليل إنشائي مبسط لتقدير العزوم والقص والقوى المحورية على العناصر الرئيسية.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {initialData?.summary && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base font-headline">ملخص التحليل</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{initialData.summary}</p>
                </CardContent>
            </Card>
        )}
        {(loading || chartData) && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-headline">توزيع القوى والعزوم</CardTitle>
                </CardHeader>
                <CardContent>
                {loading && !chartData ? (
                    <div className="h-[400px] w-full">
                        <Skeleton className="h-full w-full" />
                    </div>
                ): chartData && (
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                              type="category"
                              dataKey="element"
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              width={80}
                            />
                            <ChartTooltip
                              cursor={{ fill: 'hsl(var(--muted))' }}
                              content={<ChartTooltipContent />}
                            />
                            <Legend />
                            <Bar
                            dataKey="moment"
                            name="العزم (kNm)"
                            fill="var(--color-moment)"
                            radius={[0, 4, 4, 0]}
                            />
                            <Bar
                            dataKey="shear"
                            name="القص (kN)"
                            fill="var(--color-shear)"
                            radius={[0, 4, 4, 0]}
                            />
                            <Bar
                            dataKey="axial"
                            name="القوة المحورية (kN)"
                            fill="var(--color-axial)"
                            radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
                </CardContent>
            </Card>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSimulation} disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? 'جاري المحاكاة...' : (initialData ? 'إعادة المحاكاة' : 'بدء المحاكاة')}
        </Button>
      </CardFooter>
    </Card>
  );
}
