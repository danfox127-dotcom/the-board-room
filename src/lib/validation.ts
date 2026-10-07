import levenshtein from 'fast-levenshtein';
import { AnswerValidationResult } from '@/types/game';

/**
 * Normalizes an answer string by:
 * 1. Lowercasing and trimming
 * 2. Stripping accents/diacritics (e.g., Café -> cafe)
 * 3. Stripping common Jeopardy preamble phrasing ("What is", "Who is", etc.)
 * 4. Stripping leading English articles ("a", "an", "the")
 * 5. Stripping all punctuation and extra whitespace
 */
export function cleanAnswer(raw: string): string {
  if (!raw) return '';

  let cleaned = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip accents

  // Remove common punctuation: quotes, commas, periods, question marks, dashes, parentheses
  cleaned = cleaned.replace(/["'""’`]/g, '');

  // Strip leading Jeopardy question phrasing
  const preamblePatterns = [
    /^(what\s+is\s+|what\s+are\s+|what\s+was\s+|what\s+were\s+)/i,
    /^(whats\s+|who\s+is\s+|who\s+are\s+|who\s+was\s+|who\s+were\s+|whos\s+)/i,
    /^(where\s+is\s+|where\s+are\s+|where\s+was\s+|where\s+were\s+)/i,
    /^(when\s+is\s+|when\s+was\s+|why\s+is\s+|how\s+is\s+)/i,
    /^(is\s+it\s+|could\s+it\s+be\s+|it\s+is\s+)/i,
  ];

  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  // Strip leading articles
  cleaned = cleaned.replace(/^(the\s+|a\s+|an\s+)/i, '').trim();

  // Strip trailing punctuation & symbols
  cleaned = cleaned.replace(/[.,?!:;()[\]{}#&*~^/\\-]+/g, ' ').trim();

  // Collapse multiple whitespaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned;
}

/**
 * Calculates a normalized similarity score between 0 and 1 using Levenshtein distance.
 */
export function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const distance = levenshtein.get(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0;

  return Math.max(0, (maxLength - distance) / maxLength);
}

/**
 * Validates a user's answer against canonical answer and accepted answer aliases.
 */
export function validateAnswer(
  userRawInput: string,
  canonicalAnswer: string,
  acceptedAnswers: string[] = []
): AnswerValidationResult {
  const cleanedInput = cleanAnswer(userRawInput);

  if (!cleanedInput) {
    return {
      isCorrect: false,
      similarity: 0,
      cleanedInput: '',
      reason: 'No answer provided.',
    };
  }

  // Pool all valid candidates (canonical + accepted aliases)
  const candidateList = [canonicalAnswer, ...acceptedAnswers].filter(Boolean);

  let bestMatch: {
    target: string;
    cleanedTarget: string;
    similarity: number;
    distance: number;
  } = {
    target: '',
    cleanedTarget: '',
    similarity: 0,
    distance: Infinity,
  };

  for (const candidate of candidateList) {
    const cleanedTarget = cleanAnswer(candidate);
    if (!cleanedTarget) continue;

    // 1. Direct exact match
    if (cleanedInput === cleanedTarget) {
      return {
        isCorrect: true,
        similarity: 1.0,
        matchedAnswer: candidate,
        cleanedInput,
        reason: `Exact match for "${candidate}"`,
      };
    }

    // 2. Check if user provided just the surname/primary distinctive token
    // e.g. target is "abraham lincoln" and input is "lincoln"
    const targetTokens = cleanedTarget.split(' ');
    if (targetTokens.length > 1) {
      const surname = targetTokens[targetTokens.length - 1];
      if (cleanedInput === surname && surname.length >= 4) {
        return {
          isCorrect: true,
          similarity: 0.95,
          matchedAnswer: candidate,
          cleanedInput,
          reason: `Surname match "${surname}" for "${candidate}"`,
        };
      }
    }

    // 3. Check Levenshtein distance
    const dist = levenshtein.get(cleanedInput, cleanedTarget);
    const sim = calculateSimilarity(cleanedInput, cleanedTarget);

    if (sim > bestMatch.similarity) {
      bestMatch = {
        target: candidate,
        cleanedTarget,
        similarity: sim,
        distance: dist,
      };
    }
  }

  // Tolerance criteria:
  // Short words (<= 3 chars): must be exact (distance 0)
  // Medium words (4-6 chars): allow distance <= 1
  // Long words (> 6 chars): allow distance <= 2 OR similarity >= 0.82
  const targetLen = bestMatch.cleanedTarget.length;
  const inputLen = cleanedInput.length;
  const minLen = Math.min(targetLen, inputLen);

  let isAcceptableTypo = false;

  if (minLen <= 3) {
    isAcceptableTypo = bestMatch.distance === 0;
  } else if (minLen <= 6) {
    isAcceptableTypo = bestMatch.distance <= 1 || bestMatch.similarity >= 0.85;
  } else {
    isAcceptableTypo = bestMatch.distance <= 2 || bestMatch.similarity >= 0.82;
  }

  if (isAcceptableTypo) {
    return {
      isCorrect: true,
      similarity: bestMatch.similarity,
      matchedAnswer: bestMatch.target,
      cleanedInput,
      reason: `Accepted with typo tolerance (${Math.round(bestMatch.similarity * 100)}% match) against "${bestMatch.target}"`,
    };
  }

  return {
    isCorrect: false,
    similarity: bestMatch.similarity,
    matchedAnswer: bestMatch.target,
    cleanedInput,
    reason: `Did not match "${canonicalAnswer}" (Best match: "${bestMatch.target}" at ${Math.round(bestMatch.similarity * 100)}%)`,
  };
}
