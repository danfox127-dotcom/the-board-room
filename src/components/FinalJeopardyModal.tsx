'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { validateAnswer } from '@/lib/validation';
import { retroAudio } from '@/lib/audio';
import { hostSpeech } from '@/lib/speech';
import { generateDailyShareText, generateEmojiGrid } from '@/lib/daily-drop';
import confetti from 'canvas-confetti';
import {
  Trophy,
  DollarSign,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Share2,
  RotateCcw,
  Sparkles,
  Scale,
  Flame,
} from 'lucide-react';

export const FinalJeopardyModal: React.FC = () => {
  const {
    board,
    isFinalJeopardyModalOpen,
    finalJeopardyPhase,
    finalJeopardyWagers,
    finalJeopardyAnswers,
    finalJeopardyResults,
    singleScore,
    submitFinalWager,
    revealFinalClue,
    submitFinalAnswer,
    finishFinalJeopardy,
    initGame,
    mode,
    clueStatuses,
    dailyStats,
    todayDateStr,
    overrideJudgeDecision,
  } = useGameStore();

  const [wagerInput, setWagerInput] = useState<number>(1000);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize wager default
  useEffect(() => {
    if (isFinalJeopardyModalOpen && finalJeopardyPhase === 'wager') {
      const defaultWager = Math.max(0, Math.min(singleScore, 5000));
      setWagerInput(defaultWager > 0 ? defaultWager : 500);
      setAnswerInput('');
      setSecondsRemaining(30);
      setIsAnswerSubmitted(false);
      setShareCopied(false);
    }
  }, [isFinalJeopardyModalOpen, finalJeopardyPhase, singleScore]);

  // 30-Second Think Clock during think phase
  useEffect(() => {
    if (finalJeopardyPhase === 'think' && !isAnswerSubmitted) {
      setSecondsRemaining(30);

      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [finalJeopardyPhase, isAnswerSubmitted]);

  // Fire celebratory confetti on recap victory
  useEffect(() => {
    if (finalJeopardyPhase === 'recap' && singleScore > 0) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFE600', '#FFB800', '#00E5FF', '#FFFFFF'],
        });
      } catch {}
    }
  }, [finalJeopardyPhase, singleScore]);

  if (!isFinalJeopardyModalOpen || !board) return null;

  const fj = board.finalJeopardy;
  const maxWager = Math.max(1000, Math.max(0, singleScore));

  const handleLockInWager = () => {
    submitFinalWager('single', wagerInput);
    revealFinalClue();
  };

  const handleTimeExpired = () => {
    handleAnswerSubmit(true);
  };

  const handleAnswerSubmit = (forcedTimeout: boolean = false) => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    if (timerRef.current) clearInterval(timerRef.current);
    retroAudio.stopFinalJeopardyThink();
    hostSpeech.stop();

    const textToValidate = forcedTimeout ? '' : answerInput;
    const result = validateAnswer(textToValidate, fj.answer, fj.acceptedAnswers || []);

    submitFinalAnswer('single', textToValidate, result.isCorrect);

    setTimeout(() => {
      finishFinalJeopardy();
    }, 1200);
  };

  const handleShareScore = () => {
    const isCorrect = finalJeopardyResults['single'] || false;
    const emojiGrid = generateEmojiGrid(board, clueStatuses);
    const correctClues = Object.values(clueStatuses).filter((s) => s === 'correct').length;
    const totalClues = board.categories.reduce((acc, cat) => acc + cat.clues.length, 0);
    const highValueCount = board.categories.reduce((acc, cat) => {
      return (
        acc +
        cat.clues.filter(
          (c) => (c.value === 800 || c.value === 1000) && clueStatuses[c.id] === 'correct'
        ).length
      );
    }, 0);

    const shareText = generateDailyShareText({
      dateStr: todayDateStr,
      score: singleScore,
      totalClues,
      correctClues,
      highValueSnags: highValueCount,
      finalJeopardyStatus: isCorrect ? 'correct' : 'incorrect',
      emojiGrid,
      streak: dailyStats.currentStreak,
    });

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex w-full max-w-2xl flex-col rounded-2xl border-4 border-yellow-500 bg-gradient-to-b from-[#02074d] via-[#040e69] to-[#010433] p-6 text-white shadow-[0_0_80px_rgba(6,12,233,0.9)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-yellow-500/60 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-300 drop-shadow"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              FINAL JEOPARDY!
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-200">
            Current Bank: ${singleScore.toLocaleString()}
          </span>
        </div>

        {/* Category Card */}
        <div className="mb-6 rounded-lg border-2 border-yellow-400/80 bg-[#000844] p-4 text-center shadow-inner">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/80">
            CATEGORY:
          </span>
          <h3
            className="text-2xl sm:text-3xl font-black uppercase text-amber-200 tracking-wide mt-1"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {fj.category}
          </h3>
        </div>

        {/* PHASE 1: WAGER PHASE */}
        {finalJeopardyPhase === 'wager' && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-center text-amber-200/90 max-w-md">
              Contestants, examine the category. You may wager up to your current score (maximum $
              {maxWager.toLocaleString()}).
            </p>

            <div className="w-full max-w-sm space-y-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute left-4 text-2xl font-black text-yellow-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  max={maxWager}
                  step={100}
                  value={wagerInput}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setWagerInput(Math.min(maxWager, Math.max(0, v)));
                  }}
                  className="w-full rounded-lg border-2 border-yellow-400 bg-slate-950 py-3 pl-10 pr-4 text-center text-3xl font-black text-yellow-300 font-mono focus:border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setWagerInput(0)}
                  className="rounded border border-yellow-500/40 bg-blue-950/60 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-blue-900 transition"
                >
                  $0
                </button>
                <button
                  type="button"
                  onClick={() => setWagerInput(Math.floor(maxWager / 2))}
                  className="rounded border border-yellow-500/40 bg-blue-950/60 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-blue-900 transition"
                >
                  Half (${Math.floor(maxWager / 2).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setWagerInput(maxWager)}
                  className="rounded border border-yellow-500/40 bg-blue-950/60 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-blue-900 transition"
                >
                  All In (${maxWager.toLocaleString()})
                </button>
              </div>

              <button
                onClick={handleLockInWager}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 py-3.5 text-base font-black uppercase tracking-wider text-slate-950 shadow-xl transition hover:brightness-110 active:scale-98 cursor-pointer"
              >
                <span>Lock In Wager & Reveal Clue</span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: THINK & SUBMISSION PHASE */}
        {finalJeopardyPhase === 'think' && (
          <div className="flex flex-col gap-4">
            {/* Clue prompt */}
            <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-yellow-400/40 bg-[#000530] p-6 text-center shadow-inner">
              <p
                className="text-xl sm:text-2xl font-extrabold uppercase leading-snug tracking-wide text-white drop-shadow"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {fj.clue}
              </p>
            </div>

            {/* 30s Countdown Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-yellow-400 animate-spin" />
                  <span>30-Second Think Clock (Music Playing...)</span>
                </span>
                <span className="font-mono text-base font-black text-yellow-300">
                  {secondsRemaining}s
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900">
                <div
                  className={`h-full transition-all duration-1000 ${
                    secondsRemaining > 10
                      ? 'bg-gradient-to-r from-emerald-500 to-yellow-400'
                      : secondsRemaining > 5
                      ? 'bg-amber-400'
                      : 'bg-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Answer input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnswerSubmit(false);
              }}
              className="flex flex-col gap-2 pt-2"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Who is... / What is..."
                  className="w-full rounded-lg border-2 border-yellow-400 bg-slate-950 px-4 py-3 text-lg font-bold text-yellow-300 placeholder-yellow-600/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="submit"
                  disabled={!answerInput.trim()}
                  className="absolute right-2 flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 font-black text-slate-950 shadow transition hover:brightness-110 disabled:opacity-40"
                >
                  <span>Submit</span>
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PHASE 3 & 4: RECAP / VICTORY SUMMARY */}
        {finalJeopardyPhase === 'recap' && (
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Answer Verdict */}
            <div className="w-full rounded-xl border border-yellow-500/40 bg-[#000530] p-4 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300/80">
                Correct Canonical Answer:
              </span>
              <div className="text-2xl font-black text-amber-300">{fj.answer}</div>
              {fj.explanation && (
                <p className="text-xs text-blue-200 italic max-w-md mx-auto pt-1">
                  {fj.explanation}
                </p>
              )}
            </div>

            {/* Final Score Banner */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-yellow-400 bg-[#00084a] px-8 py-5 shadow-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80">
                FINAL TOTAL SCORE
              </span>
              <div
                className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  singleScore >= 0 ? 'text-yellow-300' : 'text-red-400'
                } drop-shadow`}
                style={{ fontFamily: 'monospace' }}
              >
                ${singleScore.toLocaleString()}
              </div>
              {singleScore > 0 ? (
                <span className="mt-1 text-xs font-bold text-emerald-400">
                  🎉 CHAMPION PERFORMANCE!
                </span>
              ) : (
                <span className="mt-1 text-xs font-bold text-rose-400">
                  Tough Board — Better Luck Next Time!
                </span>
              )}
            </div>

            {/* Daily Streak Highlight */}
            {mode === 'daily' && dailyStats.currentStreak > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-orange-500/50 bg-orange-950/40 px-4 py-1.5 text-sm font-black text-orange-400">
                <Flame className="h-5 w-5 fill-orange-500 text-orange-500 animate-pulse" />
                <span>Daily Streak: {dailyStats.currentStreak} Days Active</span>
              </div>
            )}

            {/* Action Buttons: Share Score & Play Again */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
              {mode === 'daily' && (
                <button
                  onClick={handleShareScore}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 font-black text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
                >
                  <Share2 className="h-5 w-5" />
                  <span>{shareCopied ? 'Copied to Clipboard! ✓' : 'Share Score (Emoji Grid)'}</span>
                </button>
              )}

              <button
                onClick={() => initGame(mode)}
                className="flex items-center gap-2 rounded-xl border border-yellow-400/60 bg-blue-900/80 px-6 py-3 font-bold text-amber-200 shadow hover:bg-blue-800 active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Play New Board</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
