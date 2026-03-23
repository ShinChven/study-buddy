# EduBuddy: AI Learning Companion - Feature Summary

EduBuddy is a sophisticated, AI-driven educational platform designed to transform traditional learning into an interactive, visual, and personalized experience. It leverages the latest generative AI models to provide structured knowledge, interactive visualizations, and automated assessment tools.

---

## 1. Core Learning Experience (AI-Powered Chat)

The heart of EduBuddy is an intelligent, teacher-persona driven chat interface that provides rigorous yet accessible explanations.

*   **Professional "Teacher" Persona**: The AI (EduBuddy) adopts a professional, middle/high school teacher tone, prioritizing accuracy, depth, and structured expression.
*   **Streaming Responses**: Real-time message streaming for immediate feedback and a more natural conversational flow.
*   **Structured Knowledge Display**:
    *   **Markdown Support**: Full support for headers, bullet points, and bold text for readability.
    *   **Mathematical Formulae**: High-quality rendering of math equations using LaTeX (KaTeX).
    *   **Data Tables**: Automated organization of complex data into clean, responsive tables.
*   **Interactive "Thinking" State**: A dynamic, multi-step indicator that communicates the AI's analytical process (e.g., "Consulting academic databases...", "Synthesizing educational insights...").
*   **Conversation Branching**: Users can edit previous messages, which automatically creates a new conversation branch to explore alternative learning paths without losing previous progress.
*   **Topic-Based Onboarding**: A dedicated "New Chat" page with suggested topics and a focused search-like entry for new study investigations.

---

## 2. Interactive Learning Artifacts

EduBuddy goes beyond text by automatically analyzing responses to generate interactive visual aids and study materials.

*   **Data-Driven Charts**:
    *   Automatically extracts quantitative data from text.
    *   Renders Bar, Line, or Pie charts using **Recharts**.
    *   Includes confidence scoring to ensure visual accuracy.
*   **Visual Diagrams**:
    *   Generates **Mermaid.js** diagrams for processes, cycles, workflows, and system architectures.
    *   Supports various types including Flowcharts, Sequence Diagrams, and Class Diagrams.
*   **Study Keynotes**:
    *   Summarizes complex responses into presentation-style slide decks.
    *   Features a dedicated presentation view with smooth transitions (Framer Motion).
    *   Provides high-impact summaries for quick review.
*   **Knowledge Flip Cards**:
    *   Captures key concepts, definitions, and facts into digital flashcards.
    *   Organized into a "Knowledge Collection" for long-term retention.
*   **Proactive Follow-ups**:
    *   Suggests deep-thinking questions after every response to encourage further exploration.

---

## 3. Assessment & Mastery Tools

To ensure knowledge retention, EduBuddy provides built-in testing and review mechanisms.

*   **Dynamic Knowledge Tests**:
    *   Automatically generates quizzes based on the Flip Cards collected during the study session.
    *   Features a polished, focused test interface with progress tracking.
*   **Real-time Feedback**:
    *   Immediate validation of answers with detailed "Knowledge" explanations for every question.
    *   Scoring system with a final performance summary and mastery percentage.
*   **Artifact Repository**:
    *   A dedicated **Artifact Panel** provides centralized access to all generated Keynotes and Flip Cards for any session.

---

## 4. Personalization & User Interface

Designed for focus and ease of use, the platform offers a modern, responsive environment.

*   **Theming & Aesthetics**:
    *   Native **Dark and Light Mode** support.
    *   Customizable **Accent Colors** (Indigo, Blue, Rose, Amber, Emerald) that propagate throughout the UI.
*   **Sidebar Navigation**: Easy management of study sessions with history persistence and deletion.
*   **Mobile-First Design**: A fully responsive layout with collapsible sidebars and optimized touch targets for learning on any device.
*   **Local Persistence**: All study sessions, messages, and artifacts are persisted in local storage, ensuring no progress is lost between visits.

---

## 5. Technical Implementation Highlights

*   **Advanced AI Orchestration**: Uses `gemini-3-flash-preview` with a multi-pass workflow:
    1.  **Generation**: Primary knowledge response.
    2.  **Extraction**: Content analysis for charts, diagrams, keynotes, and cards.
    3.  **Validation**: AI-based reassessment and confidence scoring for visual elements.
*   **Modern Web Stack**:
    *   **React 19** with TypeScript for a robust, type-safe frontend.
    *   **Tailwind CSS 4** for modern, utility-first styling.
    *   **Framer Motion** for fluid, high-quality animations.
    *   **Vite** for ultra-fast development and build processes.
*   **Reliable API Integration**: Robust error handling for AI rate limits and generation failures.
