# Chat History & Conversation Branching

This document details the implementation of the chat history system, specifically focusing on the **Conversation Branching** feature which allows users to explore alternative learning paths.

---

## 1. Data Structure: The Message Tree

Unlike a traditional linear chat, EduBuddy stores messages as a **tree**. Each message (except the root) points to a `ParentMessageId`.

### Backend Representation (PostgreSQL)
*   **Conversations Table**: Acts as a container for a specific topic/session.
*   **Messages Table**:
    *   `Id`: Unique Identifier.
    *   `ConversationId`: Links to the session.
    *   `ParentMessageId`: The ID of the message that preceded this one.
    *   `IsLatestInBranch`: Boolean flag to quickly identify "leaf" nodes.

### Frontend Representation (TypeScript)
The frontend `ChatSession` will be enhanced to handle the tree structure:
```typescript
interface Message {
  id: string;
  parentId: string | null; // Null for the very first message
  role: 'user' | 'assistant';
  content: string;
  // ... artifacts
}
```

---

## 2. Branching Flow

### Triggering a Branch
When a user **edits** a previously sent message:
1.  The frontend identifies the `ParentMessageId` of the message being edited.
2.  A **new message** is sent to the backend with that same `ParentMessageId`.
3.  The backend creates a new entry. From this point forward, all subsequent AI responses and user follow-ups follow this new branch.

### Visual Representation in UI
*   **Branch Indicators**: Messages that have multiple "children" will display a branch selector (e.g., "Branch 2 of 3").
*   **Switching Paths**: Clicking the selector updates the active "Thread" in the `ChatProvider` state, effectively re-rendering the conversation from that point downward.

---

## 3. Thread Reconstruction

To render a conversation, the system must reconstruct a **linear thread** from the tree.

### Backend Retrieval (`GET /api/conversations/{id}/thread?leafId={id}`)
The backend performs a recursive CTE (Common Table Expression) or a simple iterative loop to:
1.  Start at the `leafId` (or the most recent message).
2.  Traverse up the `ParentMessageId` chain until the root (null parent) is reached.
3.  Return the array in chronological order.

### Frontend State Management
The `ChatProvider` maintains:
*   `fullTree`: All messages in the session.
*   `activeThread`: The currently selected linear path of messages.

---

## 4. Session Management

### Title Generation
The session title is initially "New Chat". After the first AI response, the backend uses a lightweight model pass (or the primary model's "thinking" phase) to generate a concise title based on the first user query.

### History Sidebar
*   Lists all `Conversations`.
*   Displays the `LastUpdated` timestamp and a snippet of the most recent message in the **active thread**.
*   **Archival**: Deleting a session in the UI performs a "Soft Delete" in the backend (setting `IsArchived = true`) to allow for future data recovery or AI training insights.

---

## 5. Migration from LocalStorage

1.  **Export**: A utility function will read all `edubuddy_sessions` from `localStorage`.
2.  **Mapping**: Since the frontend already uses UUIDs for message IDs, the backend can ingest these directly as Primary Keys.
3.  **Sync**: Upon first login, the frontend will "push" its local history to the backend to ensure a seamless transition for returning users.
