# AI Integration Implementation Plan: Secure Proxy & Streaming

This document details the step-by-step implementation for migrating EduBuddy from local AI calls to a secure .NET backend proxy using **Microsoft.Extensions.AI** and **SignalR**.

---

## 1. Backend Implementation (.NET 8/9)

### Phase 1: Infrastructure & Dependency Injection
1.  **Package Installation**:
    *   `Microsoft.Extensions.AI`
    *   `Microsoft.Extensions.AI.OpenAI` (or the specific Google Gemini adapter when available, otherwise using the OpenAI-compatible endpoint for Gemini).
    *   `Microsoft.AspNetCore.SignalR`
2.  **Service Configuration (`Program.cs`)**:
    *   Register `IChatClient` using the Gemini API key retrieved from the `SystemSettings` table.
    *   Configure `ChatClientBuilder` to include `.UseFunctionInvocation()` for artifact extraction.

### Phase 2: SignalR Hub (`ChatHub.cs`)
1.  **Connection Management**: Map user IDs to SignalR connections to ensure private streaming.
2.  **Stream Orchestration**:
    *   Receive `SendMessage` request from frontend.
    *   Retrieve conversation history from PostgreSQL.
    *   Call `IChatClient.GetStreamingResponseAsync`.
    *   **Thinking Pass**: If the model supports reasoning, capture `TextReasoningContent` and optionally send a "Thinking..." status to the client.
    *   **Piping Chunks**: Loop through the stream and call `Clients.Caller.SendAsync("ReceiveChunk", chunkText)`.

### Phase 3: Artifact Extraction (Tool Calling)
1.  **Define AIFunctions**: Create a service with methods like `ExtractChart(ChartConfig data)`, `ExtractFlipCards(FlipCard[] cards)`, etc.
2.  **Auto-Extraction**: 
    *   After the primary response stream ends, the backend triggers a secondary "Extraction Pass" using `IChatClient` with the defined tools.
    *   The model calls the functions; the backend saves the JSON results directly to the `Artifacts` table.
    *   Notify the frontend via SignalR: `Clients.Caller.SendAsync("ArtifactsReady", messageId)`.

---

## 2. Frontend Implementation (React)

### Phase 1: SignalR Integration
1.  **Service Update**: Replace `gemini.ts` direct calls with a `SignalRService.ts`.
2.  **Hub Connection**: Initialize connection in `ChatProvider.tsx`.
    *   Listen for `"ReceiveChunk"`: Update the active message content in state.
    *   Listen for `"ArtifactsReady"`: Re-fetch the message from the API to display the new charts/cards.

### Phase 2: Refactoring `ChatProvider.tsx`
1.  **Streaming Logic**: Update `sendMessage` to emit the message to the SignalR Hub instead of calling an async function.
2.  **State Management**: Maintain a `currentStreamingContent` string in state for ultra-smooth UI updates before the final database commit is broadcast.

---

## 3. Data Flow Diagram

1.  **User** sends message via React UI.
2.  **Frontend** emits `SendMessage` to **SignalR Hub**.
3.  **Backend** retrieves **Gemini API Key** and **History**.
4.  **Backend** calls **Gemini** via **Microsoft.Extensions.AI**.
5.  **Gemini** streams response; **Backend** pipes chunks back to **Frontend** in real-time.
6.  **Backend** (Background) runs **Extraction Tools** to identify Charts/Cards.
7.  **Backend** saves **Artifacts** to **PostgreSQL**.
8.  **Frontend** receives "Ready" signal and renders the rich visual artifacts.

---

## 4. Security Considerations

*   **API Key Isolation**: The frontend never sees the Gemini Key.
*   **JWT Validation**: The SignalR Hub connection is protected by the same JWT used for the REST API.
*   **Rate Limiting**: Applied at the API Gateway/Middleware level to prevent abuse of the AI proxy.
