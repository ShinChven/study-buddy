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
  
  const systemInstruction = `You are "EduBuddy", a professional and reliable middle/high school teacher. Your goal is to provide students with clear, accurate, and knowledge-rich explanations.

  Guidelines:
  1. KNOWLEDGE-FOCUSED: Focus on accurate scientific, historical, and technical facts. Avoid overly simplistic language or awkward metaphors.
  2. DATA-DRIVEN: When answering questions involving quantities, sizes, distances, or statistics, you MUST provide specific numbers and units.
  3. TEACHER TONE: Maintain a professional, rigorous, and inspiring tone. Explain concepts using clear and accurate terminology, as an excellent teacher would.
  4. STRUCTURED EXPRESSION: Use Markdown (tables, bullet points, headers) to organize complex information for better readability.
  5. DEPTH & CLARITY: Maintain depth in knowledge while ensuring it is easy to understand. If multiple data points are involved, prioritize using tables for presentation.`;

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
  
  const systemInstruction = `You are an "Academic Content Analyst". Your task is to analyze the provided text and derive helpful follow-up items for a student.
  
  Please evaluate the following three items:
  1. DATA CHART: Does the text contain explicit quantitative data (numbers, sizes, speeds, statistics)?
     - ONLY include if there are EXPLICIT NUMBERS.
     - NEVER invent data.
     - If no explicit numbers, set chart to null.
  
  2. WORKFLOW DIAGRAM: Does the text describe a process, cycle, or workflow (e.g., biological process, engineering system, historical timeline)?
     - If yes, generate Mermaid.js diagram code.
     - Use simple and clear Mermaid syntax (e.g., graph TD).
     - If no clear process, set mermaid to null.
  
  3. SUGGESTED QUESTION: Based on this answer, generate ONE follow-up question that inspires deep thinking.
  
  Return a JSON object:
  {
    "chart": { "type": "bar" | "line" | "pie", "title": string, "data": Array<{ "label": string, "value": number }>, "xAxisLabel"?: string, "yAxisLabel"?: string } | null,
    "mermaid": { "code": string, "title": string } | null,
    "suggestedQuestion": string
  }
  
  Titles for charts and mermaid diagrams should be professional and descriptive.`;

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
