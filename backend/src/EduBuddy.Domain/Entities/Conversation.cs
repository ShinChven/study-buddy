using System;
using System.Collections.Generic;

namespace EduBuddy.Domain.Entities;

public class Conversation : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
