# 🌌 Hamun & Fatuha Saga: The Ammari Nexus (V7 / API V6.0)

[![Status: Immortal](https://img.shields.io/badge/Status-Immortal-gold?style=for-the-badge&logo=probot)](/)
[![Version: 7](https://img.shields.io/badge/Web_Version-7-cyan?style=for-the-badge)](/)
[![API: 6.0](https://img.shields.io/badge/API_Version-6.0-blueviolet?style=for-the-badge)](/)
- **PWA:** Ready
- **Author:** Ammar
- **License:** GNU GPLv3

> *"In the depths of the Ammari Galaxy, words are more than just ink—they are the blueprints of destiny."*


Welcome to the **Hamun & Fatuha Saga**, an immersive storytelling platform and lore-rich web application. This project is a sophisticated digital archive for the epic struggle between the dynasties of Mercy (Hamun), Power (Fatuha), and Mind (Ententooth). 

Built with a focus on deep immersion, the platform features a custom-built lore engine, an extensive RESTful API, and a Progressive Web App (PWA) architecture for seamless reading across the cosmos.

---

## 📜 Table of Contents
1. [🌟 Project Overview](#-project-overview)
2. [✨ Core Features](#-core-features)
3. [🛠 Technology Stack](#-technology-stack)
4. [📂 Project Structure](#-project-structure)
5. [🚀 Getting Started](#-getting-started)
6. [📖 Lore System (Keyword Engine)](#-lore-system-keyword-engine)
7. [📡 The Nexus API (V6.0)](#-the-nexus-api-v60)
8. [📱 Progressive Web App (PWA)](#-progressive-web-app-pwa)
9. [🎨 UI/UX Design Philosophy](#-uiux-design-philosophy)
10. [🌩 Deployment](#-deployment)
11. [🐍 Data Processing (Python)](#-data-processing-python)

---

## 🌟 Project Overview

The **Hamun & Fatuha Saga** is a two-season epic containing over 80 parts of detailed narrative. The website serves as a portal into this universe, allowing users to:
- **Read** the chronicles of the Ammari Galaxy.
- **Interact** with the lore via an intelligent keyword-tooltip system.
- **Track** the cosmic release schedule.
- **Consume** data programmatically via a massive API surface.

### Seasons
- **Season 1: Conflict of Dynasties: Dawn of the Ammari Galaxy** (50 Episodes)
  - *Theme:* The search for "The Covenant" (Al-Mithaq) and the beginning of the eternal struggle.
- **Season 2: Ammari Galaxy: Flood of Slumber** (30 Episodes)
  - *Theme:* The Great Slumber that threatens the survival of the galaxy.

---

## ✨ Core Features

### 📖 Immersive Reading Experience
- **Surgical EJS Templates:** Clean, readable, and beautifully styled story pages.
- **Auto-Progress Tracking:** Uses `localStorage` to remember where the reader left off in each season.
- **Navigation:** Next/Previous buttons and a quick-jump sidebar for all episodes.

### 🧠 Intelligent Lore Engine
- **Keyword Highlighting:** Automatically detects important terms (Characters, Locations, Artifacts) and highlights them.
- **Contextual Tooltips:** Hovering over a keyword reveals its definition and historical significance without leaving the page.
- **Sorted Matching:** An advanced regex-based replacement system that handles overlapping keywords (longest match first) to prevent broken HTML.

### 📅 Release Schedule Tracking
- Reads from a flat-file database (`videosrealses.txt`) to dynamically display release dates and status for every episode.

### 📶 Offline Persistence
- **Service Worker:** Full PWA support allowing for offline reading.
- **Manifest:** Installable as a standalone app on Android, iOS, and Desktop.

---

## 🛠 Technology Stack

### Backend
- **Node.js & Express:** Core server logic and routing.
- **Serverless-HTTP:** Optimized for deployment on Netlify Functions.
- **EJS (Embedded JavaScript Templates):** Server-side rendering for high SEO performance and speed.

### Frontend
- **Vanilla CSS3:** Custom-built "Ritual" design system with CSS variables for easy theming.
- **Vanilla JavaScript:** Light-weight interactions and progress tracking.
- **PWA Technologies:** Manifest.json and Service Workers.

### Data & Scripting
- **JSON:** Lore data and keyword mapping.
- **Python 3:** Automated keyword extraction and frequency analysis scripts.
- **Flat-File DB:** Optimized reading from `.txt` and `.json` files for high-speed delivery.

---

## 📂 Project Structure

```bash
/
├── data/               # 🗄 Core Database (JSON, TXT)
│   ├── season1/        # S1 Episode Texts
│   ├── season2/        # S2 Episode Texts
│   ├── covers/         # Season Posters
│   ├── keywords.json   # Lore Dictionary
│   └── videosrealses.txt # Release Schedule
├── functions/          # 🌩 Serverless Logic
│   └── server.js       # Express App & API Nexus
├── public/             # 🌐 Static Assets
│   ├── css/            # Style Rituals
│   ├── js/             # Client Logic
│   ├── sw.js           # PWA Service Worker
│   └── manifest.json   # PWA Manifest
├── views/              # 🖼 EJS Templates
│   ├── index.ejs       # Home Portal
│   ├── episode.ejs     # Story View
│   ├── season.ejs      # Season Archive
│   ├── schedule.ejs    # Release Tracking
│   └── api_docs.ejs    # API Documentation
├── extract_keywords.py # 🐍 Python Lore Extractor
├── netlify.toml        # ⚙️ Deployment Config
├── package.json        # 📦 Dependencies
└── README.md           # 📍 You are here
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.x (for keyword processing)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AmmarBasha2011/Hamun-and-Fatoha-Story-Website.git
   cd Hamun-and-Fatoha-Story-Website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the portal at `http://localhost:3000`.

---

## 📖 Lore System (Keyword Engine)

The lore system is powered by `data/keywords.json`. 
When a story page is rendered, the server:
1. Loads all keywords.
2. Sorts them by length (longest first).
3. Executes a lookbehind/lookahead regex to replace terms with `<span class="keyword">` tags.
4. Injecting tooltips for an interactive experience.

**Sample Keyword Entry:**
```json
"همون": "الملك المؤسس لراية الرحمة، يمثل الجانب الروحي والأخلاقي في الملحمة."
```

---

## 📡 The Nexus API (V6.0)

The project includes an extensive RESTful API with over **50 endpoints** for third-party integration and mobile apps.

### Base URL: `/api/v1/`

#### 🗝 Key Endpoints:
- `GET /api/v1/health`: System health status.
- `GET /api/v1/seasons`: List all seasons with metadata.
- `GET /api/v1/seasons/:id/episodes`: Full episode list for a season.
- `GET /api/v1/content/raw/:season/:id`: Get the raw text of an episode.
- `GET /api/v1/keywords/random`: Fetch a random lore entry.
- `GET /api/v1/search/total?q=...`: Global search across episodes and lore.
- `GET /api/v1/stats/lore-density`: Get insights into keyword frequency.

#### 📘 API Documentation
Full interactive documentation is available at the `/api-docs` route of the application.

---

## 📱 Progressive Web App (PWA)

The application is fully PWA-compliant.
- **Offline Reading:** Episodes are cached locally by the Service Worker.
- **Mobile First:** The UI is designed to feel like a native e-reading app.
- **Add to Home Screen:** Features a custom icon and splash screen.

---

## 🎨 UI/UX Design Philosophy

The website uses two primary visual themes:
1. **Obsidian Ancient:** Deep blacks, gold accents, and runic borders (Used for Season 1).
2. **Cosmic Neon:** Cyber-blue glows and starfield backgrounds (Used for Season 2).

### Design Tokens:
- **Font:** `Amiri` for Arabic titles, `Roboto` for English text.
- **Glows:** `0 0 20px var(--accent-glow)` for a mystical feel.
- **Transitions:** `var(--t-ritual)` for smooth, high-end interactions.

---

## 🌩 Deployment

The project is optimized for **Netlify**.
- **Serverless Hosting:** The Express app runs as a single Netlify Function.
- **Static Assets:** CSS, JS, and Images are served via Netlify's high-speed CDN.
- **Automatic Build:** `package.json` scripts handle the deployment lifecycle.

---

## 🐍 Data Processing (Python)

The `extract_keywords.py` script is a utility for the author:
- **Analysis:** Scans all episode texts for recurring Proper Nouns.
- **Filtering:** Uses a custom "stop words" list for Arabic.
- **Mapping:** Generates or updates the `keywords.json` file to ensure the lore archive stays synced with the story.

To update keywords:
```bash
python3 extract_keywords.py
```

---

## 📜 License
This project is licensed under the GNU GPLv3 License. 

**Developed by Ammar.**
*"Words endure longer than stars."*
