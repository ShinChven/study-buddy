# 🎓 EduBuddy: Your AI-Powered Learning Companion

EduBuddy is a sophisticated, AI-driven educational platform designed to transform traditional learning into an interactive, visual, and personalized experience. It leverages advanced generative AI models to provide structured knowledge, interactive visualizations, and automated assessment tools.

## 🎥 Demo
[![EduBuddy Demo](https://img.youtube.com/vi/2vD-ZPX3jAc/0.jpg)](https://www.youtube.com/watch?v=2vD-ZPX3jAc)

---

## ✨ Key Features

### 🧑‍🏫 1. Professional Teacher-Persona Chat
The heart of EduBuddy is an intelligent, teacher-persona driven chat interface that provides rigorous yet accessible explanations.
*   **Teacher Persona**: AI adopts a professional, middle/high school teacher tone, prioritizing accuracy, depth, and structured expression.
*   **Streaming Responses**: Real-time message streaming (via SignalR) for immediate feedback.
*   **Structured Knowledge Display**:
    *   **Markdown Support**: Headers, bullet points, and bold text for maximum readability.
    *   **Mathematical Formulae**: High-quality LaTeX rendering (KaTeX).
    *   **Data Tables**: Automated organization of complex data into clean, responsive tables.
*   **Interactive "Thinking" State**: A dynamic, multi-step indicator that communicates the AI's analytical process.

### 📊 2. Interactive Learning Artifacts
EduBuddy goes beyond text by automatically analyzing responses to generate interactive visual aids and study materials.
*   **Data-Driven Charts**: Automated extraction of quantitative data into **Bar, Line, or Pie charts** (Recharts).
*   **Visual Diagrams**: Generates **Mermaid.js** diagrams for processes, cycles, workflows, and architectures.
*   **Study Keynotes**: Summarizes complex responses into presentation-style **slide decks** (Framer Motion).
*   **Knowledge Flip Cards**: Captures key concepts into digital flashcards for long-term retention.

### 📝 3. Assessment & Mastery Tools
To ensure knowledge retention, EduBuddy provides built-in testing and review mechanisms.
*   **Dynamic Knowledge Tests**: Automatically generates quizzes based on the Flip Cards collected during your session.
*   **Real-time Feedback**: Immediate validation of answers with detailed educational explanations.
*   **Artifact Repository**: Centralized access to all generated Keynotes and Flip Cards in the **Artifact Panel**.

### 🎨 4. Modern & Responsive UI
Designed for focus and ease of use, the platform offers a polished, professional environment.
*   **Adaptive Themes**: Native **Dark and Light Mode** support with customizable **Accent Colors**.
*   **Mobile-First Design**: Fully responsive layout optimized for learning on any device.
*   **Conversation Branching**: Edit previous messages to create new learning paths without losing progress.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visuals**: [Recharts](https://recharts.org/), [Mermaid.js](https://mermaid.js.org/), [Framer Motion](https://www.framer.com/motion/)
- **Real-time**: [@microsoft/signalr](https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction)

### Backend
- **Framework**: [.NET 8/9 Web API](https://dotnet.microsoft.com/)
- **AI Orchestration**: [Microsoft.Extensions.AI](https://github.com/dotnet/extensions/tree/main/src/Libraries/Microsoft.Extensions.AI)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- **Authentication**: ASP.NET Core Identity + JWT (JSON Web Tokens)
- **Real-time Hubs**: ASP.NET Core SignalR

---

## 🚀 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
- [.NET 8/9 SDK](https://dotnet.microsoft.com/download) (for local backend development)
- [Node.js v18+](https://nodejs.org/) & npm (for local frontend development)
- **Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/)

### 🐳 Using Docker (Recommended)
The easiest way to get EduBuddy running is via Docker Compose.

1. Clone the repository:
   ```bash
   git clone https://github.com/shinchven/study-buddy.git
   cd study-buddy
   ```

2. Configure your API key in `docker-compose.yml`:
   ```yaml
   environment:
     - GeminiApiKey=your_gemini_api_key_here
   ```

3. Spin up the services:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - **Frontend**: `http://localhost:3000` (Manual start required if not containerized, see below)
   - **Backend API**: `http://localhost:5293`
   - **Database**: `localhost:5433`

### 💻 Local Development Setup

#### 1. Database
Run only the database via Docker:
```bash
docker-compose up db -d
```

#### 2. Backend API
```bash
cd backend/src/EduBuddy.WebApi
dotnet run
# API will be available at http://localhost:5140 (or check launchSettings.json)
```

#### 3. Frontend App
```bash
cd frontend
npm install
npm run dev
# App will be available at http://localhost:3000
```

---

## ⚙️ Configuration

### Backend Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | `Host=localhost;Port=5433...` |
| `JwtSettings__Key` | Secret key for JWT signing | `EduBuddySecretKey...` |
| `GeminiApiKey` | Your Google Gemini API Key | *(Required)* |

### Frontend Environment Variables
Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5140
```

---

## 📂 Project Structure

```
/study-buddy
├── backend/                # .NET Core Clean Architecture
│   ├── src/
│   │   ├── EduBuddy.Domain/       # Entities & Core Logic
│   │   ├── EduBuddy.Application/  # Interfaces & DTOs
│   │   ├── EduBuddy.Infrastructure/ # Data & AI Services
│   │   └── EduBuddy.WebApi/       # API Controllers & Hubs
├── frontend/               # React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # UI Parts (Artifacts, Chat, etc.)
│   │   ├── pages/          # Full page views
│   │   └── services/       # API & Storage logic
├── docs/                   # Detailed feature & architecture docs
└── docker-compose.yml      # Orchestration
```

---

## 🛡️ Security & Privacy
EduBuddy acts as a **Secure AI Proxy**. Your Gemini API keys are never exposed to the frontend; all AI communication is proxied through the .NET backend, ensuring that your keys and safety filters remain server-side.

---

© 2026 EduBuddy Team. Built for the future of interactive education.
