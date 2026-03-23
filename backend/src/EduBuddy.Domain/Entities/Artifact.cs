using System;
using System.Text.Json;

namespace EduBuddy.Domain.Entities;

public enum ArtifactType
{
    Chart,
    Mermaid,
    Keynote,
    FlipCard
}

public class Artifact : BaseEntity
{
    public Guid MessageId { get; set; }
    public ArtifactType Type { get; set; }
    public double ConfidenceScore { get; set; }
    public string Data { get; set; } = "{}"; // Store as JSON string, EF will handle mapping

    public virtual Message Message { get; set; } = null!;
}
