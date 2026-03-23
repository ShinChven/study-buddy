using System.Text.Json;
using System.Threading.Tasks;
using EduBuddy.Application.Interfaces;
using Microsoft.Extensions.AI;

namespace EduBuddy.Infrastructure.Services;

public class FollowUpService : IFollowUpService
{
    private readonly IChatClient _chatClient;

    public FollowUpService(IChatClient chatClient)
    {
        _chatClient = chatClient;
    }

    public async Task<string?> GenerateFollowUpAsync(string assistantText)
    {
        var systemInstruction = @"You are an ""Academic Content Analyst"". Your task is to analyze the provided text and derive helpful follow-up items for a student.
  
  Please evaluate the following items:
  1. DATA CHARTS: Does the text contain multiple sets of explicit quantitative data (numbers, sizes, speeds, statistics)?
     - You can generate multiple charts if the text contains distinct data sets (e.g., Earth's dimensions vs its perspective in space).
     - ONLY include if there are EXPLICIT NUMBERS.
     - NEVER invent data.
     - For chart values, use ONLY pure numbers. Do NOT include units or symbols like '%' in the 'value' field.
     - If no explicit numbers, set charts to an empty array.
  
  2. DIAGRAMS: Does the text describe multiple processes, cycles, workflows, or system architectures?
     - If yes, generate an array of Mermaid.js diagram objects.
     - Use appropriate Mermaid syntax: 'graph TD' for flowcharts/architecture, 'sequenceDiagram' for interactions, 'classDiagram' for structures, etc.
     - If no clear process or system, set mermaids to an empty array.
  
  3. SUGGESTED QUESTION: Based on this answer, generate ONE follow-up question that inspires deep thinking.
  
  4. FLIP CARDS: Create an array of flashcards representing key concepts from the text. This will be used for a test later.
     - title: The core concept or topic (short).
     - knowledge: A concise summary of the key fact or definition.
     - question: A multiple-choice question testing this knowledge.
     - options: An array of exactly 4 string options.
     - correctAnswerIndex: The index (0-3) of the correct option.
  
  5. KEYNOTES: Summarize the response into a presentation-style ""Keynote"" deck.
     - Decide how many pages (1 or more) are needed based on content complexity.
     - Each page must be a concise, high-impact summary of a sub-topic.
     - title: A professional title for the entire deck.
     - pages: An array of objects, each with:
       - title: Title for this specific page.
       - content: The main knowledge point in Markdown (bullet points, bold text).
       - shortDescription: A 1-sentence summary for the sidebar preview.
  
  Return a JSON object:
  {
    ""charts"": Array<{ ""type"": ""bar"" | ""line"" | ""pie"", ""title"": string, ""data"": Array<{ ""label"": string, ""value"": number }>, ""xAxisLabel""?: string, ""yAxisLabel""?: string, ""confidence"": number }>,
    ""mermaids"": Array<{ ""code"": string, ""title"": string, ""confidence"": number }>,
    ""suggestedQuestion"": string,
    ""flipCards"": Array<{ ""title"": string, ""knowledge"": string, ""question"": string, ""options"": string[], ""correctAnswerIndex"": number }>,
    ""keynotes"": { ""title"": string, ""pages"": Array<{ ""title"": string, ""content"": string, ""shortDescription"": string }> } | null
  }
  
  IMPORTANT: The ""confidence"" field for charts and diagrams MUST be an integer or decimal between 0 and 10 (e.g., 9.5), where 10 is absolute certainty that the artifact is relevant and accurate based on the text.
  
  Titles for charts and mermaid diagrams should be professional and descriptive.";

        var messages = new List<Microsoft.Extensions.AI.ChatMessage>
        {
            new(ChatRole.System, systemInstruction),
            new(ChatRole.User, assistantText)
        };

        var response = await _chatClient.GetResponseAsync(messages, new ChatOptions { ResponseFormat = ChatResponseFormat.Json });
        return response.Text;
    }
}
