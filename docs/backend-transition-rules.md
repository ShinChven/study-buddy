# Backend Transition: Frontend Preservation Rules

To ensure a seamless transition from a Local-Only prototype to a Cloud-Synchronized application, all backend and integration work must adhere to the following strict mandates.

---

## 1. UX & Visual Preservation
*   **Zero UI Regressions**: The visual layout, animations (Framer Motion), and theme transitions must remain identical. No UI elements should be removed or altered unless strictly necessary for Authentication (e.g., adding a Login screen).
*   **Performance Parity**: The switch to a backend proxy must not introduce perceptible lag. **SignalR Streaming** must be optimized to match or exceed the current "direct-to-Gemini" streaming speed.
*   **Error Handling Grace**: If the backend or AI is unavailable, the UI must show the same teacher-persona error states currently implemented, rather than raw browser/network errors.

---

## 2. Data Contract Integrity
*   **DTO Matching**: All backend API responses must strictly follow the existing TypeScript interfaces defined in `web/src/types.ts` (`Message`, `ChatSession`, `FollowUp`, `ChartConfig`, etc.).
*   **No Schema Drift**: Do not rename fields (e.g., `content` must remain `content`, not `text` or `body`) to avoid breaking the React components that consume them.
*   **Artifact Compatibility**: The `Data` field in the `Artifacts` table must store JSON that is 100% compatible with the props expected by `ChartRenderer.tsx` and `MermaidRenderer.tsx`.

---

## 3. State Management Rules
*   **Provider Consistency**: The `ChatProvider.tsx` must maintain its current external API. Components using `useChat()` should not require refactoring.
*   **Incremental Streaming**: The "Typewriter" effect and incremental message updates must be preserved using SignalR's chunking capabilities.
*   **Local-to-Cloud Migration**: Upon the first login, the system must offer to "Sync Local History." The migration logic must ensure no existing study sessions are lost during the transition.

---

## 4. AI Behavior & Persona
*   **Persona Lock**: The "Professional Teacher" system prompt must be moved from the frontend to the backend's `SystemSettings` or `AppConfig`, but its content and behavior must remain unchanged.
*   **Thinking Indicators**: The frontend's "Thinking" state must be driven by the backend's `TextReasoningContent` stream to ensure the user still sees the AI's analytical process.

---

## 5. Development Workflow
*   **Parallel Running**: During the transition, the frontend should support a "Hybrid Mode" where it can still run against `localStorage` if the backend environment variable is not set, facilitating easier testing and debugging.
*   **Feature-First Implementation**: Add the backend as an enhancement (Persistence, Security, Sync) rather than a replacement of the core interactive logic.
