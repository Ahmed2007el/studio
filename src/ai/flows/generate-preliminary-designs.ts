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
    .describe('The preliminary cross-section design for columns, with examples and justification.'),
  beamCrossSection: z
    .string()
    .describe('The preliminary cross-section design for beams, with examples and justification.'),
  foundationDesign: z
    .string()
    .describe('The preliminary design for foundations, with examples and justification.'),
  deadLoad: z.string().describe('The calculated dead load for the structure, with calculation explanation.'),
  liveLoad: z.string().describe('The calculated live load for the structure, with calculation explanation.'),
  windLoad: z.string().describe('The calculated wind load for the structure, with calculation explanation.'),
  seismicLoad: z.string().describe('The calculated seismic load for the structure, with calculation explanation.'),
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
  prompt: `You are an experienced structural engineer tasked with generating detailed preliminary designs for a construction project. Your response must be in clear, well-structured Arabic.

  Based on the following project description:
  {{projectDescription}}

  Considering the building code: {{buildingCode}} and the project location: {{location}}.

  Provide the following information with detailed explanations, examples, and justifications:
  - A suggested structural system: (Justify your choice based on efficiency, cost, and suitability for the location).
  - Preliminary cross-section designs for columns and beams: (Provide specific dimension examples like 'C1: 40x60 cm' and 'B1: 30x70 cm'. Explain *why* these dimensions are a good starting point and mention typical reinforcement).
  - A preliminary design for the foundations: (Suggest a foundation type like isolated footings, raft, or piles. Provide initial sizing and explain the choice based on assumed soil conditions).
  - Initial calculations for dead load, live load, wind load, and seismic load: (Present the loads in kN/m^2 or kN. Briefly explain the assumptions and code references used for each calculation. For example: 'Dead Load (Gk): Calculated as ~12 kN/m^2 based on slab thickness, finishes, and partitions.').

  Ensure that the designs and calculations are consistent with the specified building code and location. Structure the output clearly.
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
