'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Flame,
  Trophy,
  DollarSign,
  Calendar,
  Share2,
  X,
  CheckCircle,
} from 'lucide-react';

interface DailyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyStatsModal: React.FC<DailyStatsModalProps> = ({ isOpen, onClose }) => {
  const { dailyStats, todayDateStr } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayResult = dailyStats.dailyResults[todayDateStr];
  const winRate =
    dailyStats.gamesPlayed > 0
      ? Math.round((dailyStats.wins / dailyStats.gamesPlayed) * 100)
      : 0;

  const handleCopyTodayEmoji = () => {
    if (!todayResult) return;
    const shareText = `The Board Room — Daily Drop ${todayDateStr}
💰 $${todayResult.score.toLocaleString()} | Streak: ${dailyStats.currentStreak} 🔥
${todayResult.emojiGrid}
Play: https://theboardroom.game`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl border-4 border-yellow-500 bg-gradient-to-b from-[#02073d] via-[#040e69] to-[#01042b] p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-yellow-500/40 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-400 fill-orange-400 animate-pulse" />
            <h2
              className="text-xl font-black uppercase tracking-wider text-amber-300"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              Daily Drop Statistics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-amber-300 hover:bg-blue-900/60 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl border border-blue-800 bg-[#00052b] p-3 shadow-inner">
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">
              Current Streak
            </span>
            <div className="text-2xl font-black text-amber-300 flex items-center justify-center gap-1">
              <span>{dailyStats.currentStreak}</span>
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            </div>
          </div>

          <div className="rounded-xl border border-blue-800 bg-[#00052b] p-3 shadow-inner">
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">
              Max Streak
            </span>
            <div className="text-2xl font-black text-yellow-400">
              {dailyStats.maxStreak}
            </div>
          </div>

          <div className="rounded-xl border border-blue-800 bg-[#00052b] p-3 shadow-inner">
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">
              Games Played
            </span>
            <div className="text-2xl font-black text-white">
              {dailyStats.gamesPlayed}
            </div>
          </div>

          <div className="rounded-xl border border-blue-800 bg-[#00052b] p-3 shadow-inner">
            <span className="text-[10px] font-bold text-amber-300/70 uppercase">
              Win Rate
            </span>
            <div className="text-2xl font-black text-emerald-400">
              {winRate}%
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="rounded-xl border border-yellow-500/40 bg-[#000424] p-3 text-center mb-4">
          <span className="text-[11px] font-bold text-amber-300/70 uppercase">
            Total Career Earnings:
          </span>
          <div className="text-2xl font-black text-yellow-300 font-mono">
            ${dailyStats.totalEarnings.toLocaleString()}
          </div>
        </div>

        {/* Today's Result & Share Button */}
        {todayResult ? (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">
                Today&apos;s Board Completed ({todayDateStr})
              </span>
              <span className="font-mono text-sm font-black text-amber-300">
                ${todayResult.score.toLocaleString()}
              </span>
            </div>

            <pre className="text-sm font-mono text-center tracking-widest bg-slate-950/60 p-2 rounded">
              {todayResult.emojiGrid}
            </pre>

            <button
              onClick={handleCopyTodayEmoji}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 text-xs font-black text-slate-950 shadow hover:brightness-110 active:scale-98 transition"
            >
              <Share2 className="h-4 w-4" />
              <span>{copied ? 'Copied to Clipboard! ✓' : 'Share Daily Drop Summary'}</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-blue-900 bg-blue-950/40 p-4 text-center text-xs text-amber-200/80">
            <p>You have not finished today&apos;s Daily Drop board yet!</p>
            <p className="mt-1 text-amber-300 font-bold">
              Complete today&apos;s clues to record your score and advance your streak.
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-yellow-400 px-6 py-2 text-xs font-black text-slate-950 hover:bg-yellow-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
