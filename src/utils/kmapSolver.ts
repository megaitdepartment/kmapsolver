import {
  VariableCount,
  OptimizationForm,
  Implicant,
  SolverResult,
  SolverStep,
  AlternativeSolution,
  PiChartRow,
} from '../types';

export const GRAY_CODE_2 = ['00', '01', '11', '10'];
export const GRAY_CODE_1 = ['0', '1'];

export const PALETTE = [
  { border: '#4f46e5', fill: 'rgba(79, 70, 229, 0.18)', badge: 'bg-indigo-600', text: 'text-indigo-600' },
  { border: '#dc2626', fill: 'rgba(220, 38, 38, 0.18)', badge: 'bg-red-600', text: 'text-red-600' },
  { border: '#059669', fill: 'rgba(5, 150, 105, 0.18)', badge: 'bg-emerald-600', text: 'text-emerald-600' },
  { border: '#d97706', fill: 'rgba(217, 119, 6, 0.18)', badge: 'bg-amber-600', text: 'text-amber-600' },
  { border: '#7c3aed', fill: 'rgba(124, 58, 237, 0.18)', badge: 'bg-purple-600', text: 'text-purple-600' },
  { border: '#0891b2', fill: 'rgba(8, 145, 178, 0.18)', badge: 'bg-cyan-600', text: 'text-cyan-600' },
  { border: '#db2777', fill: 'rgba(219, 39, 119, 0.18)', badge: 'bg-pink-600', text: 'text-pink-600' },
  { border: '#ea580c', fill: 'rgba(234, 88, 12, 0.18)', badge: 'bg-orange-600', text: 'text-orange-600' },
];

/**
 * Returns grid dimensions and mapping for given variable count
 */
export function getMapStructure(varCount: VariableCount, variables: string[]) {
  if (varCount === 2) {
    return {
      subMapsCount: 1,
      rowVars: [variables[0]],
      colVars: [variables[1]],
      rowCodes: GRAY_CODE_1,
      colCodes: GRAY_CODE_1,
      rows: 2,
      cols: 2,
    };
  }
  if (varCount === 3) {
    return {
      subMapsCount: 1,
      rowVars: [variables[0]],
      colVars: [variables[1], variables[2]],
      rowCodes: GRAY_CODE_1,
      colCodes: GRAY_CODE_2,
      rows: 2,
      cols: 4,
    };
  }
  if (varCount === 4) {
    return {
      subMapsCount: 1,
      rowVars: [variables[0], variables[1]],
      colVars: [variables[2], variables[3]],
      rowCodes: GRAY_CODE_2,
      colCodes: GRAY_CODE_2,
      rows: 4,
      cols: 4,
    };
  }
  if (varCount === 5) {
    return {
      subMapsCount: 2,
      splitVars: [variables[0]],
      rowVars: [variables[1], variables[2]],
      colVars: [variables[3], variables[4]],
      rowCodes: GRAY_CODE_2,
      colCodes: GRAY_CODE_2,
      rows: 4,
      cols: 4,
    };
  }
  // 6 variables
  return {
    subMapsCount: 4,
    splitVars: [variables[0], variables[1]],
    splitCodes: GRAY_CODE_2,
    rowVars: [variables[2], variables[3]],
    colVars: [variables[4], variables[5]],
    rowCodes: GRAY_CODE_2,
    colCodes: GRAY_CODE_2,
    rows: 4,
    cols: 4,
  };
}

/**
 * Convert row, col, subMap to decimal minterm index
 */
export function getMintermFromCoord(
  row: number,
  col: number,
  subMap: number,
  varCount: VariableCount
): number {
  if (varCount === 2) {
    // row is A (0 or 1), col is B (0 or 1)
    return (row << 1) | col;
  }
  if (varCount === 3) {
    // row is A (0 or 1), col is BC (Gray: 00, 01, 11, 10 -> col to binary: 0->0, 1->1, 2->3, 3->2)
    const bcMap = [0, 1, 3, 2];
    return (row << 2) | bcMap[col];
  }
  if (varCount === 4) {
    // row is AB, col is CD
    const grayMap = [0, 1, 3, 2];
    const ab = grayMap[row];
    const cd = grayMap[col];
    return (ab << 2) | cd;
  }
  if (varCount === 5) {
    // subMap is A (0 or 1), row is BC, col is DE
    const grayMap = [0, 1, 3, 2];
    const bc = grayMap[row];
    const de = grayMap[col];
    return (subMap << 4) | (bc << 2) | de;
  }
  // 6 variables: subMap is AB (Gray order: 0->00, 1->01, 2->11, 3->10)
  const grayMap = [0, 1, 3, 2];
  const ab = grayMap[subMap];
  const cd = grayMap[row];
  const ef = grayMap[col];
  return (ab << 4) | (cd << 2) | ef;
}

