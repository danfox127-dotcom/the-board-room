'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CategoryHeader } from './CategoryHeader';
import { ClueCard } from './ClueCard';
import { Trophy, HelpCircle } from 'lucide-react';

export const Board: React.FC = () => {
  const {
    board,
    clueStatuses,
    openClue,
    startFinalJeopardy,
    completedCluesCount,
    totalCluesCount,
  } = useGameStore();

  if (!board) {
    return (
      <div className="flex h-96 items-center justify-center text-amber-300">
        <p className="text-lg font-bold animate-pulse">Initializing Board Room...</p>
      </div>
    );
  }

  const allCluesAnswered = completedCluesCount >= totalCluesCount;

  return (
    <div className="w-full">
      {/* Jeopardy Grid Container */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 rounded-lg border-4 border-yellow-600/90 bg-[#00052b] p-2 sm:p-4 shadow-[0_0_40px_rgba(6,12,233,0.3)]">
        {/* Category Header Row */}
        {board.categories.map((category) => (
          <CategoryHeader key={category.id} category={category} />
        ))}

        {/* Clue Rows (values 200, 400, 600, 800, 1000) */}
        {[0, 1, 2, 3, 4].map((rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {board.categories.map((category) => {
              const clue = category.clues[rowIndex];
              if (!clue) {
                return (
                  <div
                    key={`empty-${category.id}-${rowIndex}`}
                    className="min-h-[75px] rounded bg-blue-950/20"
                  />
                );
              }

              return (
                <ClueCard
                  key={clue.id}
                  clue={clue}
                  status={clueStatuses[clue.id] || 'unopened'}
                  onClick={() => openClue(category, clue)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Final Jeopardy Banner / Shortcut */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-yellow-500/40 bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-blue-950/80 px-4 py-3 text-sm text-amber-200">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span>
            Board Progress:{' '}
            <strong className="text-white">
              {completedCluesCount} of {totalCluesCount}
            </strong>{' '}
            clues played
          </span>
        </div>

        <button
          onClick={startFinalJeopardy}
          className={`flex items-center gap-2 rounded border px-4 py-1.5 font-bold transition shadow ${
            allCluesAnswered
              ? 'border-yellow-400 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 animate-bounce'
              : 'border-yellow-600/60 bg-blue-900/60 text-amber-300 hover:bg-blue-800'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>{allCluesAnswered ? 'Advance to Final Jeopardy!' : 'Jump to Final Jeopardy'}</span>
        </button>
      </div>
    </div>
  );
};
