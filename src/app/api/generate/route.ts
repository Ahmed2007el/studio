import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL_NAME = 'google/gemini-1.5-pro-latest';

export async function POST(req: NextRequest) {
  const {projectDescription, projectLocation} = await req.json();

  if (!projectDescription) {
    return NextResponse.json({error: 'Project description is required'}, {status: 400});
  }

  const outputSchema = {
    suggestedStructuralSystem: "string",
    applicableBuildingCodes: "string",
    executionMethod: "string",
    potentialChallenges: "string",
    keyFocusAreas: "string",
    academicReferences: [
      {
        title: "string",
        authors: "string",
        note: "string",
        searchLink: "string (must be a valid URL)"
      }
    ]
  };

  const prompt = `You are an expert civil engineering consultant providing a detailed and complete analysis for a project. Your response must be in clear, well-structured Arabic.

Project Description: ${projectDescription}
Project Location: ${projectLocation || 'Not specified, please infer from description.'}

Your task is to generate a comprehensive preliminary analysis. Provide a detailed response for ALL of the following sections in the output schema:
1.  **suggestedStructuralSystem**: Provide a detailed rationale for your choice of structural system.
2.  **applicableBuildingCodes**: List all relevant national and international codes.
3.  **executionMethod**: Describe the best construction methodology with justification.
4.  **potentialChallenges**: List at least 3 potential challenges and common mistakes.
5.  **keyFocusAreas**: List at least 3 critical points to focus on during design and construction.
6.  **academicReferences**: List at least 3 relevant academic references with titles, authors, notes, and valid Google search URLs in the format 'https://www.google.com/search?q=...'.

Your output MUST be a valid JSON object matching this schema:
${JSON.stringify(outputSchema, null, 2)}
`;

  try {
    const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });
    
    const responseText = response.choices[0].message?.content;
    if (!responseText) {
        throw new Error("Empty response from AI");
    }

    const responseJson = JSON.parse(responseText);
    return NextResponse.json(responseJson);

  } catch (error: any) {
    console.error('Error generating content:', error);
    const errorMessage = error.response ? await error.response.json() : { message: error.message };
    return NextResponse.json(
      {error: errorMessage.error?.message || 'Failed to generate content'},
      {status: 500}
    );
  }
}
