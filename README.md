# The Board Room

An authentic, retro-styled *Jeopardy!*-inspired trivia web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

---

## 🌟 Key Features & Game Modes

### 1. 📅 Daily Drop Mode (Wordle Model)
- **Deterministic Calendar Board:** A single seeded board generated for each calendar day using a `YYYY-MM-DD` date hash algorithm (e.g., `2026-10-07`).
- **Streak & Performance Tracking:** Automatically stores current streak, longest streak, career earnings, win rate, and historical scores in `localStorage`.
- **Spoiler-Free Emoji Share Grid:** Generates an emoji score summary ready to copy and share:
  ```
  The Board Room — Daily Drop 2026-10-07
  💰 $14,200 | 22/25 Clues | 🔥 Streak: 5
  🟩🟩🟩🟩🟩
  🟩🟩🟥🟩🟩
  🟩🟩🟩🟩🟩
  🟩🟥🟩🟩🟩
  🟩🟩🟩🟩🟩
  Final: 🏆 Correct
  Play: https://theboardroom.game
  ```

### 2. 🏛️ Classic Mode (J-Archive Vault)
- **50+ Curated Historic Categories:** Spans five decades (1980s through 2020s) with authentic trivia across Shakespeare, World Capitals, Presidential Nicknames, The Periodic Table, 80s Pop Music, Ancient Civilizations, 19th Century Novels, Opera, and more.
- **Random Board Deal:** Deals 5 Single Jeopardy categories ($200 to $1000) with 1 designated Daily Double, plus 1 Final Jeopardy clue.
- **Preserved Difficulty Curves:** Accessible $200 entry points up to deep-cut $1000 questions.

### 3. 🤖 Two-Pass AI Category Generator (`/api/generate-category`)
- **Pass 1 (The Clue Writer):** Takes any topic prompt and drafts 5 strictly tiered clues ($200 to $1000) with canonical answers, accepted aliases, and factoids.
- **Pass 2 (The Fact-Checker / Judge):** A second model pass that audits the JSON for ambiguity, verifies that all alternative interpretations and surnames are included in `acceptedAnswers`, and refines clue phrasing.
- **Zero-Dependency Fallback:** Works seamlessly with Google Gemini API, OpenAI API, or the built-in procedural knowledge generator if no external API key is provided.

### 4. 🛋️ Two-Player Buzzer (Couch Co-Op Mode)
- **Hardware Lockout System:**
  - **Player 1:** `A` key
  - **Player 2:** `L` key
- **5-Second Countdown Window:** The first contestant to buzz locks out the opponent and gets 5 seconds to answer.
- **Rebound Mechanism:** If the first player answers incorrectly, points are deducted and a 5-second rebound window opens for Player 2 to steal!

---

## 🔊 Audio & Speech Engines

### Procedural Web Audio API Synthesizer
Zero external audio file dependencies. All sound effects are generated mathematically in real time:
- **Board Reveal Cascade:** Arpeggiated C-major chime sequence.
- **Clue Select:** Crisp digital ping.
- **Daily Double Fanfare:** Four-chord triumphant brass synth fanfare.
- **Lockout Buzzer:** Aggressive 220Hz sawtooth game show lockout buzz.
- **Times Up / Triple Stumper:** Iconic three descending staccato buzzes.
- **Right Answer Chime:** Triumphant two-tone bell chime.
- **Wrong Answer Thud:** Low descending distortion buzz.
- **Final Jeopardy Think Music:** Synthesized 30-second marimba recreation with ticking percussive clock and concluding orchestral gong.

### Web Speech API Host Synthesis
- Synthesized speech host reads clues aloud with natural broadcast inflection.
- Clue reading is automatically interrupted when a player buzzes in.
- Toggle voice on/off or click to skip speech anytime.

---

## 🎯 Smart Validation & Typo Tolerance

Powered by `fast-levenshtein`:
1. **Canonical Preamble Removal:** Automatically strips question phrasing (*"What is"*, *"Who was"*, *"Where are"*, *"Is it"*, etc.) and leading articles (*"The"*, *"A"*, *"An"*).
2. **Surname Match:** Accepts surnames for people (*"Lincoln"* for *"Abraham Lincoln"*, *"Curie"* for *"Marie Curie"*).
3. **Typo Tolerance:** Allows 1–2 edit distances for longer words while strictly requiring exact precision for short words.
4. **Judges' Ruling Override:** Contestants can click *"Judges' Override"* on any clue to overturn decisions on contested trivia answers.

---

## 📐 Data Schema

```typescript
export interface Clue {
  id: string;
  value: number; // 200, 400, 600, 800, 1000
  clue: string;
  answer: string; // Canonical display answer
  acceptedAnswers: string[]; // Aliases, misspellings, surnames only
  explanation?: string;
  isDailyDouble?: boolean;
}

export interface Category {
  id: string;
  title: string;
  commentary?: string;
  clues: Clue[];
}

export interface BoardState {
  id: string;
  date?: string;
  title?: string;
  categories: Category[];
  finalJeopardy: {
    category: string;
    clue: string;
    answer: string;
    acceptedAnswers: string[];
  };
}
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the test suite
npm run test:suite

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