/**
 * Convert minterm to grid coordinates (subMap, row, col)
 */
export function getCoordFromMinterm(
  m: number,
  varCount: VariableCount
): { subMap: number; row: number; col: number } {
  const binaryToGrayColRow = (val: number): number => {
    // maps 00->0, 01->1, 10->3, 11->2
    if (val === 0) return 0;
    if (val === 1) return 1;
    if (val === 2) return 3;
    if (val === 3) return 2;
    return 0;
  };

  if (varCount === 2) {
    const a = (m >> 1) & 1;
    const b = m & 1;
    return { subMap: 0, row: a, col: b };
  }
  if (varCount === 3) {
    const a = (m >> 2) & 1;
    const bc = m & 3;
    return { subMap: 0, row: a, col: binaryToGrayColRow(bc) };
  }
  if (varCount === 4) {
    const ab = (m >> 2) & 3;
    const cd = m & 3;
    return { subMap: 0, row: binaryToGrayColRow(ab), col: binaryToGrayColRow(cd) };
  }
  if (varCount === 5) {
    const a = (m >> 4) & 1;
    const bc = (m >> 2) & 3;
    const de = m & 3;
    return {
      subMap: a,
      row: binaryToGrayColRow(bc),
      col: binaryToGrayColRow(de),
    };
  }
  // 6 variables
  const ab = (m >> 4) & 3;
  const cd = (m >> 2) & 3;
  const ef = m & 3;
  return {
    subMap: binaryToGrayColRow(ab),
    row: binaryToGrayColRow(cd),
    col: binaryToGrayColRow(ef),
  };
}

/**
 * Convert binary mask (e.g. "01-1") to human readable algebraic SOP & POS terms
 */
export function patternToTerms(
  pattern: string,
  variables: string[]
): {
  sop: string;
  pos: string;
  latexSop: string;
  latexPos: string;
  constantVars: Array<{ name: string; value: number }>;
  canceledVars: string[];
} {
  const sopParts: string[] = [];
  const latexSopParts: string[] = [];
  const posParts: string[] = [];
  const latexPosParts: string[] = [];
  const constantVars: Array<{ name: string; value: number }> = [];
  const canceledVars: string[] = [];

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const vName = variables[i] || `X${i}`;
    if (char === '0') {
      sopParts.push(`${vName}'`);
      latexSopParts.push(`\\overline{${vName}}`);
      posParts.push(`${vName}`);
      latexPosParts.push(`${vName}`);
      constantVars.push({ name: vName, value: 0 });
    } else if (char === '1') {
      sopParts.push(`${vName}`);
      latexSopParts.push(`${vName}`);
      posParts.push(`${vName}'`);
      latexPosParts.push(`\\overline{${vName}}`);
      constantVars.push({ name: vName, value: 1 });
    } else {
      canceledVars.push(vName);
    }
  }

  // All variables canceled
  if (sopParts.length === 0) {
    return {
      sop: '1',
      pos: '1',
      latexSop: '1',
      latexPos: '1',
      constantVars: [],
      canceledVars,
    };
  }

  return {
    sop: sopParts.join(''),
    pos: `(${posParts.join(' + ')})`,
    latexSop: latexSopParts.join(''),
    latexPos: `(${latexPosParts.join(' + ')})`,
    constantVars,
    canceledVars,
  };
}

/**
 * Combines two implicant terms if they differ by exactly 1 bit
 */
function combineTerms(t1: string, t2: string): string | null {
  let diffCount = 0;
  let combined = '';
  for (let i = 0; i < t1.length; i++) {
    if (t1[i] !== t2[i]) {
      if (t1[i] === '-' || t2[i] === '-') return null;
      diffCount++;
      combined += '-';
    } else {
      combined += t1[i];
    }
    if (diffCount > 1) return null;
  }
  return diffCount === 1 ? combined : null;
}

