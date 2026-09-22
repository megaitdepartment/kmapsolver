export type VariableCount = 2 | 3 | 4 | 5 | 6;

export type CellValue = '0' | '1' | 'X';

export type OptimizationForm = 'SOP' | 'POS';

export interface CellCoord {
  row: number;
  col: number;
  subMap?: number; // for 5-variable (0, 1) or 6-variable (0, 1, 2, 3)
}

export interface Implicant {
  id: string;
  minterms: number[];
  dontCares: number[];
  binaryPattern: string; // e.g. "01-1" where '-' is don't-care/canceled
  termString: string; // e.g. "A' B D"
  posTermString: string; // e.g. "(A + B' + D')"
  latexTerm: string; // e.g. "\\overline{A} B D"
  latexPosTerm: string; // e.g. "(A + \\overline{B} + \\overline{D})"
  isEssential: boolean;
  color: string;
  borderColor: string;
  fillColor: string;
  size: number; // 1, 2, 4, 8, 16, 32
  // Coordinates in the grid for rendering visual loops
  cells: Array<{
    minterm: number;
    row: number;
    col: number;
    subMap: number;
  }>;
  explanation: {
    constantVars: Array<{ name: string; value: number }>;
    canceledVars: string[];
    description: string;
  };
}

export interface SolverStep {
  stepNumber: number;
  title: string;
  description: string;
  details?: string;
  implicantsHighlighted?: string[];
  type: 'setup' | 'grouping' | 'pi-chart' | 'essential' | 'coverage' | 'simplification';
}

export interface AlternativeSolution {
  implicantIds: string[];
  equation: string;
  latex: string;
  terms: Implicant[];
}

export interface PiChartRow {
  implicant: Implicant;
  coveredMinterms: number[];
  isEssential: boolean;
}

export interface SolverResult {
  variableCount: VariableCount;
  variables: string[];
  form: OptimizationForm;
  minterms: number[];
  maxterms: number[];
  dontCares: number[];
  allPrimeImplicants: Implicant[];
  essentialPrimeImplicants: Implicant[];
  selectedPrimeImplicants: Implicant[];
  minimalEquation: string;
  latexEquation: string;
  minimalPosEquation: string;
  latexPosEquation: string;
  alternativeSolutions: AlternativeSolution[];
  piChart: {
    minterms: number[];
    rows: PiChartRow[];
  };
  steps: SolverStep[];
  isTautology: boolean; // all 1s -> F = 1
  isContradiction: boolean; // all 0s -> F = 0
}

export interface PresetProblem {
  id: string;
  title: string;
  description: string;
  variableCount: VariableCount;
  variables: string[];
  minterms: number[];
  dontCares: number[];
  form?: OptimizationForm;
  category: 'Classic' | 'Wrap-Around' | 'Don\'t-Care' | 'Multiple Solutions' | 'Exam / Hardware';
}
