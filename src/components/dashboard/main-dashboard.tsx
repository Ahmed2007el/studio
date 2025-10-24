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
    useState<SuggestStructuralSystemAndCodesOutput | null>(null);
  const [conceptualDesign, setConceptualDesign] =
    useState<GeneratePreliminaryDesignsOutput | null>(null);
  const [simulationResult, setSimulationResult] =
    useState<SimulateStructuralAnalysisOutput | null>(null);

  return (
    <Tabs defaultValue="project-analysis">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <TabsTrigger value="project-analysis">
          <ClipboardList />
          Project Analysis
        </TabsTrigger>
        <TabsTrigger value="conceptual-design" disabled={!projectAnalysis}>
          <DraftingCompass />
          Conceptual Design
        </TabsTrigger>
        <TabsTrigger value="structural-simulation" disabled={!conceptualDesign}>
          <Activity />
          Structural Simulation
        </TabsTrigger>
        <TabsTrigger value="3d-viewer">
          <View />
          3D Viewer
        </TabsTrigger>
        <TabsTrigger value="educational-support">
          <BookOpen />
          Educational Support
        </TabsTrigger>
      </TabsList>
      <TabsContent value="project-analysis">
        <ProjectAnalysis
          onAnalysisComplete={setProjectAnalysis}
          initialData={projectAnalysis}
        />
      </TabsContent>
      <TabsContent value="conceptual-design">
        {projectAnalysis ? (
          <ConceptualDesign
            projectAnalysis={projectAnalysis}
            onDesignComplete={setConceptualDesign}
            initialData={conceptualDesign}
          />
        ) : (
          <DisabledTabPlaceholder
            title="Awaiting Project Analysis"
            description="Please complete the 'Project Analysis' step to enable Conceptual Design."
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
            title="Awaiting Conceptual Design"
            description="Please complete the 'Conceptual Design' step to enable Structural Simulation."
          />
        )}
      </TabsContent>
      <TabsContent value="3d-viewer">
        <ThreeDViewer />
      </TabsContent>
      <TabsContent value="educational-support">
        <EducationalSupport />
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
