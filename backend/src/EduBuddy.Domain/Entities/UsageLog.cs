using System;

namespace EduBuddy.Domain.Entities;

public class UsageLog : BaseEntity
{
    public Guid UserId { get; set; }
    public string ModelId { get; set; } = string.Empty;
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
    public string Endpoint { get; set; } = string.Empty;

    public virtual User User { get; set; } = null!;
}
