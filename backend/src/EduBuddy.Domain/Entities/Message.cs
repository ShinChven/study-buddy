using System;
using System.Collections.Generic;

namespace EduBuddy.Domain.Entities;

public enum MessageRole
{
    User,
    Assistant,
    System
}

public class Message : BaseEntity
{
    public Guid ConversationId { get; set; }
    public MessageRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? ParentMessageId { get; set; }

    public virtual Conversation Conversation { get; set; } = null!;
    public virtual Message? ParentMessage { get; set; }
    public virtual ICollection<Message> Children { get; set; } = new List<Message>();
    public virtual ICollection<Artifact> Artifacts { get; set; } = new List<Artifact>();
}
