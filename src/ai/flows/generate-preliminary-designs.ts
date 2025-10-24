'use server';

/**
 * @fileOverview Generates preliminary designs for structural elements, including cross-sections and initial load calculations.
 *
 * - generatePreliminaryDesigns - A function that handles the generation of preliminary designs.
 * - GeneratePreliminaryDesignsInput - The input type for the generatePreliminaryDesigns function.
 * - GeneratePreliminaryDesignsOutput - The return type for the generatePreliminaryDesigns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePreliminaryDesignsInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project, including the type of structure, dimensions, and location.'),
  buildingCode: z.enum(['ACI', 'BS', 'UPC']).describe('The building code to be used for the design.'),
  location: z.string().describe('The location of the project.'),
});
export type GeneratePreliminaryDesignsInput = z.infer<
  typeof GeneratePreliminaryDesignsInputSchema
>;

const GeneratePreliminaryDesignsOutputSchema = z.object({
  structuralSystemSuggestion: z
    .string()
    .describe('The suggested structural system for the project.'),
  columnCrossSection: z
    .string()
    .describe('The preliminary cross-section design for columns.'),
  beamCrossSection: z
    .string()
    .describe('The preliminary cross-section design for beams.'),
  foundationDesign: z
    .string()
    .describe('The preliminary design for foundations.'),
  deadLoad: z.string().describe('The calculated dead load for the structure.'),
  liveLoad: z.string().describe('The calculated live load for the structure.'),
  windLoad: z.string().describe('The calculated wind load for the structure.'),
  seismicLoad: z.string().describe('The calculated seismic load for the structure.'),
});
export type GeneratePreliminaryDesignsOutput = z.infer<
  typeof GeneratePreliminaryDesignsOutputSchema
>;

export async function generatePreliminaryDesigns(
  input: GeneratePreliminaryDesignsInput
): Promise<GeneratePreliminaryDesignsOutput> {
  return generatePreliminaryDesignsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePreliminaryDesignsPrompt',
  input: {schema: GeneratePreliminaryDesignsInputSchema},
  output: {schema: GeneratePreliminaryDesignsOutputSchema},
  prompt: `You are an experienced structural engineer tasked with generating preliminary designs for a construction project.

  Based on the following project description:
  {{projectDescription}}

  Considering the building code: {{buildingCode}} and the project location: {{location}}.

  Provide the following information:
  - A suggested structural system.
  - Preliminary cross-section designs for columns and beams.
  - A preliminary design for the foundations.
  - Initial calculations for dead load, live load, wind load, and seismic load.

  Ensure that the designs and calculations are consistent with the specified building code and location.
`,
});

const generatePreliminaryDesignsFlow = ai.defineFlow(
  {
    name: 'generatePreliminaryDesignsFlow',
    inputSchema: GeneratePreliminaryDesignsInputSchema,
    outputSchema: GeneratePreliminaryDesignsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
