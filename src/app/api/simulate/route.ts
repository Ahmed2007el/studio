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
      
      const prompt = `You are an expert structural analyst performing a simplified, yet realistic, structural analysis based on the provided conceptual design data. Your response must be in clear, professional, and well-structured Arabic.
      
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
      Perform a conceptual structural analysis. The estimations should be realistic and reflect the principles of structural mechanics.

      1.  **Summary:**
          *   Provide a **detailed summary** of the analysis.
          *   Highlight the elements subjected to the most critical forces.
          *   Mention any potential concerns, such as high shear forces in beams or high bending moments in columns, and suggest what to look out for in the detailed design phase.

      2.  **Analysis Results:**
          *   Fill out the **analysisResults** array with your estimated maximum forces (Moment, Shear, Axial) for at least two representative critical elements (e.g., a ground-floor corner column and a first-floor long-span beam).
          *   The values should be realistic estimations based on the provided loads, dimensions, and standard engineering approximation methods.
      
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
