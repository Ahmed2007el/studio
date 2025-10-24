'use client';
import React from 'react';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
import { useState } from 'react';
import ProjectAnalysis from './project-analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  AlertCircle,
  Share2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  CheckCircle2,
  CircleDashed,
  GanttChartSquare,
  HardHat,
  ListChecks,
  TriangleAlert,
  BookMarked
} from 'lucide-react';
import EngineeringAssistant from './engineering-assistant';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

export type AnalysisStep =
  | 'structuralSystem'
  | 'buildingCodes'
  | 'executionMethod'
  | 'potentialChallenges'
  | 'keyFocusAreas'
  | 'academicReferences';

export type AnalysisStatus = {
  [key in AnalysisStep]: 'pending' | 'loading' | 'complete';
};

export default function MainDashboard() {
  const [projectAnalysis, setProjectAnalysis] = useState<
    | (Partial<SuggestStructuralSystemAndCodesOutput> & {
        projectDescription: string;
        projectLocation: string;
      })
    | null
  >(null);

  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysisUpdate = (
    data: Partial<SuggestStructuralSystemAndCodesOutput>
  ) => {
    setProjectAnalysis((prev) => ({
      ...(prev as object),
      ...data,
      projectDescription: prev?.projectDescription || '',
      projectLocation: prev?.projectLocation || '',
    }));
  };

  const handleStatusUpdate = (status: AnalysisStatus) => {
    setAnalysisStatus(status);
  };

  const resetState = () => {
    setError(null);
    setProjectAnalysis(null);
    setAnalysisStatus(null);
  };

  const handleShare = async () => {
    if (!projectAnalysis) return;

    const shareText = `
تحليل مشروع: ${projectAnalysis.projectDescription}

النظام الإنشائي المقترح:
${projectAnalysis.suggestedStructuralSystem || 'N/A'}

أكواد البناء المطبقة:
${projectAnalysis.applicableBuildingCodes || 'N/A'}

طريقة التنفيذ المثلى:
${projectAnalysis.executionMethod || 'N/A'}

التحديات المحتملة:
${projectAnalysis.potentialChallenges || 'N/A'}

نقاط التركيز الأساسية:
${projectAnalysis.keyFocusAreas || 'N/A'}

مراجع أكاديمية:
${projectAnalysis.academicReferences?.map(ref => `- ${ref.title} by ${ref.authors}`).join('\n') || 'N/A'}

تم إنشاؤه بواسطة مساعد الهندسة المدنية.
    `.trim();

    if (navigator.share) {
        try {
            await navigator.share({
                title: `تحليل مشروع: ${projectAnalysis.projectDescription}`,
                text: shareText,
            });
            toast({
                title: "تمت المشاركة بنجاح!",
            });
        } catch (err) {
            console.error('Failed to share: ', err);
            toast({
                variant: "destructive",
                title: "فشلت المشاركة",
                description: "لم نتمكن من مشاركة النتائج. قد يكون المتصفح لا يدعم هذه الميزة أو تم رفض الإذن.",
            });
        }
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            toast({
                title: "تم النسخ بنجاح!",
                description: "تم نسخ نتائج التحليل إلى الحافظة.",
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast({
                variant: "destructive",
                title: "فشل النسخ",
                description: "لم نتمكن من نسخ النتائج. يرجى المحاولة مرة أخرى.",
            });
        });
    }
  }

  const getStatusIcon = (status: 'pending' | 'loading' | 'complete') => {
    switch (status) {
      case 'pending':
        return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
      case 'loading':
        return (
          <GanttChartSquare className="h-5 w-5 animate-pulse text-primary" />
        );
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const analysisSteps: {
    key: AnalysisStep;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'structuralSystem',
      label: 'اقتراح النظام الإنشائي',
      icon: <GanttChartSquare className="h-5 w-5" />,
    },
    {
      key: 'buildingCodes',
      label: 'تحديد أكواد البناء',
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      key: 'executionMethod',
      label: 'اقتراح طريقة التنفيذ',
      icon: <HardHat className="h-5 w-5" />,
    },
    {
      key: 'potentialChallenges',
      label: 'تحديد التحديات المحتملة',
      icon: <TriangleAlert className="h-5 w-5" />,
    },
    {
      key: 'keyFocusAreas',
      label: 'تحديد نقاط التركيز الرئيسية',
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
        key: 'academicReferences',
        label: 'اقتراح مراجع أكاديمية',
        icon: <BookMarked className="h-5 w-5" />,
      },
  ];

  const isAnalyzing = !!analysisStatus && !Object.values(analysisStatus).every(s => s === 'complete' || s === 'pending');
  const isAnalysisComplete =
    !!analysisStatus && Object.values(analysisStatus).every((s) => s === 'complete');
    
  const showAnalysisProgress = !!analysisStatus;

  return (
    <div className="w-full space-y-8 relative">
      {!isAnalysisComplete && (
         <ProjectAnalysis
         onAnalysisStart={(description, location) => {
           resetState();
           setProjectAnalysis({ projectDescription: description, projectLocation: location });
           setAnalysisStatus({
             structuralSystem: 'loading',
             buildingCodes: 'pending',
             executionMethod: 'pending',
             potentialChallenges: 'pending',
             keyFocusAreas: 'pending',
             academicReferences: 'pending',
           });
         }}
         onAnalysisUpdate={handleAnalysisUpdate}
         onStatusUpdate={handleStatusUpdate}
         onError={(e) => setError(e)}
         isAnalyzing={isAnalyzing}
       />
      )}
     

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAnalysisProgress && !isAnalysisComplete && analysisStatus && (
        <Card>
          <CardHeader>
            <CardTitle>جاري التحليل...</CardTitle>
            <CardDescription>
              يقوم مساعد الذكاء الاصطناعي بتحليل مشروعك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {analysisSteps.map((step) => (
                <li key={step.key} className="flex items-center gap-3">
                  {getStatusIcon(analysisStatus[step.key])}
                  <span
                    className={`text-sm ${
                      analysisStatus[step.key] === 'pending'
                        ? 'text-muted-foreground'
                        : ''
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {isAnalysisComplete && projectAnalysis && (
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
                <Card className="bg-card">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className='flex-1'>
                    <CardTitle className="font-headline text-xl">نتائج التحليل</CardTitle>
                    <CardDescription>{projectAnalysis.projectDescription}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">مشاركة</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 !pt-0">
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
                    {projectAnalysis.academicReferences && projectAnalysis.academicReferences.length > 0 && (
                        <ResultItem
                            icon={<BookMarked />}
                            title="مراجع أكاديمية مقترحة"
                            references={projectAnalysis.academicReferences}
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
            </div>
            <div className="lg:col-span-2">
                <EngineeringAssistant projectContext={projectAnalysis} />
            </div>
        </div>
      )}

    </div>
  );
}

function ResultItem({
    icon,
    title,
    content,
    references,
    isSubItem = false,
  }: {
    icon: React.ReactNode;
    title: string;
    content?: string;
    references?: { title: string; authors: string; note: string, searchLink: string }[];
    isSubItem?: boolean;
  }) {
  return (
    <div
      className={`${
        isSubItem ? '' : 'rounded-lg border bg-background/50 p-4'
      }`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
          {React.cloneElement(icon as React.ReactElement, {
            className: 'h-5 w-5',
          })}
        </div>
        <div className="flex-1">
          <h4 className="font-headline text-base font-semibold mb-1">{title}</h4>
          {content && (
             <div
             className={`prose dark:prose-invert max-w-none text-muted-foreground text-lg`}
           >
             {content.split('\n').map((paragraph, index) => {
                const isListItem = paragraph.match(/^\s*(\d+\.|-|\*|[a-zA-Z]\))\s*/);
                return (
                  <p key={index} className={`mb-2 first:mt-0 text-base ${isListItem ? 'p-0' : 'text-justify'}`}>
                    {paragraph}
                  </p>
                );
             })}
           </div>
          )}
          {references && (
            <ul className="space-y-3 mt-2 list-none p-0">
                {references.map((ref, index) => (
                    <li key={index} className="text-base">
                        <a href={ref.searchLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline">
                          {ref.title}
                        </a>
                        <span className="text-muted-foreground text-sm"> by {ref.authors}</span>
                        <p className="text-sm text-muted-foreground/80 mt-1">{ref.note}</p>
                    </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
