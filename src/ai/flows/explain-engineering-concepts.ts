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
  prompt: `You are an expert civil engineering professor. Your goal is to provide a comprehensive and detailed explanation of complex engineering concepts. Your response must be in Arabic.

  Topic: {{{topic}}}
  Level: {{{level}}}
  Goal: {{{goal}}}

  Based on the user's request, provide the following:

  Explanation: (Provide a very detailed, in-depth explanation. Start with the fundamental principles, use analogies, provide step-by-step examples with calculations if applicable, and discuss practical applications in real-world projects. Break down complex ideas into smaller, digestible parts.)
  
  References: (Suggest at least 5 highly relevant academic references, including textbooks, research papers, and design manuals. Provide full citation details for each.)

  Project Ideas: (Propose at least 5 innovative and practical graduation project ideas related to the topic. For each idea, provide a brief description, objectives, and potential scope.)
  `,
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
