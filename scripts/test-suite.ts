import { cleanAnswer, validateAnswer, calculateSimilarity } from '../src/lib/validation';
import { generateDailyBoard, generateClassicBoard, hashDateString } from '../src/lib/daily-drop';
import { CLASSIC_CATEGORIES, FINAL_JEOPARDY_VAULT } from '../src/data/classic-vault';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('=== TEST SUITE: THE BOARD ROOM ===\n');

// 1. Preamble & Article Stripping
console.log('--- 1. Canonical Jeopardy Preamble & Article Stripping ---');
assert(cleanAnswer('What is Abraham Lincoln?') === 'abraham lincoln', 'Strips "What is"');
assert(cleanAnswer('Who was Marie Curie?') === 'marie curie', 'Strips "Who was"');
assert(cleanAnswer('What are the Great Lakes?') === 'great lakes', 'Strips "What are"');
assert(cleanAnswer('Where is Paris?') === 'paris', 'Strips "Where is"');
assert(cleanAnswer('Is it The Godfather?') === 'godfather', 'Strips "Is it The"');
assert(cleanAnswer('The Pacific Ocean') === 'pacific ocean', 'Strips leading "The"');
assert(cleanAnswer('A Sandwich') === 'sandwich', 'Strips leading "A"');
assert(cleanAnswer('An Apple') === 'apple', 'Strips leading "An"');
assert(cleanAnswer('  "Les Misérables"  ') === 'les miserables', 'Strips quotes and accents');

// 2. Fuzzy Validation & Typo Tolerance
console.log('\n--- 2. Fuzzy Matching & Typo Tolerance ---');
{
  const res1 = validateAnswer('What is Abraham Lincoln?', 'Abraham Lincoln', ['Lincoln', 'Abe Lincoln']);
  assert(res1.isCorrect, 'Exact match with preamble');
}
{
  const res2 = validateAnswer('Lincoln', 'Abraham Lincoln', ['Lincoln', 'Abe Lincoln']);
  assert(res2.isCorrect, 'Surname-only match');
}
{
  const res3 = validateAnswer('Mobi Dick', 'Moby-Dick', ['Moby Dick']);
  assert(res3.isCorrect, 'Minor typo tolerance in "Mobi Dick"');
}
{
  const res4 = validateAnswer('Ludwig van Beethovn', 'Ludwig van Beethoven', ['Beethoven']);
  assert(res4.isCorrect, 'Minor typo in Beethoven');
}
{
  const res5 = validateAnswer('MJ', 'Michael Jackson', ['Jackson', 'MJ', 'King of Pop']);
  assert(res5.isCorrect, 'Alias match for MJ');
}
{
  const res6 = validateAnswer('Thomas Jefferson', 'Abraham Lincoln', ['Lincoln', 'Abe Lincoln']);
  assert(!res6.isCorrect, 'Rejection of completely wrong answer');
}

// 3. Static J-Archive Vault Data Integrity
console.log('\n--- 3. J-Archive Vault Dataset Verification ---');
assert(CLASSIC_CATEGORIES.length >= 50, `Vault has 50+ categories (found: ${CLASSIC_CATEGORIES.length})`);
assert(FINAL_JEOPARDY_VAULT.length >= 10, `Final Jeopardy vault has 10+ clues (found: ${FINAL_JEOPARDY_VAULT.length})`);

let allCluesValid = true;
let allValuesTiered = true;

CLASSIC_CATEGORIES.forEach((cat) => {
  if (cat.clues.length !== 5) {
    allCluesValid = false;
    console.error(`Category ${cat.title} does not have exactly 5 clues!`);
  }
  const values = cat.clues.map((c) => c.value);
  if (JSON.stringify(values) !== JSON.stringify([200, 400, 600, 800, 1000])) {
    allValuesTiered = false;
    console.error(`Category ${cat.title} values are not [200, 400, 600, 800, 1000]`);
  }
});

assert(allCluesValid, 'All 52 categories have exactly 5 clues');
assert(allValuesTiered, 'All categories strictly adhere to $200-$1000 difficulty tiers');

// 4. Daily Drop Mode Seed Hashing & Determinism
console.log('\n--- 4. Daily Drop Determinism & Date Hashing ---');
const dateA = '2026-10-07';
const boardA1 = generateDailyBoard(dateA);
const boardA2 = generateDailyBoard(dateA);
assert(boardA1.categories.length === 5, 'Daily board contains 5 categories');
assert(boardA1.categories[0].id === boardA2.categories[0].id, 'Deterministic category 0');
assert(boardA1.categories[4].id === boardA2.categories[4].id, 'Deterministic category 4');
assert(boardA1.finalJeopardy.clue === boardA2.finalJeopardy.clue, 'Deterministic Final Jeopardy');

// Check that a different date produces a different board
const dateB = '2026-10-08';
const boardB = generateDailyBoard(dateB);
assert(boardA1.categories[0].id !== boardB.categories[0].id || boardA1.categories[1].id !== boardB.categories[1].id, 'Different dates produce different boards');

// Check Daily Double presence
const dailyDoublesCount = boardA1.categories.reduce((acc, cat) => {
  return acc + cat.clues.filter((c) => c.isDailyDouble).length;
}, 0);
assert(dailyDoublesCount === 1, `Daily Drop contains exactly 1 designated Daily Double (found: ${dailyDoublesCount})`);

// 5. Classic Board Generator
console.log('\n--- 5. Classic Vault Deal ---');
const classicBoard = generateClassicBoard();
assert(classicBoard.categories.length === 5, 'Classic board deal selects 5 categories');
assert(!!classicBoard.finalJeopardy, 'Classic board includes Final Jeopardy clue');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
