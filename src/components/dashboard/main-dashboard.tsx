'use client';

import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';

import { useState } from 'react';
import ProjectAnalysis from './project-analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';


export default function MainDashboard() {
  const [projectAnalysis, setProjectAnalysis] =
    useState<
      | (SuggestStructuralSystemAndCodesOutput & {
          projectDescription: string;
        })
      | null
    >(null);

  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full space-y-8">
      <ProjectAnalysis
        onAnalysisStart={() => {
            setError(null);
            setProjectAnalysis(null);
        }}
        onAnalysisComplete={(data, description) => {
          setProjectAnalysis({ ...data, projectDescription: description });
        }}
        initialData={projectAnalysis}
        onError={(e) => setError(e)}
      />

      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {projectAnalysis && (
         <div className="p-6 pt-0 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="mb-4 text-lg font-medium font-headline p-6 pb-0">نتائج التحليل</h3>
            <div className="grid gap-6 p-6 pt-0 md:grid-cols-2">
                <div className="md:col-span-2 space-y-4">
                    <p><strong className="font-semibold">النظام الإنشائي المقترح:</strong> {projectAnalysis.suggestedStructuralSystem}</p>
                    <p><strong className="font-semibold">أكواد البناء المطبقة:</strong> {projectAnalysis.applicableBuildingCodes}</p>
                    <p><strong className="font-semibold">طريقة التنفيذ المثلى:</strong> {projectAnalysis.executionMethod}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">التحديات المحتملة</h4>
                    <p className="text-sm text-muted-foreground">{projectAnalysis.potentialChallenges}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">نقاط التركيز الأساسية</h4>
                    <p className="text-sm text-muted-foreground">{projectAnalysis.keyFocusAreas}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
