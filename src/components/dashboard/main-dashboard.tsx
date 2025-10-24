'use client';
import React from 'react';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
import { useState, useEffect } from 'react';
import ProjectAnalysis from './project-analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  AlertCircle,
  Share2,
  BookMarked,
  CheckCircle2,
  CircleDashed,
  GanttChartSquare,
  HardHat,
  ListChecks,
  TriangleAlert,
  History,
  PlusCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import EngineeringAssistant from './engineering-assistant';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

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

export type ProjectAnalysisData = Partial<SuggestStructuralSystemAndCodesOutput> & {
  id: string;
  projectDescription: string;
  projectLocation: string;
  timestamp: string;
};

export default function MainDashboard() {
  const [currentAnalysis, setCurrentAnalysis] =
    useState<ProjectAnalysisData | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<ProjectAnalysisData[]>(
    []
  );
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'form' | 'analysis_progress' | 'results'>(
    'form'
  );

  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory) as ProjectAnalysisData[];
        setAnalysisHistory(parsedHistory);
        if (parsedHistory.length > 0) {
            // Automatically select the most recent analysis
            setCurrentAnalysis(parsedHistory[0]);
            setView('results');
        }
      }
    } catch (e) {
      console.error("Failed to parse analysis history from localStorage", e);
      // Handle corrupted data if necessary
      localStorage.removeItem('analysisHistory');
    }
  }, []);

  const saveHistory = (history: ProjectAnalysisData[]) => {
    try {
        localStorage.setItem('analysisHistory', JSON.stringify(history));
    } catch(e) {
        console.error("Failed to save analysis history to localStorage", e);
    }
  };

  const handleAnalysisStart = (description: string, location: string) => {
    setError(null);
    const newAnalysis: ProjectAnalysisData = {
      id: Date.now().toString(),
      projectDescription: description,
      projectLocation: location,
      timestamp: new Date().toISOString(),
    };
    setCurrentAnalysis(newAnalysis);
    setAnalysisStatus({
      structuralSystem: 'loading',
      buildingCodes: 'pending',
      executionMethod: 'pending',
      potentialChallenges: 'pending',
      keyFocusAreas: 'pending',
      academicReferences: 'pending',
    });
    setView('analysis_progress');
  };

  const handleAnalysisUpdate = (
    data: Partial<SuggestStructuralSystemAndCodesOutput>
  ) => {
    setCurrentAnalysis((prev) => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
  };

  const handleAnalysisComplete = () => {
    setCurrentAnalysis(prev => {
        if (prev) {
            const updatedHistory = [prev, ...analysisHistory];
            setAnalysisHistory(updatedHistory);
            saveHistory(updatedHistory);
        }
        return prev;
    });
    setView('results');
  };

  const handleStatusUpdate = (status: AnalysisStatus) => {
    setAnalysisStatus(status);
     const isComplete = Object.values(status).every((s) => s === 'complete');
     if (isComplete) {
        handleAnalysisComplete();
     }
  };

  const handleSelectHistoryItem = (id: string) => {
    const selected = analysisHistory.find(item => item.id === id);
    if (selected) {
        setCurrentAnalysis(selected);
        setView('results');
        setAnalysisStatus(null);
        setError(null);
    }
  }

  const handleNewAnalysisClick = () => {
    setCurrentAnalysis(null);
    setAnalysisStatus(null);
    setError(null);
    setView('form');
  }


  const handleShare = async () => {
    if (!currentAnalysis) return;

    const shareText = `
تحليل مشروع: ${currentAnalysis.projectDescription}

النظام الإنشائي المقترح:
${currentAnalysis.suggestedStructuralSystem || 'N/A'}

أكواد البناء المطبقة:
${currentAnalysis.applicableBuildingCodes || 'N/A'}

طريقة التنفيذ المثلى:
${currentAnalysis.executionMethod || 'N/A'}

التحديات المحتملة:
${currentAnalysis.potentialChallenges || 'N/A'}

نقاط التركيز الأساسية:
${currentAnalysis.keyFocusAreas || 'N/A'}

مراجع أكاديمية:
${
  currentAnalysis.academicReferences
    ?.map((ref) => `- ${ref.title} by ${ref.authors}`)
    .join('\n') || 'N/A'
}

تم إنشاؤه بواسطة مساعد الهندسة المدنية.
    `.trim();

    try {
        await navigator.clipboard.writeText(shareText);
        toast({
            title: "تم النسخ بنجاح!",
            description: "تم نسخ نتائج التحليل إلى الحافظة.",
        });
    } catch (err) {
        console.error('Failed to copy: ', err);
        toast({
            variant: "destructive",
            title: "فشل النسخ",
            description: "لم نتمكن من نسخ النتائج. يرجى المحاولة مرة أخرى.",
        });
    }
  };

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

  return (
    <SidebarProvider>
      <Sidebar>
          <SidebarHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-lg">سجل التحليلات</h2>
                <SidebarTrigger />
              </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
                {analysisHistory.map(item => (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          onClick={() => handleSelectHistoryItem(item.id)}
                          isActive={currentAnalysis?.id === item.id}
                          className="h-auto py-2"
                        >
                            <div className="flex flex-col items-start text-right w-full">
                                <span className="font-semibold text-sm">{item.projectDescription}</span>
                                <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarContent>
      </Sidebar>
      <div className="w-full space-y-8 relative flex-1">
        <div className="absolute top-0 right-0 z-10 p-2 md:hidden">
            <SidebarTrigger/>
        </div>
        <div className='flex justify-start mb-4'>
             <Button onClick={handleNewAnalysisClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                تحليل جديد
            </Button>
        </div>
        {view === 'form' && (
          <ProjectAnalysis
            onAnalysisStart={handleAnalysisStart}
            onAnalysisUpdate={handleAnalysisUpdate}
            onStatusUpdate={handleStatusUpdate}
            onError={(e) => setError(e)}
            isAnalyzing={view === 'analysis_progress'}
          />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {view === 'analysis_progress' && analysisStatus && (
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

        {view === 'results' && currentAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Card className="bg-card">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-headline text-xl">
                      نتائج التحليل
                    </CardTitle>
                    <CardDescription>
                      {currentAnalysis.projectDescription}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">مشاركة</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 !pt-0">
                  {currentAnalysis.suggestedStructuralSystem && (
                    <ResultItem
                      icon={<GanttChartSquare />}
                      title="النظام الإنشائي المقترح"
                      content={currentAnalysis.suggestedStructuralSystem}
                    />
                  )}
                  {currentAnalysis.applicableBuildingCodes && (
                    <ResultItem
                      icon={<ListChecks />}
                      title="أكواد البناء المطبقة"
                      content={currentAnalysis.applicableBuildingCodes}
                    />
                  )}
                  {currentAnalysis.executionMethod && (
                    <ResultItem
                      icon={<HardHat />}
                      title="طريقة التنفيذ المثلى"
                      content={currentAnalysis.executionMethod}
                    />
                  )}
                  {currentAnalysis.academicReferences &&
                    currentAnalysis.academicReferences.length > 0 && (
                      <ResultItem
                        icon={<BookMarked />}
                        title="مراجع أكاديمية مقترحة"
                        references={currentAnalysis.academicReferences}
                      />
                    )}
                  <div className="grid gap-6 md:grid-cols-2">
                    {currentAnalysis.potentialChallenges && (
                      <ResultItem
                        icon={<TriangleAlert />}
                        title="التحديات المحتملة"
                        content={currentAnalysis.potentialChallenges}
                        isSubItem
                      />
                    )}
                    {currentAnalysis.keyFocusAreas && (
                      <ResultItem
                        icon={<ListChecks />}
                        title="نقاط التركيز الأساسية"
                        content={currentAnalysis.keyFocusAreas}
                        isSubItem
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <EngineeringAssistant projectContext={currentAnalysis} />
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
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
  references?: {
    title: string;
    authors: string;
    note: string;
    searchLink: string;
  }[];
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
          <h4 className="font-headline text-base font-semibold mb-1">
            {title}
          </h4>
          {content && (
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
              {content.split('\n').map((paragraph, index) => {
                const isListItem = paragraph.match(
                  /^\s*(\d+\.|-|\*|[a-zA-Z]\))\s*/
                );
                return (
                  <p
                    key={index}
                    className={`mb-2 first:mt-0 text-base p-0 text-justify`}
                  >
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
                  <a
                    href={ref.searchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-400 hover:underline"
                  >
                    {ref.title}
                  </a>
                  <span className="text-muted-foreground text-sm">
                    {' '}
                    by {ref.authors}
                  </span>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    {ref.note}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
