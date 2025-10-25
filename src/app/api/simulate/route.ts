import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL_NAME = 'openai/gpt-3.5-turbo';

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    const outputSchema = {
        summary: "string (A detailed summary of the structural analysis results, highlighting critical elements and potential concerns in Arabic)",
        analysisResults: [
          {
            element: "string (e.g., 'Ground Floor Column C1')",
            moment: "number (Maximum bending moment in kNm)",
            shear: "number (Maximum shear force in kN)",
            axial: "number (Maximum axial force in kN)"
          },
          {
            element: "string (e.g., 'First Floor Beam B1')",
            moment: "number",
            shear: "number",
            axial: "number"
          }
        ]
      };
      
      const prompt = `You are an expert structural analyst performing a simplified, yet realistic, structural analysis simulation based on the provided conceptual design data. Your response must be in clear, professional, and well-structured Arabic. The numerical results should be plausible engineering estimates.

      **Project & Conceptual Design Data:**
      - Project Description: ${input.projectDescription}
      - Structural System: ${input.structuralSystemSuggestion}
      - Column Section: ${input.columnCrossSection}
      - Beam Section: ${input.beamCrossSection}
      - Foundation: ${input.foundationDesign}
      - Dead Load: ${input.deadLoad}
      - Live Load: ${input.liveLoad}
      - Wind Load: ${input.windLoad}
      - Seismic Load: ${input.seismicLoad}
      
      **Task:**
      Perform a conceptual structural analysis simulation. The estimations must be realistic and reflect the principles of structural mechanics based on the inputs.

      1.  **Summary of Simulation:**
          *   Provide a **detailed technical summary** of the analysis results.
          *   Highlight the elements subjected to the most critical forces (e.g., "The ground floor columns experience high axial loads combined with bending," "The 8m-span beams show significant shear forces near the supports").
          *   Mention potential concerns and provide specific, actionable recommendations for the detailed design phase. (e.g., "High shear in beams may require shear reinforcement," "Check punching shear at column-slab connections.").

      2.  **Simulated Analysis Results:**
          *   Fill out the **analysisResults** array with your estimated maximum internal forces (Moment, Shear, Axial) for at least two representative critical elements. Choose one column and one beam.
          *   The values should be realistic estimations based on the provided loads, dimensions, and standard engineering approximation methods (e.g., tributary area for columns, WL^2/8 for beams). Do not provide placeholder values; calculate plausible numbers.
      
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

    const responseJson = JSON.parse(responseText);
    return NextResponse.json(responseJson);

  } catch (error: any)
   {
    console.error('Error in simulate API:', error);
    const errorMessage = error.message || 'Failed to generate content';
    return NextResponse.json(
      {error: errorMessage},
      {status: error.status || 500}
    );
  }
}
