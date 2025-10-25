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
        summary: "string (A brief summary of the structural analysis results in Arabic)",
        analysisResults: [
          {
            element: "string (e.g., 'Ground Floor Column')",
            moment: "number (Maximum bending moment in kNm)",
            shear: "number (Maximum shear force in kN)",
            axial: "number (Maximum axial force in kN)"
          },
          {
            element: "string (e.g., 'First Floor Beam')",
            moment: "number",
            shear: "number",
            axial: "number"
          }
        ]
      };
      
      const prompt = `You are an expert structural analyst. Perform a simplified structural analysis based on the provided design data. Your response must be in clear, well-structured Arabic.
      
      **Project & Design Data:**
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
      1.  Provide a **summary** of the analysis, highlighting the most critical forces and any potential concerns.
      2.  Fill out the **analysisResults** array with estimated maximum forces for at least two representative elements (e.g., a critical column and a critical beam). The values should be realistic estimations based on the provided loads and dimensions.
      
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

    const responseJson = JSON.parse(responseText);
    return NextResponse.json(responseJson);

  } catch (error: any)
   {
    console.error('Error in simulate API:', error);
    const errorMessage = error.error?.message || error.message || 'Failed to generate content';
    return NextResponse.json(
      {error: errorMessage},
      {status: error.status || 500}
    );
  }
}
