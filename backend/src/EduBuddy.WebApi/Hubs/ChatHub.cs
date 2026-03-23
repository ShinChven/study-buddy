using System.Runtime.CompilerServices;
using System.Text.Json;
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

    public async Task GetFollowUp(Guid messageId, string assistantContent)
    {
        var result = await _followUpService.GenerateFollowUpAsync(assistantContent);
        if (result != null)
        {
            // Save artifacts to database
            try 
            {
                var followUpData = JsonSerializer.Deserialize<JsonElement>(result);
                
                // Save Charts
                if (followUpData.TryGetProperty("charts", out var charts) && charts.ValueKind == JsonValueKind.Array)
                {
                    foreach (var chart in charts.EnumerateArray())
                    {
                        _context.Artifacts.Add(new Artifact
                        {
                            MessageId = messageId,
                            Type = ArtifactType.Chart,
                            ConfidenceScore = chart.TryGetProperty("confidence", out var c) ? c.GetDouble() : 10,
                            Data = chart.GetRawText()
                        });
                    }
                }

                // Save Mermaids
                if (followUpData.TryGetProperty("mermaids", out var mermaids) && mermaids.ValueKind == JsonValueKind.Array)
                {
                    foreach (var mermaid in mermaids.EnumerateArray())
                    {
                        _context.Artifacts.Add(new Artifact
                        {
                            MessageId = messageId,
                            Type = ArtifactType.Mermaid,
                            ConfidenceScore = mermaid.TryGetProperty("confidence", out var c) ? c.GetDouble() : 10,
                            Data = mermaid.GetRawText()
                        });
                    }
                }

                // Save FlipCards
                if (followUpData.TryGetProperty("flipCards", out var flipCards) && flipCards.ValueKind == JsonValueKind.Array)
                {
                    foreach (var card in flipCards.EnumerateArray())
                    {
                        _context.Artifacts.Add(new Artifact
                        {
                            MessageId = messageId,
                            Type = ArtifactType.FlipCard,
                            ConfidenceScore = 10,
                            Data = card.GetRawText()
                        });
                    }
                }

                // Save Keynotes
                if (followUpData.TryGetProperty("keynotes", out var keynotes) && keynotes.ValueKind != JsonValueKind.Null)
                {
                    _context.Artifacts.Add(new Artifact
                    {
                        MessageId = messageId,
                        Type = ArtifactType.Keynote,
                        ConfidenceScore = 10,
                        Data = keynotes.GetRawText()
                    });
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log error but still send the result to the caller for immediate UI update
                Console.WriteLine($"Error saving artifacts: {ex.Message}");
            }

            await Clients.Caller.SendAsync("ReceiveFollowUp", result);
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
