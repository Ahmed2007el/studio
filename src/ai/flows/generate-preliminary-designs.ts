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
    .describe('A text description of the preliminary cross-section design for columns, with examples and justification.'),
  columnWidth: z.number().describe('The suggested width for a typical column in centimeters (cm).'),
  columnHeight: z.number().describe('The suggested height/depth for a typical column in centimeters (cm).'),
  beamCrossSection: z
    .string()
    .describe('A text description of the preliminary cross-section design for beams, with examples and justification.'),
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

  Provide the following information:
  1.  **Suggested Structural System**: Justify your choice based on efficiency, cost, and suitability for the location.
  2.  **Column Design**:
      *   Provide a descriptive text for the preliminary cross-section of columns. Explain *why* these dimensions are a good starting point and mention typical reinforcement.
      *   Provide a specific numerical value for the column width in centimeters in the 'columnWidth' field (e.g., 40).
      *   Provide a specific numerical value for the column height/depth in centimeters in the 'columnHeight' field (e.g., 60).
  3.  **Beam Design**: Provide a descriptive text for the preliminary cross-section of beams with justifications.
  4.  **Foundation Design**: Suggest a foundation type (e.g., isolated footings, raft, or piles), provide initial sizing, and explain your choice based on assumed soil conditions.
  5.  **Load Calculations**: Provide initial calculations for dead load, live load, wind load, and seismic load. Present the loads in kN/m^2 or kN and briefly explain the assumptions and code references used for each.

  Ensure all text is in Arabic and that the numerical dimensions are correctly placed in their respective fields.
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
