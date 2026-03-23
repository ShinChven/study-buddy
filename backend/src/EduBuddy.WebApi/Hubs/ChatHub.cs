using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Nodes;
using EduBuddy.Application.Interfaces;
using EduBuddy.Domain.Entities;
using EduBuddy.Infrastructure.Persistence;
using EduBuddy.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;

namespace EduBuddy.WebApi.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatClient _chatClient;
    private readonly EduBuddyDbContext _context;
    private readonly IFollowUpService _followUpService;

    public ChatHub(IChatClient chatClient, EduBuddyDbContext context, IFollowUpService followUpService)
    {
        _chatClient = chatClient;
        _context = context;
        _followUpService = followUpService;
    }

    public async Task GetFollowUp(string assistantContent, Guid messageId)
    {
        var result = await _followUpService.GenerateFollowUpAsync(assistantContent);
        if (result != null)
        {
            // Persist each follow-up component as an Artifact row
            await SaveFollowUpArtifactsAsync(messageId, result);
            await Clients.Caller.SendAsync("ReceiveFollowUp", result);
        }
    }

    private async Task SaveFollowUpArtifactsAsync(Guid messageId, string followUpJson)
    {
        try
        {
            var doc = JsonNode.Parse(followUpJson);
            if (doc == null) return;

            var typeMap = new Dictionary<string, ArtifactType>
            {
                ["chart"]    = ArtifactType.Chart,
                ["mermaid"]  = ArtifactType.Mermaid,
                ["flipCard"] = ArtifactType.FlipCard,
                ["keynotes"] = ArtifactType.Keynote
            };

            // Remove any stale artifacts for this message first
            var existing = _context.Artifacts.Where(a => a.MessageId == messageId);
            _context.Artifacts.RemoveRange(existing);

            foreach (var (key, artifactType) in typeMap)
            {
                var node = doc[key];
                if (node == null) continue;

                double confidence = 0;
                var confidenceNode = node["confidence"];
                if (confidenceNode != null)
                    confidence = confidenceNode.GetValue<double>();

                _context.Artifacts.Add(new Artifact
                {
                    MessageId = messageId,
                    Type = artifactType,
                    ConfidenceScore = confidence,
                    Data = node.ToJsonString(),
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Persist suggestedQuestion as a special artifact with type Chart (reuse a sentinel)
            // We store it separately so it's not lost on reload
            var sqNode = doc["suggestedQuestion"];
            if (sqNode != null)
            {
                _context.Artifacts.Add(new Artifact
                {
                    MessageId = messageId,
                    Type = ArtifactType.Chart, // stored with a marker in Data
                    ConfidenceScore = -1,       // sentinel: -1 means suggestedQuestion
                    Data = JsonSerializer.Serialize(new { suggestedQuestion = sqNode.ToString() }),
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Failed to save follow-up artifacts: {ex.Message}");
        }
    }

    public async Task SendMessage(Guid conversationId, string userContent)
    {
        var userIdString = Context.UserIdentifier;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            await Clients.Caller.SendAsync("Error", "Unauthorized");
            return;
        }

        var conversation = await _context.Conversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);

        if (conversation == null)
        {
            await Clients.Caller.SendAsync("Error", "Conversation not found");
            return;
        }

        // Save User Message
        var userMessage = new Message
        {
            ConversationId = conversationId,
            Role = EduBuddy.Domain.Entities.MessageRole.User,
            Content = userContent,
            CreatedAt = DateTime.UtcNow
        };
        _context.Messages.Add(userMessage);
        await _context.SaveChangesAsync();

        // Prepare History for AI
        var history = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => new Microsoft.Extensions.AI.ChatMessage(m.Role == EduBuddy.Domain.Entities.MessageRole.User ? Microsoft.Extensions.AI.ChatRole.User : Microsoft.Extensions.AI.ChatRole.Assistant, m.Content))
            .ToList();

        // Generate title if it's the first message
        if (history.Count == 1)
        {
            try
            {
                var titlePrompt = $"Summarize the following message into a concise, professional title (max 5 words) for a chat conversation:\n\"{userContent}\"";
                var titleMessages = new List<Microsoft.Extensions.AI.ChatMessage> { new(Microsoft.Extensions.AI.ChatRole.User, titlePrompt) };
                var titleResponse = await _chatClient.GetResponseAsync(titleMessages);
                var generatedTitle = titleResponse.Text?.Trim('"', ' ', '\n', '\r');
                if (!string.IsNullOrEmpty(generatedTitle))
                {
                    conversation.Title = generatedTitle;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Failed to generate title: {ex.Message}");
            }
        }

        // Stream AI Response
        var fullContent = "";
        await foreach (var chunk in _chatClient.GetStreamingResponseAsync(history))
        {
            // Handle Thinking/Reasoning
            var thinking = chunk.Contents.OfType<TextReasoningContent>().FirstOrDefault();
            if (thinking != null && !string.IsNullOrEmpty(thinking.Text))
            {
                await Clients.Caller.SendAsync("ReceiveThinking", thinking.Text);
            }

            if (chunk.Text != null)
            {
                fullContent += chunk.Text;
                await Clients.Caller.SendAsync("ReceiveChunk", chunk.Text);
            }
        }

        // Save Assistant Message
        var assistantMessage = new Message
        {
            ConversationId = conversationId,
            Role = EduBuddy.Domain.Entities.MessageRole.Assistant,
            Content = fullContent,
            CreatedAt = DateTime.UtcNow,
            ParentMessageId = userMessage.Id
        };

        _context.Messages.Add(assistantMessage);
        conversation.LastUpdated = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Log Usage (Simplified for now)
        var usageLog = new UsageLog
        {
            UserId = userId,
            ModelId = "gemini-3-flash-preview",
            InputTokens = 0,
            OutputTokens = 0,
            Endpoint = "ChatHub.SendMessage"
        };
        _context.UsageLogs.Add(usageLog);
        await _context.SaveChangesAsync();

        await Clients.Caller.SendAsync("Finished", assistantMessage.Id);
    }
}
