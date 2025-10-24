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
        title: 'Simulation Failed',
        description: 'An error occurred during the simulation. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = initialData?.analysisResults;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Structural Simulation</CardTitle>
        <CardDescription>
          Run a simplified structural analysis to estimate moments, shear, and
          axial forces on key elements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {initialData?.summary && (
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base font-headline">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{initialData.summary}</p>
                </CardContent>
            </Card>
        )}
        {(loading || chartData) && (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-headline">Force & Moment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                {loading && !chartData ? (
                    <div className="h-[400px] w-full">
                        <Skeleton className="h-full w-full" />
                    </div>
                ): (
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                            dataKey="element"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            />
                            <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            />
                            <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={<ChartTooltipContent />}
                            />
                            <Legend />
                            <Bar
                            dataKey="moment"
                            fill="hsl(var(--chart-1))"
                            radius={[4, 4, 0, 0]}
                            />
                            <Bar
                            dataKey="shear"
                            fill="hsl(var(--chart-2))"
                            radius={[4, 4, 0, 0]}
                            />
                            <Bar
                            dataKey="axial"
                            fill="hsl(var(--chart-3))"
                            radius={[4, 4, 0, 0]}
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
          {loading ? 'Simulating...' : (initialData ? 'Re-run Simulation' : 'Run Simulation')}
        </Button>
      </CardFooter>
    </Card>
  );
}
