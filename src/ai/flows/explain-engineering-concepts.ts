'use server';

/**
 * @fileOverview Provides explanations of engineering concepts, suggests academic references, and proposes graduation project ideas.
 *
 * - explainEngineeringConcepts - A function that handles the explanation of engineering concepts.
 * - ExplainEngineeringConceptsInput - The input type for the explainEngineeringConcepts function.
 * - ExplainEngineeringConceptsOutput - The return type for the explainEngineeringConcepts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainEngineeringConceptsInputSchema = z.object({
  topic: z.string().describe('The specific engineering topic to explain.'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).describe('The level of detail required in the explanation.'),
  goal: z.string().describe('The specific goal or question the user has about the topic.'),
});

export type ExplainEngineeringConceptsInput = z.infer<typeof ExplainEngineeringConceptsInputSchema>;

const ExplainEngineeringConceptsOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the engineering concept.'),
  references: z.array(z.string()).describe('A list of academic references relevant to the topic.'),
  projectIdeas: z.array(z.string()).describe('A list of graduation project ideas related to the topic.'),
});

export type ExplainEngineeringConceptsOutput = z.infer<typeof ExplainEngineeringConceptsOutputSchema>;

export async function explainEngineeringConcepts(input: ExplainEngineeringConceptsInput): Promise<ExplainEngineeringConceptsOutput> {
  return explainEngineeringConceptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainEngineeringConceptsPrompt',
  input: {schema: ExplainEngineeringConceptsInputSchema},
  output: {schema: ExplainEngineeringConceptsOutputSchema},
  prompt: `You are an expert civil engineering tutor. Your goal is to explain complex engineering concepts in a clear and understandable way, suggest relevant academic references, and provide project ideas based on the student's goals.

  Topic: {{{topic}}}
  Level: {{{level}}}
  Goal: {{{goal}}}

  Explanation:
  References:
  Project Ideas:`,
});

const explainEngineeringConceptsFlow = ai.defineFlow(
  {
    name: 'explainEngineeringConceptsFlow',
    inputSchema: ExplainEngineeringConceptsInputSchema,
    outputSchema: ExplainEngineeringConceptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
