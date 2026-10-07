import { BoardState, Category, ClueStatus, DailyDropStats } from '@/types/game';
import { CLASSIC_CATEGORIES, FINAL_JEOPARDY_VAULT } from '@/data/classic-vault';

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a numeric seed from a YYYY-MM-DD string
 */
export function hashDateString(dateStr: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a deterministic daily board for a given YYYY-MM-DD date string
 */
export function generateDailyBoard(dateStr: string = getTodayDateString()): BoardState {
  const seed = hashDateString(dateStr);
  const random = mulberry32(seed);

  // Shuffle categories pool deterministically
  const pool = [...CLASSIC_CATEGORIES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick 5 categories for the daily board
  const selectedCategories: Category[] = pool.slice(0, 5).map((cat) => ({
    ...cat,
    clues: cat.clues.map((clue) => ({ ...clue, isDailyDouble: false })),
  }));

  // Pick one clue across the board to be the Daily Double (preferably value 600, 800, or 1000)
  const ddCatIdx = Math.floor(random() * selectedCategories.length);
  const eligibleClueIdxs = [2, 3, 4]; // $600, $800, or $1000
  const ddClueIdx = eligibleClueIdxs[Math.floor(random() * eligibleClueIdxs.length)];
  if (selectedCategories[ddCatIdx]?.clues[ddClueIdx]) {
    selectedCategories[ddCatIdx].clues[ddClueIdx].isDailyDouble = true;
  }

  // Deterministically select Final Jeopardy clue
  const fjIdx = Math.floor(random() * FINAL_JEOPARDY_VAULT.length);
  const fjItem = FINAL_JEOPARDY_VAULT[fjIdx];

  return {
    id: `daily-${dateStr}`,
    date: dateStr,
    title: `DAILY DROP — ${dateStr}`,
    categories: selectedCategories,
    finalJeopardy: {
      category: fjItem.category,
      clue: fjItem.clue,
      answer: fjItem.answer,
      acceptedAnswers: fjItem.acceptedAnswers,
      explanation: fjItem.explanation,
      airDate: fjItem.airDate,
    },
  };
}

/**
 * Generates a random board for Classic Mode (5 random categories + 1 Final Jeopardy)
 */
export function generateClassicBoard(): BoardState {
  const pool = [...CLASSIC_CATEGORIES];
  // Fisher-Yates random shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selectedCategories: Category[] = pool.slice(0, 5).map((cat) => ({
    ...cat,
    clues: cat.clues.map((clue) => ({ ...clue, isDailyDouble: false })),
  }));

  // Assign one Daily Double
  const ddCatIdx = Math.floor(Math.random() * selectedCategories.length);
  const ddClueIdx = 2 + Math.floor(Math.random() * 3); // index 2, 3, or 4
  if (selectedCategories[ddCatIdx]?.clues[ddClueIdx]) {
    selectedCategories[ddCatIdx].clues[ddClueIdx].isDailyDouble = true;
  }

  const fjIdx = Math.floor(Math.random() * FINAL_JEOPARDY_VAULT.length);
  const fjItem = FINAL_JEOPARDY_VAULT[fjIdx];

  const now = new Date();
  const id = `classic-${now.getTime()}`;

  return {
    id,
    title: 'CLASSIC ARCHIVE VAULT',
    categories: selectedCategories,
    finalJeopardy: {
      category: fjItem.category,
      clue: fjItem.clue,
      answer: fjItem.answer,
      acceptedAnswers: fjItem.acceptedAnswers,
      explanation: fjItem.explanation,
      airDate: fjItem.airDate,
    },
  };
}

const DAILY_STATS_KEY = 'the_board_room_daily_stats_v1';

export function getStoredDailyStats(): DailyDropStats {
  if (typeof window === 'undefined') {
    return {
      lastPlayedDate: null,
      currentStreak: 0,
      maxStreak: 0,
      gamesPlayed: 0,
      wins: 0,
      totalEarnings: 0,
      dailyResults: {},
    };
  }

  try {
    const raw = localStorage.getItem(DAILY_STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load daily stats from localStorage:', err);
  }

  return {
    lastPlayedDate: null,
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    wins: 0,
    totalEarnings: 0,
    dailyResults: {},
  };
}

export function saveStoredDailyStats(stats: DailyDropStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save daily stats to localStorage:', err);
  }
}

/**
 * Generates an emoji grid string representing the board results
 */
export function generateEmojiGrid(
  board: BoardState,
  clueStatuses: Record<string, ClueStatus>
): string {
  const rows: string[] = [];
  const numRows = 5; // values $200, $400, $600, $800, $1000

  for (let r = 0; r < numRows; r++) {
    let rowStr = '';
    for (let c = 0; c < board.categories.length; c++) {
      const clue = board.categories[c]?.clues[r];
      if (!clue) {
        rowStr += '⬛';
        continue;
      }
      const status = clueStatuses[clue.id] || 'unopened';
      if (status === 'correct') {
        rowStr += '🟩';
      } else if (status === 'incorrect') {
        rowStr += '🟥';
      } else if (status === 'passed') {
        rowStr += '🟨';
      } else {
        rowStr += '⬛';
      }
    }
    rows.push(rowStr);
  }

  return rows.join('\n');
}

/**
 * Generates the spoiler-free share text for Daily Drop
 */
export function generateDailyShareText(params: {
  dateStr: string;
  score: number;
  totalClues: number;
  correctClues: number;
  highValueSnags: number;
  finalJeopardyStatus: 'correct' | 'incorrect' | 'skipped' | 'unplayed';
  emojiGrid: string;
  streak: number;
}): string {
  const formattedScore = params.score >= 0 ? `$${params.score.toLocaleString()}` : `-$${Math.abs(params.score).toLocaleString()}`;
  const finalEmoji = params.finalJeopardyStatus === 'correct' ? '🏆 Correct' : params.finalJeopardyStatus === 'incorrect' ? '❌ Missed' : '⏭️ Skipped';

  return `The Board Room — Daily Drop ${params.dateStr}
💰 ${formattedScore} | ${params.correctClues}/${params.totalClues} Clues | 🔥 Streak: ${params.streak}
${params.emojiGrid}
Final Jeopardy: ${finalEmoji}
Play today's board: https://theboardroom.game`;
}
