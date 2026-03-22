import { GoogleGenAI, Type } from "@google/genai";
import { ChartConfig, FollowUp } from "../types";

const getAI = () => {
  // Prefer the user-selected API_KEY from the platform dialog, fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

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

export async function chatWithGeminiStream(messages: { role: string, content: string }[]) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are "EduBuddy", a professional and reliable middle/high school teacher. Your goal is to provide students with clear, accurate, and knowledge-rich explanations.

  Guidelines:
  1. KNOWLEDGE-FOCUSED: Focus on accurate scientific, historical, and technical facts. Avoid overly simplistic language or awkward metaphors.
  2. DATA-DRIVEN: When answering questions involving quantities, sizes, distances, or statistics, you MUST provide specific numbers and units.
  3. TEACHER TONE: Maintain a professional, rigorous, and inspiring tone. Explain concepts using clear and accurate terminology, as an excellent teacher would.
  4. STRUCTURED EXPRESSION: Use Markdown (tables, bullet points, headers) to organize complex information for better readability.
  5. DEPTH & CLARITY: Maintain depth in knowledge while ensuring it is easy to understand. If multiple data points are involved, prioritize using tables for presentation.`;

  const responseStream = await ai.models.generateContentStream({
    model,
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction,
    }
  });

  return responseStream;
}

export async function chatWithGemini(messages: { role: string, content: string }[]) {
  const ai = getAI();
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
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an "Academic Content Analyst". Your task is to analyze the provided text and derive helpful follow-up items for a student.
  
  Please evaluate the following three items:
  1. DATA CHART: Does the text contain explicit quantitative data (numbers, sizes, speeds, statistics)?
     - ONLY include if there are EXPLICIT NUMBERS.
     - NEVER invent data.
     - For chart values, use ONLY pure numbers. Do NOT include units or symbols like '%' in the 'value' field.
     - If no explicit numbers, set chart to null.
  
  2. DIAGRAM: Does the text describe a process, cycle, workflow, or system architecture (e.g., biological process, engineering system, historical timeline, software architecture)?
     - If yes, generate Mermaid.js diagram code.
     - Use appropriate Mermaid syntax: 'graph TD' for flowcharts/architecture, 'sequenceDiagram' for interactions, 'classDiagram' for structures, etc.
     - If no clear process or system, set mermaid to null.
  
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
    
    // Reassess the generated items
    if (result.chart || result.mermaid) {
      const reassessInstruction = `You are an "Academic Content Reviewer". Your task is to reassess the generated follow-up items (chart and diagram) based on their relevance to the original text.
      
      Score each item from 1 to 10, where 10 means it is highly relevant, accurate, and enhances the explanation, and 1 means it is irrelevant or incorrect.
      
      Return a JSON object:
      {
        "chartConfidence": number | null,
        "mermaidConfidence": number | null
      }`;

      const reassessResponse = await ai.models.generateContent({
        model,
        contents: [
          { role: 'user', parts: [{ text: `Original Text:\n${assistantText}\n\nGenerated Items:\n${JSON.stringify({ chart: result.chart, mermaid: result.mermaid })}` }] }
        ],
        config: {
          systemInstruction: reassessInstruction,
          responseMimeType: "application/json"
        }
      });

      const reassessResult = JSON.parse(reassessResponse.text || '{}');
      
      if (result.chart && reassessResult.chartConfidence !== undefined) {
        result.chart.confidence = reassessResult.chartConfidence;
      }
      if (result.mermaid && reassessResult.mermaidConfidence !== undefined) {
        result.mermaid.confidence = reassessResult.mermaidConfidence;
      }
    }

    return {
      chart: result.chart || undefined,
      mermaid: result.mermaid || undefined,
      suggestedQuestion: result.suggestedQuestion || undefined
    };
  } catch (e) {
    return null;
  }
}
