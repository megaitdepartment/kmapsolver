import React, { useState } from 'react';
import { VariableCount, OptimizationForm, PresetProblem } from '../types';
import { PRESET_PROBLEMS } from '../data/presets';
import { AppLogo } from './AppLogo';
import {
  Share2,
  Printer,
  HelpCircle,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  varCount: VariableCount;
  onChangeVarCount: (count: VariableCount) => void;
  form: OptimizationForm;
  onChangeForm: (form: OptimizationForm) => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: PresetProblem) => void;
  onReset: () => void;
  onOpenExport: () => void;
  onTogglePrintMode: () => void;
  isPrintMode: boolean;
  showQuiz: boolean;
  onToggleQuiz: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  varCount,
  onChangeVarCount,
  form,
  onChangeForm,
  selectedPresetId,
  onSelectPreset,
  onReset,
  onOpenExport,
  onTogglePrintMode,
  isPrintMode,
  showQuiz,
  onToggleQuiz,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* DESKTOP NAVBAR (visible on lg screens and up) */}
        <div className="hidden lg:flex items-center justify-between gap-3 py-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <AppLogo className="w-8 h-8 rounded-xl" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              K Maps Solver
            </h1>
          </div>

          {/* Variables Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 px-2">Variables:</span>
            {([2, 3, 4, 5, 6] as VariableCount[]).map(v => (
              <button
                key={v}
                id={`desktop-var-select-${v}-btn`}
                onClick={() => onChangeVarCount(v)}
                className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg transition-all ${
                  varCount === v
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                title={`${v} Variables (${1 << v} cells)`}
              >
                {v}V
              </button>
            ))}
          </div>

          {/* SOP vs POS Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="form-sop-btn"
              onClick={() => onChangeForm('SOP')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                form === 'SOP'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              title="Sum of Products (AND-OR, groups 1s)"
            >
              SOP (&sum;)
            </button>
            <button
              id="form-pos-btn"
              onClick={() => onChangeForm('POS')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                form === 'POS'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              title="Product of Sums (OR-AND, groups 0s)"
            >
              POS (&prod;)
            </button>
          </div>

          {/* Presets Dropdown */}
          <div className="relative">
            <select
              id="presets-dropdown-select"
              value={selectedPresetId || ''}
              onChange={e => {
                const pId = e.target.value;
                if (!pId) return;
                const preset = PRESET_PROBLEMS.find(p => p.id === pId);
                if (preset) onSelectPreset(preset);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs max-w-[260px] truncate"
            >
              <option value="" disabled={!!selectedPresetId}>
                Load Example Problem...
              </option>
              {PRESET_PROBLEMS.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.category}] {p.title} ({p.variableCount}V)
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2">
            <button
              id="practice-quiz-toggle-btn"
              onClick={onToggleQuiz}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                showQuiz
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Practice & Quiz Mode"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Practice</span>
            </button>

            <button
              id="print-worksheet-btn"
              onClick={onTogglePrintMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isPrintMode
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Print"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>Print</span>
            </button>

            <button
              id="open-export-modal-btn"
              onClick={onOpenExport}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="Export TikZ, LaTeX, HDL, and solutions"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Export</span>
            </button>

            <button
              id="reset-kmap-btn"
              onClick={onReset}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors"
              title="Clear all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE & TABLET NAVBAR (visible on screens < lg) */}
        <div className="lg:hidden flex flex-col py-2 gap-2">
          {/* Top Row: Brand & Quick Buttons & Hamburger */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <AppLogo className="w-7 h-7 rounded-lg" />
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                K Maps Solver
              </span>
            </div>

            {/* Quick Action Buttons on Mobile */}
            <div className="flex items-center gap-1.5">
              {/* Quick Practice button */}
              <button
                id="mobile-quick-practice-btn"
                onClick={onToggleQuiz}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                  showQuiz
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Practice & Quiz"
              >
                <HelpCircle className={`w-3.5 h-3.5 ${showQuiz ? 'text-white' : 'text-indigo-600'}`} />
                <span>Practice</span>
              </button>

              {/* Quick Print Exam button */}
              <button
                id="mobile-quick-print-btn"
                onClick={onTogglePrintMode}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                  isPrintMode
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Print Exam"
              >
                <Printer className={`w-3.5 h-3.5 ${isPrintMode ? 'text-white' : 'text-amber-600'}`} />
                <span>Print</span>
              </button>

              {/* Hamburger Menu Toggle Button */}
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
                  isMobileMenuOpen
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secondary Mobile Row: Variables and SOP/POS toggles (Always instantly accessible on mobile) */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {/* Variables Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 px-1 hidden xs:inline">Variables:</span>
              {([2, 3, 4, 5, 6] as VariableCount[]).map(v => (
                <button
                  key={v}
                  id={`mobile-var-select-${v}-btn`}
                  onClick={() => onChangeVarCount(v)}
                  className={`px-2 py-0.5 text-xs font-bold font-mono rounded-md transition-all ${
                    varCount === v
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`${v} Variables`}
                >
                  {v}V
                </button>
              ))}
            </div>

            {/* SOP vs POS */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                id="mobile-form-sop-btn"
                onClick={() => onChangeForm('SOP')}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                  form === 'SOP'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SOP (&sum;)
              </button>
              <button
                id="mobile-form-pos-btn"
                onClick={() => onChangeForm('POS')}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                  form === 'POS'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                POS (&prod;)
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE FULL-FEATURE DRAWER / MENU */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-3.5 bg-slate-50/95 -mx-2 sm:-mx-4 px-3 sm:px-5">
            {/* Example Problems Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Example Problem Presets</span>
              </label>
              <select
                id="mobile-presets-dropdown-select"
                value={selectedPresetId || ''}
                onChange={e => {
                  const pId = e.target.value;
                  if (!pId) return;
                  const preset = PRESET_PROBLEMS.find(p => p.id === pId);
                  if (preset) {
                    onSelectPreset(preset);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
              >
                <option value="" disabled={!!selectedPresetId}>
                  Tap to load example problem...
                </option>
                {PRESET_PROBLEMS.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.title} ({p.variableCount} Variables)
                  </option>
                ))}
              </select>
            </div>

            {/* Variables Detail Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Variables Count
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([2, 3, 4, 5, 6] as VariableCount[]).map(v => (
                  <button
                    key={v}
                    id={`mobile-drawer-var-${v}-btn`}
                    onClick={() => {
                      onChangeVarCount(v);
                    }}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      varCount === v
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{v} Vars</div>
                    <div className="text-[10px] opacity-75 font-normal">{1 << v} cells</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features & Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Practice Quiz */}
              <button
                id="mobile-drawer-practice-btn"
                onClick={() => {
                  onToggleQuiz();
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                  showQuiz
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Practice & Quiz Mode</span>
                    {showQuiz && (
                      <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Interactive questions, instant feedback & score tracking
                  </p>
                </div>
              </button>

              {/* Print */}
              <button
                id="mobile-drawer-print-btn"
                onClick={() => {
                  onTogglePrintMode();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-left flex items-start gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Print</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clean printable sheet with problem, grid and answer key
                  </p>
                </div>
              </button>

              {/* Export Modal */}
              <button
                id="mobile-drawer-export-btn"
                onClick={() => {
                  onOpenExport();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-left flex items-start gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Export LaTeX / TikZ / Verilog</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generate vector TikZ diagrams, HDL modules, and math formulas
                  </p>
                </div>
              </button>

              {/* Reset Clear All */}
              <button
                id="mobile-drawer-reset-btn"
                onClick={() => {
                  onReset();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-800 text-left flex items-start gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-700">Clear K-Map (Reset)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clear all cells back to 0
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
