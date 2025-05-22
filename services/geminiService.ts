
// import { GoogleGenAI } from "@google/genai";

// const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || process.env.API_KEY;

// if (!API_KEY) {
//   console.warn("Gemini API key not found. Explanations might not be generated dynamically.");
// }

// const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// export const getAlgorithmExplanationFromGemini = async (algorithmName: string): Promise<string | null> => {
//   if (!ai) {
//     return "Gemini API not configured. Cannot fetch dynamic explanation.";
//   }

//   try {
//     const prompt = `Explain the ${algorithmName} CPU scheduling algorithm in simple terms, including its working principle, advantages, disadvantages, and a simple example. Format it nicely for a web page.`;
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash-preview-04-17',
//       contents: [{ parts: [{ text: prompt }] }],
//     });
//     return response.text;
//   } catch (error) {
//     console.error("Error fetching explanation from Gemini:", error);
//     return "Failed to fetch explanation from Gemini.";
//   }
// };

// This is a placeholder. The current implementation uses static explanations from constants.tsx.
// To enable Gemini-based explanations, uncomment the code above, ensure API_KEY is set,
// and integrate this function into the AlgorithmExplanation.tsx component.
export {};
