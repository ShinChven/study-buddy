# AI Providers Configuration Plan

This document outlines how EduBuddy manages multiple AI providers and models using **Microsoft.Extensions.AI**, with a focus on our default "Thinking" model.

---

## 1. Default Provider: Google Gemini

We use **Gemini 3 Flash** as the primary engine for EduBuddy.

### Why Gemini 3 Flash?
*   **Dynamic Reasoning**: Gemini 3 Flash provides high-speed internal reasoning. It supports a `thinking_level` parameter to balance reasoning depth with latency.
*   **Cost-Efficient Intelligence**: It offers Pro-level reasoning capabilities at Flash-level cost and speed, ideal for a multi-user educational platform.
*   **Thinking Tokens**: It natively surfaces "thought processes" through the `TextReasoningContent` abstraction in MEAI.

### Model Configuration
*   **Model ID**: `gemini-3-flash-preview`
*   **Reasoning Configuration**: Set to `Medium` by default via `ChatOptions.Reasoning`.
*   **Streaming**: Enabled by default for all chat interactions.

---

## 2. Multi-Provider Abstraction

By using `Microsoft.Extensions.AI`, the backend can support additional providers without changing the core business logic.

### Supported Adapters:
1.  **Google Gemini**: Primary (Gemini 3 Flash).
2.  **OpenAI**: Secondary (e.g., GPT-5 or latest reasoning models).
3.  **Local (Ollama)**: Optional (e.g., Llama 4 or Phi-5 for offline development).

### Provider Injection Logic:
In `Program.cs`, the `IChatClient` is registered based on the active provider stored in `SystemSettings`:

```csharp
// Conceptual registration logic
var activeProvider = await settingsService.GetAsync("ActiveAIProvider"); // e.g., "Gemini"

IChatClient innerClient = activeProvider switch {
    "Gemini" => new GoogleChatClient(apiKey, "gemini-3-flash-preview"),
    "OpenAI" => new OpenAIChatClient(apiKey, "gpt-5"),
    _ => throw new NotSupportedException()
};

// Add cross-cutting concerns (logging, function invocation)
builder.Services.AddSingleton<IChatClient>(new ChatClientBuilder(innerClient)
    .UseFunctionInvocation()
    .Build());
```

---

## 3. Admin Key Management

The **Admin Console** provides a secure interface to manage provider keys:
*   **Storage**: Keys are encrypted at rest in the `SystemSettings` table.
*   **Rotation**: Admins can update keys via `POST /api/admin/settings/gemini-key` without restarting the server.
*   **Validation**: The system performs a "ping" test (simple `1+1` prompt) to verify the new key before saving it.

---

## 4. Thinking Mode Orchestration

The backend handles the "Thinking" output based on the model's capabilities:
*   **Internal Capture**: The backend captures `TextReasoningContent` from the stream.
*   **Optional Visibility**: 
    *   **Student View**: Receives only the final `TextContent` (unless "Show Thinking" is enabled in preferences).
    *   **Extraction Logic**: The backend uses the "thought process" to improve the accuracy of the secondary Artifact Extraction pass.

---

## 5. Fallback Strategy

1.  **Primary**: Gemini 3 Flash Thinking.
2.  **Secondary (Optional)**: If Gemini is unavailable, the system can automatically fall back to an OpenAI model (if configured) to ensure zero downtime for students.
3.  **Graceful Degradation**: If all AI providers fail, the system returns a friendly "Teacher is busy" message and prevents credit/token consumption.
