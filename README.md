# 🧠 Cognitive Tension Engine (CTE) v3.0
### ⚡ Autonomous Recursive Dialectics & Strategic Reasoning System

![Status](https://img.shields.io/badge/Status-Prototype-blueviolet)
![Tech](https://img.shields.io/badge/Stack-LangGraph_FastAPI_React-blue)
![Focus](https://img.shields.io/badge/Focus-AGI_Reasoning_Pathways-ff0055)
![Engine](https://img.shields.io/badge/Engine-Gemini_2.0_Flash-orange)

> **"LLMs are naturally sycophantic. The CTE forces them to disagree, mathematically measures the conflict, and synthesizes the truth."**

---

## 🚀 What Is This?

**TL;DR:** CTE is an experimental multi-agent reasoning engine that forces LLMs to debate, scores contradictions mathematically, and synthesizes grounded outputs using vector evidence and recursive control loops.

Standard LLM wrappers suffer from **Groupthink** and **Hallucination**. The **Cognitive Tension Engine (CTE)** is a multi-agent dialectical reasoning system designed as a conceptual stepping stone toward **AGI-level autonomous reasoning**.

Instead of generating one answer, CTE spawns **competing AI agents** — The Skeptic, The Accelerationist, The Pragmatist — who debate your problem from opposing angles. A deterministic **Math Engine** (using Shapley Values & Spectral Centrality) scores their arguments against real-time vector-search evidence. The system loops recursively via an **OODA feedback cycle** until a mathematically grounded consensus is reached.

This is not just another LLM wrapper. This is a **structured conflict machine** — where disagreement is the feature, not the bug.

---

## 🎯 Who Is This For?

- AI engineers exploring multi-agent reasoning systems  
- Data / ML engineers interested in orchestration and feedback loops  
- Researchers prototyping dialectical or ensemble reasoning pipelines  

---

## ⚡ Key Technical Innovations

### 🔁 1. Fractal OODA Loops
Implements `LangGraph` for recursive, stateful decision-making (Observe → Orient → Decide → Act). The system autonomously decides to **Refine**, **Inject Chaos**, or **Synthesize** based on live divergence scores — no human routing required.

### 📐 2. Dialectic Math Engine
Uses `NumPy` to calculate **Shapley Values** (Game Theory) and **Information Gain** (Shannon Entropy) to objectively score text arguments — going beyond LLM sentiment into deterministic mathematical grounding.

### 😈 3. Adversarial Chaos Swarm
Automatically deploys **Chaos Agents** (Red Teaming) when low-entropy groupthink is detected. If agents start agreeing too much, the system deliberately disrupts consensus to stress-test it.

### 🛰️ 4. Semantic Grounding via Vector Evidence
Uses `Qdrant` (Vector DB) + `SearxNG` (aggregated anonymous search) to anchor every agent argument in real-world retrieved data — actively filtering out hallucinated citations before synthesis.

---

## 🛠️ Architecture Stack

### 🐍 Core Engine — Python / FastAPI
| Component | Technology |
|---|---|
| 🔄 Orchestration | `LangGraph` — Stateful cyclic graphs |
| 🤖 LLM Provider | `Google Gemini 2.0 Flash` — Primary brain |
| 📐 Math Layer | `NumPy`, `Scikit-Learn`, `NetworkX` (Eigenvector Centrality) |
| 🗄️ Mission Logs | `MongoDB` |
| ⚡ Hot Cache | `Redis` |
| 🧬 Vector Evidence | `Qdrant` |
| 🔍 Search | `SearxNG` (aggregated) + `Tavily` (fallback) |

### 🖥️ Telemetry UI — React / Vite
| Component | Technology |
|---|---|
| 🎞️ Animations | `Framer Motion` |
| 📊 Metrics | `Recharts` |
| 📡 Real-time Stream | `React-Use-Websocket` |
| 🎨 Design System | `Material UI (MUI)` + `Lucide React` — Glassmorphism Dashboard |

---

## 🧠 System Workflow — "The Brain"

```
User Prompt
    │
    ▼
🛠️  [1] CONFIGURATOR       → Analyzes prompt complexity, tunes LLM hyperparameters (Temp / Top-P)
    │
    ▼
🧠  [2] PLANNER             → Spawns 3 distinct personas (Thesis / Antithesis / Pragmatist)
    │
    ▼
🔍  [3] CONTRADICTION       → Detects logical gaps and conflicts between competing plans
    │
    ▼
🛰️  [4] RESEARCH SWARM     → Fetches vectorized real-world evidence to resolve contradictions
    │
    ▼
🧐  [5] META-CRITIC         → Grades plans based on logic adherence and evidence quality
    │
    ▼
⚡  [6] TENSION ENGINE      → Calculates Divergence Score (σ) using Shapley + Entropy math
    │
    ▼
🚦  [7] OODA ROUTER (Loop)
        ├── 🔴 High Divergence (σ > 0.8)  → 🔧 REFINER      → Force consensus, loop back
        ├── 🟡 Low Divergence  (σ < 0.4)  → 😈 CHAOS AGENT  → Break groupthink, loop back
        └── 🟢 Stable          (0.5–0.7)  → ⚗️ SYNTHESIZER   → Merge into strategic brief
    │
    ▼
⚗️  [8] SYNTHESIZER         → Final output: structured strategic brief with provenance
    │
    ▼
💾  [9] STORAGE             → Logs saved to MongoDB, vectors stored in Qdrant
```

---

## 📦 Installation & Setup

### ✅ Prerequisites
- 🐳 Docker & Docker Compose
- 🐍 Python 3.10+
- 🟢 Node.js 18+
- 🔑 Google Gemini API Key

---

### 🔧 Step 1 — Clone the Repository

```bash
git clone https://github.com/NithinAI11/cognitive-tension-engine.git
cd cognitive-tension-engine
```

---

### 🐳 Step 2 — Start Infrastructure (Databases)

```bash
cd cte_engine
docker-compose up -d
```

> 🟢 This starts **MongoDB**, **Redis**, and **Qdrant** in detached mode.
> Verify containers are running: `docker ps`

---

### 🔑 Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```env
# 🔑 Required
GEMINI_API_KEY=your_gemini_api_key_here

# 🗄️ MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB=cte_missions

# ⚡ Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# 🧬 Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333

# 🔍 Search
SEARXNG_URL=http://localhost:8080
TAVILY_API_KEY=your_tavily_key_here   # Optional fallback
```

---

### 🐍 Step 4 — Set Up Python Backend

```bash
cd cte_engine

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate         # 🐧 Linux / macOS
# venv\Scripts\activate          # 🪟 Windows

# Install dependencies
pip install -r requirements.txt

# Start the engine
python -m api.server
```

> 🟢 Backend running at `http://localhost:8000`
> 📡 WebSocket endpoint: `ws://localhost:8000/ws/analyze`

---

### 🖥️ Step 5 — Launch the Frontend UI

```bash
cd cte-ui

# Install dependencies
npm install

# Start dev server
npm run dev
```

> 🟢 UI running at `http://localhost:5173`

---

### 🚀 Step 6 — Run Your First Analysis

1. Open `http://localhost:5173` in your browser
2. Enter a complex strategic question into the **Prompt Cockpit** 🎛️
3. Watch the **Telemetry Dashboard** as agents debate in real-time 📊
4. Receive a mathematically synthesized strategic brief ⚗️

---

## ⚠️ Current Limitations

- Single LLM provider in the current prototype phase  
- Experimental scoring heuristics (math layer under active iteration)  
- Not production-hardened (no auth, rate limiting, or sandboxing yet)

---

## 🔮 Roadmap — Dynamic Neural Routing (The Real Vision)

> ⚠️ **Current State:** The system currently operates entirely on `Google Gemini 2.0 Flash` as the sole LLM provider. This is intentional — the prototype phase focuses on validating the dialectical reasoning pipeline, the OODA loop mechanics, and the math engine scoring system before introducing multi-provider complexity.

> 🚧 **Empty Modules Notice:** `openai.py`, `claude.py`, and `perplexity.py` inside `providers/` are intentionally scaffolded but not yet implemented. They are architectural placeholders representing the next evolutionary phase of CTE.

---

### 🧬 The Next Phase — Multi-Brain Dynamic Neural Routing

The core philosophy of CTE is that **no single AI model excels at everything**. The future of this system lies in the **Configurator node** autonomously assessing the *nature* of each micro-task within a reasoning cycle and routing it in real-time to the most capable model — without any human decision-making.

```
🧠 Task Nature Assessment (by Configurator)
        │
        ├── 💻 Coding / Technical       →  Route to Claude (Anthropic)
        ├── 🎨 Creative / Narrative     →  Route to Gemini 2.0
        ├── 🔢 Deep Logic / Math        →  Route to OpenAI o1 / o3
        ├── 🌐 Real-time Web Reasoning  →  Route to Perplexity
        └── ⚖️  Final Synthesis          →  Ensemble vote across all providers
```

**The end goal** is a fully self-organizing reasoning swarm where the system decides which AI brain handles which cognitive subtask based on task intensity, entropy scores, and live performance telemetry — with zero human intervention.

This evolves CTE from a multi-agent debate system into a true **heterogeneous AI ensemble** — a prototype stepping stone toward systems capable of AGI-level autonomous problem decomposition, dynamic delegation, and synthesis at scale.

---

## 👤 Author

Built by **Nithin (NithinAI11)**  
Feel free to open issues or discussions for architectural ideas and feedback.

---
> 🛠️ *Built as a conceptual prototype for autonomous dialectical AI systems.*
> 🔬 *All architectural decisions are experimental and subject to evolution.*
> 💡 *This project is an early-stage concept — the architecture is the product.*
