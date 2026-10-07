'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PlayerId } from '@/types/game';
import { Bell, Flame, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface TwoPlayerBuzzerProps {
  onPlayerActive: (playerId: PlayerId) => void;
}

export const TwoPlayerBuzzer: React.FC<TwoPlayerBuzzerProps> = ({ onPlayerActive }) => {
  const {
    buzzerState,
    activeBuzzerPlayer,
    buzzerTimeRemaining,
    playerAttempted,
    buzzIn,
    tickBuzzerTimer,
    players,
  } = useGameStore();

  // Keyboard listener for A and L keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        buzzIn('player1');
      } else if (e.key === 'l' || e.key === 'L') {
        buzzIn('player2');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzIn]);

  // Buzzer countdown timer tick
  useEffect(() => {
    if (
      buzzerState !== 'player1_active' &&
      buzzerState !== 'player2_active' &&
      buzzerState !== 'rebound_active'
    ) {
      return;
    }

    const interval = setInterval(() => {
      tickBuzzerTimer(0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [buzzerState, tickBuzzerTimer]);

  const p1Locked = playerAttempted.player1;
  const p2Locked = playerAttempted.player2;

  const isPlayer1Turn = activeBuzzerPlayer === 'player1';
  const isPlayer2Turn = activeBuzzerPlayer === 'player2';

  return (
    <div className="w-full rounded-lg border-2 border-yellow-600/60 bg-blue-950/80 p-3 sm:p-4 shadow-inner">
      <div className="mb-3 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
          <Bell className="h-4 w-4 text-yellow-400 animate-bounce" />
          <span>COUCH BUZZER LOCKOUT SYSTEM</span>
        </div>
        <p className="text-[11px] text-amber-200/70 mt-0.5">
          First to buzz earns 5 seconds to answer. Wrong answers allow a rebound!
        </p>
      </div>

      {/* Countdown progress bar if a player buzzed */}
      {activeBuzzerPlayer && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
            <span>
              {activeBuzzerPlayer === 'player1' ? 'PLAYER 1' : 'PLAYER 2'} WINDOW
            </span>
            <span className="font-mono text-sm text-yellow-400">
              {buzzerTimeRemaining.toFixed(1)}s
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-100 ${
                buzzerTimeRemaining > 2
                  ? 'bg-emerald-400'
                  : buzzerTimeRemaining > 1
                  ? 'bg-amber-400'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${(buzzerTimeRemaining / 5.0) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Buzzer Buttons / Lockout Podiums */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Player 1 Pod */}
        <button
          onClick={() => buzzIn('player1')}
          disabled={p1Locked || buzzerState === 'player2_active'}
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition active:scale-95 cursor-pointer ${
            isPlayer1Turn
              ? 'border-yellow-300 bg-blue-600 text-white ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse'
              : p1Locked
              ? 'border-slate-700 bg-slate-900/60 text-slate-500 opacity-50 cursor-not-allowed'
              : 'border-blue-400/80 bg-blue-900/80 text-blue-100 hover:bg-blue-800 hover:border-yellow-400'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
            <span>PLAYER 1</span>
            <kbd className="rounded border border-blue-300 bg-blue-950/90 px-1.5 py-0.5 text-xs text-yellow-300 font-mono">
              KEY [A]
            </kbd>
          </div>
          <span className="text-xs text-blue-200 mt-1">
            Score: ${players.player1.score.toLocaleString()}
          </span>
          {p1Locked && (
            <span className="mt-1 text-[10px] font-bold text-rose-400 uppercase">
              Locked Out
            </span>
          )}
          {isPlayer1Turn && (
            <span className="mt-1 text-[10px] font-black text-yellow-300 uppercase tracking-wider">
              BUZZED IN!
            </span>
          )}
        </button>

        {/* Player 2 Pod */}
        <button
          onClick={() => buzzIn('player2')}
          disabled={p2Locked || buzzerState === 'player1_active'}
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition active:scale-95 cursor-pointer ${
            isPlayer2Turn
              ? 'border-yellow-300 bg-rose-600 text-white ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse'
              : p2Locked
              ? 'border-slate-700 bg-slate-900/60 text-slate-500 opacity-50 cursor-not-allowed'
              : 'border-rose-400/80 bg-rose-950/80 text-rose-100 hover:bg-rose-900 hover:border-yellow-400'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
            <span>PLAYER 2</span>
            <kbd className="rounded border border-rose-300 bg-rose-950/90 px-1.5 py-0.5 text-xs text-yellow-300 font-mono">
              KEY [L]
            </kbd>
          </div>
          <span className="text-xs text-rose-200 mt-1">
            Score: ${players.player2.score.toLocaleString()}
          </span>
          {p2Locked && (
            <span className="mt-1 text-[10px] font-bold text-rose-400 uppercase">
              Locked Out
            </span>
          )}
          {isPlayer2Turn && (
            <span className="mt-1 text-[10px] font-black text-yellow-300 uppercase tracking-wider">
              BUZZED IN!
            </span>
          )}
        </button>
      </div>

      {buzzerState === 'rebound_active' && (
        <div className="mt-2 text-center text-xs font-bold text-amber-300 animate-pulse">
          ⚡ REBOUND ACTIVE! Second player has a chance to steal!
        </div>
      )}
    </div>
  );
};
