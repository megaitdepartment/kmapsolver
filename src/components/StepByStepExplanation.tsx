import React, { useState } from 'react';
import { SolverResult } from '../types';
import { Check, Star, Copy, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { copyTextToClipboard } from '../utils/svgExport';

interface StepByStepExplanationProps {
  result: SolverResult;
  hoveredImplicantId: string | null;
  onHoverImplicant: (id: string | null) => void;
}

export const StepByStepExplanation: React.FC<StepByStepExplanationProps> = ({
  result,
  hoveredImplicantId,
  onHoverImplicant,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const {
    variableCount,
    variables,
    form,
    minterms,
    dontCares,
    selectedPrimeImplicants,
    allPrimeImplicants,
    essentialPrimeImplicants,
    alternativeSolutions,
    piChart,
    minimalEquation,
    latexEquation,
    minimalPosEquation,
    steps,
  } = result;

  // Calculate literal savings
  const canonicalLiterals = minterms.length * variableCount;
  const simplifiedLiterals = selectedPrimeImplicants.reduce((acc, pi) => {
    return acc + pi.binaryPattern.replace(/-/g, '').length;
  }, 0);
  const literalSavings = canonicalLiterals > 0
    ? Math.max(0, Math.round(((canonicalLiterals - simplifiedLiterals) / canonicalLiterals) * 100))
    : 0;

  const handleCopySolutionText = () => {
    let text = `=== Karnaugh Map Simplification Steps ===\n`;
    text += `Variables: ${variables.join(', ')} (${variableCount}-variable K-Map)\n`;
    text += `Form: ${form}\n`;
    text += `Minterms: m(${minterms.join(', ') || 'none'})\n`;
    if (dontCares.length > 0) {
      text += `Don't-cares: d(${dontCares.join(', ')})\n`;
    }
    text += `\n--- Minimal Solution ---\n`;
    text += `SOP: ${minimalEquation}\n`;
    text += `POS: ${minimalPosEquation}\n`;
    text += `LaTeX: ${latexEquation}\n\n`;

    text += `--- Step-by-Step Breakdown ---\n`;
    steps.forEach((s, idx) => {
      text += `Step ${idx + 1}: ${s.title}\n`;
      text += `${s.description}\n`;
      if (s.details) text += `${s.details}\n`;
      text += `\n`;
    });

    copyTextToClipboard(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50/80 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Simplification Proof & Steps
          </span>
        </div>

        <button
          id="copy-steps-text-btn"
          onClick={handleCopySolutionText}
          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Steps!' : 'Copy Solution'}</span>
        </button>
      </div>

      {/* Main Solution Showcase Box */}
      <div className="p-3 sm:p-3.5 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 border-b border-slate-200 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
              Simplified {form} Expression
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5 tracking-tight truncate">
              {form === 'SOP' ? minimalEquation : minimalPosEquation}
            </div>
            <div className="text-xs text-slate-500 font-serif italic mt-0.5">
              LaTeX: <code className="font-mono text-indigo-900 bg-indigo-50/80 px-1.5 py-0.5 rounded text-[11px]">{latexEquation}</code>
            </div>
          </div>

          {/* Efficiency Metric Badge */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0 self-start sm:self-auto">
            <div className="text-center px-1.5 min-w-[50px]">
              <div className="text-[9px] uppercase font-bold text-slate-400">Terms</div>
              <div className="text-base font-bold font-mono text-slate-800">{selectedPrimeImplicants.length}</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-1.5 min-w-[50px]">
              <div className="text-[9px] uppercase font-bold text-slate-400">Literals</div>
              <div className="text-base font-bold font-mono text-slate-800">{simplifiedLiterals}</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center px-1.5 min-w-[55px]">
              <div className="text-[9px] uppercase font-bold text-emerald-600 whitespace-nowrap">Reduction</div>
              <div className="text-base font-bold font-mono text-emerald-600">{literalSavings}%</div>
            </div>
          </div>
        </div>

        {/* Alternative Minimal Solutions Alert if Petrick found ties */}
        {alternativeSolutions.length > 1 && (
          <div className="mt-2.5 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 mb-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Multiple Equivalent Minimal Solutions ({alternativeSolutions.length} Solutions Exist):</span>
            </div>
            <div className="space-y-0.5 pl-5 list-disc font-mono">
              {alternativeSolutions.map((alt, i) => (
                <div key={i} className="text-slate-800 text-[11px]">
                  Option {i + 1}: <span className="font-bold">{alt.equation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion / List of Sequential Steps */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3 space-y-2">
        {/* Step 1: Formulation */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">Canonical Boolean Formulation</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Function <span className="font-mono font-semibold">F({variables.join(', ')})</span> defined over {1 << variableCount} states:
              </p>
              <div className="mt-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                <div>
                  <span className="text-indigo-600 font-bold">Canonical SOP:</span> F = &sum; m({minterms.join(', ') || 'none'})
                  {dontCares.length > 0 && <span className="text-purple-600"> + &sum; d({dontCares.join(', ')})</span>}
                </div>
                <div>
                  <span className="text-slate-600 font-bold">Canonical POS:</span> F = &prod; M({result.maxterms.join(', ') || 'none'})
                  {dontCares.length > 0 && <span className="text-purple-600"> &middot; &prod; D({dontCares.join(', ')})</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Quine-McCluskey Prime Implicant Table */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">
                Prime Implicant Coverage Table (Quine-McCluskey)
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Cross-checking all prime implicants against minterms to isolate{' '}
                <strong className="text-amber-700">Essential Prime Implicants (EPIs &star;)</strong>:
              </p>

              {/* PI Table */}
              <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 font-mono">
                    <tr>
                      <th className="p-2 w-10 text-center">EPI</th>
                      <th className="p-2 font-sans font-bold">Prime Implicant</th>
                      <th className="p-2 text-center">Pattern</th>
                      <th className="p-2 text-center">Size</th>
                      {piChart.minterms.map(m => (
                        <th key={m} className="p-2 text-center text-slate-500 font-mono">
                          m{m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {piChart.rows.map((row, rIdx) => {
                      const isHovered = hoveredImplicantId === row.implicant.id;
                      const termLabel = form === 'SOP' ? row.implicant.termString : row.implicant.posTermString;

                      return (
                        <tr
                          key={rIdx}
                          onMouseEnter={() => onHoverImplicant(row.implicant.id)}
                          onMouseLeave={() => onHoverImplicant(null)}
                          className={`transition-colors cursor-pointer ${
                            isHovered
                              ? 'bg-indigo-50/80 font-bold'
                              : row.isEssential
                              ? 'bg-amber-50/40'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2 text-center">
                            {row.isEssential ? (
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="p-2 font-bold text-slate-900">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: row.implicant.borderColor }}
                            />
                            {termLabel}
                          </td>
                          <td className="p-2 text-center text-slate-500 font-mono">
                            {row.implicant.binaryPattern}
                          </td>
                          <td className="p-2 text-center text-slate-600">
                            {row.implicant.size}
                          </td>
                          {piChart.minterms.map(m => {
                            const isCovered = row.coveredMinterms.includes(m);
                            return (
                              <td
                                key={m}
                                className={`p-2 text-center ${
                                  isCovered ? 'text-indigo-600 font-extrabold bg-indigo-50/30' : 'text-slate-200'
                                }`}
                              >
                                {isCovered ? '✓' : ''}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-400">
                &star; Essential Prime Implicants cover at least one minterm that is not covered by any other prime implicant.
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Boolean Variable Cancellation Breakdown */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">
                Algebraic Variable Cancellation & Proof
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Demonstrates the exact variables eliminated within each loop via the Boolean adjacency theorem (<span className="font-mono">X + X' = 1</span>):
              </p>

              <div className="mt-3 space-y-2.5">
                {selectedPrimeImplicants.map((pi, idx) => {
                  const termLabel = form === 'SOP' ? pi.termString : pi.posTermString;
                  const isHovered = hoveredImplicantId === pi.id;

                  return (
                    <div
                      key={pi.id}
                      onMouseEnter={() => onHoverImplicant(pi.id)}
                      onMouseLeave={() => onHoverImplicant(null)}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        isHovered
                          ? 'border-indigo-400 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-slate-900 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: pi.borderColor }}
                          />
                          <span>Term #{idx + 1}: {termLabel}</span>
                          {pi.isEssential && (
                            <span className="text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              Essential
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          Covers {pi.cells.length} cells: {'{'}{pi.minterms.join(', ')}{pi.dontCares.length ? ` + d(${pi.dontCares.join(', ')})` : ''}{'}'}
                        </span>
                      </div>

                      <div className="text-slate-600 text-[11px] leading-relaxed mt-1">
                        {pi.explanation.description}
                      </div>

                      {pi.explanation.canceledVars.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400 font-medium">Eliminated Variables:</span>
                          <span className="font-mono font-bold text-rose-600">
                            {pi.explanation.canceledVars.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Final Synthesis & Conclusion */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">Final Minimal Equation</h4>
              <p className="text-xs text-slate-600 mt-1">
                Combining all essential and optimal cover terms yields the minimal two-level logic function:
              </p>
              <div className="mt-2 p-3 bg-slate-900 text-emerald-400 font-mono font-bold text-sm rounded-lg shadow-inner">
                {form === 'SOP' ? minimalEquation : minimalPosEquation}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
