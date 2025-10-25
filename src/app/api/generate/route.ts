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
        potentialChallenges: "string (Bulleted list with detailed explanation for each challenge, including risk level and mitigation strategies)",
        keyFocusAreas: "string (Bulleted list with detailed explanation for each area, including consequences of neglect)",
        academicReferences: [
          {
            title: "string",
            authors: "string",
            note: "string (Brief summary of relevance)",
            searchLink: "string (A valid Google search URL)"
          }
        ]
    };

    const prompt = `You are a highly experienced Principal Structural Engineer and consultant with 30 years of expertise in designing complex structures worldwide. Your task is to provide a comprehensive, highly detailed, and technically precise preliminary analysis for a new project. Your response must be in clear, professional, and well-structured Arabic.

    **Project Description:**
    ${projectDescription}

    **Project Location:**
    ${projectLocation || 'Not specified, please infer from description if possible.'}

    **Your Detailed Analysis Must Include:**

    1.  **Suggested Structural System:**
        *   Propose at least two viable structural systems (e.g., Moment Resisting Frame, Shear Wall System, etc.).
        *   Conduct a detailed comparative analysis of these systems, evaluating them against criteria like soil conditions (assume typical for the location unless specified), seismicity, wind loads, architectural requirements, cost-effectiveness, and constructability.
        *   Recommend the most suitable system and provide an in-depth **technical justification** for your choice, explaining the key advantages and disadvantages of the recommended system for this specific project.

    2.  **Applicable Building Codes:**
        *   List all relevant national and international building codes (e.g., SBC, ASCE 7, ACI 318, Eurocode).
        *   For each code, identify the **most critical chapters and sections** and explain in detail *why* they are critical to this project (e.g., "SBC 301 for precise load combinations required for this type of structure," "ACI 318 Chapter 18 because the project is in a seismic zone and requires specific detailing for beam-column joints to ensure ductility").

    3.  **Execution Method:**
        *   Describe the optimal construction methodology in detail (e.g., cast-in-situ, precast, top-down construction).
        *   Justify your choice thoroughly based on project scale, timeline, local construction practices, and quality control requirements.
        *   List the key machinery and specialized equipment required for your proposed method.

    4.  **Potential Challenges:**
        *   Identify at least 4-5 significant potential challenges (e.g., complex formwork, dewatering, long-span beams, soil-structure interaction, thermal effects).
        *   For each challenge, provide a detailed explanation of the risk, assess its risk level (High, Medium, Low), and propose a proactive, specific, and actionable mitigation strategy. For instance: "Challenge: Deep excavation adjacent to existing structures. Risk: High. Mitigation: Implement a contiguous pile wall with tie-back anchors, combined with a real-time monitoring system for adjacent structures."

    5.  **Key Focus Areas for Detailed Design:**
        *   Identify at least 4-5 critical areas that require special attention during the detailed design phase (e.g., foundation settlement analysis, dynamic response to wind, punching shear in flat slabs, seismic detailing for ductility, connection design).
        *   Explain the importance of each focus area in detail and describe the potential negative consequences of neglecting it (e.g., "Focus Area: Slab Deflection Control. Consequence of Neglect: Excessive deflection can lead to damage in non-structural elements like partitions and facades, and may cause user discomfort.").

    6.  **Academic References:**
        *   List at least 3 highly relevant and modern academic papers, textbooks, or design guides.
        *   For each reference, provide the title, authors, a brief but specific note on its relevance to the project's challenges (e.g., "This book provides an excellent chapter on the design of post-tensioned slabs, which is relevant to achieving the long spans in this project"), and a valid Google search URL.

    Your output MUST be a valid JSON object strictly matching this schema. Ensure all fields are filled with detailed, expert-level content. Do not leave any fields empty.
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
    
      const prompt = `You are an expert Principal Structural Engineer. Based on the following project details, generate a detailed conceptual design. Your response must be in clear, professional, and well-structured Arabic. Your estimations must be based on sound engineering principles and the specified building code.

      **Project & Analysis Data:**
      *   Project Description: ${input.projectDescription}
      *   Location: ${input.location}
      *   Selected Building Code: ${input.buildingCode}
    
      **Your Task:**
      Generate the conceptual design details. Provide a detailed, justified response for ALL of the following sections.

      1.  **Structural System Suggestion:** Refine or confirm the structural system choice with a brief technical justification.
      2.  **Column Cross Section:** Suggest a typical preliminary column size (e.g., '600x600 mm'). Justify your choice based on estimated axial loads from tributary area calculations and architectural considerations. State your assumptions clearly.
      3.  **Beam Cross Section:** Suggest a typical preliminary beam size (e.g., '300x700 mm'). Justify based on typical spans (assume 6-8m if not specified) and preliminary load estimations.
      4.  **Foundation Design:** Suggest a suitable foundation system (e.g., Raft, Isolated Footings). State your assumptions clearly (e.g., "Assumed soil bearing capacity of 150 kPa").
      5.  **Dead Load (DL):** Provide a numerical estimate for the superimposed dead load (finishes, partitions, MEP) and the self-weight of typical elements to arrive at a total dead load per unit area (in kN/m²). Show a brief, clear breakdown of your calculation (e.g., Flooring: X, Partitions: Y, MEP: Z, Self-weight: A).
      6.  **Live Load (LL):** Provide a numerical estimate for the live load (in kN/m²) according to the specified building code for the assumed occupancy (e.g., residential, office). Cite the specific code category or table if possible (e.g., "ASCE 7-16 Table 4.3-1, Residential Areas").
      7.  **Wind Load (WL):** Estimate the basic wind pressure (in kPa) based on the project's location and assumed height. Mention the parameters used (e.g., "Basic wind speed V, Exposure category C").
      8.  **Seismic Load (EL):** Estimate the key seismic design parameters based on the selected code and location. Include Seismic Zone/Design Category, Importance Factor (I), and spectral acceleration parameters (SDS, SD1).
      9.  **Column Width:** Extract the numerical width of the column in centimeters.
      10. **Column Height:** Extract the numerical height (depth) of the column in centimeters.
    
      Your output MUST be a valid JSON object strictly matching this schema. Ensure all fields are filled with detailed, expert-level content.
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
