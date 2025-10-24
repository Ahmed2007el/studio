import {NextRequest, NextResponse} from 'next/server';
import {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} from '@google/generative-ai';

const MODEL_NAME = 'gemini-pro';

export async function POST(req: NextRequest) {
  const {projectDescription, projectLocation} = await req.json();

  if (!projectDescription) {
    return NextResponse.json({error: 'Project description is required'}, {status: 400});
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({error: 'API key not found'}, {status: 500});
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

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
{
  "suggestedStructuralSystem": "string",
  "applicableBuildingCodes": "string",
  "executionMethod": "string",
  "potentialChallenges": "string",
  "keyFocusAreas": "string",
  "academicReferences": [
    {
      "title": "string",
      "authors": "string",
      "note": "string",
      "searchLink": "string"
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const responseJson = JSON.parse(responseText);
    return NextResponse.json(responseJson);
  } catch (error: any) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      {error: error.message || 'Failed to generate content'},
      {status: 500}
    );
  }
}
