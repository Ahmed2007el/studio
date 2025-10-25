import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL_NAME = 'google/gemini-1.5-pro-latest';

async function handlePreliminaryAnalysis(projectDescription: string, projectLocation: string) {
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

    const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });
    
    const responseText = response.choices[0].message?.content;
    if (!responseText) {
        throw new Error("Empty response from AI");
    }

    return JSON.parse(responseText);
}

async function handleConceptualDesign(input: any) {
    const outputSchema = {
        structuralSystemSuggestion: "string (based on the original suggestion but potentially refined)",
        columnCrossSection: "string (e.g., '600x600 mm')",
        beamCrossSection: "string (e.g., '300x700 mm')",
        foundationDesign: "string (e.g., 'Raft foundation, 800mm thick')",
        deadLoad: "string (e.g., '12 kN/m²')",
        liveLoad: "string (e.g., '3 kN/m²')",
        windLoad: "string (e.g., '1.5 kPa')",
        seismicLoad: "string (e.g., 'Zone 2B, Importance Factor 1.2')",
        columnWidth: "number (width of column in cm)",
        columnHeight: "number (height of column in cm)",
      };
    
      const prompt = `You are an expert civil engineering consultant. Based on the following project details, generate a conceptual design. Your response must be in clear, well-structured Arabic.
    
      Project Description: ${input.projectDescription}
      Location: ${input.location}
      Selected Building Code: ${input.buildingCode}
    
      Your task is to generate the conceptual design details. Provide a detailed response for ALL of the following sections in the output schema:
      1.  **structuralSystemSuggestion**: Refine or confirm the structural system choice.
      2.  **columnCrossSection**: Suggest a typical preliminary column size.
      3.  **beamCrossSection**: Suggest a typical preliminary beam size.
      4.  **foundationDesign**: Suggest a suitable foundation system.
      5.  **deadLoad**: Estimate the dead load.
      6.  **liveLoad**: Estimate the live load according to the code.
      7.  **windLoad**: Estimate the wind load.
      8.  **seismicLoad**: Estimate the seismic load parameters.
      9.  **columnWidth**: Extract the width of the column in centimeters.
      10. **columnHeight**: Extract the height (depth) of the column in centimeters.
    
      Your output MUST be a valid JSON object matching this schema:
      ${JSON.stringify(outputSchema, null, 2)}
      `;

      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
    });
    
    const responseText = response.choices[0].message?.content;
    if (!responseText) {
        throw new Error("Empty response from AI");
    }

    return JSON.parse(responseText);
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysisType, projectDescription, projectLocation, ...rest } = body;

    if (!analysisType) {
        return NextResponse.json({error: 'Analysis type is required'}, {status: 400});
    }

    if (analysisType === 'preliminary') {
        if (!projectDescription) {
            return NextResponse.json({error: 'Project description is required for preliminary analysis'}, {status: 400});
        }
        const result = await handlePreliminaryAnalysis(projectDescription, projectLocation);
        return NextResponse.json(result);
    } else if (analysisType === 'conceptualDesign') {
        const result = await handleConceptualDesign({projectDescription, location: projectLocation, ...rest});
        return NextResponse.json(result);
    } else {
        return NextResponse.json({error: 'Invalid analysis type'}, {status: 400});
    }

  } catch (error: any) {
    console.error('Error in generate API:', error);
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    return NextResponse.json(
      {error: errorMessage || 'Failed to generate content'},
      {status: 500}
    );
  }
}
