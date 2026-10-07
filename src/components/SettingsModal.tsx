'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import {
  Settings,
  Volume2,
  Mic,
  Tv,
  Key,
  RotateCcw,
  X,
  Check,
  Bot,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    soundMuted,
    setSoundMuted,
    soundVolume,
    setSoundVolume,
    speechEnabled,
    setSpeechEnabled,
    crtScanlines,
    setCRTScanlines,
    aiApiKey,
    setAIApiKey,
    aiProvider,
    setAIProvider,
    initGame,
    mode,
  } = useGameStore();

  const [tempKey, setTempKey] = useState(aiApiKey);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setAIApiKey(tempKey);
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl border-4 border-yellow-600/80 bg-gradient-to-b from-[#02073d] via-[#040e69] to-[#01042b] p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-yellow-600/40 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-300" />
            <h2
              className="text-xl font-black uppercase tracking-wider text-amber-300"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              Game Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-amber-300 hover:bg-blue-900/60 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Options List */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Audio SFX Volume */}
          <div className="rounded-xl border border-blue-800/60 bg-[#00052b] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-amber-400" />
                Synthesized Web Audio SFX
              </span>
              <button
                onClick={() => setSoundMuted(!soundMuted)}
                className={`rounded px-2.5 py-1 font-bold ${
                  soundMuted
                    ? 'bg-red-950 text-red-300 border border-red-700'
                    : 'bg-blue-900/80 text-amber-300 border border-blue-600'
                }`}
              >
                {soundMuted ? 'Muted' : 'Enabled'}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-amber-300/70">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <span className="font-mono text-amber-300 w-8 text-right">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Web Speech API Host Synthesis */}
          <div className="rounded-xl border border-blue-800/60 bg-[#00052b] p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-amber-400" />
                Synthesized Host Clue Reading
              </span>
              <p className="text-[11px] text-amber-200/60 mt-0.5">
                Uses browser Web Speech API to read clues aloud.
              </p>
            </div>

            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`rounded px-2.5 py-1 font-bold ${
                speechEnabled
                  ? 'bg-blue-900/80 text-amber-300 border border-blue-600'
                  : 'bg-red-950 text-red-300 border border-red-700'
              }`}
            >
              {speechEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* CRT Scanline Shader */}
          <div className="rounded-xl border border-blue-800/60 bg-[#00052b] p-3.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <Tv className="h-4 w-4 text-amber-400" />
                Retro CRT Scanlines & TV Bezel
              </span>
              <p className="text-[11px] text-amber-200/60 mt-0.5">
                Authentic 1980s television display raster lines.
              </p>
            </div>

            <button
              onClick={() => setCRTScanlines(!crtScanlines)}
              className={`rounded px-2.5 py-1 font-bold ${
                crtScanlines
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                  : 'bg-gray-800 text-gray-300 border border-gray-600'
              }`}
            >
              {crtScanlines ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* AI Generator API Keys */}
          <div className="rounded-xl border border-cyan-800/60 bg-[#00052b] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-200 flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-cyan-400" />
                AI API Key (Gemini / OpenAI)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAIProvider('gemini')}
                  className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                    aiProvider === 'gemini'
                      ? 'bg-cyan-600 text-black'
                      : 'bg-cyan-950 text-cyan-300'
                  }`}
                >
                  Gemini
                </button>
                <button
                  onClick={() => setAIProvider('openai')}
                  className={`rounded px-2 py-0.5 font-bold text-[10px] ${
                    aiProvider === 'openai'
                      ? 'bg-cyan-600 text-black'
                      : 'bg-cyan-950 text-cyan-300'
                  }`}
                >
                  OpenAI
                </button>
              </div>
            </div>

            <p className="text-[10px] text-cyan-300/70">
              Optional: Leave blank to use the high-quality built-in procedural engine.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIza... or sk-..."
                className="flex-1 rounded border border-cyan-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
              <button
                onClick={handleSaveKey}
                className="flex items-center gap-1 rounded bg-cyan-600 px-3 py-1.5 font-bold text-slate-950 hover:bg-cyan-500 transition"
              >
                {savedKeySuccess ? <Check className="h-4 w-4" /> : <span>Save</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Reset / New Game */}
        <div className="mt-6 flex justify-between border-t border-yellow-600/30 pt-4">
          <button
            onClick={() => {
              initGame(mode);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-900/60 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Active Game</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-yellow-400 px-5 py-2 text-xs font-black text-slate-950 hover:bg-yellow-300 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
