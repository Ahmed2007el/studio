'use server';

/**
 * @fileOverview A conversational AI assistant for civil engineering topics.
 *
 * - chatWithEngineeringAssistant - A function that handles the conversational chat.
 * - EngineeringAssistantInput - The input type for the chat function.
 * - EngineeringAssistantOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const EngineeringAssistantInputSchema = z.object({
  projectContext: z.any().describe('The full context of the analyzed project, including description, structural system, codes, etc.'),
  history: z.array(MessageSchema).describe('The history of the conversation.'),
});

export type EngineeringAssistantInput = z.infer<typeof EngineeringAssistantInputSchema>;

const EngineeringAssistantOutputSchema = z.object({
  reply: z.string().describe('The AI assistant\'s response.'),
});

export type EngineeringAssistantOutput = z.infer<typeof EngineeringAssistantOutputSchema>;

export async function chatWithEngineeringAssistant(input: EngineeringAssistantInput): Promise<EngineeringAssistantOutput> {
  return engineeringAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'engineeringAssistantPrompt',
  input: { schema: EngineeringAssistantInputSchema },
  output: { schema: EngineeringAssistantOutputSchema },
  prompt: `You are an expert Civil Engineering Assistant. Your name is "المهندس المساعد". Your personality is helpful, professional, and highly knowledgeable. Your responses must always be in clear, well-structured Arabic.

You are having a conversation with a user about a specific engineering project or general civil engineering topics.

**Project Context:**
Here is the data for the project that has been previously analyzed. Use this as the primary source of truth when answering questions about this specific project.
- Project Description: {{projectContext.projectDescription}}
- Suggested Structural System: {{projectContext.suggestedStructuralSystem}}
- Applicable Building Codes: {{projectContext.applicableBuildingCodes}}
- Execution Method: {{projectContext.executionMethod}}
- Potential Challenges: {{projectContext.potentialChallenges}}
- Key Focus Areas: {{projectContext.keyFocusAreas}}

**Conversation History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}

**Your Task:**
Based on the new user question in the history, the project context, and your extensive knowledge of civil engineering, provide a detailed and helpful response.
- If the question is about the project, refer to the context provided.
- If the question is general, use your expert knowledge.
- Keep your answers concise but comprehensive. Use lists and formatting to make the information easy to digest.
`,
});

const engineeringAssistantFlow = ai.defineFlow(
  {
    name: 'engineeringAssistantFlow',
    inputSchema: EngineeringAssistantInputSchema,
    outputSchema: EngineeringAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
