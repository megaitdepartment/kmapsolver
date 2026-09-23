import React, { useState, useMemo, useCallback } from 'react';
import { VariableCount, OptimizationForm, PresetProblem } from './types';
import { solveKMap } from './utils/kmapSolver';
import { Navbar } from './components/Navbar';
import { InputPanel } from './components/InputPanel';
import { KMapVisualizer } from './components/KMapVisualizer';
import { TruthTable } from './components/TruthTable';
import { StepByStepExplanation } from './components/StepByStepExplanation';
import { ExportModal } from './components/ExportModal';
import { QuizMode } from './components/QuizMode';
import { PrintableWorksheet } from './components/PrintableWorksheet';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { PRESET_PROBLEMS } from './data/presets';
import {
  Layers,
  BookOpen,
  Table,
  Sparkles,
  HelpCircle,
  Share2,
  Eye,
  EyeOff,
} from 'lucide-react';

const DEFAULT_VARIABLES: Record<VariableCount, string[]> = {
  2: ['A', 'B'],
  3: ['A', 'B', 'C'],
  4: ['A', 'B', 'C', 'D'],
  5: ['A', 'B', 'C', 'D', 'E'],
  6: ['A', 'B', 'C', 'D', 'E', 'F'],
};

export default function App() {
  const [varCount, setVarCount] = useState<VariableCount>(4);
  const [variables, setVariables] = useState<string[]>(DEFAULT_VARIABLES[4]);
  const [form, setForm] = useState<OptimizationForm>('SOP');

  // Initial minterms: wrap around 4 corners (m0, m2, m8, m10)
  const [cellValues, setCellValues] = useState<Record<number, '0' | '1' | 'X'>>(() => {
    const initial: Record<number, '0' | '1' | 'X'> = {};
    const defaultMinterms = [0, 2, 8, 10];
    for (let i = 0; i < 16; i++) {
      initial[i] = defaultMinterms.includes(i) ? '1' : '0';
    }
    return initial;
  });

  const [hoveredImplicantId, setHoveredImplicantId] = useState<string | null>(null);
  const [showMintermIndices, setShowMintermIndices] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'kmap' | 'steps' | 'truth-table'>('kmap');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showDetailedSolution, setShowDetailedSolution] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Extract minterms, maxterms, and dont-cares from current cell values
  const { currentMinterms, currentMaxterms, currentDontCares } = useMemo(() => {
    const minterms: number[] = [];
    const maxterms: number[] = [];
    const dontCares: number[] = [];
    const totalCells = 1 << varCount;

    for (let i = 0; i < totalCells; i++) {
      const val = cellValues[i] ?? '0';
      if (val === '1') minterms.push(i);
      else if (val === '0') maxterms.push(i);
      else if (val === 'X') dontCares.push(i);
    }
    return { currentMinterms: minterms, currentMaxterms: maxterms, currentDontCares: dontCares };
  }, [cellValues, varCount]);

  // Solver Engine result
  const solverResult = useMemo(() => {
    return solveKMap(varCount, variables, currentMinterms, currentDontCares, form);
  }, [varCount, variables, currentMinterms, currentDontCares, form]);

  // Handle cell toggle: 0 -> 1 -> X -> 0
  const handleCellClick = useCallback((minterm: number) => {
    setSelectedPresetId(null);
    setCellValues(prev => {
      const current = prev[minterm] ?? '0';
      let next: '0' | '1' | 'X' = '1';
      if (current === '0') next = '1';
      else if (current === '1') next = 'X';
      else next = '0';
      return { ...prev, [minterm]: next };
    });
  }, []);

  // Handle variable count change
  const handleChangeVarCount = (newCount: VariableCount) => {
    setSelectedPresetId(null);
    setVarCount(newCount);
    setVariables(DEFAULT_VARIABLES[newCount]);
    const maxCells = 1 << newCount;
    // Retain minterms that fit, reset others
    setCellValues(prev => {
      const next: Record<number, '0' | '1' | 'X'> = {};
      for (let i = 0; i < maxCells; i++) {
        next[i] = prev[i] ?? '0';
      }
      return next;
    });
  };

  // Preset Selection
  const handleSelectPreset = (preset: PresetProblem) => {
    setSelectedPresetId(preset.id);
    setVarCount(preset.variableCount);
    setVariables(preset.variables);
    if (preset.form) setForm(preset.form);

    const maxCells = 1 << preset.variableCount;
    const next: Record<number, '0' | '1' | 'X'> = {};
    for (let i = 0; i < maxCells; i++) {
      if (preset.minterms.includes(i)) next[i] = '1';
      else if (preset.dontCares.includes(i)) next[i] = 'X';
      else next[i] = '0';
    }
    setCellValues(next);
  };

  // Quick Action Handlers
  const handleClear = () => {
    setSelectedPresetId(null);
    const maxCells = 1 << varCount;
    const next: Record<number, '0' | '1' | 'X'> = {};
    for (let i = 0; i < maxCells; i++) next[i] = '0';
    setCellValues(next);
  };

  const handleFillAllOnes = () => {
    setSelectedPresetId(null);
    const maxCells = 1 << varCount;
    const next: Record<number, '0' | '1' | 'X'> = {};
    for (let i = 0; i < maxCells; i++) next[i] = '1';
    setCellValues(next);
  };

  const handleInvertAll = () => {
    setSelectedPresetId(null);
    const maxCells = 1 << varCount;
    setCellValues(prev => {
      const next: Record<number, '0' | '1' | 'X'> = {};
      for (let i = 0; i < maxCells; i++) {
        const val = prev[i] ?? '0';
        next[i] = val === '1' ? '0' : val === '0' ? '1' : 'X';
      }
      return next;
    });
  };

  const handleRandomize = () => {
    const maxCells = 1 << varCount;
    const next: Record<number, '0' | '1' | 'X'> = {};
    for (let i = 0; i < maxCells; i++) {
      const rand = Math.random();
      if (rand < 0.35) next[i] = '1';
      else if (rand < 0.45) next[i] = 'X';
      else next[i] = '0';
    }
    setCellValues(next);
  };

  const handleApplyValues = (terms: number[], dontCares: number[], isMaxterms: boolean) => {
    const maxCells = 1 << varCount;
    const next: Record<number, '0' | '1' | 'X'> = {};
    for (let i = 0; i < maxCells; i++) {
      if (dontCares.includes(i)) {
        next[i] = 'X';
      } else if (terms.includes(i)) {
        next[i] = isMaxterms ? '0' : '1';
      } else {
        next[i] = isMaxterms ? '1' : '0';
      }
    }
    setCellValues(next);
  };

  // Quiz Mode Question Loader
  const handleLoadQuizQuestion = (qMinterms: number[], qDontCares: number[], qVarCount: VariableCount) => {
    setSelectedPresetId(null);
    setVarCount(qVarCount);
    setVariables(DEFAULT_VARIABLES[qVarCount]);
    const maxCells = 1 << qVarCount;
    const next: Record<number, '0' | '1' | 'X'> = {};
    for (let i = 0; i < maxCells; i++) {
      if (qMinterms.includes(i)) next[i] = '1';
      else if (qDontCares.includes(i)) next[i] = 'X';
      else next[i] = '0';
    }
    setCellValues(next);
  };

  // If in printable worksheet mode, render the print layout
  if (isPrintMode) {
    return (
      <PrintableWorksheet
        result={solverResult}
        cellValues={cellValues}
        onExitPrintMode={() => setIsPrintMode(false)}
      />
    );
  }

  const hoveredMinterms = hoveredImplicantId
    ? solverResult.allPrimeImplicants.find(pi => pi.id === hoveredImplicantId)?.cells.map(c => c.minterm) ?? null
    : null;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <div className="shrink-0">
        <Navbar
          varCount={varCount}
          onChangeVarCount={handleChangeVarCount}
          form={form}
          onChangeForm={setForm}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onReset={handleClear}
          onOpenExport={() => setIsExportModalOpen(true)}
          onTogglePrintMode={() => setIsPrintMode(true)}
          isPrintMode={isPrintMode}
          showQuiz={showQuiz}
          onToggleQuiz={() => {
            setShowQuiz(prev => {
              const next = !prev;
              if (next) setShowDetailedSolution(false);
              return next;
            });
          }}
          onOpenContact={() => setIsContactModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main
        className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 py-3 flex flex-col gap-3.5 pb-8"
      >
        {/* Practice Quiz Section if opened */}
        {showQuiz && (
          <div className="shrink-0">
            <QuizMode
              currentResult={solverResult}
              varCount={varCount}
              onChangeVarCount={handleChangeVarCount}
              form={form}
              onChangeForm={setForm}
              onLoadQuestion={handleLoadQuizQuestion}
              showDetailedSolution={showDetailedSolution}
              onToggleDetailedSolution={() => setShowDetailedSolution(s => !s)}
              onCloseQuiz={() => setShowQuiz(false)}
            />
          </div>
        )}

        {/* When in Practice Mode and Solution is Hidden */}
        {showQuiz && !showDetailedSolution && (
          <div className="min-h-[260px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Eye className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800">Detailed Solution & Proof are Hidden</h4>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                Work out the {form} minimization on paper or mentally, then enter your answer above.
                When you want to inspect the step-by-step Quine-McCluskey groupings, prime implicant chart, and K-Map, reveal the solution below.
              </p>
            </div>
            <button
              id="reveal-detailed-solution-btn"
              onClick={() => setShowDetailedSolution(true)}
              className="mt-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Show Detailed Solution</span>
            </button>
          </div>
        )}

        {/* Regular Mode, OR Practice Mode with Detailed Solution Revealed */}
        {(!showQuiz || showDetailedSolution) && (
          <>
            {/* Input Panel only in non-quiz mode */}
            {!showQuiz && (
              <div className="shrink-0">
                <InputPanel
                  varCount={varCount}
                  variables={variables}
                  onChangeVariables={setVariables}
                  onApplyValues={handleApplyValues}
                  onClear={handleClear}
                  onFillAllOnes={handleFillAllOnes}
                  onInvertAll={handleInvertAll}
                  onRandomize={handleRandomize}
                  currentMinterms={currentMinterms}
                  currentMaxterms={currentMaxterms}
                  currentDontCares={currentDontCares}
                  form={form}
                />
              </div>
            )}

            {/* Header Bar with View Tabs and Minimal Equation */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 shrink-0">
              {/* View Tab Selection */}
              <div className="flex items-center gap-1.5">
                <button
                  id="tab-kmap-view-btn"
                  onClick={() => setActiveTab('kmap')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'kmap'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>K-Map & Proof</span>
                </button>
                <button
                  id="tab-steps-view-btn"
                  onClick={() => setActiveTab('steps')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'steps'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Full Steps</span>
                </button>
                <button
                  id="tab-truthtable-view-btn"
                  onClick={() => setActiveTab('truth-table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'truth-table'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Truth Table</span>
                </button>
              </div>

              {/* Minimal Equation Highlight Badge & Quick Export */}
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs max-w-full overflow-x-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Minimal {form}:</span>
                <span className="font-mono font-bold text-sm text-indigo-900 truncate">
                  {form === 'SOP' ? solverResult.minimalEquation : solverResult.minimalPosEquation}
                </span>
                <div className="h-4 w-px bg-slate-200 mx-0.5 shrink-0" />
                <button
                  id="quick-export-modal-btn"
                  onClick={() => setIsExportModalOpen(true)}
                  className="p-1 text-slate-500 hover:text-indigo-600 rounded transition-colors flex items-center gap-1 text-xs font-semibold shrink-0 cursor-pointer"
                  title="Copy LaTeX & TikZ"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline text-[11px] text-slate-600">LaTeX</span>
                </button>
              </div>
            </div>

            {/* Tab Content Panels */}
            {activeTab === 'kmap' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                {/* Left Visualizer */}
                <div className="lg:col-span-5 min-h-[480px] sm:min-h-[520px] flex flex-col">
                  <KMapVisualizer
                    result={solverResult}
                    cellValues={cellValues}
                    onCellClick={handleCellClick}
                    hoveredImplicantId={hoveredImplicantId}
                    onHoverImplicant={setHoveredImplicantId}
                    showMintermIndices={showMintermIndices}
                    onToggleMintermIndices={() => setShowMintermIndices(v => !v)}
                  />
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-7 min-h-[500px] flex flex-col">
                  <StepByStepExplanation
                    result={solverResult}
                    hoveredImplicantId={hoveredImplicantId}
                    onHoverImplicant={setHoveredImplicantId}
                  />
                </div>
              </div>
            )}

            {activeTab === 'steps' && (
              <div className="max-w-5xl w-full mx-auto min-h-[500px]">
                <StepByStepExplanation
                  result={solverResult}
                  hoveredImplicantId={hoveredImplicantId}
                  onHoverImplicant={setHoveredImplicantId}
                />
              </div>
            )}

            {activeTab === 'truth-table' && (
              <div className="min-h-[500px] max-w-4xl w-full mx-auto">
                <TruthTable
                  varCount={varCount}
                  variables={variables}
                  cellValues={cellValues}
                  onCellClick={handleCellClick}
                  hoveredImplicantMinterms={hoveredMinterms}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer onOpenQueryModal={() => setIsContactModalOpen(true)} />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={solverResult}
        cellValues={cellValues}
      />

      {/* Contact & Query Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
