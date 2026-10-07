'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { GameMode } from '@/types/game';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Tv,
  Flame,
  Sparkles,
  Users,
  Calendar,
  Layers,
  Share2,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onOpenAIGenerator: () => void;
  onOpenDailyStats: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAIGenerator,
  onOpenDailyStats,
  onOpenSettings,
  onOpenHowToPlay,
}) => {
  const {
    mode,
    initGame,
    singleScore,
    players,
    soundMuted,
    setSoundMuted,
    speechEnabled,
    setSpeechEnabled,
    crtScanlines,
    setCRTScanlines,
    dailyStats,
    todayDateStr,
    board,
  } = useGameStore();

  const handleModeChange = (newMode: GameMode) => {
    if (newMode === mode) return;
    initGame(newMode);
  };

  const formattedSingleScore =
    singleScore >= 0
      ? `$${singleScore.toLocaleString()}`
      : `-$${Math.abs(singleScore).toLocaleString()}`;

  return (
    <header className="relative z-20 border-b-4 border-yellow-600 bg-gradient-to-b from-[#020638] via-[#040b54] to-[#010329] text-white shadow-2xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 md:flex-row">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1
              className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl"
              style={{ fontFamily: 'Georgia, serif', textTransform: 'uppercase' }}
            >
              The Board Room
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-amber-300/80 uppercase">
              Retro Trivia Showcase • {board?.title || 'Jeopardy Edition'}
            </span>
          </div>

          {/* Daily Streak Badge */}
          {dailyStats.currentStreak > 0 && (
            <button
              onClick={onOpenDailyStats}
              title="Daily Streak"
              className="flex items-center gap-1 rounded-full border border-orange-500/50 bg-orange-950/40 px-2.5 py-1 text-xs font-bold text-orange-400 hover:bg-orange-900/60 transition"
            >
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{dailyStats.currentStreak} Day{dailyStats.currentStreak > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* Game Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-yellow-600/40 bg-[#000a40]/90 p-1 text-xs shadow-inner">
          <button
            onClick={() => handleModeChange('daily')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition ${
              mode === 'daily'
                ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-200 hover:bg-blue-900/60'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Daily Drop</span>
          </button>

          <button
            onClick={() => handleModeChange('classic')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition ${
              mode === 'classic'
                ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-200 hover:bg-blue-900/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Classic Vault</span>
          </button>

          <button
            onClick={() => handleModeChange('two-player')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition ${
              mode === 'two-player'
                ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-slate-950 shadow-md font-extrabold'
                : 'text-amber-200 hover:bg-blue-900/60'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Couch Co-Op</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-950/50 px-3 py-1.5 font-bold text-cyan-300 hover:bg-cyan-900/60 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Clue Lab</span>
          </button>
        </div>

        {/* Live Scoreboard & Controls */}
        <div className="flex items-center gap-3">
          {/* Score display */}
          {mode !== 'two-player' ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/70">
                Score
              </span>
              <div
                className={`text-xl font-black tracking-tight ${
                  singleScore >= 0 ? 'text-amber-300' : 'text-red-400'
                } drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
                style={{ fontFamily: 'monospace' }}
              >
                {formattedSingleScore}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center rounded border border-blue-400/40 bg-blue-950/60 px-2 py-0.5">
                <span className="text-[9px] font-bold text-blue-300">P1 (A)</span>
                <span className="text-sm font-black text-amber-300" style={{ fontFamily: 'monospace' }}>
                  ${players.player1.score.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center rounded border border-rose-400/40 bg-rose-950/60 px-2 py-0.5">
                <span className="text-[9px] font-bold text-rose-300">P2 (L)</span>
                <span className="text-sm font-black text-amber-300" style={{ fontFamily: 'monospace' }}>
                  ${players.player2.score.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Quick Action Icon Buttons */}
          <div className="flex items-center gap-1 border-l border-yellow-600/40 pl-3">
            {/* Audio Mute Toggle */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              title={soundMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
              className={`rounded p-1.5 transition ${
                soundMuted
                  ? 'bg-red-950 text-red-400 hover:bg-red-900'
                  : 'bg-blue-900/60 text-amber-300 hover:bg-blue-800'
              }`}
            >
              {soundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Host Voice Toggle */}
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              title={speechEnabled ? 'Disable Synthesized Host' : 'Enable Synthesized Host'}
              className={`rounded p-1.5 transition ${
                speechEnabled
                  ? 'bg-blue-900/60 text-amber-300 hover:bg-blue-800'
                  : 'bg-red-950 text-red-400 hover:bg-red-900'
              }`}
            >
              {speechEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>

            {/* CRT TV scanlines */}
            <button
              onClick={() => setCRTScanlines(!crtScanlines)}
              title={crtScanlines ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
              className={`rounded p-1.5 transition ${
                crtScanlines
                  ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Tv className="h-4 w-4" />
            </button>

            {/* How to Play / Help */}
            <button
              onClick={onOpenHowToPlay}
              title="How to Play & Shortcuts"
              className="rounded p-1.5 bg-blue-900/60 text-amber-300 hover:bg-blue-800 transition"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Game Settings"
              className="rounded p-1.5 bg-blue-900/60 text-amber-300 hover:bg-blue-800 transition"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
