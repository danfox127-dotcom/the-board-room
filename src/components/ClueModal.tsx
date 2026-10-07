'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { validateAnswer } from '@/lib/validation';
import { hostSpeech } from '@/lib/speech';
import { TwoPlayerBuzzer } from './TwoPlayerBuzzer';
import { AnswerValidationResult } from '@/types/game';
import {
  VolumeX,
  Send,
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';

export const ClueModal: React.FC = () => {
  const {
    activeClue,
    activeCategory,
    isClueModalOpen,
    closeClueModal,
    mode,
    submitAnswer,
    passClue,
    overrideJudgeDecision,
    buzzerState,
    activeBuzzerPlayer,
    dailyDoubleWager,
    speechEnabled,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [validationResult, setValidationResult] = useState<AnswerValidationResult | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to host speech state
  useEffect(() => {
    const unsubscribe = hostSpeech.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Reset state when a clue opens
  useEffect(() => {
    if (isClueModalOpen) {
      setInputVal('');
      setValidationResult(null);
      setIsAnswerSubmitted(false);

      if (mode !== 'two-player') {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
    }
  }, [isClueModalOpen, mode]);

  // Focus input when player buzzes in during 2-player mode
  useEffect(() => {
    if (mode === 'two-player' && activeBuzzerPlayer) {
      setInputVal('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [mode, activeBuzzerPlayer]);

  if (!isClueModalOpen || !activeClue || !activeCategory) {
    return null;
  }

  const effectiveValue = activeClue.isDailyDouble ? dailyDoubleWager : activeClue.value;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswerSubmitted) return;

    // Validate the answer with fuzzy matching & canonical stripping
    const result = validateAnswer(
      inputVal,
      activeClue.answer,
      activeClue.acceptedAnswers || []
    );

    setValidationResult(result);
    setIsAnswerSubmitted(true);

    // Commit answer to game store
    submitAnswer(inputVal, result.isCorrect);
  };

  const handleStopSpeech = () => {
    hostSpeech.stop();
  };

  const isInputDisabled =
    isAnswerSubmitted ||
    (mode === 'two-player' && !activeBuzzerPlayer);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex w-full max-w-3xl flex-col rounded-xl border-4 border-yellow-500 bg-gradient-to-b from-[#060CE9] via-[#0408B4] to-[#01045E] p-6 text-white shadow-[0_0_60px_rgba(6,12,233,0.8)]">
        {/* Top Header Card */}
        <div className="mb-4 flex items-center justify-between border-b-2 border-yellow-500/60 pb-3">
          <div className="flex flex-col">
            <span
              className="text-base sm:text-lg font-black uppercase tracking-widest text-amber-300 drop-shadow"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              {activeCategory.title}
            </span>
            {activeClue.isDailyDouble ? (
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 animate-pulse">
                ★ DAILY DOUBLE (${dailyDoubleWager.toLocaleString()}) ★
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-200">
                ${activeClue.value} Clue
              </span>
            )}
          </div>

          {/* Host Speech Indicator */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeech}
              title="Stop Host Voice"
              className="flex items-center gap-2 rounded-full border border-yellow-400/60 bg-blue-900/90 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-blue-800 transition shadow"
            >
              <div className="flex items-center gap-0.5">
                <span className="h-2 w-1 bg-yellow-400 animate-pulse" />
                <span className="h-3 w-1 bg-yellow-300 animate-pulse delay-75" />
                <span className="h-2 w-1 bg-yellow-400 animate-pulse delay-150" />
              </div>
              <span>Host Reading... (Click to Skip)</span>
            </button>
          )}
        </div>

        {/* The Clue Text Box */}
        <div className="my-6 flex min-h-[160px] items-center justify-center rounded-lg border border-yellow-400/30 bg-[#000844]/80 p-6 text-center shadow-inner">
          <p
            className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase leading-snug tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: 'Georgia, Cambria, serif' }}
          >
            {activeClue.clue}
          </p>
        </div>

        {/* Two-Player Buzzer Lockout Podium (if Couch Co-Op mode) */}
        {mode === 'two-player' && !isAnswerSubmitted && (
          <div className="mb-4">
            <TwoPlayerBuzzer onPlayerActive={() => {}} />
          </div>
        )}

        {/* Answer Input Section */}
        {!isAnswerSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isInputDisabled}
                placeholder={
                  mode === 'two-player' && !activeBuzzerPlayer
                    ? 'Waiting for a contestant to buzz in...'
                    : 'What is... / Who is...'
                }
                autoComplete="off"
                className="w-full rounded-lg border-2 border-yellow-400/80 bg-[#00052b] px-4 py-3 text-lg font-bold text-yellow-300 placeholder-yellow-600/60 shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isInputDisabled || !inputVal.trim()}
                className="absolute right-2 flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 font-black text-slate-950 shadow transition hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 cursor-pointer"
              >
                <span>Submit</span>
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-200/80">
              <span>
                💡 Phrasings like &quot;What is&quot;, &quot;Who is&quot;, and &quot;The&quot; are automatically stripped.
              </span>
              <button
                type="button"
                onClick={passClue}
                className="font-bold text-amber-400 hover:text-amber-200 underline transition cursor-pointer"
              >
                Pass / Triple Stumper
              </button>
            </div>
          </form>
        ) : (
          /* Post-Answer Feedback & Factoid Box */
          <div className="flex flex-col gap-3 rounded-lg border-2 border-yellow-500/60 bg-[#000636] p-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {validationResult?.isCorrect ? (
                  <div className="flex items-center gap-1.5 font-black text-emerald-400 text-lg">
                    <CheckCircle className="h-6 w-6" />
                    <span>CORRECT! +${effectiveValue.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-black text-rose-400 text-lg">
                    <XCircle className="h-6 w-6" />
                    <span>INCORRECT! -${effectiveValue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Canonical Answer Highlight */}
              <div className="text-right">
                <span className="text-[11px] font-bold text-amber-300/70 uppercase">
                  Correct Answer:
                </span>
                <div className="text-base font-black text-amber-300">
                  {activeClue.answer}
                </div>
              </div>
            </div>

            {/* Validation Match Reasoning */}
            {validationResult && (
              <p className="text-xs text-amber-100/90 italic bg-blue-950/60 p-2 rounded border border-blue-800/40">
                {validationResult.reason}
              </p>
            )}

            {/* Clue Explanation Factoid */}
            {activeClue.explanation && (
              <div className="flex items-start gap-2 rounded bg-blue-900/30 p-2.5 text-xs text-blue-200">
                <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{activeClue.explanation}</span>
              </div>
            )}

            {/* Judges' Ruling Override Button */}
            <div className="mt-2 flex items-center justify-between border-t border-yellow-600/30 pt-2 text-xs">
              <span className="text-amber-300/70 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-amber-400" />
                Contested Answer?
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => overrideJudgeDecision(true)}
                  className="rounded border border-emerald-500/60 bg-emerald-950/60 px-2.5 py-1 font-bold text-emerald-300 hover:bg-emerald-900 transition"
                >
                  Judges&apos; Override: Mark Correct
                </button>
                <button
                  type="button"
                  onClick={() => overrideJudgeDecision(false)}
                  className="rounded border border-rose-500/60 bg-rose-950/60 px-2.5 py-1 font-bold text-rose-300 hover:bg-rose-900 transition"
                >
                  Judges&apos; Override: Mark Incorrect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
