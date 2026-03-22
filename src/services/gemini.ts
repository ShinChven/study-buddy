import { GoogleGenAI, Type } from "@google/genai";
import { ChartConfig } from "../types";

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
  Explain things in a way that is easy for kids to understand.
  
  When comparing multiple items (like planet sizes, animal speeds, or historical dates), use Markdown tables to make the information clear and scannable.`;

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

export async function generateChartIfNeeded(assistantText: string) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a "Data Visualizer". Your job is to analyze the provided text and decide if it contains quantitative data (numbers, sizes, speeds, etc.) that would benefit from a chart.
  
  RULES:
  1. If the text contains NO numbers or quantitative comparisons, return exactly: {"needed": false}
  2. If the text contains numbers/comparisons, return a JSON object with "needed": true and a "chart" object matching the ChartConfig type.
  
  ChartConfig structure:
  {
    "type": "bar" | "line" | "pie",
    "title": string,
    "data": Array<{ "label": string, "value": number }>,
    "xAxisLabel"?: string,
    "yAxisLabel"?: string
  }
  
  Example: {"needed": true, "chart": {"type": "bar", "title": "Planet Sizes", "data": [{"label": "Earth", "value": 12742}, {"label": "Mars", "value": 6779}]}}`;

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
    if (result.needed && result.chart) {
      return result.chart as ChartConfig;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function generateQuickTip(messages: { role: string, content: string }[]) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a "Learning Scout". Your job is to extract one interesting, short, and educational "Quick Tip" or "Did you know?" fact based on the current conversation.
  The tip should be:
  1. Very short (max 20 words).
  2. Fun and engaging for kids.
  3. Directly related to what was just discussed.
  4. Formatted as JSON with "content" and "category" fields.
  Example: {"content": "Cheetahs can go from 0 to 60 mph in just 3 seconds!", "category": "Fun Fact"}`;

  const response = await ai.models.generateContent({
    model,
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { content: "Keep exploring to find new tips!", category: "Tip" };
  }
}
