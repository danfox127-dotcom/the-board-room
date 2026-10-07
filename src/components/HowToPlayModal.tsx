'use client';

import React from 'react';
import {
  HelpCircle,
  Calendar,
  Layers,
  Users,
  Sparkles,
  Zap,
  Scale,
  X,
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative my-8 flex w-full max-w-2xl flex-col rounded-2xl border-4 border-yellow-500/80 bg-gradient-to-b from-[#02073d] via-[#040e69] to-[#01042b] p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-yellow-500/40 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-yellow-400" />
            <h2
              className="text-xl font-black uppercase tracking-wider text-amber-300"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              How to Play &quot;The Board Room&quot;
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-amber-300 hover:bg-blue-900/60 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-4 space-y-4 text-xs text-amber-100/90 leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
          {/* Game Modes */}
          <div className="space-y-3">
            <div className="rounded-xl border border-blue-800/60 bg-[#00052b] p-3.5 space-y-1">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-yellow-300">
                <Calendar className="h-4 w-4 text-amber-400" />
                1. Daily Drop Mode (Wordle Model)
              </h3>
              <p>
                A single seeded board generated for each calendar day based on YYYY-MM-DD hashing.
                Keep your daily streak alive! At the end of the round, share your spoiler-free emoji grid summary with friends.
              </p>
            </div>

            <div className="rounded-xl border border-blue-800/60 bg-[#00052b] p-3.5 space-y-1">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-yellow-300">
                <Layers className="h-4 w-4 text-amber-400" />
                2. Classic Mode (J-Archive Vault)
              </h3>
              <p>
                Picks 5 Single Jeopardy categories + 1 Final Jeopardy clue from a curated vault of 50+ classic Jeopardy categories spanning from the 1980s to the 2020s. Preserves authentic difficulty curves from $200 to $1000.
              </p>
            </div>

            <div className="rounded-xl border border-blue-800/60 bg-[#00052b] p-3.5 space-y-1">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-yellow-300">
                <Users className="h-4 w-4 text-amber-400" />
                3. Two-Player Couch Co-Op Mode
              </h3>
              <p>
                True arcade buzzer lockout! When a clue opens, contestants race to buzz in:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-200">
                <li><strong>Player 1</strong> buzzes in using the <kbd className="px-1 py-0.5 bg-blue-950 border border-blue-400 rounded text-yellow-300">A</kbd> key.</li>
                <li><strong>Player 2</strong> buzzes in using the <kbd className="px-1 py-0.5 bg-rose-950 border border-rose-400 rounded text-yellow-300">L</kbd> key.</li>
                <li>The first to buzz gets <strong>5 seconds</strong> to answer. If incorrect, the other player gets a <strong>5-second rebound</strong> opportunity!</li>
              </ul>
            </div>

            <div className="rounded-xl border border-cyan-800/60 bg-[#00052b] p-3.5 space-y-1">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-cyan-300">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                4. Two-Pass AI Category Generator
              </h3>
              <p>
                Generates custom categories on any topic using a strict 2-pass pipeline:
                Pass 1 (The Clue Writer) crafts 5 tiered clues; Pass 2 (The Fact-Checker & Judge) fact-checks, audits ambiguity, and expands accepted answers.
              </p>
            </div>
          </div>

          {/* Answer validation tips */}
          <div className="rounded-xl border border-yellow-600/40 bg-yellow-950/20 p-3.5 space-y-1.5">
            <h4 className="font-bold text-yellow-300 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-yellow-400" />
              Smart Validation & Typo Tolerance
            </h4>
            <p>
              You do not need to worry about strict phrasing: prefixes like <em>&quot;What is&quot;</em>, <em>&quot;Who is&quot;</em>, and articles like <em>&quot;The&quot;</em> are automatically stripped. Levenshtein distance handles minor typos and surname-only answers (e.g. &quot;Lincoln&quot; for &quot;Abraham Lincoln&quot;).
            </p>
            <p className="text-[11px] text-amber-300/80">
              Disputed answer? Click the <strong>Judges&apos; Ruling Override</strong> button on any clue to overturn the computer&apos;s decision!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-yellow-600/30 pt-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-yellow-400 px-6 py-2 text-xs font-black text-slate-950 hover:bg-yellow-300 transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
