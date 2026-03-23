# EduBuddy Backend Architecture

This document outlines the architectural design for the EduBuddy .NET Core backend, transitioning from local persistence to a centralized, scalable API.

---

## 1. Technology Stack

*   **Framework**: .NET 8/9 Web API (C#)
*   **Database**: PostgreSQL (Relational data, JSONB support for artifacts)
*   **ORM**: Entity Framework Core
*   **Authentication**: ASP.NET Core Identity + JWT (JSON Web Tokens)
*   **AI Orchestration**: Microsoft.Extensions.AI (Unified Abstraction)
*   **Real-time Communication**: SignalR (for streaming AI responses)
*   **Containerization**: Docker & Docker Compose
*   **Documentation**: Swagger/OpenAPI

---

## 2. System Architecture (Clean Architecture)

The backend follows the **Clean Architecture** (Onion) pattern:
1.  **Domain**: Core entities (`User`, `Message`, `Artifact`), Enums, and Domain Logic.
2.  **Application**: Use cases, DTOs (matching frontend interfaces), and Service interfaces.
3.  **Infrastructure**: Data persistence (EF Core), External API integrations (Gemini).
4.  **Web API**: Controllers, Middleware, and SignalR Hubs.

---

## 3. Database Schema

### Core Tables:

*   **Users**: 
    *   `Id`, `Username`, `Email`, `PasswordHash`.
    *   `Role`: Enum (`Admin`, `Normal`).
        *   **Admin**: Access to Management Console (User management, System logs, AI prompts) and Personal Study.
        *   **Normal**: Access to Personal Study interface only.
    *   `Preferences`: JSONB (Matches `ThemeSettings` & `FollowUpSettings` from frontend).
        *   `accentColor`: Enum (`indigo`, `blue`, `rose`, `amber`, `emerald`).
        *   `isDarkMode`: Boolean.

*   **SystemSettings**:
    *   `Key`: String (Primary Key) - e.g., "GeminiApiKey".
    *   `Value`: String (Encrypted at rest).
    *   `LastUpdated`: Timestamp.
    *   `UpdatedBy`: UserId.

*   **Conversations**: 
    *   `Id`, `UserId`, `Title`, `CreatedAt`, `LastUpdated`.

*   **Messages**:
    *   `Id`, `ConversationId`, `Role` (`user`, `assistant`).
    *   `Content`: Text (Markdown).
    *   `ParentMessageId`: Nullable (For branching logic).
    *   `CreatedAt`: Timestamp.

*   **Artifacts**:
    *   `Id`, `MessageId`, `Type` (`Chart`, `Mermaid`, `Keynote`, `FlipCard`).
    *   `ConfidenceScore`: Decimal.
    *   `Data`: JSONB (Mapped strictly to frontend interfaces):
        *   **Chart**: `title`, `type`, `data[]`, `xAxisLabel`, `yAxisLabel`.
        *   **Mermaid**: `title`, `code`.
        *   **Keynote**: `title`, `pages[]` (`title`, `content`, `shortDescription`).
        *   **FlipCard**: `title`, `knowledge`, `question`, `options[]`, `correctAnswerIndex`.

---

## 4. Implementation Strategies

### AI Proxy & Streaming
The backend acts as a **secure proxy** for all AI interactions using **Microsoft.Extensions.AI**.
*   **Unified Abstraction**: The `IChatClient` interface allows swapping between Gemini, OpenAI, or local models (Ollama) with minimal code changes.
*   **Key Protection**: The Gemini API key is stored only on the server (encrypted in the database) and is injected into the AI service at runtime.
*   **Tool Calling**: Leverages MEAI's `AIFunctionFactory` to define extraction tools (Charts, Keynotes, etc.) as regular C# methods.
*   **SignalR Hub**: The `ChatHub` manages the streaming connection. When a user sends a message, the backend initiates the Gemini call, receives the stream server-side, and pipes chunks to the client via `Clients.Caller.SendAsync("ReceiveChunk", chunk)`.
*   **Thinking Support**: Accesses `TextReasoningContent` to handle model "thought processes" for improved artifact extraction and debugging.

### Conversation Branching
*   The API provides a `GET /api/conversations/{id}/thread?messageId={id}` endpoint. It traverses up the `ParentMessageId` chain to reconstruct the specific branch history.

### Security & Roles
*   **Policy-Based Authorization**: 
    *   `[Authorize(Policy = "AdminOnly")]` for management endpoints.
    *   `[Authorize]` for standard study endpoints.
*   **JWT Bearer Auth**: All requests must be authenticated, preventing anonymous AI usage.

---

## 5. Refined API Endpoints

### Auth
*   `POST /api/auth/register` | `POST /api/auth/login`

### Study (All Users)
*   `GET /api/conversations`: List user sessions.
*   `GET /api/conversations/{id}`: Get session with current message thread.
*   `POST /api/conversations/{id}/messages`: Send message (Trigger SignalR Proxy & AI).
*   `PATCH /api/users/preferences`: Update theme/accent color.

### Management Console (Admin Only)
*   `GET /api/admin/users`: List/Manage all users.
*   `GET /api/admin/analytics`: AI usage and session statistics.
*   `POST /api/admin/prompts`: Configure system instructions for the teacher persona.
*   `POST /api/admin/settings/gemini-key`: Securely update the Gemini API key.

---

## 6. Deployment & Dockerization

The application is fully containerized for simplified deployment and environment parity.

### Docker Configuration:
*   **API Service**: A multi-stage `Dockerfile`.
    1.  **Build Stage**: Uses `mcr.microsoft.com/dotnet/sdk:8.0`.
    2.  **Runtime Stage**: Uses `mcr.microsoft.com/dotnet/aspnet:8.0`.
*   **Database Service**: Uses `postgres:latest` with persistent volume mapping.
*   **Orchestration**: `docker-compose.yml` links the services and manages sensitive environment variables (Secrets).
