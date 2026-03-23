using System.ComponentModel;
using System.Text.Json;
using EduBuddy.Domain.Entities;

namespace EduBuddy.Infrastructure.Services;

public class AITools
{
    private readonly List<Artifact> _extractedArtifacts = new();

    public IReadOnlyList<Artifact> ExtractedArtifacts => _extractedArtifacts;

    [Description("Displays a bar, line, or pie chart to the user based on quantitative data.")]
    public void ShowChart(
        [Description("The type of chart (bar, line, or pie)")] string type,
        [Description("The title of the chart")] string title,
        [Description("The data points as a JSON string array of {label, value}")] string dataJson,
        [Description("Optional X axis label")] string? xAxisLabel = null,
        [Description("Optional Y axis label")] string? yAxisLabel = null)
    {
        _extractedArtifacts.Add(new Artifact
        {
            Type = ArtifactType.Chart,
            ConfidenceScore = 1.0,
            Data = JsonSerializer.Serialize(new
            {
                type,
                title,
                data = JsonSerializer.Deserialize<object>(dataJson),
                xAxisLabel,
                yAxisLabel
            })
        });
    }

    [Description("Displays a Mermaid.js diagram to illustrate a process or system.")]
    public void ShowDiagram(
        [Description("The title of the diagram")] string title,
        [Description("The Mermaid.js code")] string code)
    {
        _extractedArtifacts.Add(new Artifact
        {
            Type = ArtifactType.Mermaid,
            ConfidenceScore = 1.0,
            Data = JsonSerializer.Serialize(new { title, code })
        });
    }

    [Description("Creates a presentation-style Keynote deck summarizing the topic.")]
    public void ShowKeynote(
        [Description("The title of the deck")] string title,
        [Description("A JSON string array of pages, each with {title, content, shortDescription}")] string pagesJson)
    {
        _extractedArtifacts.Add(new Artifact
        {
            Type = ArtifactType.Keynote,
            ConfidenceScore = 1.0,
            Data = JsonSerializer.Serialize(new
            {
                title,
                pages = JsonSerializer.Deserialize<object>(pagesJson)
            })
        });
    }

    [Description("Creates a flashcard for later testing.")]
    public void CreateFlipCard(
        [Description("The topic")] string title,
        [Description("The summary fact")] string knowledge,
        [Description("The multiple choice question")] string question,
        [Description("Array of 4 options")] string[] options,
        [Description("Index of correct option (0-3)")] int correctAnswerIndex)
    {
        _extractedArtifacts.Add(new Artifact
        {
            Type = ArtifactType.FlipCard,
            ConfidenceScore = 1.0,
            Data = JsonSerializer.Serialize(new
            {
                title,
                knowledge,
                question,
                options,
                correctAnswerIndex
            })
        });
    }
}
