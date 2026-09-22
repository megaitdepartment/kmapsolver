import React, { useState, useEffect } from 'react';
import { SolverResult, OptimizationForm, VariableCount } from '../types';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  Eye,
  EyeOff,
  X,
  BookOpen,
  ArrowRight,
  Layers,
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  title: string;
  varCount: VariableCount;
  minterms: number[];
  dontCares: number[];
  question: string;
  hint: string;
  expected: string;
}

export const QUIZ_BANKS: Record<VariableCount, Record<OptimizationForm, QuizQuestion[]>> = {
  2: {
    SOP: [
      {
        id: 'sop-2v-1',
        title: 'Single Row Adjacency (A=0)',
        varCount: 2,
        minterms: [0, 1],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B) = Σ m(0, 1)?',
        hint: "Cells m0 (00) and m1 (01) occupy row A=0. Variable B varies between 0 and 1 and cancels out, leaving A'.",
        expected: "A'",
      },
      {
        id: 'sop-2v-2',
        title: 'Diagonal Checkerboard (XOR)',
        varCount: 2,
        minterms: [1, 2],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B) = Σ m(1, 2)?',
        hint: "The diagonal 1s differ by 2 bits and cannot combine into a power-of-2 group. Write the sum of two single minterms: A'B + AB'.",
        expected: "A'B + AB'",
      },
      {
        id: 'sop-2v-3',
        title: 'Three Minterms (OR Logic)',
        varCount: 2,
        minterms: [1, 2, 3],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B) = Σ m(1, 2, 3)?',
        hint: 'Cell m3 pairs with m2 to give A, and m3 pairs with m1 to give B. The minimal sum of products is A + B.',
        expected: 'A + B',
      },
      {
        id: 'sop-2v-4',
        title: "Don't-Care Optimization",
        varCount: 2,
        minterms: [2],
        dontCares: [3],
        question: 'What is the minimal SOP expression for F(A, B) = Σ m(2) + d(3)?',
        hint: "Include don't-care cell 3 (AB=11) with minterm 2 (AB=10) to form a 2-cell group across row A=1.",
        expected: 'A',
      },
    ],
    POS: [
      {
        id: 'pos-2v-1',
        title: 'Row of Maxterms (A=0)',
        varCount: 2,
        minterms: [2, 3], // Maxterms: 0, 1 are zeros
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B) = Π M(0, 1)?',
        hint: 'Zeros occupy row A=0 (M0 and M1). In POS notation, A=0 corresponds to the uncomplemented sum term (A).',
        expected: '(A)',
      },
      {
        id: 'pos-2v-2',
        title: 'Column of Maxterms (B=1)',
        varCount: 2,
        minterms: [0, 2], // Maxterms: 1, 3 are zeros
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B) = Π M(1, 3)?',
        hint: "Zeros occupy column B=1 (M1 and M3). In POS sum terms, B=1 becomes complemented (B').",
        expected: "(B')",
      },
      {
        id: 'pos-2v-3',
        title: 'Diagonal Maxterms (XNOR)',
        varCount: 2,
        minterms: [1, 2], // Maxterms: 0, 3 are zeros
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B) = Π M(0, 3)?',
        hint: "Maxterm M0 (00) gives (A + B) and M3 (11) gives (A' + B'). Multiply the two sum terms.",
        expected: "(A + B)(A' + B')",
      },
      {
        id: 'pos-2v-4',
        title: "POS Don't-Care Optimization",
        varCount: 2,
        minterms: [1, 3], // Maxterms: 0 is zero
        dontCares: [2], // Cell 2 is X
        question: 'What is the minimal POS expression for F(A, B) = Π M(0) + d(2)?',
        hint: "Combine zero at M0 (00) with don't-care at cell 2 (10) in column B=0 to eliminate variable A.",
        expected: '(B)',
      },
    ],
  },
  3: {
    SOP: [
      {
        id: 'sop-3v-1',
        title: 'Full Adder Carry Out (Cout)',
        varCount: 3,
        minterms: [3, 5, 6, 7],
        dontCares: [],
        question: 'What is the minimal SOP expression for Full Adder Carry Out F(A, B, C) = Σ m(3, 5, 6, 7)?',
        hint: 'Three pairs of adjacent 1s form three overlapping 2-cell groups: AB + AC + BC.',
        expected: 'AB + AC + BC',
      },
      {
        id: 'sop-3v-2',
        title: '4-Cell Quad Group',
        varCount: 3,
        minterms: [2, 3, 6, 7],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C) = Σ m(2, 3, 6, 7)?',
        hint: 'The 4 cells span the two central columns where B=1 across both row A=0 and row A=1.',
        expected: 'B',
      },
      {
        id: 'sop-3v-3',
        title: 'Left-Right Wrap-Around Pair',
        varCount: 3,
        minterms: [0, 2],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C) = Σ m(0, 2)?',
        hint: "In row A=0, the leftmost column (BC=00) and rightmost column (BC=10) wrap around because C=0. Result: A'C'.",
        expected: "A'C'",
      },
      {
        id: 'sop-3v-4',
        title: "3-Variable Don't-Care",
        varCount: 3,
        minterms: [1, 3, 5],
        dontCares: [7],
        question: 'What is the minimal SOP expression for F(A, B, C) = Σ m(1, 3, 5) + d(7)?',
        hint: "Combine the 1s with don't-care d(7) to form a 4-cell group occupying all cells where C=1.",
        expected: 'C',
      },
    ],
    POS: [
      {
        id: 'pos-3v-1',
        title: '4-Cell Column Maxterm Group',
        varCount: 3,
        minterms: [2, 3, 6, 7], // Maxterms: 0, 1, 4, 5
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C) = Π M(0, 1, 4, 5)?',
        hint: 'Zeros occupy columns where C=0 across both rows. The 4-cell group of zeros simplifies to the single sum term (C).',
        expected: '(C)',
      },
      {
        id: 'pos-3v-2',
        title: '3-Variable Majority Zeros',
        varCount: 3,
        minterms: [3, 5, 6, 7], // Maxterms: 0, 1, 2, 4
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C) = Π M(0, 1, 2, 4)?',
        hint: 'Three 2-cell groups of zeros cover all maxterms: (A + B)(A + C)(B + C).',
        expected: '(A + B)(A + C)(B + C)',
      },
      {
        id: 'pos-3v-3',
        title: 'Corner Maxterms Wrap-Around',
        varCount: 3,
        minterms: [1, 3, 5, 7], // Maxterms: 0, 2, 4, 6
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C) = Π M(0, 2, 4, 6)?',
        hint: 'Zeros occupy columns BC=00 and BC=10 where C=0 across all rows. The 4-cell group simplifies to (C).',
        expected: '(C)',
      },
    ],
  },
  4: {
    SOP: [
      {
        id: 'sop-4v-1',
        title: 'Corner Wrap-Around Adjacency',
        varCount: 4,
        minterms: [0, 2, 8, 10],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D) = Σ m(0, 2, 8, 10)?',
        hint: "Look at the four outer corners of the 4×4 map (m0, m2, m8, m10). They wrap horizontally and vertically into a single 4-cell group where B=0 and D=0: B'D'.",
        expected: "B'D'",
      },
      {
        id: 'sop-4v-2',
        title: "Don't-Care Optimization",
        varCount: 4,
        minterms: [1, 3, 7, 11, 15],
        dontCares: [0, 2, 5],
        question: 'What is the minimal SOP expression for F(A, B, C, D) = Σ m(1, 3, 7, 11, 15) + d(0, 2, 5)?',
        hint: "Include don't-care d(5) with m(1, 3, 7) to form a 4-cell group (A'D), and m(3, 7, 11, 15) forms a full vertical column (CD).",
        expected: "CD + A'D",
      },
      {
        id: 'sop-4v-3',
        title: 'Row Wrap-Around Octet',
        varCount: 4,
        minterms: [0, 1, 2, 3, 8, 9, 10, 11],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D) = Σ m(0, 1, 2, 3, 8, 9, 10, 11)?',
        hint: "Row 0 (AB=00) and Row 3 (AB=10) wrap around top-to-bottom to form an 8-cell octet where B=0. The term is B'.",
        expected: "B'",
      },
      {
        id: 'sop-4v-4',
        title: 'Essential vs Redundant Groups',
        varCount: 4,
        minterms: [2, 3, 6, 7, 8, 10, 12, 14],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D) = Σ m(2, 3, 6, 7, 8, 10, 12, 14)?',
        hint: "Left columns m(2, 3, 6, 7) form A'C, and right wrap-around corners m(8, 10, 12, 14) form AD'.",
        expected: "A'C + AD'",
      },
    ],
    POS: [
      {
        id: 'pos-4v-1',
        title: 'Corner Maxterm Wrap-Around',
        varCount: 4,
        minterms: [1, 3, 4, 5, 6, 7, 9, 11, 12, 13, 14, 15], // Maxterms: 0, 2, 8, 10
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D) = Π M(0, 2, 8, 10)?',
        hint: 'Group the 4 outer corner zeros (M0, M2, M8, M10). In POS sum terms, B=0 gives B and D=0 gives D. Result: (B + D).',
        expected: '(B + D)',
      },
      {
        id: 'pos-4v-2',
        title: 'Column Elimination (All Odd Maxterms)',
        varCount: 4,
        minterms: [0, 2, 4, 6, 8, 10, 12, 14], // Maxterms: 1, 3, 5, 7, 9, 11, 13, 15
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D) = Π M(1, 3, 5, 7, 9, 11, 13, 15)?',
        hint: "All 8 odd states have D=1. In maxterm form, D=1 corresponds to the literal D'. An 8-cell group of zeros reduces to (D').",
        expected: "(D')",
      },
      {
        id: 'pos-4v-3',
        title: "POS with Don't Cares",
        varCount: 4,
        minterms: [0, 1, 2, 3, 8, 9, 10, 11], // Maxterms: 4, 5, 6, 7, 12, 13
        dontCares: [14, 15],
        question: 'What is the minimal POS expression for F(A, B, C, D) = Π M(4, 5, 6, 7, 12, 13) + d(14, 15)?',
        hint: "Combine the zeros in row 1 (01) and row 2 (11) with don't-cares 14, 15 to form an 8-cell group where B=1. Result: (B').",
        expected: "(B')",
      },
      {
        id: 'pos-4v-4',
        title: 'Row Wrap-Around (B=0)',
        varCount: 4,
        minterms: [4, 5, 6, 7, 12, 13, 14, 15], // Maxterms: 0, 1, 2, 3, 8, 9, 10, 11
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D) = Π M(0, 1, 2, 3, 8, 9, 10, 11)?',
        hint: 'Top row (AB=00) and bottom row (AB=10) contain zeros where B=0. The 8-cell group simplifies to the sum term (B).',
        expected: '(B)',
      },
    ],
  },
  5: {
    SOP: [
      {
        id: 'sop-5v-1',
        title: '3D Inter-Layer Corner Adjacency',
        varCount: 5,
        minterms: [0, 2, 8, 10, 16, 18, 24, 26],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D, E) = Σ m(0, 2, 8, 10, 16, 18, 24, 26)?',
        hint: "The four corners in submap A=0 (0, 2, 8, 10) align with the four corners in submap A=1 (16, 18, 24, 26). Variable A cancels across layers, and in each 4x4 map BCDE cancels B and D. Result: C'E'.",
        expected: "C'E'",
      },
      {
        id: 'sop-5v-2',
        title: 'Single Submap Octet (A=0)',
        varCount: 5,
        minterms: [0, 1, 2, 3, 4, 5, 6, 7],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D, E) = Σ m(0, 1, 2, 3, 4, 5, 6, 7)?',
        hint: "All 8 minterms reside entirely in submap A=0 (so A' is retained) in the first two rows where B=0. Result: A'B'.",
        expected: "A'B'",
      },
      {
        id: 'sop-5v-3',
        title: "5-Variable Don't-Care Optimization",
        varCount: 5,
        minterms: [1, 3, 5, 7],
        dontCares: [17, 19, 21, 23],
        question: 'What is the minimal SOP expression for F(A, B, C, D, E) = Σ m(1, 3, 5, 7) + d(17, 19, 21, 23)?',
        hint: "Minterms in layer A=0 (where B=0 and E=1) merge with don't-cares in layer A=1 (where B=0 and E=1) to form an 8-cell 3D group canceling A. Result: B'E.",
        expected: "B'E",
      },
    ],
    POS: [
      {
        id: 'pos-5v-1',
        title: '3D Inter-Layer Maxterm Group',
        varCount: 5,
        // Maxterms: 0, 2, 8, 10, 16, 18, 24, 26
        minterms: Array.from({ length: 32 }, (_, i) => i).filter(
          i => ![0, 2, 8, 10, 16, 18, 24, 26].includes(i)
        ),
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D, E) = Π M(0, 2, 8, 10, 16, 18, 24, 26)?',
        hint: 'The 8 corner zeros span both layers (A=0 and A=1). Across layers A cancels; within the maps C=0 and E=0. In POS sum terms, this gives (C + E).',
        expected: '(C + E)',
      },
      {
        id: 'pos-5v-2',
        title: '5-Variable Submap Maxterm Row',
        varCount: 5,
        // Maxterms: 0, 1, 2, 3, 4, 5, 6, 7
        minterms: Array.from({ length: 32 }, (_, i) => i).filter(
          i => ![0, 1, 2, 3, 4, 5, 6, 7].includes(i)
        ),
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D, E) = Π M(0, 1, 2, 3, 4, 5, 6, 7)?',
        hint: 'The 8 zeros reside in submap A=0 with B=0. In POS sum terms, A=0 and B=0 form the sum term (A + B).',
        expected: '(A + B)',
      },
    ],
  },
  6: {
    SOP: [
      {
        id: 'sop-6v-1',
        title: '4-Submap 16-Cell Hypercube Corner Group',
        varCount: 6,
        minterms: [0, 2, 8, 10, 16, 18, 24, 26, 32, 34, 40, 42, 48, 50, 56, 58],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D, E, F) = Σ m(0, 2, 8, 10, 16, 18, 24, 26, 32, 34, 40, 42, 48, 50, 56, 58)?',
        hint: "The 4 corners repeat across all 4 submaps (AB=00, 01, 11, 10), eliminating A and B. Within each 4x4 map, D=0 and F=0. Result: D'F'.",
        expected: "D'F'",
      },
      {
        id: 'sop-6v-2',
        title: 'Adjacent Submaps 16-Cell Group',
        varCount: 6,
        minterms: [0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20, 21, 22, 23],
        dontCares: [],
        question: 'What is the minimal SOP expression for F(A, B, C, D, E, F) = Σ m(0..7, 16..23)?',
        hint: "The 1s occupy top two rows (C=0) across submaps AB=00 and AB=01 (so A=0, and B cancels). Result: A'C'.",
        expected: "A'C'",
      },
    ],
    POS: [
      {
        id: 'pos-6v-1',
        title: '6-Variable 16-Cell Maxterm Hypercube',
        varCount: 6,
        minterms: Array.from({ length: 64 }, (_, i) => i).filter(
          i => ![0, 2, 8, 10, 16, 18, 24, 26, 32, 34, 40, 42, 48, 50, 56, 58].includes(i)
        ),
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D, E, F) = Π M(0, 2, 8, 10, 16, 18, 24, 26, 32, 34, 40, 42, 48, 50, 56, 58)?',
        hint: 'The 16 zeros occupy corner positions in all 4 submaps, canceling A and B. In each 4x4 map, D=0 and F=0. In POS sum terms, this gives (D + F).',
        expected: '(D + F)',
      },
      {
        id: 'pos-6v-2',
        title: '6-Variable Adjacent Submap Maxterms',
        varCount: 6,
        minterms: Array.from({ length: 64 }, (_, i) => i).filter(
          i => ![0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20, 21, 22, 23].includes(i)
        ),
        dontCares: [],
        question: 'What is the minimal POS expression for F(A, B, C, D, E, F) = Π M(0..7, 16..23)?',
        hint: 'Zeros occupy rows where C=0 across submaps AB=00 and AB=01. Literal A=0 and C=0 yield (A + C).',
        expected: '(A + C)',
      },
    ],
  },
};

