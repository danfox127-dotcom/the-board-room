import { create } from 'zustand';
import {
  BoardState,
  Category,
  Clue,
  ClueStatus,
  DailyDropStats,
  GameMode,
  Player,
  PlayerId,
} from '@/types/game';
import {
  generateDailyBoard,
  generateClassicBoard,
  getStoredDailyStats,
  saveStoredDailyStats,
  getTodayDateString,
  generateEmojiGrid,
} from '@/lib/daily-drop';
import { retroAudio } from '@/lib/audio';
import { hostSpeech } from '@/lib/speech';

interface GameState {
  // Mode & Board
  mode: GameMode;
  board: BoardState | null;
  clueStatuses: Record<string, ClueStatus>;

  // Scores
  singleScore: number;
  players: Record<PlayerId, Player>;

  // Active Clue Modal
  activeClue: Clue | null;
  activeCategory: Category | null;
  isClueModalOpen: boolean;

  // Daily Double
  isDailyDoubleModalOpen: boolean;
  dailyDoubleWager: number;

  // Two Player Buzzer Lockout
  buzzerState: 'idle' | 'open' | 'player1_active' | 'player2_active' | 'rebound_active' | 'expired';
  activeBuzzerPlayer: PlayerId | null;
  buzzerTimeRemaining: number;
  playerAttempted: Record<PlayerId, boolean>;

  // Final Jeopardy
  isFinalJeopardyModalOpen: boolean;
  finalJeopardyPhase: 'wager' | 'think' | 'reveal' | 'recap';
  finalJeopardyWagers: Record<string, number>;
  finalJeopardyAnswers: Record<string, string>;
  finalJeopardyResults: Record<string, boolean>;

  // Daily Stats & History
  dailyStats: DailyDropStats;
  todayDateStr: string;

  // Audio & Settings
  soundMuted: boolean;
  soundVolume: number;
  speechEnabled: boolean;
  crtScanlines: boolean;
  aiApiKey: string;
  aiProvider: 'gemini' | 'openai';

  // Game Progress
  completedCluesCount: number;
  totalCluesCount: number;
  isGameOver: boolean;

  // Actions
  initGame: (mode: GameMode, customBoard?: BoardState) => void;
  openClue: (category: Category, clue: Clue) => void;
  closeClueModal: () => void;
  submitAnswer: (userAnswer: string, isCorrect: boolean, overridePlayer?: PlayerId) => void;
  passClue: () => void;
  overrideJudgeDecision: (isCorrect: boolean) => void;

  // Daily Double Actions
  setDailyDoubleWager: (wager: number) => void;
  proceedFromDailyDoubleModal: () => void;

  // Buzzer Actions (Two-player)
  buzzIn: (player: PlayerId) => void;
  openBuzzer: () => void;
  tickBuzzerTimer: (delta: number) => void;

  // Final Jeopardy Actions
  startFinalJeopardy: () => void;
  submitFinalWager: (playerId: string, wager: number) => void;
  revealFinalClue: () => void;
  submitFinalAnswer: (playerId: string, answer: string, isCorrect: boolean) => void;
  finishFinalJeopardy: () => void;

