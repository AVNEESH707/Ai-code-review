# CodeLens AI — Smart Code Reviewer

An AI-powered code review tool that analyzes your code for bugs, performance issues, security vulnerabilities, and best practices. Built with React + Vite (frontend) and Node.js + Express (backend), using OpenRouter's free AI models.

## 🌐 Live Demo

- **App:** [ai-code-review-psi-two.vercel.app](https://ai-code-review-psi-two.vercel.app)
- **API:** [ai-code-review-9osx.onrender.com](https://ai-code-review-9osx.onrender.com)

---

## ✨ Features

- **AI Code Review** — Instant feedback on bugs, performance, security, and best practices
- **File Upload** — Drag & drop any `.js`, `.py`, `.ts`, `.java` and more — editor auto-fills
- **14+ Languages** — JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, and more
- **Dark / Light Mode** — One-click theme toggle, preference saved automatically
- **Review History** — Last 5 reviews saved locally, restore any with one click
- **Export as PDF** — Download your review as a formatted PDF report
- **Copy Review** — Copy the full AI review to clipboard instantly
- **Review Timer** — Shows how long the AI took to generate the review
- **Markdown Rendering** — Review output with syntax-highlighted code suggestions

---

## 🛠 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | UI framework |
| Monaco Editor | VS Code-style code editor |
| React Markdown | Renders AI review as markdown |
| jsPDF | PDF export |
| Axios | API calls |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server |
| OpenRouter API | Access to free AI models |
| Axios | Calls OpenRouter |
| dotenv | Environment variables |
| cors | Cross-origin requests |

### Deployment
| Service | Purpose |
|---------|---------|
| GitHub | Source control |
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## 📁 Project Structure
Ai-code-review/
├── Frontend/
│   ├── src/
│   │   ├── App.jsx        # Main component with all features
│   │   ├── App.css        # Styling with dark/light theme variables
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── BackEnd/
├── src/
│   ├── controllers/
│   │   └── ai.controller.js   # Request validation
│   ├── routes/
│   │   └── ai.routes.js       # API routes
│   ├── services/
│   │   └── ai.service.js      # OpenRouter API integration
│   └── app.js                 # Express app setup
├── server.js                  # Server entry point
└── package.json
---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- OpenRouter API key (free at [openrouter.ai](https://openrouter.ai))

### 1. Clone the repo
```bash
git clone https://github.com/AVNEESH707/Ai-code-review.git
cd Ai-code-review
```

### 2. Setup Backend
```bash
cd BackEnd
npm install
```

Create a `.env` file inside `BackEnd/`:
```env
PORT=3000
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Start the backend:
```bash
npm run dev
```

Backend runs at `http://localhost:3000`

### 3. Setup Frontend
```bash
cd ../Frontend
npm install
```

Create a `.env` file inside `Frontend/`:
```env
VITE_BACKEND_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/get-review` | Submit code for AI review |
| `GET` | `/health` | Check if API is running |

### Example Request
```json
POST /ai/get-review
{
  "code": "function add(a, b) { return a + b; }"
}
```

### Example Response
```json
{
  "review": "## Code Review\n\n### Code Quality\n..."
}
```

---

## 🤖 AI Models Used

The backend uses OpenRouter with a smart fallback system — if one model is rate-limited it automatically tries the next:

1. `deepseek/deepseek-v4-flash:free`
2. `openrouter/free` (auto-picks best available)
3. `google/gemini-2.0-flash-exp:free`
4. `meta-llama/llama-3.3-70b-instruct:free`
5. `mistralai/mistral-7b-instruct:free`

---

## 🔐 Environment Variables

### Backend (`BackEnd/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |

### Frontend (`Frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL |

---

## 👨‍💻 Author

**Avneesh** — [github.com/AVNEESH707](https://github.com/AVNEESH707)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
