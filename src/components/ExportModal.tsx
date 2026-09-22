import React, { useState } from 'react';
import { SolverResult } from '../types';
import {
  generateTikzCode,
  generateKarnaughMapPackageLatex,
  generateHardwareCode,
} from '../utils/latexGenerator';
import { copyTextToClipboard } from '../utils/svgExport';
import { X, Copy, Check, FileCode, Terminal, Code2, BookOpen } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SolverResult;
  cellValues: Record<number, '0' | '1' | 'X'>;
}

type TabType = 'tikz' | 'kmap-pkg' | 'latex-math' | 'verilog' | 'vhdl' | 'c' | 'markdown';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
  cellValues,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tikz');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tikzCode = generateTikzCode(result, cellValues);
  const kmapPkgCode = generateKarnaughMapPackageLatex(result, cellValues);
  const hardware = generateHardwareCode(result);

  const markdownContent = `# Karnaugh Map Solution & Derivation
**Function:** $F(${result.variables.join(', ')})$  
**Form:** ${result.form}  
**Minterms:** $m(${result.minterms.join(', ') || 'none'})$  
**Don't-cares:** $d(${result.dontCares.join(', ') || 'none'})$  

## Minimal Boolean Expression
- **SOP:** \`${result.minimalEquation}\`
- **POS:** \`${result.minimalPosEquation}\`
- **LaTeX:** \`$${result.latexEquation}$\`

## Prime Implicants
${result.allPrimeImplicants
  .map(
    (pi, i) =>
      `- **PI ${i + 1}**: \`${result.form === 'SOP' ? pi.termString : pi.posTermString}\` ${
        pi.isEssential ? '*(Essential)*' : ''
      } | Cells: {${pi.cells.map(c => c.minterm).join(', ')}} | Pattern: \`${pi.binaryPattern}\``
  )
  .join('\n')}

## Step-by-Step Derivation
${result.steps
  .map(
    (step, idx) =>
      `### Step ${idx + 1}: ${step.title}\n${step.description}\n\n${step.details ? `\`\`\`\n${step.details}\n\`\`\`` : ''}`
  )
  .join('\n\n')}
`;

  let currentCode = '';
  if (activeTab === 'tikz') currentCode = tikzCode;
  else if (activeTab === 'kmap-pkg') currentCode = kmapPkgCode;
  else if (activeTab === 'latex-math') currentCode = result.latexEquation;
  else if (activeTab === 'verilog') currentCode = hardware.verilog;
  else if (activeTab === 'vhdl') currentCode = hardware.vhdl;
  else if (activeTab === 'c') currentCode = hardware.cCode;
  else if (activeTab === 'markdown') currentCode = markdownContent;

  const handleCopy = () => {
    copyTextToClipboard(currentCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Textbook & Publication Export Suite
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-compile LaTeX TikZ, textbook packages, hardware HDL, and Markdown solutions
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs font-medium">
          <button
            id="tab-tikz-btn"
            onClick={() => setActiveTab('tikz')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tikz'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            LaTeX TikZ (Standalone)
          </button>
          <button
            id="tab-kmap-pkg-btn"
            onClick={() => setActiveTab('kmap-pkg')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'kmap-pkg'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            LaTeX (karnaugh-map pkg)
          </button>
          <button
            id="tab-latex-math-btn"
            onClick={() => setActiveTab('latex-math')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'latex-math'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            LaTeX Math Equation
          </button>
          <button
            id="tab-markdown-btn"
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'markdown'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            Markdown Solution
          </button>
          <button
            id="tab-verilog-btn"
            onClick={() => setActiveTab('verilog')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'verilog'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            Verilog HDL
          </button>
          <button
            id="tab-vhdl-btn"
            onClick={() => setActiveTab('vhdl')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'vhdl'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            VHDL
          </button>
          <button
            id="tab-c-btn"
            onClick={() => setActiveTab('c')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'c'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            C / C++ Function
          </button>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900 text-slate-100 font-mono text-xs relative">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed">{currentCode}</pre>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-500">
            {activeTab === 'tikz' && 'Compiles in Overleaf with \\usepackage{tikz}'}
            {activeTab === 'kmap-pkg' && 'Uses the CTAN karnaugh-map LaTeX package'}
            {activeTab === 'latex-math' && 'Copy into math mode $ ... $ in any paper or forum'}
            {activeTab === 'markdown' && 'Great for homework, lecture notes, or Obsidian'}
            {activeTab === 'verilog' && 'Synthesizable standard Verilog IEEE 1364-2001'}
            {activeTab === 'vhdl' && 'Synthesizable standard VHDL IEEE 1164'}
            {activeTab === 'c' && 'Pure standard C/C++ evaluation logic'}
          </span>

          <div className="flex items-center gap-2">
            <button
              id="copy-export-content-btn"
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-2 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
            <button
              id="close-export-btn-footer"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
