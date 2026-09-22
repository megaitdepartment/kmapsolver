import React, { useState } from 'react';
import { SolverResult } from '../types';
import { Printer, ArrowLeft, Download, Check, Copy, AlertCircle } from 'lucide-react';
import { getMapStructure, getMintermFromCoord } from '../utils/kmapSolver';
import { copyTextToClipboard } from '../utils/svgExport';

interface PrintableWorksheetProps {
  result: SolverResult;
  cellValues: Record<number, '0' | '1' | 'X'>;
  onExitPrintMode: () => void;
}

export const PrintableWorksheet: React.FC<PrintableWorksheetProps> = ({
  result,
  cellValues,
  onExitPrintMode,
}) => {
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [blankGridForStudent, setBlankGridForStudent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    variableCount,
    variables,
    form,
    minterms,
    maxterms,
    dontCares,
    minimalEquation,
    minimalPosEquation,
    selectedPrimeImplicants,
  } = result;
  const struct = getMapStructure(variableCount, variables);

  // Generate a self-contained, print-perfect HTML document that can be opened in any browser
  const generateStandaloneHTML = () => {
    const subMapsHtml = Array.from({ length: struct.subMapsCount || 1 })
      .map((_, subIdx) => {
        let subMapTitle = '';
        if (variableCount === 5) {
          subMapTitle = `${struct.splitVars?.[0]} = ${subIdx}`;
        } else if (variableCount === 6) {
          subMapTitle = `${struct.splitVars?.join('')} = ${struct.splitCodes?.[subIdx]}`;
        }

        const colHeaders = struct.colCodes
          .map(
            code =>
              `<th style="border:2px solid #000; padding:8px 12px; font-family:monospace; background:#f8fafc; font-size:14px;">${code}</th>`
          )
          .join('');

        const rowsHtml = Array.from({ length: struct.rows })
          .map((_, r) => {
            const rowHeader = `<td style="border:2px solid #000; padding:8px 12px; font-family:monospace; background:#f8fafc; font-weight:bold; font-size:14px;">${struct.rowCodes[r]}</td>`;
            const cells = Array.from({ length: struct.cols })
              .map((_, c) => {
                const m = getMintermFromCoord(r, c, subIdx, variableCount);
                const val = cellValues[m] ?? '0';
                return `
                  <td style="border:2px solid #000; width:56px; height:56px; text-align:center; position:relative; vertical-align:middle;">
                    <div style="position:absolute; top:2px; right:4px; font-size:9px; color:#64748b; font-family:monospace;">${m}</div>
                    ${blankGridForStudent ? '' : `<div style="font-size:20px; font-weight:bold; font-family:monospace;">${val}</div>`}
                  </td>
                `;
              })
              .join('');
            return `<tr>${rowHeader}${cells}</tr>`;
          })
          .join('');

        return `
          <div style="display:inline-block; margin: 12px; text-align:center;">
            ${subMapTitle ? `<div style="font-family:monospace; font-weight:bold; font-size:13px; margin-bottom:6px;">[${subMapTitle}]</div>` : ''}
            <table style="border-collapse:collapse; margin:0 auto; background:#ffffff;">
              <thead>
                <tr>
                  <th style="border:2px solid #000; width:64px; height:46px; position:relative; background:#f8fafc;">
                    <svg style="position:absolute; top:0; left:0; width:100%; height:100%;" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <line x1="0" y1="0" x2="100" y2="100" stroke="#000" stroke-width="2" />
                    </svg>
                    <span style="position:absolute; top:3px; right:6px; font-size:12px; font-family:monospace; font-weight:bold;">${struct.colVars.join('')}</span>
                    <span style="position:absolute; bottom:3px; left:6px; font-size:12px; font-family:monospace; font-weight:bold;">${struct.rowVars.join('')}</span>
                  </th>
                  ${colHeaders}
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    const targetEquation = form === 'POS' ? minimalPosEquation : minimalEquation;
    const alternateEquation = form === 'POS' ? minimalEquation : minimalPosEquation;
    const targetLabel = form === 'POS' ? 'Minimal POS (Target Solution)' : 'Minimal SOP (Target Solution)';
    const alternateLabel = form === 'POS' ? 'Minimal SOP (Equivalent Form)' : 'Minimal POS (Equivalent Form)';

    const answersHtml = includeAnswers
      ? `
        <div style="margin-top: 32px; padding-top: 18px; border-top: 2px dashed #94a3b8; font-family:serif;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <h3 style="margin:0; font-size:16px;">[Answer Key & Verification Steps &bull; ${form}]</h3>
            <span style="font-size:12px; color:#64748b; font-family:sans-serif;">For Instructor Use</span>
          </div>
          <div style="display:flex; gap:14px; margin-bottom:14px; flex-wrap:wrap;">
            <div style="flex:1; min-width:240px; padding:10px 14px; background:#f1f5f9; border:2px solid #000; border-radius:6px;">
              <strong style="font-size:12px; color:#0f172a; text-transform:uppercase;">${targetLabel}:</strong>
              <div style="font-family:monospace; font-size:16px; font-weight:bold; margin-top:4px; word-break:break-all;">${targetEquation}</div>
            </div>
            <div style="flex:1; min-width:240px; padding:10px 14px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px;">
              <strong style="font-size:12px; color:#475569;">${alternateLabel}:</strong>
              <div style="font-family:monospace; font-size:15px; font-weight:bold; margin-top:4px; word-break:break-all;">${alternateEquation}</div>
            </div>
          </div>
          <div style="font-size:13px; line-height:1.6;">
            <strong>Selected Prime Implicants (${form} Groups):</strong>
            <ul style="margin:6px 0 0 18px; padding:0; font-family:monospace;">
              ${selectedPrimeImplicants
                .map((pi, i) => {
                  const term = form === 'POS' ? pi.posTermString : pi.termString;
                  return `<li>Group ${i + 1}: <strong>${term}</strong> &mdash; cells {${pi.minterms.join(', ')}} (${pi.isEssential ? 'Essential PI' : 'Covering PI'})</li>`;
                })
                .join('')}
            </ul>
          </div>
        </div>
      `
      : '';

    const problemEquationHtml =
      form === 'SOP'
        ? `F(${variables.join(', ')}) = &sum; m(${minterms.join(', ') || 'none'})${dontCares.length > 0 ? ` + &sum; d(${dontCares.join(', ')})` : ''}`
        : `F(${variables.join(', ')}) = &prod; M(${maxterms.join(', ') || 'none'})${dontCares.length > 0 ? ` &middot; &prod; d(${dontCares.join(', ')})` : ''}`;

    const problemInstructions =
      form === 'SOP'
        ? "Instructions: Plot minterms (1s) and don't-cares (Xs) on the Gray-code grid, circle optimal rectangular groups of 1s (powers of 2: 1, 2, 4, 8, 16), and determine the minimal SOP equation."
        : "Instructions: Plot maxterms (0s) and don't-cares (Xs) on the Gray-code grid, circle optimal rectangular groups of 0s (powers of 2: 1, 2, 4, 8, 16), and determine the minimal POS equation.";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K-Map Print - ${variables.join('')} (${variableCount} Variables &bull; ${form})</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, Georgia, serif; color: #000000; background: #ffffff; padding: 16px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
    .header-box { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px; }
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
    .header-title h1 { margin: 0; font-size: 22px; font-weight: bold; }
    .header-meta { font-size: 13px; line-height: 1.8; }
    .field-line { display: inline-block; border-bottom: 1px solid #000; }
    .grid-container { text-align: center; margin: 20px 0; overflow-x: auto; }
    @media screen and (max-width: 600px) {
      .header-row { flex-direction: column; }
      .header-meta { width: 100%; text-align: left; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="header-row">
      <div class="header-title">
        <h1>Karnaugh Map Worksheet</h1>
        <p style="margin:3px 0 0 0; font-size:13px; font-style:italic; color:#475569;">
          Boolean Function Simplification & Logic Design &bull; ${form} Form
        </p>
      </div>
      <div class="header-meta">
        <div>Name: <span class="field-line" style="width:180px;"></span></div>
        <div>Date: <span class="field-line" style="width:100px;"></span> Score: <span class="field-line" style="width:50px; text-align:right;">/10</span></div>
      </div>
    </div>
  </div>

  <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
    <div style="font-weight:bold;">Problem: Simplify the following Boolean function in ${form} form using a ${variableCount}-variable Karnaugh Map:</div>
    <div style="margin: 8px 0; padding: 10px 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 14px; font-weight: bold; word-break: break-all;">
      ${problemEquationHtml}
    </div>
    <div style="font-size: 13px; font-style: italic; color: #475569;">
      ${problemInstructions}
    </div>
  </div>

  <div class="grid-container">
    ${subMapsHtml}
  </div>

  ${answersHtml}

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
  };

  // Direct print button handler with fallback
  const handlePrint = () => {
    setStatusMessage('Preparing print worksheet...');
    try {
      window.focus();
      window.print();
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.warn('Direct window.print() prevented by sandbox:', err);
      // Auto-fallback to standalone HTML download
      handleDownloadHTML();
    }
  };

  // Download standalone printable HTML file
  const handleDownloadHTML = () => {
    const html = generateStandaloneHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kmap-print-${variables.join('')}-${variableCount}var-${form.toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage('Print HTML file downloaded! Open it in any browser and it will immediately open the Print dialog.');
    setTimeout(() => setStatusMessage(null), 6000);
  };

  // Copy standalone HTML markup
  const handleCopyHTML = () => {
    const html = generateStandaloneHTML();
    copyTextToClipboard(html).then(() => {
      setCopied(true);
      setStatusMessage('HTML copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setStatusMessage(null);
      }, 3000);
    });
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-900 font-sans p-2 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-3.5 sm:p-8">
        {/* Non-printed control header */}
        <div className="print:hidden mb-5 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-xl flex flex-col gap-3 border border-slate-200">
          {/* Top Control Bar Row */}
          <div className="flex items-center justify-between gap-2">
            <button
              id="back-to-editor-btn"
              onClick={onExitPrintMode}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Print
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                  form === 'POS'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                }`}
              >
                {form} Form
              </span>
            </div>
          </div>

          {/* Options & Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200">
            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-3.5">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={e => setIncludeAnswers(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Include Answer Key</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={blankGridForStudent}
                  onChange={e => setBlankGridForStudent(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Blank Grid</span>
              </label>
            </div>

            {/* Print & Export Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Primary Print Button */}
              <button
                id="execute-print-btn"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Trigger browser print dialog"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              {/* Download Standalone HTML Button */}
              <button
                id="download-exam-html-btn"
                onClick={handleDownloadHTML}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Download standalone HTML with auto-print"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download HTML</span>
                <span className="sm:hidden">Download</span>
              </button>

              {/* Copy HTML Button */}
              <button
                id="copy-exam-html-btn"
                onClick={handleCopyHTML}
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Copy standalone HTML code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Toast / Help Notification */}
        {statusMessage && (
          <div className="print:hidden mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Printable Sheet Content */}
        <div id="printable-exam-sheet" className="font-serif">
          {/* Sheet Header - Responsive on Mobile & Clean on Print */}
          <div className="border-b-2 border-black pb-4 mb-5 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-6">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black leading-tight">
                  Karnaugh Map Worksheet
                </h1>
                <p className="text-xs text-slate-600 italic mt-0.5">
                  Boolean Function Simplification & Logic Design &bull; {form} Form
                </p>
              </div>
              <div className="text-left sm:text-right text-xs space-y-2 sm:space-y-1 text-black font-sans shrink-0">
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <span className="font-semibold text-slate-800">Name:</span>
                  <span className="border-b-2 border-black w-40 sm:w-52 inline-block"></span>
                </div>
                <div className="flex items-center gap-2.5 sm:justify-end flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">Date:</span>
                    <span className="border-b-2 border-black w-24 sm:w-28 inline-block"></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-800">Score:</span>
                    <span className="border-b-2 border-black w-14 inline-block text-right pr-1 font-mono">/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Problem Statement - Form Aware (SOP vs POS) */}
          <div className="mb-5 sm:mb-6 space-y-2 text-sm text-black">
            <div className="font-bold text-xs sm:text-sm">
              Problem: Simplify the following Boolean function in {form} form using a {variableCount}-variable Karnaugh Map:
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-300 rounded font-mono text-xs sm:text-sm font-semibold break-words">
              {form === 'SOP' ? (
                <>
                  F({variables.join(', ')}) = &sum; m({minterms.join(', ') || 'none'})
                  {dontCares.length > 0 && <span> + &sum; d({dontCares.join(', ')})</span>}
                </>
              ) : (
                <>
                  F({variables.join(', ')}) = &prod; M({maxterms.join(', ') || 'none'})
                  {dontCares.length > 0 && <span> &middot; &prod; d({dontCares.join(', ')})</span>}
                </>
              )}
            </div>
            <div className="text-xs text-slate-600 italic">
              {form === 'SOP'
                ? "Instructions: Plot minterms (1s) and don't-cares (Xs) on the Gray-code grid, circle optimal rectangular groups of 1s (powers of 2), and determine the minimal SOP equation."
                : "Instructions: Plot maxterms (0s) and don't-cares (Xs) on the Gray-code grid, circle optimal rectangular groups of 0s (powers of 2), and determine the minimal POS equation."}
            </div>
          </div>

          {/* Grid Display */}
          <div className="my-5 sm:my-6 flex flex-wrap justify-center gap-6 sm:gap-8">
            {Array.from({ length: struct.subMapsCount || 1 }).map((_, subIdx) => {
              let subMapTitle = '';
              if (variableCount === 5) {
                subMapTitle = `${struct.splitVars?.[0]} = ${subIdx}`;
              } else if (variableCount === 6) {
                subMapTitle = `${struct.splitVars?.join('')} = ${struct.splitCodes?.[subIdx]}`;
              }

              return (
                <div key={subIdx} className="flex flex-col items-center max-w-full">
                  {subMapTitle && (
                    <div className="text-xs font-bold font-mono mb-1.5 uppercase tracking-wide text-black">
                      [{subMapTitle}]
                    </div>
                  )}
                  <div className="overflow-x-auto max-w-full pb-2">
                    <div className="border-2 border-black p-1.5 sm:p-2 inline-block bg-white shadow-2xs">
                      <table className="border-collapse text-center">
                        <thead>
                          <tr>
                            {/* Diagonal Split Corner Cell with Row \ Col variables */}
                            <th className="border-2 border-black relative p-0 w-12 h-10 sm:w-16 sm:h-12 bg-slate-50 overflow-hidden select-none">
                              <svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                preserveAspectRatio="none"
                                viewBox="0 0 100 100"
                              >
                                <line
                                  x1="0"
                                  y1="0"
                                  x2="100"
                                  y2="100"
                                  stroke="#000000"
                                  strokeWidth="2"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                              {/* Column Variables */}
                              <span className="absolute top-0.5 right-1 sm:top-1 sm:right-1.5 text-[10px] sm:text-xs font-mono font-bold text-black leading-none">
                                {struct.colVars.join('')}
                              </span>
                              {/* Row Variables */}
                              <span className="absolute bottom-0.5 left-1 sm:bottom-1 sm:left-1.5 text-[10px] sm:text-xs font-mono font-bold text-black leading-none">
                                {struct.rowVars.join('')}
                              </span>
                            </th>

                            {/* Column Gray Codes */}
                            {struct.colCodes.map((code, c) => (
                              <th
                                key={c}
                                className="p-1 sm:p-2 border-2 border-black font-mono text-[11px] sm:text-xs w-11 sm:w-14 font-bold bg-slate-50 text-black"
                              >
                                {code}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: struct.rows }).map((_, r) => (
                            <tr key={r}>
                              {/* Row Gray Code */}
                              <td className="p-1 sm:p-2 border-2 border-black font-mono text-[11px] sm:text-xs bg-slate-50 font-bold w-12 sm:w-16 text-black">
                                {struct.rowCodes[r]}
                              </td>

                              {/* Cell Values */}
                              {Array.from({ length: struct.cols }).map((_, c) => {
                                const m = getMintermFromCoord(r, c, subIdx, variableCount);
                                const val = cellValues[m] ?? '0';
                                return (
                                  <td
                                    key={c}
                                    className="p-1.5 sm:p-3 border-2 border-black font-mono text-sm sm:text-base relative h-11 w-11 sm:h-14 sm:w-14 text-center align-middle"
                                  >
                                    <span className="absolute top-0.5 right-0.5 sm:right-1 text-[8px] sm:text-[9px] text-slate-400 font-normal">
                                      {m}
                                    </span>
                                    {!blankGridForStudent && (
                                      <span
                                        className={`font-bold ${
                                          form === 'POS' && val === '0'
                                            ? 'text-black'
                                            : form === 'SOP' && val === '1'
                                            ? 'text-black'
                                            : val === 'X'
                                            ? 'text-amber-700'
                                            : 'text-slate-600'
                                        }`}
                                      >
                                        {val}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answer Key / Steps if enabled */}
          {includeAnswers && (
            <div className="mt-7 pt-5 border-t-2 border-dashed border-slate-400 space-y-4">
              <div className="font-bold text-sm sm:text-base flex flex-wrap items-center justify-between gap-2 text-black">
                <span>[Answer Key & Verification Steps &bull; {form}]</span>
                <span className="text-xs font-mono text-slate-500 font-normal">For Instructor Use</span>
              </div>

              {/* Solution Boxes - Prioritizes the active form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                {/* Active Target Form Box */}
                <div
                  className={`p-3 rounded-lg border ${
                    form === 'POS'
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900">
                      Minimal {form} (Target Solution):
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        form === 'POS' ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-900'
                      }`}
                    >
                      Active Form
                    </span>
                  </div>
                  <div className="text-sm font-bold text-black mt-1 break-words font-mono">
                    {form === 'POS' ? minimalPosEquation : minimalEquation}
                  </div>
                </div>

                {/* Alternative Equivalent Form Box */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <div className="font-bold text-slate-700 mb-1">
                    Minimal {form === 'POS' ? 'SOP' : 'POS'} (Equivalent):
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1 break-words font-mono">
                    {form === 'POS' ? minimalEquation : minimalPosEquation}
                  </div>
                </div>
              </div>

              {/* Selected Prime Implicants List */}
              <div className="text-xs space-y-1.5 text-black">
                <div className="font-bold">
                  Selected Prime Implicants ({form} Groups):
                </div>
                <div className="space-y-1 pl-2">
                  {selectedPrimeImplicants.map((pi, idx) => {
                    const termLabel = form === 'POS' ? pi.posTermString : pi.termString;
                    return (
                      <div key={pi.id} className="font-mono text-slate-800 text-[11px] sm:text-xs">
                        &bull; Group {idx + 1}: <strong className="text-black">{termLabel}</strong> &mdash; cells {'{'}{pi.minterms.join(', ')}{'}'} ({pi.isEssential ? 'Essential PI' : 'Covering PI'})
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
