# EduBuddy: Project Roadmap & Structure

This document defines the physical organization of the codebase and the phased implementation plan to move from prototype to production.

---

## 1. Project Structure

The repository will be reorganized into a monorepo structure:

```
/study-buddy
├── /web                # Existing React 19 Frontend
├── /api                # New .NET 8/9 Web API (Clean Architecture)
│   ├── EduBuddy.Api    # Web API / Controllers / SignalR Hubs
│   ├── EduBuddy.Core   # Domain Entities / Enums / Interfaces
│   ├── EduBuddy.App    # Use Cases / DTOs / Service Logic
│   └── EduBuddy.Infra  # Data Persistence / AI Connectors
├── /docs               # Architectural & Feature Documentation
├── /infra              # Dockerfiles, Nginx config, Env templates
└── docker-compose.yml  # Orchestration for API + Postgres
```

---

## 2. Phased Implementation Plan

### Phase 1: Infrastructure & Data (Week 1)
*   **API Scaffold**: Create the .NET Solution and projects.
*   **Database Setup**: Implement EF Core Migrations for Users, Conversations, and Artifacts.
*   **Identity Setup**: Configure ASP.NET Core Identity and JWT middleware.
*   **Dockerization**: Get the API and Postgres running in containers.

### Phase 2: AI Proxy & SignalR (Week 2)
*   **IChatClient Integration**: Implement `Microsoft.Extensions.AI` with the Gemini 3 Flash connector.
*   **SignalR Hub**: Build the `ChatHub` for streaming.
*   **Frontend Refactor**: Update `ChatProvider.tsx` to use the SignalR proxy instead of direct AI calls.
*   **Validation**: Ensure streaming UX is identical to the prototype.

### Phase 3: Advanced Logic & Profile (Week 3)
*   **Branching Logic**: Implement the message tree reconstruction in the API.
*   **Artifact Extraction**: Implement tool calling for automatic Chart/Keynote generation.
*   **Profile Page**: Build the frontend Account page and backend profile endpoints.
*   **Admin Console (V1)**: Build the basic management page for API Key and Prompt configuration.

### Phase 4: Sync & Polish (Week 4)
*   **Data Migration**: Implement the "Sync Local History" logic.
*   **Admin Analytics**: Add usage monitoring and logs to the console.
*   **Security Hardening**: Final review of JWT lifetimes, CORS, and encryption at rest.

---

## 3. Success Metrics

1.  **Latency**: AI response streaming begins in < 1 second.
2.  **Accuracy**: Artifact extraction confidence scores > 0.9.
3.  **Integrity**: 100% of existing `localStorage` data is successfully migrated to PostgreSQL upon user opt-in.
4.  **Security**: 0% exposure of Gemini API keys to the client-side code.
