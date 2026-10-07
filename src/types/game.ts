export interface Clue {
  id: string;
  value: number; // 200, 400, 600, 800, 1000
  clue: string;
  answer: string; // Canonical display answer
  acceptedAnswers: string[]; // Aliases, misspellings, surnames only
  explanation?: string;
  isDailyDouble?: boolean;
  airDate?: string;
}

export interface Category {
  id: string;
  title: string;
  commentary?: string;
  airDate?: string;
  era?: string; // e.g. "1980s", "1990s", "2000s", "2010s", "2020s"
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
    explanation?: string;
    airDate?: string;
  };
}

export type GameMode = 'daily' | 'classic' | 'two-player' | 'custom';

export type ClueStatus = 'unopened' | 'active' | 'correct' | 'incorrect' | 'passed';

export type PlayerId = 'player1' | 'player2';

export interface Player {
  id: PlayerId;
  name: string;
  score: number;
  buzzedAt?: number;
  hasAttempted?: boolean;
}

export interface DailyDropStats {
  lastPlayedDate: string | null;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  wins: number;
  totalEarnings: number;
  dailyResults: Record<
    string,
    {
      score: number;
      cluesAttempted: number;
      cluesCorrect: number;
      highValueSnags: number; // $800 or $1000 clues correct
      finalJeopardyCorrect: boolean;
      emojiGrid: string;
      completedAt: string;
    }
  >;
}

export interface AnswerValidationResult {
  isCorrect: boolean;
  similarity: number;
  matchedAnswer?: string;
  cleanedInput: string;
  reason: string;
}

export interface TwoPassGenerationPass1 {
  categoryTitle: string;
  commentary?: string;
  clues: {
    value: number;
    clue: string;
    answer: string;
    acceptedAnswers: string[];
    explanation?: string;
  }[];
}

export interface TwoPassGenerationPass2 {
  auditNotes: string[];
  refinementsMade: string[];
  finalCategory: Category;
}
