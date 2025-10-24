'use client';

import type {
  GeneratePreliminaryDesignsOutput,
} from '@/ai/flows/generate-preliminary-designs';
import type {
  SimulateStructuralAnalysisOutput,
} from '@/ai/flows/simulate-structural-analysis';
import type {
  SuggestStructuralSystemAndCodesOutput,
} from '@/ai/flows/project-type-and-code-suggestion';

import { useState } from 'react';
import {
  Activity,
  BookOpen,
  ClipboardList,
  DraftingCompass,
  View,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectAnalysis from './project-analysis';
import ConceptualDesign from './conceptual-design';
import StructuralSimulation from './structural-simulation';
import EducationalSupport from './educational-support';
import ThreeDViewer from './three-d-viewer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MainDashboard() {
  const [projectAnalysis, setProjectAnalysis] =
    useState<(SuggestStructuralSystemAndCodesOutput & {projectDescription: string; projectLocation: string}) | null>(null);
  const [conceptualDesign, setConceptualDesign] =
    useState<(GeneratePreliminaryDesignsOutput & {projectDescription: string}) | null>(null);
  const [simulationResult, setSimulationResult] =
    useState<SimulateStructuralAnalysisOutput | null>(null);

  return (
    <Tabs defaultValue="educational-support">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <TabsTrigger value="educational-support">
          <BookOpen />
          الدعم التعليمي
        </TabsTrigger>
        <TabsTrigger value="project-analysis">
          <ClipboardList />
          تحليل المشروع
        </TabsTrigger>
        <TabsTrigger value="conceptual-design" disabled={!projectAnalysis}>
          <DraftingCompass />
          التصميم المبدئي
        </TabsTrigger>
        <TabsTrigger value="structural-simulation" disabled={!conceptualDesign}>
          <Activity />
          محاكاة إنشائية
        </TabsTrigger>
        <TabsTrigger value="3d-viewer">
          <View />
          عارض ثلاثي الأبعاد
        </TabsTrigger>
      </TabsList>
      <TabsContent value="educational-support">
        <EducationalSupport />
      </TabsContent>
      <TabsContent value="project-analysis">
        <ProjectAnalysis
          onAnalysisComplete={(data) => {
            const description = (document.querySelector('textarea[name="projectDescription"]') as HTMLTextAreaElement)?.value;
            const location = (document.querySelector('input[name="projectLocation"]') as HTMLInputElement)?.value;
            setProjectAnalysis({...data, projectDescription: description, projectLocation: location});
          }}
          initialData={projectAnalysis}
        />
      </TabsContent>
      <TabsContent value="conceptual-design">
        {projectAnalysis ? (
          <ConceptualDesign
            projectAnalysis={projectAnalysis}
            onDesignComplete={(data) => setConceptualDesign({...data, projectDescription: projectAnalysis.projectDescription})}
            initialData={conceptualDesign}
          />
        ) : (
          <DisabledTabPlaceholder
            title="في انتظار تحليل المشروع"
            description="يرجى إكمال خطوة 'تحليل المشروع' لتفعيل التصميم المبدئي."
          />
        )}
      </TabsContent>
      <TabsContent value="structural-simulation">
        {conceptualDesign ? (
          <StructuralSimulation
            designData={conceptualDesign}
            onSimulationComplete={setSimulationResult}
            initialData={simulationResult}
          />
        ) : (
          <DisabledTabPlaceholder
            title="في انتظار التصميم المبدئي"
            description="يرجى إكمال خطوة 'التصميم المبدئي' لتفعيل المحاكاة الإنشائية."
          />
        )}
      </TabsContent>
      <TabsContent value="3d-viewer">
        <ThreeDViewer />
      </TabsContent>
    </Tabs>
  );
}

function DisabledTabPlaceholder({title, description}: {title: string, description: string}) {
  return (
    <Card className="mt-4 text-center">
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
