'use client';

import React from 'react';
import { Clue, ClueStatus } from '@/types/game';
import { Check, X, Minus } from 'lucide-react';

interface ClueCardProps {
  clue: Clue;
  status: ClueStatus;
  onClick: () => void;
}

export const ClueCard: React.FC<ClueCardProps> = ({ clue, status, onClick }) => {
  const isPlayed = status && status !== 'unopened';

  if (isPlayed) {
    return (
      <div className="relative flex min-h-[75px] sm:min-h-[90px] items-center justify-center rounded border border-blue-900/40 bg-[#02052b]/60 p-2 text-center select-none opacity-40">
        {status === 'correct' && (
          <div className="flex flex-col items-center">
            <Check className="h-6 w-6 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">CORRECT</span>
          </div>
        )}
        {status === 'incorrect' && (
          <div className="flex flex-col items-center">
            <X className="h-6 w-6 text-rose-500" />
            <span className="text-[10px] font-bold text-rose-400">MISSED</span>
          </div>
        )}
        {status === 'passed' && (
          <div className="flex flex-col items-center">
            <Minus className="h-6 w-6 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400">PASSED</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative flex min-h-[75px] sm:min-h-[90px] w-full flex-col items-center justify-center rounded border-2 border-[#1627c7] bg-gradient-to-b from-[#060CE9] via-[#0408B4] to-[#02056B] p-2 text-center shadow-lg transition-all duration-150 hover:scale-[1.03] hover:border-yellow-400 hover:shadow-yellow-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
    >
      <span
        className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-yellow-200 transition-colors"
        style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
      >
        ${clue.value}
      </span>
    </button>
  );
};
