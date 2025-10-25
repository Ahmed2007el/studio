import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL_NAME = 'openai/gpt-3.5-turbo';

async function handlePreliminaryAnalysis(projectDescription: string, projectLocation: string) {
    const outputSchema = {
        suggestedStructuralSystem: "string (Detailed explanation and justification)",
        applicableBuildingCodes: "string (List of codes with specific relevant chapters or sections)",
        executionMethod: "string (Detailed description of the methodology and machinery)",
        potentialChallenges: "string (Bulleted list with detailed explanation for each challenge)",
        keyFocusAreas: "string (Bulleted list with detailed explanation for each area)",
        academicReferences: [
          {
            title: "string",
            authors: "string",
            note: "string (Brief summary of relevance)",
            searchLink: "string (A valid Google search URL)"
          }
        ]
    };

    const prompt = `You are a highly experienced Principal Structural Engineer with 30 years of expertise in designing complex structures worldwide. Your task is to provide a comprehensive and highly detailed preliminary analysis for a new project. Your response must be in clear, professional, and well-structured Arabic.

    **Project Description:**
    ${projectDescription}

    **Project Location:**
    ${projectLocation || 'Not specified, please infer from description if possible.'}

    **Your Detailed Analysis Must Include:**

    1.  **Suggested Structural System:**
        *   Propose the most suitable structural system (e.g., Moment Resisting Frame, Shear Wall System, etc.).
        *   Provide a **detailed justification** for your choice, considering factors like building height, soil conditions (assume typical for the location if not specified), seismicity, and architectural requirements.
        *   Explain the advantages and disadvantages of this system for this specific project.

    2.  **Applicable Building Codes:**
        *   List all relevant national and international building codes (e.g., SBC, ASCE 7, ACI 318, Eurocode).
        *   For each code, mention the **specific chapters or sections** that are most critical for this project (e.g., "SBC 301 for loads," "ACI 318 Chapter 18 for seismic design").

    3.  **Execution Method:**
        *   Describe the optimal construction methodology in detail (e.g., cast-in-situ, precast, top-down construction).
        *   Justify your choice based on project scale, timeline, and local construction practices.
        *   List the key machinery and equipment required.

    4.  **Potential Challenges:**
        *   Identify at least 3-4 significant potential challenges (e.g., complex formwork, dewatering, long-span beams).
        *   For each challenge, provide a detailed explanation of why it's a risk and suggest a proactive mitigation strategy.

    5.  **Key Focus Areas:**
        *   Identify at least 3-4 critical areas that require special attention during the design and construction phases (e.g., foundation-soil interaction, slab deflection control, seismic detailing).
        *   Explain the importance of each focus area in detail.

    6.  **Academic References:**
        *   List at least 3 highly relevant and modern academic papers or textbooks.
        *   For each reference, provide the title, authors, a brief note on its relevance, and a valid Google search URL in the format 'https://www.google.com/search?q=...'.

    Your output MUST be a valid JSON object strictly matching this schema. Ensure all fields are filled with detailed, expert-level content:
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
        structuralSystemSuggestion: "string (Refined suggestion with justification)",
        columnCrossSection: "string (e.g., '600x600 mm', with a brief justification)",
        beamCrossSection: "string (e.g., '300x700 mm', with a brief justification)",
        foundationDesign: "string (e.g., 'Raft foundation, 800mm thick, based on assumed soil bearing capacity of X')",
        deadLoad: "string (e.g., '12 kN/m²', with a breakdown of components)",
        liveLoad: "string (e.g., '3 kN/m²', based on the specified code for residential areas)",
        windLoad: "string (e.g., '1.5 kPa', based on basic wind speed for the location and building height)",
        seismicLoad: "string (e.g., 'Zone 2B, Importance Factor 1.2, SDS = X, SD1 = Y')",
        columnWidth: "number (width of column in cm)",
        columnHeight: "number (height of column in cm)",
      };
    
      const prompt = `You are an expert Principal Structural Engineer. Based on the following project details, generate a detailed conceptual design. Your response must be in clear, professional, and well-structured Arabic.
    
      **Project & Analysis Data:**
      *   Project Description: ${input.projectDescription}
      *   Location: ${input.location}
      *   Selected Building Code: ${input.buildingCode}
    
      **Your Task:**
      Generate the conceptual design details. Provide a detailed, justified response for ALL of the following sections. The estimations should be based on sound engineering principles and the selected building code.

      1.  **Structural System Suggestion:** Refine or confirm the structural system choice with a brief justification.
      2.  **Column Cross Section:** Suggest a typical preliminary column size. Justify your choice based on estimated axial loads and architectural considerations.
      3.  **Beam Cross Section:** Suggest a typical preliminary beam size. Justify based on typical spans and loads.
      4.  **Foundation Design:** Suggest a suitable foundation system. State any assumptions made (e.g., assumed soil bearing capacity).
      5.  **Dead Load (DL):** Estimate the superimposed dead load (Flooring, partitions, MEP) and self-weight of typical elements to arrive at a total dead load per unit area. Show a brief breakdown.
      6.  **Live Load (LL):** Estimate the live load according to the specified building code for the assumed occupancy (e.g., residential, office). Cite the code category if possible.
      7.  **Wind Load (WL):** Estimate the basic wind load parameters based on the project's location and height.
      8.  **Seismic Load (EL):** Estimate the key seismic parameters (e.g., Seismic Zone, Importance Factor, and spectral acceleration parameters like SDS/SD1) based on the selected code and location.
      9.  **Column Width:** Extract the numerical width of the column in centimeters.
      10. **Column Height:** Extract the numerical height (depth) of the column in centimeters.
    
      Your output MUST be a valid JSON object strictly matching this schema. Ensure all fields are filled with detailed, expert-level content:
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
    const errorMessage = error.message || 'Failed to generate content';
    return NextResponse.json(
      {error: errorMessage},
      {status: error.status || 500}
    );
  }
}
