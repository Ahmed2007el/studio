'use server';

/**
 * @fileOverview Simulates structural analysis to estimate moments, shear forces, and axial forces on key structural elements.
 *
 * - simulateStructuralAnalysis - A function that handles the structural analysis simulation.
 * - SimulateStructuralAnalysisInput - The input type for the simulateStructuralAnalysis function.
 * - SimulateStructuralAnalysisOutput - The return type for the simulateStructuralAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SimulateStructuralAnalysisInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the project, including the type of structure, dimensions, and location.'),
  structuralSystemSuggestion: z.string().describe('The suggested structural system for the project.'),
  columnCrossSection: z.string().describe('The preliminary cross-section design for columns.'),
  beamCrossSection: z.string().describe('The preliminary cross-section design for beams.'),
  foundationDesign: z.string().describe('The preliminary design for foundations.'),
  deadLoad: z.string().describe('The calculated dead load for the structure.'),
  liveLoad: z.string().describe('The calculated live load for the structure.'),
  windLoad: z.string().describe('The calculated wind load for the structure.'),
  seismicLoad: z.string().describe('The calculated seismic load for the structure.'),
});
export type SimulateStructuralAnalysisInput = z.infer<typeof SimulateStructuralAnalysisInputSchema>;

const AnalysisResultSchema = z.object({
  element: z.string().describe("Identifier for the structural element (e.g., 'Beam B-1', 'Column C-4')."),
  moment: z.number().describe('Estimated maximum bending moment in kNm.'),
  shear: z.number().describe('Estimated maximum shear force in kN.'),
  axial: z.number().describe('Estimated maximum axial force in kN.'),
});

const SimulateStructuralAnalysisOutputSchema = z.object({
  analysisResults: z.array(AnalysisResultSchema).describe('An array of analysis results for key structural elements.'),
  summary: z.string().describe('A brief summary of the analysis results and key findings.')
});
export type SimulateStructuralAnalysisOutput = z.infer<typeof SimulateStructuralAnalysisOutputSchema>;

export async function simulateStructuralAnalysis(
  input: SimulateStructuralAnalysisInput
): Promise<SimulateStructuralAnalysisOutput> {
  return simulateStructuralAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateStructuralAnalysisPrompt',
  input: { schema: SimulateStructuralAnalysisInputSchema },
  output: { schema: SimulateStructuralAnalysisOutputSchema },
  prompt: `You are an advanced structural analysis software like ETABS, performing a simulation. Your response must be in Arabic.

  Project Details:
  - Description: {{projectDescription}}
  - Structural System: {{structuralSystemSuggestion}}
  - Column Section: {{columnCrossSection}}
  - Beam Section: {{beamCrossSection}}
  - Foundation: {{foundationDesign}}
  - Loads: Dead: {{deadLoad}}, Live: {{liveLoad}}, Wind: {{windLoad}}, Seismic: {{seismicLoad}}

  Your Task:
  1. Estimate the maximum bending moments (kNm), shear forces (kN), and axial forces (kN) for 8 key structural elements (a mix of beams and columns, e.g., 'جائز B-1', 'عمود C-4').
  2. Provide a detailed summary of the analysis. The summary should interpret the results, highlight the most critical elements, explain why they are critical (e.g., 'Column C-3 carries the highest axial load due to its central location and tributary area'), and suggest potential design optimizations (e.g., 'Consider increasing the depth of beam B-5 to reduce deflection').
  
  Present the results in the required structured format. Ensure the values are realistic for a preliminary analysis.
  `,
});

const simulateStructuralAnalysisFlow = ai.defineFlow(
  {
    name: 'simulateStructuralAnalysisFlow',
    inputSchema: SimulateStructuralAnalysisInputSchema,
    outputSchema: SimulateStructuralAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
