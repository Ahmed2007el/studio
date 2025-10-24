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

const SuggestStructuralSystemAndCodesInputSchema = z.object({
  projectDescription: z.string().describe('A description of the project.'),
  projectLocation: z
    .string()
    .describe(
      'The location of the project. This can be empty. If it is, derive it from the project description if possible.'
    ),
});
export type SuggestStructuralSystemAndCodesInput = z.infer<
  typeof SuggestStructuralSystemAndCodesInputSchema
>;

const AcademicReferenceSchema = z.object({
    title: z.string().describe("The title of the academic reference (book, paper, etc.)."),
    authors: z.string().describe("The author(s) of the reference."),
    note: z.string().describe("A brief note on why this reference is relevant to the project."),
    searchLink: z.string().url().describe("A Google search URL to find the reference online. Should be in the format 'https://www.google.com/search?q=...'"),
});


const SuggestStructuralSystemAndCodesOutputSchema = z.object({
  suggestedStructuralSystem: z.string().describe('The suggested structural system for the project. Provide a detailed rationale for your choice, considering factors like building height, soil conditions if mentioned, material availability, and economic feasibility. Explain WHY this system is optimal.'),
  applicableBuildingCodes: z.string().describe('The applicable building codes for the project based on its location. List all relevant national and international codes, including structural, seismic, wind, fire, and accessibility codes. Explain the importance of the main code.'),
  executionMethod: z.string().describe("The optimal construction methodology and execution plan for the project. Describe the best construction methodology with justification. For example, 'Fast-track construction using precast concrete because...' or 'Traditional cast-in-situ concrete due to...'. Explain the steps."),
  potentialChallenges: z.string().describe("A list of at least 3 potential challenges and common mistakes to avoid during the project execution. For example, '1. Inaccurate soil testing leading to foundation issues. 2. Poor concrete curing in hot weather, which can reduce strength.'"),
  keyFocusAreas: z.string().describe("A list of at least 3 critical areas and key points to focus on during design and construction. For example, '1. Waterproofing for the basement walls to prevent leakage. 2. Coordination between structural and MEP drawings to avoid conflicts.'"),
  academicReferences: z.array(AcademicReferenceSchema).describe('A list of at least 3 relevant academic references, textbooks, and research papers relevant to the project. For each, provide the title, author(s), a brief note on its relevance, and a Google search URL to find it. For example, for the book "Structural Concrete: Theory and Design" by M. Nadim Hassoun, the searchLink would be "https://www.google.com/search?q=Structural+Concrete:+Theory+and+Design+M.+Nadim+Hassoun".'),
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
  prompt: `You are an expert civil engineering consultant providing a detailed and complete analysis for a project. Your response must be in clear, well-structured Arabic.

Project Description: {{{projectDescription}}}
Project Location: {{#if projectLocation}}{{projectLocation}}{{else}}Not specified, please infer from description.{{/if}}

Your task is to generate a comprehensive preliminary analysis. Provide a detailed response for ALL of the following sections in the output schema:
1.  **suggestedStructuralSystem**: Provide a detailed rationale for your choice of structural system.
2.  **applicableBuildingCodes**: List all relevant national and international codes.
3.  **executionMethod**: Describe the best construction methodology with justification.
4.  **potentialChallenges**: List at least 3 potential challenges and common mistakes.
5.  **keyFocusAreas**: List at least 3 critical points to focus on during design and construction.
6.  **academicReferences**: List at least 3 relevant academic references with titles, authors, notes, and valid Google search URLs.

Ensure your entire response is comprehensive and populates all fields in the output schema.
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
