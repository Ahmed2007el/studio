# **App Name**: Civil Engineering Assistant

## Core Features:

- Project Analysis: Analyze the project description provided by the user, determine the type of structure, suggest the most suitable structural system, and propose applicable building codes based on the project's location. This will tool to decide which considerations need to be incorporated into the response.
- Conceptual Design Generation: Generate preliminary designs, including cross-sections for columns, beams, and foundations. Calculate initial loads (dead, live, wind, seismic).
- Structural Analysis Simulation: Simulate structural analysis using methods similar to ETABS to estimate moments, shear forces, and axial forces. Display results in charts or tables that can be converted into 3D visuals. This will tool to decide which calculations need to be performed for a valid result.
- Code-Compliant Design: Allow users to select a code (ACI/BS/UPC) and perform preliminary designs of structural elements with calculation steps. Generate a formatted engineering report (PDF/HTML). This will tool to decide when steps should be performed and when they can be omitted.
- 3D Model Generation: Use Gemini API to generate a 3D model of the building (GLTF/OBJ/Three.js). Allow users to rotate, zoom, and interact with the model within the application.
- Educational Support: Explain analysis and design concepts step-by-step, and suggest academic references and similar graduation project ideas. Can answer theoretical and practical engineering questions.
- User Interface: Interactive dashboard for inputting project parameters, viewing analysis results, and interacting with the 3D model.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), inspired by the precision and reliability required in engineering, but avoiding the cliche of engineering blue; a deep color that communicates experience, responsibility, and clear-headed problem solving.
- Background color: Light gray (#EEEEEE), almost the same hue as the primary but very desaturated (10%) and light to provide a neutral backdrop that doesn't distract from data visualizations or models.
- Accent color: Amber (#FFC107), an analogous color, sufficiently different from the primary in brightness and saturation, used for highlighting interactive elements and important data points.
- Headline font: 'Space Grotesk' (sans-serif), for headlines and titles; its techy, precise nature matches the subject matter.
- Body font: 'Inter' (sans-serif), for body text; this sans-serif typeface ensures excellent readability and a modern appearance.
- Code font: 'Source Code Pro' (monospace) for displaying code snippets.
- Use professional, technical icons to represent different engineering concepts and tools. These icons should be consistent and easily recognizable.
- The layout should be clean and well-organized, prioritizing clear data presentation and easy navigation. Use tabs or sections to separate different project stages (analysis, design, 3D view).
- Subtle animations and transitions can be used to enhance the user experience, such as loading animations for calculations or smooth transitions between different views. These should be used sparingly to avoid distracting from the technical content.