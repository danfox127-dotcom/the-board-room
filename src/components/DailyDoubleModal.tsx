'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Sparkles, DollarSign, Zap } from 'lucide-react';

export const DailyDoubleModal: React.FC = () => {
  const {
    isDailyDoubleModalOpen,
    dailyDoubleWager,
    setDailyDoubleWager,
    proceedFromDailyDoubleModal,
    singleScore,
    activeCategory,
    activeClue,
    mode,
    players,
  } = useGameStore();

  if (!isDailyDoubleModalOpen || !activeClue) {
    return null;
  }

  // Jeopardy rules: You can wager up to your current score or the highest clue value ($1000), whichever is greater.
  const currentTotal = singleScore;
  const maxWager = Math.max(1000, Math.max(5, currentTotal));
  const minWager = 5;

  const handleTrueDailyDouble = () => {
    setDailyDoubleWager(maxWager);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex w-full max-w-lg flex-col items-center rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-[#000cb8] via-[#000570] to-[#000236] p-6 text-center text-white shadow-[0_0_80px_rgba(250,204,21,0.7)] animate-bounce-short">
        {/* Fanfare Icon */}
        <div className="mb-2 flex items-center justify-center rounded-full bg-yellow-400/20 p-3 text-yellow-300 ring-4 ring-yellow-400/40">
          <Sparkles className="h-10 w-10 animate-spin" />
        </div>

        {/* Title */}
        <h2
          className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
        >
          Daily Double!
        </h2>

        {activeCategory && (
          <p className="mt-1 text-xs font-black uppercase tracking-wider text-amber-200">
            Category: {activeCategory.title}
          </p>
        )}

        <div className="my-4 w-full rounded-xl border border-yellow-500/40 bg-[#000424]/90 p-4 shadow-inner">
          <span className="text-xs font-bold text-amber-300/80 uppercase">
            Your Current Bank:
          </span>
          <div className="text-2xl font-black text-amber-300 font-mono">
            ${currentTotal.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-200/60">
            Maximum legal wager: ${maxWager.toLocaleString()}
          </span>
        </div>

        {/* Wager Input Form */}
        <div className="w-full space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-yellow-300">
            Enter Your Wager:
          </label>

          <div className="relative flex items-center justify-center">
            <span className="absolute left-4 text-2xl font-black text-yellow-400 font-mono">
              $
            </span>
            <input
              type="number"
              min={minWager}
              max={maxWager}
              step={50}
              value={dailyDoubleWager}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setDailyDoubleWager(Math.min(maxWager, Math.max(minWager, val)));
              }}
              className="w-full rounded-lg border-2 border-yellow-400 bg-slate-950 py-3 pl-10 pr-4 text-center text-3xl font-black text-yellow-300 font-mono focus:border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDailyDoubleWager(500)}
              className="rounded border border-yellow-500/40 bg-blue-950/60 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-blue-900 transition"
            >
              $500
            </button>
            <button
              type="button"
              onClick={() => setDailyDoubleWager(1000)}
              className="rounded border border-yellow-500/40 bg-blue-950/60 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-blue-900 transition"
            >
              $1,000
            </button>
            <button
              type="button"
              onClick={handleTrueDailyDouble}
              className="flex items-center gap-1 rounded border-2 border-amber-400 bg-gradient-to-r from-amber-600 to-yellow-500 px-3 py-1 text-xs font-black text-slate-950 hover:from-amber-500 hover:to-yellow-400 transition shadow"
            >
              <Zap className="h-3 w-3 fill-slate-950" />
              <span>True Daily Double (${maxWager.toLocaleString()})</span>
            </button>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={proceedFromDailyDoubleModal}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 py-3.5 text-base font-black uppercase tracking-wider text-slate-950 shadow-xl transition hover:brightness-110 active:scale-98 cursor-pointer"
        >
          <span>Reveal the Clue</span>
        </button>
      </div>
    </div>
  );
};
