# ExamLens — Study Intelligence Frontend

An award-winning, cinematic frontend interface for **ExamLens**, turning lecture-board photos and past exam papers into one unified, intelligent study system.

Built for the **7th Semester Capstone Project (6 Credits, 6-Member Team)**.

---

## 1. Quick Start

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node `v22.19.0`)
- npm `v10+`

### Installation & Run
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 2. Connecting to the FastAPI Backend

ExamLens is designed **mock-first**. By default, it runs with rich, pre-loaded mock workspace data (indicated by the green `SAMPLE WORKSPACE` badge in the navigation bar).

To connect to the live Python FastAPI backend:

1. Create a `.env` file inside `frontend/`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
2. In the `backend/` directory, ensure the FastAPI server is running:
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
3. Restart the Vite dev server. The frontend API client automatically transitions from in-memory mocks to live FastAPI endpoints.

---

## 3. Design System & Aesthetic Language

- **Canvas & Panels**: Dark near-black navy canvas (`#07090D` to `#0D1117`) with 1px hairline borders (`#1F2937`) and razor-sharp corners (0–2px radius).
- **Signature Accent**: Hot red-orange (`#FF3B30`) with laser shadows and radial glows.
- **Semantic Topic Palette**: Amber (`#F59E0B`), Cyan (`#06B6D4`), Violet (`#8B5CF6`), Acid Lime (`#A3E635`), Rose (`#F43F5E`) mapped consistently across nodes, bars, heatmaps, and flashcards.
- **Typography**:
  - Headlines: *Bebas Neue* (ultra-condensed heavy display, uppercase).
  - Body: *Inter* (crisp grotesque).
  - Data & Micro-labels: *JetBrains Mono* (monospace, uppercase, tracking-wide).
- **Interactive Depth**:
  - Film grain overlay (`.bg-grain`) and blueprint dot-grid (`.bg-grid-dots`).
  - Staggered motion transitions via **Framer Motion**.
  - Interactive force-directed knowledge graph via **D3.js**.
  - Live KaTeX math rendering with copyable raw LaTeX.
  - Tactical reticle cursor tracker.

---

## 4. Live 5-Minute Demo Flow (Professor Walkthrough)

Click the **`RUN DEMO`** button in the top navigation bar to launch the guided tour with automated step captions:

1. **Board to Note Engine**:
   - Ingests board photos -> Homography perspective warp -> Glare/shadow reduction -> Region segmentation (Text / Diagram / Equation).
   - Word-level OCR confidence with amber highlights and KaTeX math formulas.
2. **Past Papers & Recurrence Patterns**:
   - Question and mark segmentation.
   - Highlights repeated questions ("asked 4x") in the 5-year recurrence heatmap matrix.
3. **Shared Topic Graph & Coverage Gaps**:
   - Force-directed topological graph linking notes and questions.
   - Flags critical gaps (Unit 4 Indexing & B-Trees has 28 historical marks but 0 lecture notes).
4. **Prioritized Study Planner**:
   - Input days left (72H) and committed hours/day -> Ranks topics by Marks per Hour of effort and injects coverage gap tasks into Day 1.
5. **Timed Mock Exam & 3D Flashcards**:
   - 90-minute live countdown timer with answer-length calibration hints.
   - 3D flip spaced-repetition flashcards with keyboard shortcuts (`Space`, `Arrows`, `G`) and Anki CSV export.

---

## 5. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+K` / `Cmd+K` | Open Command Palette (jump to pages, search, run actions) |
| `Space` | Flip 3D Flashcard |
| `←` / `→` | Navigate previous / next Flashcard |
| `G` | Toggle "Got it" / Mastered status on active Flashcard |
| `Esc` | Close active modal or overlay |

---

## 6. Screenshot Checklist for Project Report

Capture the following screens for the final project submission and slide deck:

- [ ] **1. Board Overview (`/`)**:
  - Faded `72H` countdown watermark ticking live.
  - Red marquee ticker banner.
  - 8-stage pipeline architecture strip.
  - Bento cards showing Lecture 14 capture and high-yield priority rankings.

- [ ] **2. Ingestion & Vision Studio (Upload Modal)**:
  - Interactive Before/After slider with raw tilted board photo vs de-glared 300 DPI rectified image.
  - Animated quadrilateral contour corner detection pins.
  - Colored bounding box region toggles (Cyan = Text, Red = Equation, Lime = Diagram).
  - Live stage logs console.

- [ ] **3. Structured Notes & OCR Confidence (`/notes`)**:
  - Vertical lecture timeline with large red lecture badges (`LEC 14`, `LEC 16`, `LEC 11`).
  - Word-by-word OCR confidence rendering with amber low-confidence flags.
  - Inline correction popover with struck-old vs lime-new diff view.
  - KaTeX math equation display with "Copy LaTeX" toggle.

- [ ] **4. Insights & Recurrence Heatmap (`/insights`)**:
  - Syllabus coverage segmented progress bar.
  - Study priority leaderboard with animated bars (`PRIORITY = MARKS / EFFORT`).
  - 5-year question recurrence matrix table with streak badges.
  - Coverage gap alert with "Create study task in Planner" button.

- [ ] **5. Force-Directed Topic Graph (`/graph`)**:
  - D3.js interactive node-link graph with nodes sized by marks weight.
  - Dashed red ring for uncovered syllabus gap (Unit 4).
  - Slide-out inspector drawer showing connected questions and notes.

- [ ] **6. Prioritized Study Planner (`/planner`)**:
  - Days remaining and hours/day interactive range sliders.
  - Day-by-day task breakdown with `NOW`, `NEXT`, and `LATER` status pills.
  - Checkable task completion with real-time marks tally.
  - "NOTES MISSING" warning tags.

- [ ] **7. Timed Mock Paper (`/mock`)**:
  - 90-minute exam countdown clock with start/pause controls.
  - Marks distribution mini-chart.
  - Live word count vs recommended answer length badge.
  - Sample answer key toggle.

- [ ] **8. 3D Spaced-Repetition Flashcards (`/cards`)**:
  - 3D perspective flip card showing front question and back answer.
  - "Asked 4x in past papers" badge.
  - Linked past exam question citation.
  - Retention progress bar and Anki CSV export modal.
