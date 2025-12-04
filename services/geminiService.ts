import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

// Analyzes the uploaded dashboard data to establish a "ground truth" for the AI
export const analyzeDashboardContext = async (csvData: string): Promise<string> => {
  const ai = getAIClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are a Senior Data Analyst and Executive Coach. 
            Analyze this dashboard data (provided in CSV format) in extreme detail. 
            
            DATASET:
            ${csvData.substring(0, 50000)} 
            (Data truncated if too large)

            TASKS:
            1. Identify the primary business context.
            2. Identify the most glaring performance gaps or critical issues shown in the data.
            3. Note 5 specific data points that support this.
            4. Identify any potential root causes visible or implied.
            
            Keep this analysis internal and structured. It will be used to evaluate a student's critical thinking.`
          }
        ]
      }
    });
    return response.text || "Failed to analyze dashboard data.";
  } catch (error) {
    console.error("Error analyzing dashboard:", error);
    return "Error: Could not analyze the dashboard data. Please try again.";
  }
};

export const getStageFeedback = async (
  stageName: string,
  userInput: string,
  dashboardContext: string,
  previousInputs: any
): Promise<string> => {
  const ai = getAIClient();

  const prompt = `
  You are an expert Executive Critical Thinking Coach.
  
  CONTEXT:
  The user is practicing a scenario based on a dashboard dataset.
  AI Analysis of Data: "${dashboardContext}"
  
  CURRENT STAGE: ${stageName}
  USER INPUT: "${userInput}"
  PREVIOUS ANSWERS: ${JSON.stringify(previousInputs)}

  TASK:
  Provide constructive, Socratic feedback to the user about their input for this stage.
  
  GUIDELINES:
  1. Determine if their answer is sufficient to move forward or if they missed critical insights.
  2. Start your response with exactly "[STATUS: PASS]" if the answer is solid, or "[STATUS: IMPROVE]" if they missed something important.
  3. Then, on a new line, provide the feedback.
  4. Use Markdown for formatting:
     - Use **bold** for key concepts or emphasis.
     - Use bullet points (- item) for lists of missing factors or good points.
  5. Be professional, encouraging, but rigorous.
  6. Keep the response concise (under 150 words).
  7. Do NOT solve the next steps for them. Focus only on the current stage.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No feedback generated.";
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Unable to generate feedback at this time.";
  }
};

export const generateFinalSummary = async (
  inputs: any,
  dashboardContext: string
): Promise<string> => {
  const ai = getAIClient();

  const prompt = `
  You are an Executive Evaluator.
  
  Review the user's complete critical thinking exercise.
  
  Dashboard Context: ${dashboardContext}
  User's Work:
  1. Problem Definition: ${inputs.gapAnalysis}
  2. Observations: ${inputs.observations.join(', ')}
  3. Analysis: ${inputs.supportingIndications}
  4. Decision/Plan: ${inputs.actionPlan}

  Provide a final performance review.
  1. Give a holistic score (out of 10) on their Critical Thinking.
  2. Highlight their biggest strength.
  3. Highlight one key area for improvement.
  4. Write a sample "Executive Summary" email (max 3 sentences) that they *should* have written based on this analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Unable to generate summary.";
  }
};