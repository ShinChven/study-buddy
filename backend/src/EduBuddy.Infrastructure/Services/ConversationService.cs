using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduBuddy.Application.DTOs;
using EduBuddy.Application.Interfaces;
using EduBuddy.Domain.Entities;
using EduBuddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduBuddy.Infrastructure.Services;

public class ConversationService : IConversationService
{
    private readonly EduBuddyDbContext _context;

    public ConversationService(EduBuddyDbContext context)
    {
        _context = context;
    }

    public async Task<List<Message>> GetThreadAsync(Guid conversationId, Guid? messageId = null)
    {
        // If messageId is provided, traverse up to get the branch
        if (messageId.HasValue)
        {
            var thread = new List<Message>();
            var currentId = messageId.Value;

            while (true)
            {
                var message = await _context.Messages
                    .Include(m => m.Artifacts)
                    .FirstOrDefaultAsync(m => m.Id == currentId && m.ConversationId == conversationId);

                if (message == null) break;
                
                thread.Add(message);
                
                if (!message.ParentMessageId.HasValue) break;
                currentId = message.ParentMessageId.Value;
            }

            thread.Reverse();
            return thread;
        }

        // Default: Get all messages in chronological order (for non-branching simple threads)
        return await _context.Messages
            .Include(m => m.Artifacts)
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<Conversation?> GetConversationAsync(Guid conversationId, Guid userId)
    {
        return await _context.Conversations
            .FirstOrDefaultAsync(c => c.Id == conversationId && c.UserId == userId);
    }

    public async Task<List<Conversation>> GetUserConversationsAsync(Guid userId)
    {
        return await _context.Conversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.LastUpdated)
            .ToListAsync();
    }

    public async Task<Conversation> CreateConversationAsync(Guid userId, string title)
    {
        var conversation = new Conversation
        {
            UserId = userId,
            Title = title,
            CreatedAt = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow
        };

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();
        return conversation;
    }

    public async Task SyncConversationsAsync(Guid userId, List<SyncConversationRequest> requests)
    {
        foreach (var req in requests)
        {
            var existing = await _context.Conversations.FindAsync(req.Id);
            if (existing == null)
            {
                var conversation = new Conversation
                {
                    Id = req.Id,
                    UserId = userId,
                    Title = req.Title,
                    CreatedAt = req.CreatedAt.ToUniversalTime(),
                    LastUpdated = req.LastUpdated.ToUniversalTime()
                };
                _context.Conversations.Add(conversation);
            }

            foreach (var msgReq in req.Messages)
            {
                var existingMsg = await _context.Messages.FindAsync(msgReq.Id);
                if (existingMsg == null)
                {
                    var message = new Message
                    {
                        Id = msgReq.Id,
                        ConversationId = req.Id,
                        Role = msgReq.Role,
                        Content = msgReq.Content,
                        CreatedAt = msgReq.CreatedAt.ToUniversalTime(),
                        ParentMessageId = msgReq.ParentMessageId
                    };
                    _context.Messages.Add(message);
                }
            }
        }

        await _context.SaveChangesAsync();
    }
}
