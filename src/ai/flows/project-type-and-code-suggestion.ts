'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting structural systems and building codes based on a project description and location.
 *
 * - suggestStructuralSystemAndCodes - A function that takes a project description and location, and returns suggestions for structural systems and building codes.
 * - SuggestStructuralSystemAndCodesInput - The input type for the suggestStructuralSystemAndCodes function.
 * - SuggestStructuralSystemAndCodesOutput - The return type for the suggestStructuralSystemAndCodes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStructuralSystemAndCodesInputSchema = z.object({
  projectDescription: z.string().describe('A description of the project.'),
  projectLocation: z.string().describe('The location of the project.'),
});
export type SuggestStructuralSystemAndCodesInput = z.infer<typeof SuggestStructuralSystemAndCodesInputSchema>;

const SuggestStructuralSystemAndCodesOutputSchema = z.object({
  suggestedStructuralSystem: z.string().describe('The suggested structural system for the project.'),
  applicableBuildingCodes: z.string().describe('The applicable building codes for the project based on its location.'),
  executionMethod: z.string().describe('The optimal construction methodology and execution plan for the project.'),
  potentialChallenges: z.string().describe('A list of potential challenges and common mistakes to avoid during the project execution.'),
  keyFocusAreas: z.string().describe('A list of critical areas and key points to focus on during design and construction.'),
});
export type SuggestStructuralSystemAndCodesOutput = z.infer<typeof SuggestStructuralSystemAndCodesOutputSchema>;

export async function suggestStructuralSystemAndCodes(input: SuggestStructuralSystemAndCodesInput): Promise<SuggestStructuralSystemAndCodesOutput> {
  return suggestStructuralSystemAndCodesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStructuralSystemAndCodesPrompt',
  input: {schema: SuggestStructuralSystemAndCodesInputSchema},
  output: {schema: SuggestStructuralSystemAndCodesOutputSchema},
  prompt: `You are an expert civil engineer providing consultation. Based on the project description and location, provide a detailed analysis. Your response must be in Arabic.

Project Description: {{{projectDescription}}}
Project Location: {{{projectLocation}}}

Provide the following:
- Suggested Structural System: (Provide a detailed rationale for your choice, considering factors like building height, soil conditions if mentioned, material availability, and economic feasibility.)
- Applicable Building Codes: (List all relevant national and international codes, including structural, seismic, wind, fire, and accessibility codes.)
- Optimal Execution Method: (Describe the best construction methodology. For example, 'Fast-track construction using precast concrete' or 'Traditional cast-in-situ concrete'. Explain why.)
- Potential Challenges & Mistakes: (List at least 3 potential challenges or common mistakes. For example, 'Inaccurate soil testing leading to foundation issues' or 'Poor concrete curing in hot weather'.)
- Key Focus Areas: (List at least 3 critical points to focus on. For example, 'Waterproofing for the basement walls' or 'Coordination between structural and MEP drawings'.)
`,
});

const suggestStructuralSystemAndCodesFlow = ai.defineFlow(
  {
    name: 'suggestStructuralSystemAndCodesFlow',
    inputSchema: SuggestStructuralSystemAndCodesInputSchema,
    outputSchema: SuggestStructuralSystemAndCodesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
