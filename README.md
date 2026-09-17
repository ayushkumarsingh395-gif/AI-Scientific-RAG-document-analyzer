# NEXUS AI — Scientific RAG Document Analyzer

> **Production-grade AI document intelligence platform** powered by RAG (Retrieval-Augmented Generation), built for scientific paper analysis, multi-lingual Q&A, and deep document understanding.

![NEXUS AI Banner](./docs/banner.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Multi-format Upload** | PDF, DOCX, TXT, CSV, MD, JSON (up to 25MB) |
| 🧠 **RAG Engine** | Pure NumPy vector store + cosine similarity retrieval |
| 💬 **Multi-lingual Chat** | English, Hindi, Hinglish — natural language understanding |
| 📐 **Math Rendering** | KaTeX LaTeX rendering (`$$...$$`) for equations |
| 🔀 **Mermaid Diagrams** | Auto-generated flowcharts from document content |
| 🔬 **Scientific Actions** | Extract equations, theorems, citations, research gaps |
| 📊 **Follow-up Questions** | AI suggests 3 relevant follow-ups after each answer |
| 🏷️ **Smart Session Titles** | Auto-generated 3-5 word titles from first message |
| 🌗 **Dark Theme** | Obsidian Emerald / Cyber Mint scientific aesthetic |

---

## 🛠️ Tech Stack

**Backend**
- FastAPI (Python 3.12) + Uvicorn
- LangChain + Groq LLM (`openai/gpt-oss-120b`)
- HuggingFace Embeddings (`all-MiniLM-L6-v2`) — pure NumPy (no FAISS)
- SQLite (`nexus_data.db`) for sessions & history
- bcrypt, slowapi (rate limiting)

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom Obsidian Emerald theme)
- Lucide React icons
- ReactMarkdown + remark-math + rehype-katex (KaTeX)
- Mermaid.js for diagram rendering
- React Router DOM, Context API

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/ayushkumarsingh395-gif/AI-Scientific-RAG-document-analyzer.git
cd AI-Scientific-RAG-document-analyzer
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
python patch_env.py        # Windows AppLocker fix (Windows only)
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Default admin login:** `admin@nexus.ai` / `admin123`

---

## ⚙️ Environment Variables

### `backend/.env`
```env
GROQ_API_KEY=your_groq_api_key_here
```

### `frontend/.env.local`
```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## 📁 Project Structure

```
nexus-ai/
├── backend/
│   ├── main.py          # FastAPI routes, DB init, session management
│   ├── rag.py           # RAG engine, Groq LLM, prompt, follow-ups
│   ├── embeddings.py    # Pure NumPy NexusVectorStore
│   ├── patch_env.py     # Windows DLL bypass
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # React UI components
│   │   ├── context/     # ThemeContext
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🔬 Scientific Quick Actions

- **Summary** — Structured executive summary
- **Flowchart** — Mermaid.js diagram of document workflow
- **Deep Analysis** — Key findings & strategic implications
- **Extract Equations** — LaTeX math with variable definitions
- **Theorems & Proofs** — Formal + intuitive explanations
- **Citations Map** — Citation context mapping
- **Research Gaps** — Explicit + implicit gap analysis
- **Structured Abstract** — Background / Methods / Results / Conclusion

---

## 📜 License

MIT License — © 2026 Ayush Kumar Singh
