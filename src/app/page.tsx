'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Header } from '@/components/Header';
import { Board } from '@/components/Board';
import { ClueModal } from '@/components/ClueModal';
import { DailyDoubleModal } from '@/components/DailyDoubleModal';
import { FinalJeopardyModal } from '@/components/FinalJeopardyModal';
import { AIGeneratorModal } from '@/components/AIGeneratorModal';
import { SettingsModal } from '@/components/SettingsModal';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { DailyStatsModal } from '@/components/DailyStatsModal';
import { CRTOverlay } from '@/components/CRTOverlay';
import { Sparkles, Calendar, Layers, Users, HelpCircle } from 'lucide-react';

export default function Home() {
  const { initGame, board, mode } = useGameStore();

  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isDailyStatsOpen, setIsDailyStatsOpen] = useState(false);

  // Initialize daily game board on first load
  useEffect(() => {
    if (!board) {
      initGame('daily');
    }
  }, [board, initGame]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#00021c] text-white">
      {/* CRT Scanlines Overlay */}
      <CRTOverlay />

      {/* Main Top Header */}
      <Header
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onOpenDailyStats={() => setIsDailyStatsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
      />

      {/* Main Board Arena */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-start">
        {/* Active Mode Sub-Banner */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-amber-300/80">
          <div className="flex items-center gap-2">
            {mode === 'daily' && (
              <span className="flex items-center gap-1.5 font-bold text-yellow-400">
                <Calendar className="h-4 w-4" />
                <span>DAILY DROP — Wordle-style calendar board</span>
              </span>
            )}
            {mode === 'classic' && (
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <Layers className="h-4 w-4" />
                <span>CLASSIC VAULT — 50+ Curated Historic Categories</span>
              </span>
            )}
            {mode === 'two-player' && (
              <span className="flex items-center gap-1.5 font-bold text-rose-300">
                <Users className="h-4 w-4" />
                <span>COUCH CO-OP — Player 1 [A] vs Player 2 [L] Lockout</span>
              </span>
            )}
            {mode === 'custom' && (
              <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Sparkles className="h-4 w-4" />
                <span>AI CUSTOM LAB — Verified 2-Pass Generated Category</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setIsHowToPlayOpen(true)}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Rules & Keyboard Shortcuts</span>
          </button>
        </div>

        {/* The 5x5 Jeopardy Grid */}
        <Board />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-yellow-600/30 bg-[#000424] py-3 text-center text-xs text-amber-300/60">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-2 px-4">
          <p>
            <strong>The Board Room</strong> — An authentic retro tribute to America&apos;s Favorite Quiz Show.
          </p>
          <div className="flex items-center gap-3">
            <span>Web Audio SFX</span>
            <span>•</span>
            <span>Web Speech Host</span>
            <span>•</span>
            <span>Fuzzy Levenshtein Matching</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ClueModal />
      <DailyDoubleModal />
      <FinalJeopardyModal />
      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />
      <DailyStatsModal
        isOpen={isDailyStatsOpen}
        onClose={() => setIsDailyStatsOpen(false)}
      />
    </div>
  );
}
