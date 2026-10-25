# NIHON (日本) — AI-Powered Cross-Cultural Japan Travel Companion

[![Hackathon](https://img.shields.io/badge/Hackathon-Thapar_Japan_Hackathon_2026-CF3A24?style=for-the-badge&logo=target)](https://thapar.edu)
[![Organized By](https://img.shields.io/badge/Organized_By-TSLAS,_Thapar_University-1C1917?style=for-the-badge)](https://thapar.edu)
[![Challenge](https://img.shields.io/badge/Challenge_Track-Hakuhodo_Inc._(博報堂)-B43B32?style=for-the-badge)](https://www.hakuhodo-global.com)
[![Team](https://img.shields.io/badge/Team-HackHers-7C3AED?style=for-the-badge)](https://github.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

> **Empowering Indian & international travelers to explore Japan with zero cultural anxiety, effortless dietary navigation, and authentic discovery.**

---

## 📌 Hackathon & Problem Statement Context

* **Event**: **Thapar Japan Hackathon**
* **Organized by**: **TSLAS (Thapar School of Liberal Arts and Sciences), Thapar University, Patiala**
* **Sponsor & Challenge Partner**: **Hakuhodo Inc. (博報堂)**
* **Team**: **HackHers** (4 Participants)

### 🎯 The Hakuhodo Challenge
**Hakuhodo Inc.**, one of Japan's leading integrated marketing and innovation companies, presented a core challenge centered around **human-centric cross-cultural interaction**:

> *"How can digital technology and human-centric design eliminate the behavioral, dietary, and linguistic barriers faced by international tourists—particularly from culturally rich countries like India—when exploring Japan, while deepening respect for authentic Japanese heritage and traditions?"*

### ⚠️ The Problem Faced by Travelers
Traveling to Japan is a dream for thousands of Indian tourists and students, yet they confront significant hurdles:
1. **Severe Dietary Anxiety**: 40%+ of Indian travelers adhere to Vegetarian, Jain, or Halal diets. In Japan, hidden animal products—such as *dashi* (bonito fish broth), pork gelatin, and animal-derived emulsifiers—are pervasive even in seemingly harmless vegetable or noodle dishes. Kanji packaging makes label reading daunting.
2. **Linguistic & Communication Gap**: English proficiency remains low in traditional towns, izakayas, and local railway stations. Translation apps often lack contextual nuance, phonetic guides, or culturally polite honorifics (*keigo*).
3. **Complex Transit & Itinerary Logistics**: Balancing multi-city bullet trains (Shinkansen), seasonal travel timings (Sakura vs. Autumn foliage), and geographically clustered daily plans without overspending is intimidating.
4. **Cultural Faux Pas Anxiety**: Unfamiliarity with nuanced social norms (onsen rules, chopstick taboos, temple bowing, and silent train etiquettes) creates apprehension.

### 💡 Our Solution: NIHON (日本)
**NIHON** is an all-in-one AI companion engineered specifically to bridge these gaps. It provides **real-time dietary scanning**, **smart localized itinerary planning with realistic Yen budget modeling**, **two-way speech and contextual phrase translation**, and **interactive etiquette guides** wrapped in an authentic, high-end Japanese aesthetic.

---

## 👥 Team Details — HackHers

| Avatar | Member | Role | Focus Areas | Contact / GitHub |
| :---: | :--- | :--- | :--- | :--- |
| 🌸 | **Participant 1** | **Team Lead & Full-Stack Architect** | System design, Supabase integration, React routing, state sync | [@github-handle](https://github.com) |
| ⛩️ | **Participant 2** | **Frontend & UI/UX Specialist** | Japanese visual design system, CSS styling, Responsive layouts | [@github-handle](https://github.com) |
| 🍜 | **Participant 3** | **Backend & AI Engineer** | FastAPI microservices, OCR parsing pipeline, Translation APIs | [@github-handle](https://github.com) |
| 🚅 | **Participant 4** | **Cultural Researcher & QA Lead** | Dietary taxonomy, Japanese linguistic validation, Etiquette engine | [@github-handle](https://github.com) |

---

## 🌟 Key Features

### 1. 🔍 AI Food Scanner & Dietary Detective (`/foodScanner`)
* **Label & Menu OCR**: Upload or snap photos of Japanese food packaging, supermarket bento labels, or restaurant menus.
* **Hidden Ingredient Detection**: Automatically highlights hidden animal derivatives (*katsuobushi*, chicken extract, mirin alcohol, pork gelatin).
* **Dietary Badges**: Instant classification for **Pure Vegetarian**, **Jain** (no root vegetables/onion/garlic), **Vegan**, **Halal-friendly**, and allergens (Dairy, Gluten, Soy, Peanuts).
* **Bilingual Dining Cards**: Generates ready-to-show Japanese flashcards (`私はベジタリアンです` - "I am a vegetarian") explaining exact restrictions politely to chefs.

### 2. 🗺️ Personalized Journey Planner & PDF Export (`/itineraryPlanner`)
* **Dynamic Generation**: Tailors multi-day travel plans according to duration (3–14 days), travel party (Solo, Couple, Family, Friends), budget tier, and travel pace (Relaxed vs. Explorer).
* **Geographic Clustering**: Groups sights by district (e.g., Asakusa + Ueno in Tokyo; Arashiyama + Kinkaku-ji in Kyoto) to prevent transit fatigue.
* **Yen (¥) Expense Estimator**: Transparent budget calculation broken down into Food, Transit, and Attractions.
* **1-Click PDF Export**: Clean, high-resolution PDF download for offline travel without roaming data.

### 3. 🗣️ Contextual Japanese Translator (`/translator`)
* **Dual-Direction Translation**: English ⇄ Japanese text with furigana/hiragana, Kanji, and Latin Romaji pronunciation.
* **Audio Pronunciation**: Text-to-speech engine to listen to native Japanese cadence.
* **Situational Phrasebooks**: Pre-compiled survival phrases for Convenience Stores (*Konbini*), JR Shinkansen, Medical Emergencies, and Taxi navigation.

### 4. ⛩️ Cultural Etiquette & Destination Showcase
* **Interactive Etiquette Engine**: Quick visual guides for Onsens (tattoos, towel rules), Shrines & Temples (purification fountain rituals, coin offering), and Dining (chopstick placement).
* **Seasonal Explorer**: Curated seasonal insights across Spring (Sakura), Summer (Matsuri), Autumn (Koyo), and Winter (Snow festivals) across Tokyo, Kyoto, Osaka, Hokkaido, Nara, and Hiroshima.

### 5. ⚡ Fast Hackathon Review & Authentication (`/login`)
* **1-Click Demo Sign-In**: Instant evaluator login with pre-populated demo traveler profile (*Arjun Sharma*) to test saved itineraries and preferences instantly.
* **Supabase Auth**: Secure email/password login as well as Google & Apple OAuth support.

---

## 💻 Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & Design System**| Custom Vanilla CSS, Modern Design Tokens, TailwindCSS 4, Lucide React Icons |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, Starlette |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, OAuth 2.0) |
| **Document Export** | html2pdf.js / jsPDF for client-side itinerary export |
| **Data Validation** | Pydantic v2, Python-dotenv |

---

## 🚀 Quickstart & Local Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org))
* **Python**: v3.10 or higher ([Download Python](https://python.org))
* **Git**: Installed and available in PATH

---

### 2. Clone Repository
```bash
git clone https://github.com/your-username/nihon-japan-companion.git
cd nihon-japan-companion
```

---

### 3. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   *(A pre-configured environment is included for local hackathon testing)*

5. Start the backend server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   * Server runs at: `http://localhost:8000`
   * Interactive Swagger API Docs: `http://localhost:8000/docs`

---

### 4. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   * Open your browser at: `http://localhost:5173`

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check & service status |
| `POST` | `/food-scanner/scan-image` | Upload food label image for OCR & ingredient safety analysis |
| `GET` | `/food-scanner/dietary-cards` | Retrieve printable Japanese allergy/dietary flashcards |
| `POST` | `/translate` | Two-way English ↔ Japanese text translation with Romaji |
| `GET` | `/preferences` | Fetch authenticated user's travel preferences & saved trips |
| `POST` | `/preferences` | Save or update custom itinerary configuration |

---

## 📂 Project Structure

```text
NIHON/
├── .gitignore                   # Comprehensive Node/Python git ignore
├── README.md                    # Project documentation
├── requirements.txt             # Root Python requirements
├── backend/                     # FastAPI Backend Microservice
│   ├── .env.example             # Backend environment template
│   ├── main.py                  # Server entry point & CORS configuration
│   ├── requirements.txt         # Backend Python dependencies
│   ├── database.py              # Supabase client connector
│   ├── schemas.py               # Pydantic data schemas
│   └── routers/                 # Modular API route controllers
│       ├── auth.py              # Auth endpoints
│       ├── food_scanner.py      # OCR & dietary analysis engine
│       ├── preferences.py       # User itineraries & preferences
│       ├── translate.py         # Bilingual translation router
│       └── voicebridge.py       # Audio/Voice bridge module
└── frontend/                    # React 19 + Vite Frontend Application
    ├── .env.example             # Frontend environment template
    ├── package.json             # NPM dependencies & scripts
    ├── vite.config.ts           # Vite configuration
    ├── index.html               # Single page application entry
    └── src/
        ├── main.jsx             # React DOM root & route definitions
        ├── index.css            # Base typography & design tokens
        ├── components/japan/    # Modular Japan-themed UI components
        │   ├── Nav.tsx          # Unified navigation bar
        │   ├── Hero.tsx         # Hero section & CTA buttons
        │   ├── Experience.tsx   # Curated destination cards
        │   └── Footer.tsx       # Cultural footer component
        └── pages/               # Application view controllers
            ├── Home.tsx         # Main landing view
            ├── Planner.jsx      # Step-by-step trip builder
            ├── ItineraryDetails.jsx # Day-by-day schedule & PDF export
            ├── FoodExplorer.jsx # AI Food Scanner & ingredient detective
            ├── Translator.tsx   # Live translator & phrasebook
            └── Auth.jsx         # Sign in modal with 1-click judge demo
```

---

## 🔮 Future Roadmap

- [ ] **Real-time Camera AR Lens**: Live camera overlay that translates Japanese shelf labels directly in augmented reality.
- [ ] **IC Card (Suica/Pasmo) Balance Reader**: NFC integration to read transit card balances directly from travelers' phones.
- [ ] **AI Smart Rerouting**: Dynamic itinerary adjustment based on live weather forecasts (e.g., suggesting indoor museums on rainy days).
- [ ] **Offline PWA Support**: Complete offline caching of itineraries and emergency phrase audio files.

---

## 🎌 Acknowledgments

We would like to express our heartfelt gratitude to:
* **Hakuhodo Inc. (博報堂)** for crafting an inspiring, real-world cross-cultural challenge statement.
* **TSLAS (Thapar School of Liberal Arts and Sciences)** and **Thapar University, Patiala** for hosting the **Thapar Japan Hackathon**.
* Mentors, organizers, and faculty coordinators for continuous guidance and feedback.

---

<p align="center">
  <b>Built with ❤️ by Team HackHers</b><br/>
  <i>Thapar Japan Hackathon 2026 · TSLAS Thapar University, Patiala</i>
</p>
