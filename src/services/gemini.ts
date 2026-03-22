import { GoogleGenAI, Type } from "@google/genai";
import { ChartConfig, FollowUp } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const showChartTool = {
  name: "showChart",
  parameters: {
    type: Type.OBJECT,
    description: "Display a bar, line, or pie chart to the user based on data.",
    properties: {
      type: {
        type: Type.STRING,
        enum: ["bar", "line", "pie"],
        description: "The type of chart to display."
      },
      title: {
        type: Type.STRING,
        description: "The title of the chart."
      },
      data: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING, description: "The label for the data point." },
            value: { type: Type.NUMBER, description: "The numeric value for the data point." }
          },
          required: ["label", "value"]
        },
        description: "The data points for the chart."
      },
      xAxisLabel: { type: Type.STRING, description: "Label for the X axis (optional)." },
      yAxisLabel: { type: Type.STRING, description: "Label for the Y axis (optional)." }
    },
    required: ["type", "title", "data"]
  }
};

export async function chatWithGemini(messages: { role: string, content: string }[]) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are "EduBuddy", a friendly and encouraging tutor for young students. 
  Your goal is to explain complex topics simply and visually. 
  Keep your language simple, use emojis, and be very supportive.
  Explain things in a way that is easy for kids to understand.`;

  const response = await ai.models.generateContent({
    model,
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction,
    }
  });

  return response;
}

export async function generateFollowUp(assistantText: string): Promise<FollowUp | null> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a "Learning Companion Analyst". Your job is to analyze the provided text and derive helpful follow-up items for a student.
  
  You must evaluate three things:
  1. DATA CHART: Does the text contain EXPLICIT quantitative data (numbers, sizes, speeds) that would benefit from a chart?
     - ONLY include if there are EXPLICIT NUMBERS.
     - NEVER invent data or percentages.
     - If no explicit numbers, set chart to null.
  
  2. WORKFLOW DIAGRAM: Does the text describe a process, cycle, or workflow (e.g., water cycle, how a car works, historical timeline)?
     - If yes, generate a Mermaid.js diagram code.
     - Use simple, clear Mermaid syntax (e.g., graph TD).
     - If no clear process, set mermaid to null.
  
  3. SUGGESTED QUESTION: Generate ONE engaging follow-up question a curious student might ask based on this answer.
  
  Return a JSON object:
  {
    "chart": { "type": "bar" | "line" | "pie", "title": string, "data": Array<{ "label": string, "value": number }>, "xAxisLabel"?: string, "yAxisLabel"?: string } | null,
    "mermaid": { "code": string, "title": string } | null,
    "suggestedQuestion": string
  }
  
  Titles for charts and mermaid diagrams should be catchy and student-friendly.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: assistantText }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return {
      chart: result.chart || undefined,
      mermaid: result.mermaid || undefined,
      suggestedQuestion: result.suggestedQuestion || undefined
    };
  } catch (e) {
    return null;
  }
}
