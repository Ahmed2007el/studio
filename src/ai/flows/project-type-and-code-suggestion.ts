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
});
export type SuggestStructuralSystemAndCodesOutput = z.infer<typeof SuggestStructuralSystemAndCodesOutputSchema>;

export async function suggestStructuralSystemAndCodes(input: SuggestStructuralSystemAndCodesInput): Promise<SuggestStructuralSystemAndCodesOutput> {
  return suggestStructuralSystemAndCodesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStructuralSystemAndCodesPrompt',
  input: {schema: SuggestStructuralSystemAndCodesInputSchema},
  output: {schema: SuggestStructuralSystemAndCodesOutputSchema},
  prompt: `You are an expert civil engineer providing consultation. Based on the project description and location, provide a detailed suggestion for the most suitable structural system and a comprehensive list of applicable building codes.

Project Description: {{{projectDescription}}}
Project Location: {{{projectLocation}}}

Your response should be in Arabic.

Suggested Structural System: (Provide a detailed rationale for your choice, considering factors like building height, soil conditions if mentioned, material availability, and economic feasibility.)
Applicable Building Codes: (List all relevant national and international codes, including structural, seismic, wind, fire, and accessibility codes.)`,
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