/**
 * Checks if a binary pattern covers a decimal minterm
 */
export function patternCoversMinterm(pattern: string, minterm: number, varCount: number): boolean {
  const binary = minterm.toString(2).padStart(varCount, '0');
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== '-' && pattern[i] !== binary[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Get all decimal numbers covered by a binary mask pattern
 */
export function getMintermsFromPattern(pattern: string): number[] {
  let results: number[] = [0];
  for (let i = 0; i < pattern.length; i++) {
    const bitWeight = 1 << (pattern.length - 1 - i);
    const char = pattern[i];
    if (char === '1') {
      results = results.map(v => v + bitWeight);
    } else if (char === '-') {
      const withOne = results.map(v => v + bitWeight);
      results = [...results, ...withOne];
    }
  }
  return results.sort((a, b) => a - b);
}

/**
 * Full Quine-McCluskey Prime Implicant Generation
 */
export function generatePrimeImplicants(
  activeIndices: number[], // 1s + Xs (for SOP), or 0s + Xs (for POS)
  targetIndices: number[], // genuine minterms that MUST be covered (1s for SOP, 0s for POS)
  varCount: VariableCount,
  variables: string[]
): Implicant[] {
  if (activeIndices.length === 0) return [];

  // Group minterms by number of 1s
  type GroupTerm = {
    pattern: string;
    covered: Set<number>;
    used: boolean;
  };

  let currentLevel: GroupTerm[] = activeIndices.map(idx => ({
    pattern: idx.toString(2).padStart(varCount, '0'),
    covered: new Set([idx]),
    used: false,
  }));

  const primeImplicantPatterns = new Map<string, Set<number>>();

  while (currentLevel.length > 0) {
    const nextLevelMap = new Map<string, Set<number>>();

    for (let i = 0; i < currentLevel.length; i++) {
      for (let j = i + 1; j < currentLevel.length; j++) {
        const combined = combineTerms(currentLevel[i].pattern, currentLevel[j].pattern);
        if (combined) {
          currentLevel[i].used = true;
          currentLevel[j].used = true;
          const unionSet = new Set<number>([
            ...currentLevel[i].covered,
            ...currentLevel[j].covered,
          ]);
          if (!nextLevelMap.has(combined)) {
            nextLevelMap.set(combined, unionSet);
          } else {
            const existing = nextLevelMap.get(combined)!;
            unionSet.forEach(v => existing.add(v));
          }
        }
      }
    }

    // Any term not used in combination is a candidate prime implicant
    for (const term of currentLevel) {
      if (!term.used) {
        if (!primeImplicantPatterns.has(term.pattern)) {
          primeImplicantPatterns.set(term.pattern, term.covered);
        }
      }
    }

    currentLevel = Array.from(nextLevelMap.entries()).map(([pattern, covered]) => ({
      pattern,
      covered,
      used: false,
    }));
  }

  // Convert to Implicant objects and filter out those that ONLY cover don't-cares
  const implicants: Implicant[] = [];
  let colorIdx = 0;

  for (const [pattern, coveredSet] of primeImplicantPatterns.entries()) {
    const allCovered = Array.from(coveredSet).sort((a, b) => a - b);
    const targetCovered = allCovered.filter(m => targetIndices.includes(m));

    // A prime implicant MUST cover at least one target minterm
    if (targetCovered.length === 0) continue;

    const termMeta = patternToTerms(pattern, variables);
    const palette = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;

    // Generate explanation for textbook/exam pedagogical clarity
    let desc = '';
    if (termMeta.constantVars.length === 0) {
      desc = `Entire map is covered (all ${1 << varCount} cells). Result is constant 1.`;
    } else {
      const constDesc = termMeta.constantVars
        .map(cv => `${cv.name}=${cv.value}`)
        .join(', ');
      const cancDesc =
        termMeta.canceledVars.length > 0
          ? `Variables {${termMeta.canceledVars.join(', ')}} toggle between 0 and 1, so they eliminate by complement law (X + X' = 1).`
          : 'No variables eliminated.';
      desc = `Group of ${allCovered.length} cells: constant variables [${constDesc}]. ${cancDesc}`;
    }

    const cells = allCovered.map(m => {
      const coord = getCoordFromMinterm(m, varCount);
      return {
        minterm: m,
        row: coord.row,
        col: coord.col,
        subMap: coord.subMap,
      };
    });

    implicants.push({
      id: `pi-${pattern}`,
      minterms: targetCovered,
      dontCares: allCovered.filter(m => !targetIndices.includes(m)),
      binaryPattern: pattern,
      termString: termMeta.sop,
      posTermString: termMeta.pos,
      latexTerm: termMeta.latexSop,
      latexPosTerm: termMeta.latexPos,
      isEssential: false,
      color: palette.border,
      borderColor: palette.border,
      fillColor: palette.fill,
      size: allCovered.length,
      cells,
      explanation: {
        constantVars: termMeta.constantVars,
        canceledVars: termMeta.canceledVars,
        description: desc,
      },
    });
  }

  // Sort prime implicants by size descending (larger groups are simpler terms)
  return implicants.sort((a, b) => b.size - a.size);
}

/**
 * Petrick's Method and Exact Branch-and-Bound Cover Solver
 */
function solveSetCover(
  minterms: number[],
  primeImplicants: Implicant[]
): {
  essentialPIs: Implicant[];
  allMinimalSolutions: Implicant[][];
} {
  if (minterms.length === 0) {
    return { essentialPIs: [], allMinimalSolutions: [[]] };
  }

  // 1. Identify Essential Prime Implicants (minterms covered by only 1 PI)
  const mintermCoverers = new Map<number, Implicant[]>();
  for (const m of minterms) {
    mintermCoverers.set(m, []);
  }

  for (const pi of primeImplicants) {
    for (const m of pi.minterms) {
      if (mintermCoverers.has(m)) {
        mintermCoverers.get(m)!.push(pi);
      }
    }
  }

  const essentialSet = new Set<Implicant>();
  for (const [, coverers] of mintermCoverers.entries()) {
    if (coverers.length === 1) {
      essentialSet.add(coverers[0]);
    }
  }

  const essentialPIs = Array.from(essentialSet);
  essentialPIs.forEach(pi => {
    pi.isEssential = true;
  });

  // Minterms already covered by essential PIs
  const coveredByEssential = new Set<number>();
  essentialPIs.forEach(pi => {
    pi.minterms.forEach(m => coveredByEssential.add(m));
  });

  const remainingMinterms = minterms.filter(m => !coveredByEssential.has(m));

  if (remainingMinterms.length === 0) {
    return {
      essentialPIs,
      allMinimalSolutions: [essentialPIs],
    };
  }

  // 2. Remaining PIs candidates
  const remainingCandidates = primeImplicants.filter(pi => !essentialSet.has(pi));

  // Branch and bound to find all minimal solutions covering remainingMinterms
  const solutions: Implicant[][] = [];
  let minCost = Infinity;

  // Cost function: primary = number of terms, secondary = number of literals
  function getCost(selection: Implicant[]) {
    const terms = selection.length;
    let literals = 0;
    for (const pi of selection) {
      for (const char of pi.binaryPattern) {
        if (char !== '-') literals++;
      }
    }
    return terms * 1000 + literals;
  }

  function search(idx: number, current: Implicant[], covered: Set<number>) {
    // Check if current already covers all
    let allCovered = true;
    for (const rm of remainingMinterms) {
      if (!covered.has(rm)) {
        allCovered = false;
        break;
      }
    }

    if (allCovered) {
      const cost = getCost(current);
      if (cost < minCost) {
        minCost = cost;
        solutions.length = 0;
        solutions.push([...current]);
      } else if (cost === minCost) {
        solutions.push([...current]);
      }
      return;
    }

    if (idx >= remainingCandidates.length) return;

    // Prune if current length exceeds best known cost terms
    const currentCost = getCost(current);
    if (currentCost > minCost) return;

    // Option 1: Include candidate if it covers at least one uncovered minterm
    const cand = remainingCandidates[idx];
    let addsValue = false;
    for (const m of cand.minterms) {
      if (remainingMinterms.includes(m) && !covered.has(m)) {
        addsValue = true;
        break;
      }
    }

    if (addsValue) {
      const nextCovered = new Set(covered);
      cand.minterms.forEach(m => nextCovered.add(m));
      current.push(cand);
      search(idx + 1, current, nextCovered);
      current.pop();
    }

    // Option 2: Exclude candidate
    search(idx + 1, current, covered);
  }

  search(0, [], new Set());

  const fullSolutions = (solutions.length > 0 ? solutions : [[]]).map(remSelection => [
    ...essentialPIs,
    ...remSelection,
  ]);

  return {
    essentialPIs,
    allMinimalSolutions: fullSolutions,
  };
}

/**
 * Main Solver Entry Point
 */
export function solveKMap(
  varCount: VariableCount,
  variables: string[],
  mintermsInput: number[],
  dontCaresInput: number[],
  form: OptimizationForm = 'SOP'
): SolverResult {
  const maxCells = 1 << varCount;
  const sanitizedMinterms = Array.from(new Set(mintermsInput.filter(m => m >= 0 && m < maxCells))).sort(
    (a, b) => a - b
  );
  const sanitizedDontCares = Array.from(
    new Set(dontCaresInput.filter(d => d >= 0 && d < maxCells && !sanitizedMinterms.includes(d)))
  ).sort((a, b) => a - b);

  const maxterms = Array.from({ length: maxCells }, (_, i) => i).filter(
    i => !sanitizedMinterms.includes(i) && !sanitizedDontCares.includes(i)
  );

  const steps: SolverStep[] = [];

  // Step 1: Initial Problem Setup
  steps.push({
    stepNumber: 1,
    title: 'Problem Formulation & Cell Indexing',
    description: `Constructed ${varCount}-variable Karnaugh Map for function F(${variables.join(
      ', '
    )}) with ${maxCells} cells arranged in Gray code sequence.`,
    details: `Minterms m(${sanitizedMinterms.join(', ') || 'none'}), Don't-cares d(${
      sanitizedDontCares.join(', ') || 'none'
    }), Maxterms M(${maxterms.join(', ') || 'none'}).`,
    type: 'setup',
  });

  // Tautology check (all 1s)
  if (sanitizedMinterms.length + sanitizedDontCares.length === maxCells && sanitizedMinterms.length > 0) {
    steps.push({
      stepNumber: 2,
      title: 'Tautology Simplification',
      description: 'All cells in the Karnaugh map are populated with 1s or don\'t-cares.',
      details: 'A single group of size ' + maxCells + ' covers the entire map. Output is logically constant 1.',
      type: 'simplification',
    });

    return {
      variableCount: varCount,
      variables,
      form,
      minterms: sanitizedMinterms,
      maxterms,
      dontCares: sanitizedDontCares,
      allPrimeImplicants: [],
      essentialPrimeImplicants: [],
      selectedPrimeImplicants: [],
      minimalEquation: 'F = 1',
      latexEquation: 'F = 1',
      minimalPosEquation: 'F = 1',
      latexPosEquation: 'F = 1',
      alternativeSolutions: [],
      piChart: { minterms: sanitizedMinterms, rows: [] },
      steps,
      isTautology: true,
      isContradiction: false,
    };
  }

  // Contradiction check (all 0s)
  if (sanitizedMinterms.length === 0) {
    steps.push({
      stepNumber: 2,
      title: 'Contradiction Simplification',
      description: 'No minterm is asserted in the Karnaugh map (all cells are 0 or don\'t-cares).',
      details: 'Output is logically constant 0.',
      type: 'simplification',
    });

    return {
      variableCount: varCount,
      variables,
      form,
      minterms: sanitizedMinterms,
      maxterms,
      dontCares: sanitizedDontCares,
      allPrimeImplicants: [],
      essentialPrimeImplicants: [],
      selectedPrimeImplicants: [],
      minimalEquation: 'F = 0',
      latexEquation: 'F = 0',
      minimalPosEquation: 'F = 0',
      latexPosEquation: 'F = 0',
      alternativeSolutions: [],
      piChart: { minterms: sanitizedMinterms, rows: [] },
      steps,
      isTautology: false,
      isContradiction: true,
    };
  }

  // Step 2 & 3: Find Prime Implicants
  // For SOP: active = minterms + dontCares; target = minterms
  // For POS: active = maxterms + dontCares; target = maxterms
  const activeForSop = [...sanitizedMinterms, ...sanitizedDontCares];
  const sopPrimeImplicants = generatePrimeImplicants(activeForSop, sanitizedMinterms, varCount, variables);

  const activeForPos = [...maxterms, ...sanitizedDontCares];
  const posPrimeImplicants = generatePrimeImplicants(activeForPos, maxterms, varCount, variables);

  // Pick target based on chosen form
  const primeImplicants = form === 'SOP' ? sopPrimeImplicants : posPrimeImplicants;
  const targetIndices = form === 'SOP' ? sanitizedMinterms : maxterms;

  steps.push({
    stepNumber: 2,
    title: 'Adjacency Grouping & Prime Implicant Generation',
    description: `Formed all valid rectangular groupings of powers of 2 (sizes 16, 8, 4, 2, 1) using wrap-around edge and corner adjacencies. Found ${primeImplicants.length} prime implicant(s).`,
    details: primeImplicants
      .map(
        (pi, idx) =>
          `PI ${idx + 1}: ${form === 'SOP' ? pi.termString : pi.posTermString} covering cells {${pi.minterms.join(
            ', '
          )}${pi.dontCares.length ? ` + d(${pi.dontCares.join(', ')})` : ''}}`
      )
      .join('\n'),
    implicantsHighlighted: primeImplicants.map(pi => pi.id),
    type: 'grouping',
  });

  // Step 4 & 5: Set Cover & Prime Implicant Table
  const { essentialPIs, allMinimalSolutions } = solveSetCover(targetIndices, primeImplicants);

  // Build PI Chart Rows
  const piChartRows: PiChartRow[] = primeImplicants.map(pi => ({
    implicant: pi,
    coveredMinterms: pi.minterms,
    isEssential: essentialPIs.some(epi => epi.id === pi.id),
  }));

  steps.push({
    stepNumber: 3,
    title: 'Prime Implicant Table & Essential Prime Implicant (EPI) Isolation',
    description: `Identified ${essentialPIs.length} Essential Prime Implicant(s) (EPIs). An EPI contains at least one minterm not covered by any other prime implicant.`,
    details:
      essentialPIs.length > 0
        ? essentialPIs
            .map(
              epi =>
                `★ Essential PI: ${form === 'SOP' ? epi.termString : epi.posTermString} (binary: ${
                  epi.binaryPattern
                })`
            )
            .join('\n')
        : 'No single prime implicant is strictly essential; a cyclic core or multiple minimal combinations exist.',
    implicantsHighlighted: essentialPIs.map(pi => pi.id),
    type: 'essential',
  });

  // Selected solution is the first minimal solution
  const selectedPIs = allMinimalSolutions[0] || [];

  if (selectedPIs.length > essentialPIs.length) {
    const nonEssentialSelected = selectedPIs.filter(pi => !pi.isEssential);
    steps.push({
      stepNumber: 4,
      title: 'Optimal Covering of Remaining Minterms (Petrick\'s Method)',
      description: `Covered remaining minterms with minimal number of non-essential prime implicants: ${nonEssentialSelected
        .map(pi => (form === 'SOP' ? pi.termString : pi.posTermString))
        .join(', ')}.`,
      details: `Minimal set covering achieved using Petrick's expansion, requiring ${selectedPIs.length} total product terms.`,
      implicantsHighlighted: nonEssentialSelected.map(pi => pi.id),
      type: 'coverage',
    });
  }

  // Step 6: Step-by-Step Algebraic Cancellation Breakdown
  const cancelDetails = selectedPIs
    .map(pi => {
      const termName = form === 'SOP' ? pi.termString : pi.posTermString;
      return `• Term ${termName}: ${pi.explanation.description}`;
    })
    .join('\n\n');

  steps.push({
    stepNumber: steps.length + 1,
    title: 'Algebraic Variable Cancellation Verification',
    description: 'Detailed proof of how variables cancel across each loop via Boolean theorems (A + A\' = 1, A · A\' = 0):',
    details: cancelDetails,
    type: 'simplification',
  });

  // Format Minimal Equations
  let minimalEquation = '';
  let latexEquation = '';
  let minimalPosEquation = '';
  let latexPosEquation = '';

  if (form === 'SOP') {
    minimalEquation = `F = ${selectedPIs.map(pi => pi.termString).join(' + ')}`;
    latexEquation = `F = ${selectedPIs.map(pi => pi.latexTerm).join(' + ')}`;
    // Also compute POS equivalent for comparison
    const posCover = solveSetCover(maxterms, posPrimeImplicants);
    const posSelected = posCover.allMinimalSolutions[0] || [];
    minimalPosEquation = `F = ${posSelected.map(pi => pi.posTermString).join(' ')}`;
    latexPosEquation = `F = ${posSelected.map(pi => pi.latexPosTerm).join(' ')}`;
  } else {
    minimalPosEquation = `F = ${selectedPIs.map(pi => pi.posTermString).join(' ')}`;
    latexPosEquation = `F = ${selectedPIs.map(pi => pi.latexPosTerm).join(' ')}`;
    // Also compute SOP equivalent
    const sopCover = solveSetCover(sanitizedMinterms, sopPrimeImplicants);
    const sopSelected = sopCover.allMinimalSolutions[0] || [];
    minimalEquation = `F = ${sopSelected.map(pi => pi.termString).join(' + ')}`;
    latexEquation = `F = ${sopSelected.map(pi => pi.latexTerm).join(' + ')}`;
  }

  // Alternative solutions
  const alternativeSolutions: AlternativeSolution[] = allMinimalSolutions.map(sol => {
    const eq = form === 'SOP' ? `F = ${sol.map(pi => pi.termString).join(' + ')}` : `F = ${sol.map(pi => pi.posTermString).join(' ')}`;
    const ltx = form === 'SOP' ? `F = ${sol.map(pi => pi.latexTerm).join(' + ')}` : `F = ${sol.map(pi => pi.latexPosTerm).join(' ')}`;
    return {
      implicantIds: sol.map(pi => pi.id),
      equation: eq,
      latex: ltx,
      terms: sol,
    };
  });

  return {
    variableCount: varCount,
    variables,
    form,
    minterms: sanitizedMinterms,
    maxterms,
    dontCares: sanitizedDontCares,
    allPrimeImplicants: primeImplicants,
    essentialPrimeImplicants: essentialPIs,
    selectedPrimeImplicants: selectedPIs,
    minimalEquation,
    latexEquation,
    minimalPosEquation,
    latexPosEquation,
    alternativeSolutions,
    piChart: {
      minterms: targetIndices,
      rows: piChartRows,
    },
    steps,
    isTautology: false,
    isContradiction: false,
  };
}

/**
 * Expression Parser: parses boolean expressions like:
 * A'B + CD
 * !A & B | C & !D
 * m(0, 2, 5, 7) + d(13, 15)
 * ~A B + C D
 */
export function parseBooleanInput(
  input: string,
  varCount: VariableCount,
  variables: string[]
): {
  success: boolean;
  minterms: number[];
  dontCares: number[];
  error?: string;
} {
  const trimmed = input.trim();
  const maxCells = 1 << varCount;

  // Case 1A: Maxterm notation like M(0, 1, 3, 7) + d(2, 6) or Π M(0, 1, 3) or maxterms(0, 1)
  const isMaxtermNotation =
    /(?:^|[+\s,;*·&|~Π(])M\s*\(/i.test(trimmed) &&
    !/(?:^|[+\s,;*·&|~Σ(])m\s*\(/i.test(trimmed.replace(/(?:^|[+\s,;*·&|~Π(])M\s*\([^)]*\)/gi, ''));

  if (isMaxtermNotation) {
    const maxMatch = trimmed.match(/(?:M|maxterm[s]?)\s*\(\s*([0-9\s,]*)\s*\)/i);
    const dMatch = trimmed.match(/d\s*\(\s*([0-9\s,]*)\s*\)/i);

    let maxterms: number[] = [];
    let dontCares: number[] = [];

    if (maxMatch && maxMatch[1]) {
      maxterms = maxMatch[1]
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n >= 0 && n < maxCells);
    }
    if (dMatch && dMatch[1]) {
      dontCares = dMatch[1]
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n >= 0 && n < maxCells);
    }

    const uniqueMax = Array.from(new Set(maxterms));
    const uniqueD = Array.from(new Set(dontCares)).filter(d => !uniqueMax.includes(d));
    const minterms: number[] = [];
    for (let i = 0; i < maxCells; i++) {
      if (!uniqueMax.includes(i) && !uniqueD.includes(i)) {
        minterms.push(i);
      }
    }

    return {
      success: true,
      minterms,
      dontCares: uniqueD,
    };
  }

  // Case 1B: Minterm notation like m(0, 1, 3, 7) + d(2, 6) or sum m(0,1,3)
  if (trimmed.toLowerCase().includes('m(') || trimmed.toLowerCase().includes('d(')) {
    const minMatch = trimmed.match(/m\s*\(\s*([0-9\s,]*)\s*\)/i);
    const dMatch = trimmed.match(/d\s*\(\s*([0-9\s,]*)\s*\)/i);

    let minterms: number[] = [];
    let dontCares: number[] = [];

    if (minMatch && minMatch[1]) {
      minterms = minMatch[1]
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n >= 0 && n < maxCells);
    }
    if (dMatch && dMatch[1]) {
      dontCares = dMatch[1]
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n >= 0 && n < maxCells && !minterms.includes(n));
    }

    return {
      success: true,
      minterms: Array.from(new Set(minterms)),
      dontCares: Array.from(new Set(dontCares)),
    };
  }

  // Case 2: Comma or space separated numbers (e.g. "0, 2, 5, 7, 8, 10")
  if (/^[0-9\s,]+$/.test(trimmed)) {
    const nums = trimmed
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 0 && n < maxCells);
    return {
      success: true,
      minterms: Array.from(new Set(nums)),
      dontCares: [],
    };
  }

  // Case 3: Boolean algebraic expression (e.g. A'B + C'D or A B' + C D)
  try {
    const minterms: number[] = [];
    const dontCares: number[] = [];

    // Evaluate expression for all 2^varCount combinations
    for (let m = 0; m < maxCells; m++) {
      const binary = m.toString(2).padStart(varCount, '0');
      const env: Record<string, boolean> = {};
      for (let i = 0; i < varCount; i++) {
        env[variables[i]] = binary[i] === '1';
      }

      const val = evaluateExpression(trimmed, env);
      if (val) {
        minterms.push(m);
      }
    }

    return {
      success: true,
      minterms,
      dontCares,
    };
  } catch (err: any) {
    return {
      success: false,
      minterms: [],
      dontCares: [],
      error: err.message || 'Could not parse Boolean expression',
    };
  }
}

/**
 * Simple recursive descent boolean expression evaluator
 */
function evaluateExpression(expr: string, env: Record<string, boolean>): boolean {
  // Normalize tokens: replace '~', '!' with NOT
  // Replace '+', '|' with OR
  // Replace '*', '&' with AND
  // Handle implicit multiplication like AB or A'B
  let cleaned = expr.replace(/\s+/g, '');

  // Convert primed variables like A' to (!A)
  for (const v of Object.keys(env)) {
    const primeRegex = new RegExp(`${v}'`, 'g');
    cleaned = cleaned.replace(primeRegex, `(!${v})`);
  }

  // Insert explicit & between adjacent variables or brackets: A B -> A & B, ) ( -> ) & (, A( -> A & (
  cleaned = cleaned.replace(/([A-Za-z0-9\)])(?=[A-Za-z\(|!])/g, (match, p1) => {
    // avoid inserting & before operators + or |
    return `${p1}&`;
  });

  // Replace + with |
  cleaned = cleaned.replace(/\+/g, '|');

  // Split by OR (|)
  const orTerms = cleaned.split('|');
  return orTerms.some(term => evaluateAndTerm(term, env));
}

function evaluateAndTerm(term: string, env: Record<string, boolean>): boolean {
  const andFactors = term.split('&').filter(Boolean);
  for (const factor of andFactors) {
    let negated = false;
    let token = factor;

    while (token.startsWith('!') || token.startsWith('~')) {
      negated = !negated;
      token = token.slice(1);
    }

    // Strip outer parens
    if (token.startsWith('(') && token.endsWith(')')) {
      token = token.slice(1, -1);
      const res = evaluateExpression(token, env);
      if ((negated ? !res : res) === false) return false;
      continue;
    }

    const varVal = env[token];
    if (varVal === undefined) {
      throw new Error(`Unknown variable: "${token}"`);
    }

    const res = negated ? !varVal : varVal;
    if (!res) return false;
  }
  return true;
}
