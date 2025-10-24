'use client';

import {
  simulateStructuralAnalysis,
  type SimulateStructuralAnalysisOutput,
  type SimulateStructuralAnalysisInput,
} from '@/ai/flows/simulate-structural-analysis';
import type { GeneratePreliminaryDesignsOutput } from '@/ai/flows/generate-preliminary-designs';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '../ui/skeleton';

interface StructuralSimulationProps {
  designData: GeneratePreliminaryDesignsOutput & { projectDescription: string };
  onSimulationComplete: (data: SimulateStructuralAnalysisOutput) => void;
  initialData: SimulateStructuralAnalysisOutput | null;
}

export default function StructuralSimulation({
  designData,
  onSimulationComplete,
  initialData
}: StructuralSimulationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSimulation = async () => {
    setLoading(true);
    const input: SimulateStructuralAnalysisInput = {
      projectDescription: designData.projectDescription,
      structuralSystemSuggestion: designData.structuralSystemSuggestion,
      columnCrossSection: designData.columnCrossSection,
      beamCrossSection: designData.beamCrossSection,
      foundationDesign: designData.foundationDesign,
      deadLoad: designData.deadLoad,
      liveLoad: designData.liveLoad,
      windLoad: designData.windLoad,
      seismicLoad: designData.seismicLoad,
    };

    try {
      const result = await simulateStructuralAnalysis(input);
      onSimulationComplete(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'فشلت المحاكاة',
        description: 'حدث خطأ أثناء المحاكاة. يرجى المحاولة مرة أخرى.',
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
                ): (
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
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
                            <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={<ChartTooltipContent />}
                            />
                            <Legend />
                            <Bar
                            dataKey="moment"
                            name="العزم (kNm)"
                            fill="hsl(var(--chart-1))"
                            radius={[0, 4, 4, 0]}
                            />
                            <Bar
                            dataKey="shear"
                            name="القص (kN)"
                            fill="hsl(var(--chart-2))"
                            radius={[0, 4, 4, 0]}
                            />
                            <Bar
                            dataKey="axial"
                            name="القوة المحورية (kN)"
                            fill="hsl(var(--chart-3))"
                            radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
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