interface QuizModeProps {
  currentResult: SolverResult;
  varCount: VariableCount;
  onChangeVarCount: (v: VariableCount) => void;
  form: OptimizationForm;
  onChangeForm: (form: OptimizationForm) => void;
  onLoadQuestion: (minterms: number[], dontCares: number[], varCount: VariableCount) => void;
  showDetailedSolution: boolean;
  onToggleDetailedSolution: () => void;
  onCloseQuiz: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({
  currentResult,
  varCount,
  onChangeVarCount,
  form,
  onChangeForm,
  onLoadQuestion,
  showDetailedSolution,
  onToggleDetailedSolution,
  onCloseQuiz,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Score tracked per unique question ID
  const [answeredMap, setAnsweredMap] = useState<Record<string, boolean>>({});

  const activeBank = QUIZ_BANKS[varCount]?.[form] || QUIZ_BANKS[4].SOP;
  const currentQuiz = activeBank[currentQIndex] || activeBank[0];

  // Whenever varCount, form, or currentQIndex changes, load the question into the solver
  useEffect(() => {
    setUserGuess('');
    setSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    const q = activeBank[currentQIndex] || activeBank[0];
    if (q) {
      onLoadQuestion(q.minterms, q.dontCares, q.varCount);
    }
  }, [varCount, form, currentQIndex]);

  // When switching varCount or form, reset question index to 0
  useEffect(() => {
    setCurrentQIndex(0);
  }, [varCount, form]);

  // Robust check for Boolean expressions
  const evaluateAnswer = (guess: string): boolean => {
    if (!guess.trim()) return false;

    const normalize = (s: string) =>
      s
        .replace(/^f\s*=\s*/i, '')
        .replace(/~/g, "'")
        .replace(/!([A-Za-z])/g, "$1'")
        .replace(/[\s*·]/g, '')
        .toLowerCase();

    const normalizedGuess = normalize(guess);
    const normalizedExpected = normalize(currentQuiz.expected);
    const normalizedSolver = normalize(
      form === 'SOP' ? currentResult.minimalEquation : currentResult.minimalPosEquation
    );

    // 1. Direct match with expected or solver output
    if (normalizedGuess === normalizedExpected || normalizedGuess === normalizedSolver) {
      return true;
    }

    // 2. Term permutation check for SOP (e.g., A + B == B + A, A'B + CD == CD + A'B)
    if (form === 'SOP') {
      const splitTerms = (s: string) =>
        s
          .replace(/^f\s*=\s*/i, '')
          .split('+')
          .map(t =>
            t
              .replace(/[\s*·]/g, '')
              .toLowerCase()
              .split('')
              .sort()
              .join('')
          )
          .sort();

      const guessTerms = splitTerms(guess);
      const expectedTerms = splitTerms(currentQuiz.expected);
      const solverTerms = splitTerms(currentResult.minimalEquation);

      if (
        guessTerms.join('+') === expectedTerms.join('+') ||
        guessTerms.join('+') === solverTerms.join('+')
      ) {
        return true;
      }
    }

    // 3. Factor permutation check for POS (e.g., (A + B)(C + D') == (C + D')(B + A))
    if (form === 'POS') {
      const splitFactors = (s: string) => {
        const matches = s.match(/\(([^)]+)\)/g);
        if (matches) {
          return matches
            .map(m => {
              const inner = m.replace(/[()]/g, '');
              const literals = inner
                .split('+')
                .map(l => l.replace(/[\s*·]/g, '').toLowerCase().trim())
                .sort();
              return `(${literals.join('+')})`;
            })
            .sort();
        }
        return [normalize(s)];
      };

      const guessFactors = splitFactors(guess);
      const expectedFactors = splitFactors(currentQuiz.expected);
      const solverFactors = splitFactors(currentResult.minimalPosEquation);

      if (
        guessFactors.join('') === expectedFactors.join('') ||
        guessFactors.join('') === solverFactors.join('')
      ) {
        return true;
      }
    }

    return false;
  };

  const handleCheck = () => {
    if (!userGuess.trim()) return;

    const correct = evaluateAnswer(userGuess);
    setIsCorrect(correct);
    setSubmitted(true);

    setAnsweredMap(prev => ({
      ...prev,
      [currentQuiz.id]: correct,
    }));
  };

  const handleNextQuestion = () => {
    const nextIdx = (currentQIndex + 1) % activeBank.length;
    setCurrentQIndex(nextIdx);
  };

  const scoreCorrect = Object.entries(answeredMap).filter(([id, ans]) => {
    return ans && activeBank.some(q => q.id === id);
  }).length;
  const scoreTotal = activeBank.length;

  const targetSolution = form === 'SOP' ? currentResult.minimalEquation : currentResult.minimalPosEquation;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3.5 transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Exam Practice & Self-Testing Mode
            </h3>
            <p className="text-[11px] text-slate-500">
              Select any variable count to practice tailored manual K-Map problems
            </p>
          </div>
        </div>

        {/* Variables Selection directly in Practice Header */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Vars:</span>
            </span>
            {([2, 3, 4, 5, 6] as VariableCount[]).map(v => (
              <button
                key={v}
                id={`practice-var-select-${v}-btn`}
                onClick={() => onChangeVarCount(v)}
                className={`px-2 py-0.5 text-xs font-bold font-mono rounded-md transition-all ${
                  varCount === v
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title={`Practice with ${v} Variables (${1 << v} cells)`}
              >
                {v}V
              </button>
            ))}
          </div>

          {/* Form Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onChangeForm('SOP')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                form === 'SOP'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SOP (&sum;)
            </button>
            <button
              onClick={() => onChangeForm('POS')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                form === 'POS'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              POS (&prod;)
            </button>
          </div>

          {/* Exam Score */}
          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium text-xs">
            Score:{' '}
            <strong className="text-indigo-600 font-mono text-sm font-bold">{scoreCorrect}</strong>
            {' / '}
            <span className="font-mono text-slate-500">{scoreTotal}</span>
          </div>

          {/* Next Challenge Button */}
          <button
            id="quiz-next-question-btn"
            onClick={handleNextQuestion}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Load next challenge in this variable bank"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Next ({currentQIndex + 1}/{activeBank.length})</span>
          </button>

          {/* Close Practice Mode */}
          <button
            onClick={onCloseQuiz}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Exit Practice Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Info */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200/80 uppercase tracking-wide">
            Question {currentQIndex + 1} of {activeBank.length}: {currentQuiz.title}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {currentQuiz.varCount} Variables ({1 << currentQuiz.varCount} cells) &bull; {form}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-snug">
          {currentQuiz.question}
        </p>
      </div>

      {/* Answer Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="quiz-answer-input"
          type="text"
          value={userGuess}
          onChange={e => setUserGuess(e.target.value)}
          placeholder={form === 'SOP' ? "e.g. B'D' or AB + C'D" : "e.g. (B + D) or (A + B')(C + D)"}
          className="flex-1 px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          onKeyDown={e => {
            if (e.key === 'Enter') handleCheck();
          }}
        />
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <button
            id="quiz-check-answer-btn"
            onClick={handleCheck}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
          >
            Check Answer
          </button>
          <button
            id="quiz-hint-btn"
            onClick={() => setShowHint(h => !h)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              showHint
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Hint</span>
          </button>
          <button
            id="quiz-toggle-detailed-solution-btn"
            onClick={onToggleDetailedSolution}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              showDetailedSolution
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Inspect full visual K-Map grid and Quine-McCluskey step-by-step steps"
          >
            {showDetailedSolution ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hide Solution Steps</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Show Solution Steps</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hint Alert */}
      {showHint && (
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 animate-fadeIn">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Grouping Hint: </span>
            {currentQuiz.hint}
          </div>
        </div>
      )}

      {/* Result Feedback Banner */}
      {submitted && (
        <div
          className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs transition-all ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {isCorrect ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {isCorrect ? 'Correct! Excellent optimization!' : 'Not quite minimal.'}
            </div>
            <div>
              Target minimal {form} equation:{' '}
              <strong className="font-mono text-slate-900 bg-white/70 px-1.5 py-0.5 rounded border border-slate-300/60">
                {targetSolution}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
