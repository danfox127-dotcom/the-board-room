'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Category, BoardState } from '@/types/game';
import { generateClassicBoard } from '@/lib/daily-drop';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  Play,
  Key,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  X,
} from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose }) => {
  const { initGame, aiApiKey, setAIApiKey, aiProvider, setAIProvider, board } = useGameStore();

  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pass1Data, setPass1Data] = useState<any | null>(null);
  const [pass2Data, setPass2Data] = useState<any | null>(null);
  const [generatedCategory, setGeneratedCategory] = useState<Category | null>(null);

  if (!isOpen) return null;

  const topicSuggestions = [
    '90s Hip Hop & Rap',
    'Quantum Computing & Physics',
    'The Golden Age of Video Games',
    'World Street Food',
    'Ancient Roman Emperors',
    'Classic Rock Guitar Legends',
  ];

  const handleGenerate = async (selectedTopic?: string) => {
    const targetTopic = (selectedTopic || topic).trim();
    if (!targetTopic) return;

    setLoading(true);
    setError(null);
    setPass1Data(null);
    setPass2Data(null);
    setGeneratedCategory(null);

    try {
      const res = await fetch('/api/generate-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          apiKey: aiApiKey || undefined,
          provider: aiProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate category');
      }

      setPass1Data(data.pass1);
      setPass2Data(data.pass2);
      setGeneratedCategory(data.category);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while contacting generation pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayWithCategory = () => {
    if (!generatedCategory) return;

    // Build custom board containing this category
    const baseBoard = generateClassicBoard();
    // Replace the first category with our newly generated AI category
    const customCategories = [generatedCategory, ...baseBoard.categories.slice(1)];

    const customBoardState: BoardState = {
      id: `custom-board-${Date.now()}`,
      title: `AI LAB: ${generatedCategory.title}`,
      categories: customCategories,
      finalJeopardy: baseBoard.finalJeopardy,
    };

    initGame('custom', customBoardState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative my-8 flex w-full max-w-4xl flex-col rounded-2xl border-4 border-cyan-500/80 bg-gradient-to-b from-[#02093a] via-[#030d52] to-[#01042b] p-6 text-white shadow-[0_0_80px_rgba(6,182,212,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-cyan-500/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-950 p-2 border border-cyan-400">
              <Sparkles className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
            <div>
              <h2
                className="text-xl sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-200 to-amber-300 drop-shadow"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                Two-Pass AI Category Generator
              </h2>
              <p className="text-xs text-cyan-200/80">
                Pass 1 (The Clue Writer) &rarr; Pass 2 (The Fact-Checker & Judge)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-cyan-300 hover:bg-cyan-900/40 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Topic Input & Generation Controls */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter any topic (e.g., 90s Hip Hop, Quantum Physics, Seinfeld)..."
              className="flex-1 rounded-lg border-2 border-cyan-400/60 bg-[#00052b] px-4 py-2.5 text-sm font-bold text-cyan-100 placeholder-cyan-600/60 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 font-black text-slate-950 shadow-lg hover:brightness-110 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'Synthesizing Pipeline...' : 'Generate Category'}</span>
            </button>
          </div>

          {/* Quick inspiration chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-cyan-300/70">Inspiration:</span>
            {topicSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  setTopic(sug);
                  handleGenerate(sug);
                }}
                className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/60 transition"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state indicator */}
        {loading && (
          <div className="my-8 flex flex-col items-center justify-center gap-3 text-cyan-300">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <p className="text-sm font-bold animate-pulse">
              Running Pass 1 (Drafting Clues) & Pass 2 (Fact-Checking & Ambiguity Audit)...
            </p>
          </div>
        )}

        {/* Two-Pass Pipeline Results Viewer */}
        {generatedCategory && (
          <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {/* Top Badge */}
            <div className="flex items-center justify-between rounded-lg border border-cyan-400/40 bg-cyan-950/40 p-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300/80">
                  CATEGORY APPROVED BY THE JUDGES
                </span>
                <h3 className="text-xl font-black text-amber-300 uppercase">
                  {generatedCategory.title}
                </h3>
              </div>

              <button
                onClick={handlePlayWithCategory}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2.5 font-black text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>Play This Category Now!</span>
              </button>
            </div>

            {/* Pass 2 Fact-Checker & Judge Audit Notes */}
            {pass2Data && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 text-xs text-emerald-200">
                <div className="flex items-center gap-1.5 font-black uppercase text-emerald-300 mb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Pass 2 Audit & Fact-Check Log</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-100/90">
                  {pass2Data.auditNotes?.map((note: string, idx: number) => (
                    <li key={`note-${idx}`}>{note}</li>
                  ))}
                  {pass2Data.refinementsMade?.map((ref: string, idx: number) => (
                    <li key={`ref-${idx}`} className="text-amber-200">
                      Refinement: {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5 Clues Inspection Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Tiered Clues ($200 &rarr; $1000):
              </h4>
              <div className="space-y-2">
                {generatedCategory.clues.map((clue) => (
                  <div
                    key={clue.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-blue-800/60 bg-[#000638] p-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-black text-amber-300 font-mono text-sm shrink-0">
                        ${clue.value}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{clue.clue}</p>
                        <p className="mt-1 text-[11px] text-amber-300 font-bold">
                          Answer: <span className="text-white">{clue.answer}</span>
                          {clue.acceptedAnswers?.length > 0 && (
                            <span className="text-cyan-300/80 font-normal ml-2">
                              (Aliases: {clue.acceptedAnswers.join(', ')})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
