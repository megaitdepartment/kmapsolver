import React, { useState, useEffect } from 'react';
import { VariableCount, OptimizationForm } from '../types';
import { parseBooleanInput } from '../utils/kmapSolver';
import { Edit3, Shuffle, Trash2, ArrowRight, Check, Sparkles } from 'lucide-react';

interface InputPanelProps {
  varCount: VariableCount;
  variables: string[];
  onChangeVariables: (vars: string[]) => void;
  onApplyValues: (terms: number[], dontCares: number[], isMaxterms: boolean) => void;
  onClear: () => void;
  onFillAllOnes: () => void;
  onInvertAll: () => void;
  onRandomize: () => void;
  currentMinterms: number[];
  currentMaxterms: number[];
  currentDontCares: number[];
  form: OptimizationForm;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  varCount,
  variables,
  onChangeVariables,
  onApplyValues,
  onClear,
  onFillAllOnes,
  onInvertAll,
  onRandomize,
  currentMinterms,
  currentMaxterms,
  currentDontCares,
  form,
}) => {
  const [inputText, setInputText] = useState('');
  const [numbersInput, setNumbersInput] = useState('');
  const [dontCaresInput, setDontCaresInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isEditingVars, setIsEditingVars] = useState(false);
  const [varNamesInput, setVarNamesInput] = useState(variables.join(', '));
  const [activeInputMode, setActiveInputMode] = useState<'numbers' | 'expression'>('numbers');

  // Keep number input boxes in sync when grid is clicked, presets loaded, or form toggled
  useEffect(() => {
    if (form === 'POS') {
      setNumbersInput(currentMaxterms.join(', '));
    } else {
      setNumbersInput(currentMinterms.join(', '));
    }
    setDontCaresInput(currentDontCares.join(', '));
  }, [form, currentMinterms, currentMaxterms, currentDontCares]);

  useEffect(() => {
    setVarNamesInput(variables.join(', '));
  }, [variables]);

  const handleApplyNumbers = () => {
    setParseError(null);
    const maxIdx = (1 << varCount) - 1;

    const parseList = (str: string) =>
      str
        .split(/[\s,]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter(n => !isNaN(n));

    const tList = parseList(numbersInput);
    const dList = parseList(dontCaresInput);

    const invalidT = tList.filter(n => n < 0 || n > maxIdx);
    const invalidD = dList.filter(n => n < 0 || n > maxIdx);

    if (invalidT.length > 0 || invalidD.length > 0) {
      setParseError(`Values must be between 0 and ${maxIdx} for ${varCount} variables`);
      return;
    }

    // Remove duplicates and overlap
    const uniqueD = Array.from(new Set(dList)).filter(d => !tList.includes(d));
    const uniqueT = Array.from(new Set(tList));

    onApplyValues(uniqueT, uniqueD, form === 'POS');
  };

  const handleApplyExpression = () => {
    setParseError(null);
    if (!inputText.trim()) return;

    const res = parseBooleanInput(inputText, varCount, variables);
    if (res.success) {
      // res.minterms has the minterms where function is 1
      onApplyValues(res.minterms, res.dontCares, false);
      setInputText('');
    } else {
      setParseError(res.error || 'Invalid boolean expression or minterm/maxterm list');
    }
  };

  const handleSaveVariableNames = () => {
    const split = varNamesInput
      .split(/[\s,]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    if (split.length === varCount) {
      onChangeVariables(split);
      setIsEditingVars(false);
      setParseError(null);
    } else {
      setParseError(`Please enter exactly ${varCount} comma-separated variable names (e.g. ${variables.join(', ')})`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-2.5 sm:p-3 space-y-2.5">
      {/* Controls Row: Variables, Mode Toggle, and Quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Variable Names & Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Variable Names */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Variables:</span>
            {isEditingVars ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={varNamesInput}
                  onChange={e => setVarNamesInput(e.target.value)}
                  placeholder="A, B, C, D"
                  className="px-1.5 py-0.5 text-xs font-mono border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 w-28"
                />
                <button
                  onClick={handleSaveVariableNames}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setVarNamesInput(variables.join(', '));
                    setIsEditingVars(false);
                  }}
                  className="px-1.5 py-0.5 text-xs rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {variables.join(', ')}
                </span>
                <button
                  onClick={() => {
                    setVarNamesInput(variables.join(', '));
                    setIsEditingVars(true);
                  }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
                  title="Rename Variables"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Mode toggle: Minterms vs Maxterms based on form */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              id="mode-numbers-btn"
              onClick={() => setActiveInputMode('numbers')}
              className={`text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${
                activeInputMode === 'numbers'
                  ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {form === 'SOP' ? 'Minterms (m, d)' : 'Maxterms (M, d)'}
            </button>
            <button
              id="mode-expression-btn"
              onClick={() => setActiveInputMode('expression')}
              className={`text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${
                activeInputMode === 'expression'
                  ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expression (Text)
            </button>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={onRandomize}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-1"
            title="Generate random problem"
          >
            <Shuffle className="w-3 h-3 text-indigo-500" />
            <span>Random</span>
          </button>
          <button
            onClick={onFillAllOnes}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            All 1s
          </button>
          <button
            onClick={onInvertAll}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            Invert
          </button>
          <button
            onClick={onClear}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-rose-600 font-medium transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Input Row: Number fields OR Expression field */}
      {activeInputMode === 'numbers' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Minterms (1s) or Maxterms (0s) */}
          <div className="flex-1 min-w-[140px] flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <span className="text-[11px] font-bold text-slate-600 shrink-0">
              {form === 'SOP' ? 'm (1s):' : 'M (0s):'}
            </span>
            <input
              type="text"
              id="kmap-numbers-input"
              value={numbersInput}
              onChange={e => setNumbersInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleApplyNumbers();
              }}
              placeholder={form === 'SOP' ? 'e.g. 0, 2, 8, 10' : 'e.g. 1, 3, 5, 7'}
              className="w-full text-xs font-mono bg-transparent focus:outline-none text-slate-800"
            />
          </div>

          {/* Don't Cares (Xs) */}
          <div className="flex-1 min-w-[120px] flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50/50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">d (Xs):</span>
            <input
              type="text"
              id="kmap-dontcares-input"
              value={dontCaresInput}
              onChange={e => setDontCaresInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleApplyNumbers();
              }}
              placeholder="e.g. 5, 7"
              className="w-full text-xs font-mono bg-transparent focus:outline-none text-slate-800"
            />
          </div>

          {/* Apply Button */}
          <button
            id="apply-numbers-btn"
            onClick={handleApplyNumbers}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs shrink-0 h-[34px] sm:h-auto"
          >
            <span>Apply</span>
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {activeInputMode === 'expression' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            id="kmap-expression-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleApplyExpression();
            }}
            placeholder={
              form === 'SOP'
                ? "e.g. m(0, 2, 8, 10) + d(5, 7)   OR   A'B + C'D"
                : "e.g. M(0, 2, 8, 10) + d(5, 7)   OR   (A + B')(C + D')"
            }
            className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
          />
          <button
            id="apply-expression-btn"
            onClick={handleApplyExpression}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs shrink-0 h-[34px] sm:h-auto"
          >
            <span>Solve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {parseError && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
          <span>&bull;</span>
          <span>{parseError}</span>
        </p>
      )}
    </div>
  );
};
