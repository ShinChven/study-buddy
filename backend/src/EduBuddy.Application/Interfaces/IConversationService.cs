using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EduBuddy.Application.DTOs;
using EduBuddy.Domain.Entities;

namespace EduBuddy.Application.Interfaces;

public interface IConversationService
{
    Task<List<Message>> GetThreadAsync(Guid conversationId, Guid? messageId = null);
    Task<Conversation?> GetConversationAsync(Guid conversationId, Guid userId);
    Task<List<Conversation>> GetUserConversationsAsync(Guid userId);
    Task<Conversation> CreateConversationAsync(Guid userId, string title);
    Task SyncConversationsAsync(Guid userId, List<SyncConversationRequest> requests);
    Task DeleteConversationAsync(Guid conversationId, Guid userId);
}
