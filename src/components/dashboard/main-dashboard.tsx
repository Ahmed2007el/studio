'use client';
import React from 'react';
import type { SuggestStructuralSystemAndCodesOutput } from '@/ai/flows/project-type-and-code-suggestion';
import { useState, useEffect } from 'react';
import ProjectAnalysis from './project-analysis';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  AlertCircle,
  BookMarked,
  CheckCircle2,
  CircleDashed,
  GanttChartSquare,
  HardHat,
  ListChecks,
  PlusCircle,
  Share2,
  TriangleAlert,
  Box,
  FileText,
  MessageCircle,
  BrainCircuit,
  GraduationCap
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
import type { GeneratePreliminaryDesignsOutput } from '@/ai/flows/generate-preliminary-designs';
import type { SimulateStructuralAnalysisOutput } from '@/ai/flows/simulate-structural-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConceptualDesign from './conceptual-design';
import StructuralSimulation from './structural-simulation';
import ThreeDViewer from './three-d-viewer';
import EducationalSupport from './educational-support';


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
  conceptualDesign: GeneratePreliminaryDesignsOutput | null;
  structuralSimulation: SimulateStructuralAnalysisOutput | null;
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
      }
    } catch (e) {
      console.error("Failed to parse analysis history from localStorage", e);
      localStorage.removeItem('analysisHistory');
    }
    setView('form');
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
      conceptualDesign: null,
      structuralSimulation: null
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

  const handleDataUpdate = <T extends 'conceptualDesign' | 'structuralSimulation'>(
    field: T,
    data: ProjectAnalysisData[T]
  ) => {
    setCurrentAnalysis(prev => {
        if (!prev) return null;
        const updatedAnalysis = { ...prev, [field]: data };

        const historyIndex = analysisHistory.findIndex(item => item.id === prev.id);
        if (historyIndex !== -1) {
            const updatedHistory = [...analysisHistory];
            updatedHistory[historyIndex] = updatedAnalysis;
            setAnalysisHistory(updatedHistory);
            saveHistory(updatedHistory);
        }
        
        return updatedAnalysis;
    });
  };


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

  const renderResults = () => {
    if (!currentAnalysis) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis"><FileText className="mr-2"/> التحليل الأولي</TabsTrigger>
                <TabsTrigger value="design"><BrainCircuit className="mr-2"/> النمذجة والتصميم</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-headline text-xl">
                          نتائج التحليل الأولي
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
            </TabsContent>
            <TabsContent value="design" className="space-y-6">
                {currentAnalysis.suggestedStructuralSystem && currentAnalysis.applicableBuildingCodes && (
                    <ConceptualDesign 
                        projectAnalysis={{
                            projectDescription: currentAnalysis.projectDescription,
                            projectLocation: currentAnalysis.projectLocation,
                            suggestedStructuralSystem: currentAnalysis.suggestedStructuralSystem,
                            applicableBuildingCodes: currentAnalysis.applicableBuildingCodes
                        }}
                        onDesignComplete={(data) => handleDataUpdate('conceptualDesign', data)}
                        initialData={currentAnalysis.conceptualDesign}
                    />
                )}
                {currentAnalysis.conceptualDesign ? (
                    <StructuralSimulation 
                        designData={{...currentAnalysis.conceptualDesign, projectDescription: currentAnalysis.projectDescription}}
                        onSimulationComplete={(data) => handleDataUpdate('structuralSimulation', data)}
                        initialData={currentAnalysis.structuralSimulation}
                    />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>المحاكاة الإنشائية</CardTitle>
                            <CardDescription>
                                يرجى إكمال خطوة "التصميم المبدئي" أولاً لتتمكن من تشغيل المحاكاة.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
                <ThreeDViewer />
            </TabsContent>
            </Tabs>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="assistant" className='h-full'>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assistant"><MessageCircle className="mr-2"/> المساعد الهندسي</TabsTrigger>
                <TabsTrigger value="education"><GraduationCap className="mr-2"/> الدعم التعليمي</TabsTrigger>
            </TabsList>
            <TabsContent value="assistant" className='h-[calc(100%-40px)]'>
              <EngineeringAssistant projectContext={currentAnalysis} />
            </TabsContent>
            <TabsContent value="education">
              <EducationalSupport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

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
                يقوم مساعد الذكاء الاصطناعي بتحليل مشروعك. قد يستغرق هذا بعض الوقت.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {analysisSteps.map((step) => (
                  <li key={step.key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-primary">{analysisStatus[step.key] === 'complete' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : analysisStatus[step.key] === 'loading' ? <GanttChartSquare className="h-5 w-5 animate-pulse text-primary" /> : <CircleDashed className="h-5 w-5 text-muted-foreground" />}</div>
                    <span
                      className={`font-medium ${
                        analysisStatus[step.key] === 'pending'
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                    {analysisStatus[step.key] === 'loading' && <span className="text-sm text-muted-foreground animate-pulse">جاري التنفيذ...</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {view === 'results' && currentAnalysis && renderResults()}
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
          <h4 className="font-headline text-base font-semibold mb-1 text-right">
            {title}
          </h4>
          {content && (
            <div className="prose dark:prose-invert max-w-none text-muted-foreground prose-p:text-right" style={{ whiteSpace: 'pre-wrap' }}>
              {content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          {references && (
            <ul className="space-y-3 mt-2 list-none p-0 text-right">
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
                    - {ref.authors}
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
