import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL_NAME = 'google/gemini-pro-1.5';

function buildSystemPrompt(projectContext: any): string {
  const context = `
You are an expert Civil Engineering Assistant. Your name is "المهندس المساعد". Your personality is helpful, professional, and highly knowledgeable. Your responses must always be in clear, well-structured Arabic.

You are having a conversation with a user about a specific engineering project or general civil engineering topics.

**Project Context:**
Here is the data for the project that has been previously analyzed. Use this as the primary source of truth when answering questions about this specific project.
- Project Description: ${projectContext?.projectDescription || 'غير محدد'}
- Suggested Structural System: ${projectContext?.suggestedStructuralSystem || 'غير محدد'}
- Applicable Building Codes: ${projectContext?.applicableBuildingCodes || 'غير محدد'}
- Execution Method: ${projectContext?.executionMethod || 'غير محدد'}
- Potential Challenges: ${projectContext?.potentialChallenges || 'غير محدد'}
- Key Focus Areas: ${projectContext?.keyFocusAreas || 'غير محدد'}
  `.trim();
  return context;
}

export async function POST(req: NextRequest) {
  try {
    const {projectContext, history} = await req.json();

    if (!history || !Array.isArray(history)) {
      return NextResponse.json({error: 'History is required'}, {status: 400});
    }

    const systemPrompt = buildSystemPrompt(projectContext);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...history.map((msg: {role: 'user' | 'model'; content: string}) => {
        return {
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content,
        };
      }),
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
    });

    const reply = chatCompletion.choices[0].message?.content;

    if (!reply) {
      return NextResponse.json({error: 'Failed to generate a reply'}, {status: 500});
    }

    return NextResponse.json({reply});
  } catch (error: any) {
    console.error('Error in chat API:', error);
    // Improved error handling to capture the correct message from OpenAI-compatible APIs
    const errorMessage = error.error?.message || error.message || 'An unknown error occurred';
    return NextResponse.json(
      {error: errorMessage},
      {status: error.status || 500}
    );
  }
}
