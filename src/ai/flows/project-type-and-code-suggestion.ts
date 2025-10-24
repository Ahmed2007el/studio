'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting structural systems and building codes based on a project description and location.
 *
 * - suggestStructuralSystemAndCodes - A function that takes a project description and returns suggestions for structural systems and building codes.
 * - SuggestStructuralSystemAndCodesInput - The input type for the suggestStructuralSystemAndCodes function.
 * - SuggestStructuralSystemAndCodesOutput - The return type for the suggestStructuralSystemAndCodes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalysisFocusSchema = z.enum([
  'structuralSystem',
  'buildingCodes',
  'executionMethod',
  'potentialChallenges',
  'keyFocusAreas',
  'academicReferences',
]);

const SuggestStructuralSystemAndCodesInputSchema = z.object({
  projectDescription: z.string().describe('A description of the project.'),
  projectLocation: z
    .string()
    .describe(
      'The location of the project. This can be empty. If it is, derive it from the project description if possible.'
    ),
  analysisFocus: AnalysisFocusSchema.describe(
    'The specific part of the analysis to perform.'
  ),
  context: z.any().optional().describe('Previously generated analysis data to provide context.')
});
export type SuggestStructuralSystemAndCodesInput = z.infer<
  typeof SuggestStructuralSystemAndCodesInputSchema
>;

const SuggestStructuralSystemAndCodesOutputSchema = z.object({
  suggestedStructuralSystem: z.string().optional().describe('The suggested structural system for the project.'),
  applicableBuildingCodes: z.string().optional().describe('The applicable building codes for the project based on its location.'),
  executionMethod: z.string().optional().describe('The optimal construction methodology and execution plan for the project.'),
  potentialChallenges: z.string().optional().describe('A list of potential challenges and common mistakes to avoid during the project execution.'),
  keyFocusAreas: z.string().optional().describe('A list of critical areas and key points to focus on during design and construction.'),
  academicReferences: z.string().optional().describe('A list of academic references, textbooks, and research papers relevant to the project.'),
});
export type SuggestStructuralSystemAndCodesOutput = z.infer<
  typeof SuggestStructuralSystemAndCodesOutputSchema
>;

export async function suggestStructuralSystemAndCodes(
  input: SuggestStructuralSystemAndCodesInput
): Promise<SuggestStructuralSystemAndCodesOutput> {
  return suggestStructuralSystemAndCodesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStructuralSystemAndCodesPrompt',
  input: { schema: SuggestStructuralSystemAndCodesInputSchema },
  output: { schema: SuggestStructuralSystemAndCodesOutputSchema },
  prompt: `You are an expert civil engineering consultant providing a detailed analysis for a project. Your response must be in clear, well-structured Arabic.

Project Description: {{{projectDescription}}}
{{#if context}}
Previous Analysis Context:
{{#if context.suggestedStructuralSystem}}
- Suggested Structural System: {{context.suggestedStructuralSystem}}
{{/if}}
{{#if context.applicableBuildingCodes}}
- Applicable Building Codes: {{context.applicableBuildingCodes}}
{{/if}}
{{#if context.executionMethod}}
- Execution Method: {{context.executionMethod}}
{{/if}}
{{#if context.potentialChallenges}}
- Potential Challenges: {{context.potentialChallenges}}
{{/if}}
{{#if context.keyFocusAreas}}
- Key Focus Areas: {{context.keyFocusAreas}}
{{/if}}
{{/if}}

Your current task is to focus ONLY on: '{{analysisFocus}}'. Provide a detailed response for this specific part.

- If analysisFocus is 'structuralSystem', provide a detailed rationale for your choice of structural system, considering factors like building height, soil conditions if mentioned, material availability, and economic feasibility. Explain WHY this system is optimal.
- If analysisFocus is 'buildingCodes', list all relevant national and international codes, including structural, seismic, wind, fire, and accessibility codes. Explain the importance of the main code.
- If analysisFocus is 'executionMethod', describe the best construction methodology with justification. For example, 'Fast-track construction using precast concrete because...' or 'Traditional cast-in-situ concrete due to...'. Explain the steps.
- If analysisFocus is 'potentialChallenges', list at least 3 potential challenges and common mistakes with brief explanations. For example, '1. Inaccurate soil testing leading to foundation issues. 2. Poor concrete curing in hot weather, which can reduce strength.'
- If analysisFocus is 'keyFocusAreas', list at least 3 critical points to focus on during design and construction. For example, '1. Waterproofing for the basement walls to prevent leakage. 2. Coordination between structural and MEP drawings to avoid conflicts.'
- If analysisFocus is 'academicReferences', list at least 3 relevant academic references. Include textbooks, research papers, or design manuals. For each, provide the title, author(s), and a brief note on why it's relevant to this specific project.

Generate a response only for the '{{analysisFocus}}' field. Do not repeat information from the context.
`,
});

const suggestStructuralSystemAndCodesFlow = ai.defineFlow(
  {
    name: 'suggestStructuralSystemAndCodesFlow',
    inputSchema: SuggestStructuralSystemAndCodesInputSchema,
    outputSchema: SuggestStructuralSystemAndCodesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
