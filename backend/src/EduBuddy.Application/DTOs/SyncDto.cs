using System;
using System.Collections.Generic;
using EduBuddy.Domain.Entities;

namespace EduBuddy.Application.DTOs;

public class SyncConversationRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastUpdated { get; set; }
    public List<SyncMessageRequest> Messages { get; set; } = new();
}

public class SyncMessageRequest
{
    public Guid Id { get; set; }
    public MessageRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? ParentMessageId { get; set; }
}
