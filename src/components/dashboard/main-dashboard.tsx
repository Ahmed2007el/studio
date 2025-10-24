'use client';
import React from 'react';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
import { useState } from 'react';
import ProjectAnalysis from './project-analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { CheckCircle2, CircleDashed, GanttChartSquare, HardHat, ListChecks, TriangleAlert } from 'lucide-react';

export type AnalysisStep =
  | 'structuralSystem'
  | 'buildingCodes'
  | 'executionMethod'
  | 'potentialChallenges'
  | 'keyFocusAreas';

export type AnalysisStatus = {
  [key in AnalysisStep]: 'pending' | 'loading' | 'complete';
};

export default function MainDashboard() {
  const [projectAnalysis, setProjectAnalysis] = useState<
    | (Partial<SuggestStructuralSystemAndCodesOutput> & {
        projectDescription: string;
      })
    | null
  >(null);

  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisUpdate = (
    data: Partial<SuggestStructuralSystemAndCodesOutput>
  ) => {
    setProjectAnalysis((prev) => ({
      ...(prev as object),
      ...data,
      projectDescription: prev?.projectDescription || '',
    }));
  };

  const handleStatusUpdate = (status: AnalysisStatus) => {
    setAnalysisStatus(status);
  }

  const resetState = () => {
    setError(null);
    setProjectAnalysis(null);
    setAnalysisStatus(null);
  };

  const getStatusIcon = (status: 'pending' | 'loading' | 'complete') => {
    switch (status) {
      case 'pending':
        return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
      case 'loading':
        return <GanttChartSquare className="h-5 w-5 animate-pulse text-primary" />;
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const analysisSteps: {key: AnalysisStep, label: string, icon: React.ReactNode}[] = [
    { key: 'structuralSystem', label: 'اقتراح النظام الإنشائي', icon: <GanttChartSquare className="h-5 w-5" /> },
    { key: 'buildingCodes', label: 'تحديد أكواد البناء', icon: <ListChecks className="h-5 w-5" /> },
    { key: 'executionMethod', label: 'اقتراح طريقة التنفيذ', icon: <HardHat className="h-5 w-5" /> },
    { key: 'potentialChallenges', label: 'تحديد التحديات المحتملة', icon: <TriangleAlert className="h-5 w-5" /> },
    { key: 'keyFocusAreas', label: 'تحديد نقاط التركيز الرئيسية', icon: <ListChecks className="h-5 w-5" /> },
  ];

  return (
    <div className="w-full space-y-8">
      <ProjectAnalysis
        onAnalysisStart={(description) => {
          resetState();
          setProjectAnalysis({ projectDescription: description });
          setAnalysisStatus({
            structuralSystem: 'loading',
            buildingCodes: 'pending',
            executionMethod: 'pending',
            potentialChallenges: 'pending',
            keyFocusAreas: 'pending',
          });
        }}
        onAnalysisUpdate={handleAnalysisUpdate}
        onStatusUpdate={handleStatusUpdate}
        onError={(e) => setError(e)}
        isAnalyzing={!!analysisStatus && Object.values(analysisStatus).some(s => s !== 'complete')}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisStatus && !projectAnalysis?.suggestedStructuralSystem && (
        <Card>
          <CardHeader>
            <CardTitle>جاري التحليل...</CardTitle>
            <CardDescription>يقوم مساعد الذكاء الاصطناعي بتحليل مشروعك.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <ul className="space-y-3">
                {analysisSteps.map(step => (
                    <li key={step.key} className="flex items-center gap-3">
                        {getStatusIcon(analysisStatus[step.key])}
                        <span className={`text-sm ${analysisStatus[step.key] === 'pending' ? 'text-muted-foreground' : ''}`}>
                            {step.label}
                        </span>
                    </li>
                ))}
             </ul>
          </CardContent>
        </Card>
      )}

      {projectAnalysis && projectAnalysis.suggestedStructuralSystem && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-headline text-xl">نتائج التحليل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projectAnalysis.suggestedStructuralSystem && (
              <ResultItem
                icon={<GanttChartSquare />}
                title="النظام الإنشائي المقترح"
                content={projectAnalysis.suggestedStructuralSystem}
              />
            )}
            {projectAnalysis.applicableBuildingCodes && (
              <ResultItem
                icon={<ListChecks />}
                title="أكواد البناء المطبقة"
                content={projectAnalysis.applicableBuildingCodes}
              />
            )}
            {projectAnalysis.executionMethod && (
              <ResultItem
                icon={<HardHat />}
                title="طريقة التنفيذ المثلى"
                content={projectAnalysis.executionMethod}
              />
            )}
             <div className="grid gap-6 md:grid-cols-2">
                {projectAnalysis.potentialChallenges && (
                    <ResultItem
                        icon={<TriangleAlert />}
                        title="التحديات المحتملة"
                        content={projectAnalysis.potentialChallenges}
                        isSubItem
                    />
                )}
                {projectAnalysis.keyFocusAreas && (
                    <ResultItem
                        icon={<ListChecks />}
                        title="نقاط التركيز الأساسية"
                        content={projectAnalysis.keyFocusAreas}
                        isSubItem
                    />
                )}
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


function ResultItem({ icon, title, content, isSubItem = false }: { icon: React.ReactNode; title: string; content: string; isSubItem?: boolean }) {
    return (
        <div className={`${isSubItem ? '' : 'rounded-lg border bg-background/50 p-4'}`}>
            <div className="flex items-start gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                    {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}
                </div>
                <div className="flex-1">
                    <h4 className="font-headline text-base font-semibold mb-1">{title}</h4>
                    <div className={`prose prose-sm dark:prose-invert max-w-none text-muted-foreground`}>
                      {content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </div>
            </div>
        </div>
    );
}