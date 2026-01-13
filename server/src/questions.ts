import type { ProblemSet } from './types.js';

export interface LevelData {
  problems: ProblemSet;
  answers: {
    p1: number;
    p2: number;
  };
}

const questions: Record<number, LevelData[]> = {
  // LEVEL 1: Basic Addition/Subtraction (1-20)
  1: [
    {
      problems: { p1Prompt: '12 + 5 = _', p2Prompt: '15 - _ = 10' },
      answers: { p1: 17, p2: 5 },
    },
    {
      problems: { p1Prompt: '_ + 7 = 15', p2Prompt: '8 + 8 = _' },
      answers: { p1: 8, p2: 16 },
    },
  ],
  // LEVEL 2: Larger numbers and Missing Operators (20-50)
  2: [
    {
      problems: { p1Prompt: '25 + 14 = _', p2Prompt: '45 - _ = 20' },
      answers: { p1: 39, p2: 25 },
    },
    {
      problems: { p1Prompt: '_ + 12 = 40', p2Prompt: '33 + 17 = _' },
      answers: { p1: 28, p2: 50 },
    },
  ],
  // LEVEL 3: Simple Multiplication & Triple Addition
  3: [
    {
      problems: { p1Prompt: '5 * 4 = _', p2Prompt: '12 + 12 + _ = 30' },
      answers: { p1: 20, p2: 6 },
    },
    {
      problems: { p1Prompt: '3 * _ = 21', p2Prompt: '50 - 15 - 5 = _' },
      answers: { p1: 7, p2: 30 },
    },
  ],
  // LEVEL 4: Division & Multi-step (Brackets)
  4: [
    {
      problems: { p1Prompt: '32 / 4 = _', p2Prompt: '(10 * 2) + _ = 25' },
      answers: { p1: 8, p2: 5 },
    },
    {
      problems: { p1Prompt: '_ / 3 = 9', p2Prompt: '100 - (20 + 30) = _' },
      answers: { p1: 27, p2: 50 },
    },
  ],
  // LEVEL 5: Squares & Larger Multi-step
  5: [
    {
      problems: { p1Prompt: '12 * 12 = _', p2Prompt: '150 / _ = 3' },
      answers: { p1: 144, p2: 50 },
    },
    {
      problems: { p1Prompt: '_ * 5 = 75', p2Prompt: '(4 * 4) + (3 * 3) = _' },
      answers: { p1: 15, p2: 25 },
    },
  ],
};

export type LevelResult =
  | { status: 'SUCCESS'; data: LevelData }
  | { status: 'COMPLETED' };

export const getLevelData = (level: number): LevelResult => {
  const pool = questions[level];

  if (!pool || pool.length === 0) {
    return { status: 'COMPLETED' };
  }
  const data = pool[Math.floor(Math.random() * pool.length)]!;
  return { status: 'SUCCESS', data };
};