  // Settings Actions
  setSoundMuted: (muted: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setSpeechEnabled: (enabled: boolean) => void;
  setCRTScanlines: (enabled: boolean) => void;
  setAIApiKey: (key: string) => void;
  setAIProvider: (provider: 'gemini' | 'openai') => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'daily',
  board: null,
  clueStatuses: {},

  singleScore: 0,
  players: {
    player1: { id: 'player1', name: 'Player 1 (Key A)', score: 0 },
    player2: { id: 'player2', name: 'Player 2 (Key L)', score: 0 },
  },

  activeClue: null,
  activeCategory: null,
  isClueModalOpen: false,

  isDailyDoubleModalOpen: false,
  dailyDoubleWager: 200,

  buzzerState: 'idle',
  activeBuzzerPlayer: null,
  buzzerTimeRemaining: 5.0,
  playerAttempted: { player1: false, player2: false },

  isFinalJeopardyModalOpen: false,
  finalJeopardyPhase: 'wager',
  finalJeopardyWagers: {},
  finalJeopardyAnswers: {},
  finalJeopardyResults: {},

  dailyStats: getStoredDailyStats(),
  todayDateStr: getTodayDateString(),

  soundMuted: false,
  soundVolume: 0.7,
  speechEnabled: true,
  crtScanlines: true,
  aiApiKey: '',
  aiProvider: 'gemini',

  completedCluesCount: 0,
  totalCluesCount: 25,
  isGameOver: false,

  initGame: (mode: GameMode, customBoard?: BoardState) => {
    let board: BoardState;
    const todayStr = getTodayDateString();

    if (customBoard) {
      board = customBoard;
    } else if (mode === 'daily') {
      board = generateDailyBoard(todayStr);
    } else if (mode === 'two-player') {
      board = generateClassicBoard();
    } else {
      board = generateClassicBoard();
    }

    const totalClues = board.categories.reduce((acc, cat) => acc + cat.clues.length, 0);

    // Audio board reveal fanfare
    retroAudio.playBoardReveal();

    set({
      mode,
      board,
      clueStatuses: {},
      singleScore: 0,
      players: {
        player1: { id: 'player1', name: 'Player 1 (Key A)', score: 0 },
        player2: { id: 'player2', name: 'Player 2 (Key L)', score: 0 },
      },
      activeClue: null,
      activeCategory: null,
      isClueModalOpen: false,
      isDailyDoubleModalOpen: false,
      dailyDoubleWager: 200,
      buzzerState: 'idle',
      activeBuzzerPlayer: null,
      buzzerTimeRemaining: 5.0,
      playerAttempted: { player1: false, player2: false },
      isFinalJeopardyModalOpen: false,
      finalJeopardyPhase: 'wager',
      finalJeopardyWagers: {},
      finalJeopardyAnswers: {},
      finalJeopardyResults: {},
      completedCluesCount: 0,
      totalCluesCount: totalClues,
      isGameOver: false,
      todayDateStr: todayStr,
    });
  },

  openClue: (category: Category, clue: Clue) => {
    const { clueStatuses, mode, singleScore, players } = get();
    if (clueStatuses[clue.id] && clueStatuses[clue.id] !== 'unopened') {
      return; // already played
    }

    // Sound effect
    retroAudio.playClueSelect();

    // Check Daily Double
    if (clue.isDailyDouble) {
      retroAudio.playDailyDouble();
      const maxWagerSingle = Math.max(1000, Math.max(0, singleScore));
      set({
        activeCategory: category,
        activeClue: clue,
        isDailyDoubleModalOpen: true,
        dailyDoubleWager: Math.min(clue.value, maxWagerSingle),
      });
      return;
    }

    set({
      activeCategory: category,
      activeClue: clue,
      isClueModalOpen: true,
      buzzerState: mode === 'two-player' ? 'open' : 'idle',
      activeBuzzerPlayer: null,
      buzzerTimeRemaining: 5.0,
      playerAttempted: { player1: false, player2: false },
    });

    // Synthesize host voice reading the clue
    if (get().speechEnabled) {
      hostSpeech.speak(clue.clue);
    }
  },

  closeClueModal: () => {
    hostSpeech.stop();
    set({
      isClueModalOpen: false,
      isDailyDoubleModalOpen: false,
      activeClue: null,
      activeCategory: null,
      buzzerState: 'idle',
      activeBuzzerPlayer: null,
    });

    // Check if all clues are answered -> prompt Final Jeopardy
    const { completedCluesCount, totalCluesCount } = get();
    if (completedCluesCount >= totalCluesCount) {
      setTimeout(() => {
        get().startFinalJeopardy();
      }, 700);
    }
  },

  submitAnswer: (userAnswer: string, isCorrect: boolean, overridePlayer?: PlayerId) => {
    const {
      activeClue,
      clueStatuses,
      mode,
      singleScore,
      players,
      completedCluesCount,
      totalCluesCount,
      dailyDoubleWager,
      activeBuzzerPlayer,
      playerAttempted,
      dailyStats,
      todayDateStr,
      board,
    } = get();

    if (!activeClue) return;

    hostSpeech.stop();

    const clueValue = activeClue.isDailyDouble ? dailyDoubleWager : activeClue.value;
    const targetPlayer = overridePlayer || activeBuzzerPlayer;

    if (isCorrect) {
      retroAudio.playCorrect();
    } else {
      retroAudio.playIncorrect();
    }

    // 1. Single Player Mode / Daily Drop / Classic
    if (mode !== 'two-player') {
      const newScore = isCorrect ? singleScore + clueValue : singleScore - clueValue;
      const newStatuses = {
        ...clueStatuses,
        [activeClue.id]: isCorrect ? ('correct' as ClueStatus) : ('incorrect' as ClueStatus),
      };
      const newCompleted = completedCluesCount + 1;

      set({
        singleScore: newScore,
        clueStatuses: newStatuses,
        completedCluesCount: newCompleted,
      });

      // Close modal after brief delay
      setTimeout(() => {
        get().closeClueModal();
      }, 1400);

      return;
    }

    // 2. Two-Player Couch Co-Op Mode
    if (targetPlayer) {
      const currentP = players[targetPlayer];
      const updatedPlayerScore = isCorrect
        ? currentP.score + clueValue
        : currentP.score - clueValue;

      const updatedPlayers = {
        ...players,
        [targetPlayer]: {
          ...currentP,
          score: updatedPlayerScore,
        },
      };

      const updatedAttempted = {
        ...playerAttempted,
        [targetPlayer]: true,
      };

      // If correct: Clue is completed, award points, close
      if (isCorrect) {
        const newStatuses = {
          ...clueStatuses,
          [activeClue.id]: 'correct' as ClueStatus,
        };
        set({
          players: updatedPlayers,
          playerAttempted: updatedAttempted,
          clueStatuses: newStatuses,
          completedCluesCount: completedCluesCount + 1,
          buzzerState: 'idle',
        });

        setTimeout(() => {
          get().closeClueModal();
        }, 1400);
        return;
      }

      // If incorrect: Check for rebound!
      const otherPlayer: PlayerId = targetPlayer === 'player1' ? 'player2' : 'player1';

      if (!updatedAttempted[otherPlayer]) {
        // Rebound window opens for other player!
        retroAudio.playBuzzer();
        set({
          players: updatedPlayers,
          playerAttempted: updatedAttempted,
          buzzerState: 'rebound_active',
          activeBuzzerPlayer: otherPlayer,
          buzzerTimeRemaining: 5.0,
        });
      } else {
        // Both players failed -> Triple stumper / clue dead
        retroAudio.playTimesUp();
        const newStatuses = {
          ...clueStatuses,
          [activeClue.id]: 'incorrect' as ClueStatus,
        };
        set({
          players: updatedPlayers,
          playerAttempted: updatedAttempted,
          clueStatuses: newStatuses,
          completedCluesCount: completedCluesCount + 1,
          buzzerState: 'expired',
        });

        setTimeout(() => {
          get().closeClueModal();
        }, 1800);
      }
    }
  },

  passClue: () => {
    const { activeClue, clueStatuses, completedCluesCount } = get();
    if (!activeClue) return;

    hostSpeech.stop();
    retroAudio.playTimesUp();

    const newStatuses = {
      ...clueStatuses,
      [activeClue.id]: 'passed' as ClueStatus,
    };

    set({
      clueStatuses: newStatuses,
      completedCluesCount: completedCluesCount + 1,
    });

    setTimeout(() => {
      get().closeClueModal();
    }, 1200);
  },

  overrideJudgeDecision: (markAsCorrect: boolean) => {
    const { activeClue, mode, singleScore, players, activeBuzzerPlayer, clueStatuses } = get();
    if (!activeClue) return;

    const clueValue = activeClue.value;

    if (markAsCorrect) {
      retroAudio.playCorrect();
      if (mode !== 'two-player') {
        // Was marked wrong (-clueValue), now marked right (+clueValue) -> net +2*clueValue
        set({
          singleScore: singleScore + clueValue * 2,
          clueStatuses: { ...clueStatuses, [activeClue.id]: 'correct' },
        });
      } else if (activeBuzzerPlayer) {
        const p = players[activeBuzzerPlayer];
        set({
          players: {
            ...players,
            [activeBuzzerPlayer]: { ...p, score: p.score + clueValue * 2 },
          },
          clueStatuses: { ...clueStatuses, [activeClue.id]: 'correct' },
        });
      }
    } else {
      retroAudio.playIncorrect();
      if (mode !== 'two-player') {
        set({
          singleScore: singleScore - clueValue * 2,
          clueStatuses: { ...clueStatuses, [activeClue.id]: 'incorrect' },
        });
      } else if (activeBuzzerPlayer) {
        const p = players[activeBuzzerPlayer];
        set({
          players: {
            ...players,
            [activeBuzzerPlayer]: { ...p, score: p.score - clueValue * 2 },
          },
          clueStatuses: { ...clueStatuses, [activeClue.id]: 'incorrect' },
        });
      }
    }
  },

  setDailyDoubleWager: (wager: number) => {
    set({ dailyDoubleWager: wager });
  },

  proceedFromDailyDoubleModal: () => {
    const { activeClue } = get();
    set({
      isDailyDoubleModalOpen: false,
      isClueModalOpen: true,
    });
    if (activeClue && get().speechEnabled) {
      hostSpeech.speak(activeClue.clue);
    }
  },

  buzzIn: (player: PlayerId) => {
    const { buzzerState, playerAttempted, isClueModalOpen } = get();
    if (!isClueModalOpen) return;

    // Only allow buzz if open or rebound for this player
    if (buzzerState === 'open' && !playerAttempted[player]) {
      hostSpeech.stop();
      retroAudio.playBuzzer();
      set({
        buzzerState: player === 'player1' ? 'player1_active' : 'player2_active',
        activeBuzzerPlayer: player,
        buzzerTimeRemaining: 5.0,
      });
    } else if (buzzerState === 'rebound_active' && !playerAttempted[player]) {
      hostSpeech.stop();
      retroAudio.playBuzzer();
      set({
        buzzerState: player === 'player1' ? 'player1_active' : 'player2_active',
        activeBuzzerPlayer: player,
        buzzerTimeRemaining: 5.0,
      });
    }
  },

  openBuzzer: () => {
    set({
      buzzerState: 'open',
      activeBuzzerPlayer: null,
      buzzerTimeRemaining: 5.0,
    });
  },

  tickBuzzerTimer: (delta: number) => {
    const { buzzerState, buzzerTimeRemaining, activeBuzzerPlayer } = get();
    if (buzzerState !== 'player1_active' && buzzerState !== 'player2_active' && buzzerState !== 'rebound_active') {
      return;
    }

    const nextTime = Math.max(0, buzzerTimeRemaining - delta);
    if (nextTime === 0) {
      // Time expired for this player's buzz!
      if (activeBuzzerPlayer) {
        get().submitAnswer('', false, activeBuzzerPlayer);
      } else {
        retroAudio.playTimesUp();
        set({ buzzerState: 'expired', buzzerTimeRemaining: 0 });
      }
    } else {
      set({ buzzerTimeRemaining: nextTime });
    }
  },

  startFinalJeopardy: () => {
    hostSpeech.stop();
    set({
      isFinalJeopardyModalOpen: true,
      finalJeopardyPhase: 'wager',
      finalJeopardyWagers: {},
      finalJeopardyAnswers: {},
      finalJeopardyResults: {},
    });
  },

  submitFinalWager: (playerId: string, wager: number) => {
    set((state) => ({
      finalJeopardyWagers: {
        ...state.finalJeopardyWagers,
        [playerId]: Math.max(0, wager),
      },
    }));
  },

  revealFinalClue: () => {
    const { board } = get();
    // Start iconic 30s think music
    retroAudio.playFinalJeopardyThink();
    set({ finalJeopardyPhase: 'think' });

    if (board && get().speechEnabled) {
      hostSpeech.speak(board.finalJeopardy.clue);
    }
  },

  submitFinalAnswer: (playerId: string, answer: string, isCorrect: boolean) => {
    set((state) => ({
      finalJeopardyAnswers: {
        ...state.finalJeopardyAnswers,
        [playerId]: answer,
      },
      finalJeopardyResults: {
        ...state.finalJeopardyResults,
        [playerId]: isCorrect,
      },
    }));
  },

  finishFinalJeopardy: () => {
    retroAudio.stopFinalJeopardyThink();
    hostSpeech.stop();

    const {
      mode,
      singleScore,
      players,
      finalJeopardyWagers,
      finalJeopardyResults,
      board,
      clueStatuses,
      dailyStats,
      todayDateStr,
    } = get();

    let updatedSingleScore = singleScore;
    const updatedPlayers = { ...players };

    if (mode !== 'two-player') {
      const wager = finalJeopardyWagers['single'] || 0;
      const isCorrect = finalJeopardyResults['single'] || false;
      updatedSingleScore = isCorrect ? singleScore + wager : singleScore - wager;

      if (isCorrect) {
        retroAudio.playCorrect();
      } else {
        retroAudio.playIncorrect();
      }
    } else {
      (['player1', 'player2'] as PlayerId[]).forEach((pId) => {
        const wager = finalJeopardyWagers[pId] || 0;
        const isCorrect = finalJeopardyResults[pId] || false;
        const curScore = updatedPlayers[pId].score;
        updatedPlayers[pId] = {
          ...updatedPlayers[pId],
          score: isCorrect ? curScore + wager : curScore - wager,
        };
      });
    }

    // If daily drop mode, update persistence
    if (mode === 'daily' && board) {
      const isWon = (finalJeopardyResults['single'] || false) && updatedSingleScore > 0;
      const correctCluesCount = Object.values(clueStatuses).filter((s) => s === 'correct').length;
      const highValueCount = board.categories.reduce((acc, cat) => {
        return (
          acc +
          cat.clues.filter(
            (c) => (c.value === 800 || c.value === 1000) && clueStatuses[c.id] === 'correct'
          ).length
        );
      }, 0);

      const emojiGrid = generateEmojiGrid(board, clueStatuses);
      const isNewDay = dailyStats.lastPlayedDate !== todayDateStr;
      const newStreak = isWon ? (isNewDay ? dailyStats.currentStreak + 1 : dailyStats.currentStreak) : 0;
      const newMaxStreak = Math.max(dailyStats.maxStreak, newStreak);

      const updatedStats: DailyDropStats = {
        lastPlayedDate: todayDateStr,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        gamesPlayed: dailyStats.gamesPlayed + (isNewDay ? 1 : 0),
        wins: dailyStats.wins + (isWon ? 1 : 0),
        totalEarnings: dailyStats.totalEarnings + Math.max(0, updatedSingleScore),
        dailyResults: {
          ...dailyStats.dailyResults,
          [todayDateStr]: {
            score: updatedSingleScore,
            cluesAttempted: Object.keys(clueStatuses).length,
            cluesCorrect: correctCluesCount,
            highValueSnags: highValueCount,
            finalJeopardyCorrect: finalJeopardyResults['single'] || false,
            emojiGrid,
            completedAt: new Date().toISOString(),
          },
        },
      };

      saveStoredDailyStats(updatedStats);
      set({ dailyStats: updatedStats });
    }

    set({
      singleScore: updatedSingleScore,
      players: updatedPlayers,
      finalJeopardyPhase: 'recap',
      isGameOver: true,
    });
  },

  setSoundMuted: (muted: boolean) => {
    retroAudio.setMuted(muted);
    set({ soundMuted: muted });
  },

  setSoundVolume: (volume: number) => {
    retroAudio.setVolume(volume);
    set({ soundVolume: volume });
  },

  setSpeechEnabled: (enabled: boolean) => {
    hostSpeech.setEnabled(enabled);
    set({ speechEnabled: enabled });
  },

  setCRTScanlines: (enabled: boolean) => {
    set({ crtScanlines: enabled });
  },

  setAIApiKey: (key: string) => {
    set({ aiApiKey: key });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('the_board_room_ai_key', key);
      } catch {}
    }
  },

  setAIProvider: (provider: 'gemini' | 'openai') => {
    set({ aiProvider: provider });
  },
}));
