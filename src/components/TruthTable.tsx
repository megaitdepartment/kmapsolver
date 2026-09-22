import React, { useState } from 'react';
import { VariableCount } from '../types';
import { Check, X, Filter } from 'lucide-react';

interface TruthTableProps {
  varCount: VariableCount;
  variables: string[];
  cellValues: Record<number, '0' | '1' | 'X'>;
  onCellClick: (minterm: number) => void;
  hoveredImplicantMinterms: number[] | null;
}

export const TruthTable: React.FC<TruthTableProps> = ({
  varCount,
  variables,
  cellValues,
  onCellClick,
  hoveredImplicantMinterms,
}) => {
  const [filter, setFilter] = useState<'all' | '1' | '0' | 'X'>('all');
  const totalRows = 1 << varCount;

  const rows = Array.from({ length: totalRows }, (_, idx) => {
    const binary = idx.toString(2).padStart(varCount, '0');
    const val = cellValues[idx] ?? '0';
    return {
      index: idx,
      binary,
      val,
    };
  });

  const filteredRows = rows.filter(r => {
    if (filter === 'all') return true;
    return r.val === filter;
  });

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden h-full">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Truth Table</span>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
            {totalRows} states
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <button
            id="filter-all-btn"
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            id="filter-ones-btn"
            onClick={() => setFilter('1')}
            className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
              filter === '1' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1s
          </button>
          <button
            id="filter-zeros-btn"
            onClick={() => setFilter('0')}
            className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
              filter === '0' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            0s
          </button>
          <button
            id="filter-dc-btn"
            onClick={() => setFilter('X')}
            className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
              filter === 'X' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Xs
          </button>
        </div>
      </div>

      {/* Table Body with Scroll */}
      <div className="overflow-y-auto overflow-x-auto max-h-[500px] divide-y divide-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              <th className="py-2.5 px-3 w-12 text-slate-400 font-mono">m#</th>
              {variables.map(v => (
                <th key={v} className="py-2.5 px-2 text-center font-mono">
                  {v}
                </th>
              ))}
              <th className="py-2.5 px-4 text-center font-bold text-indigo-700">F (Output)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredRows.map(row => {
              const isCovered = hoveredImplicantMinterms?.includes(row.index);
              return (
                <tr
                  key={row.index}
                  onClick={() => onCellClick(row.index)}
                  className={`cursor-pointer transition-colors ${
                    isCovered
                      ? 'bg-amber-50/80 font-bold text-amber-950'
                      : row.val === '1'
                      ? 'hover:bg-indigo-50/40 bg-slate-50/20'
                      : row.val === 'X'
                      ? 'hover:bg-purple-50/40 bg-purple-50/10'
                      : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-400 font-medium">m{row.index}</td>
                  {Array.from({ length: varCount }).map((_, bitIdx) => (
                    <td key={bitIdx} className="py-2 px-2 text-center text-slate-600">
                      {row.binary[bitIdx]}
                    </td>
                  ))}
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-6 rounded-md font-bold transition-all ${
                        row.val === '1'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : row.val === 'X'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {row.val}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any row or cell to cycle: 0 &rarr; 1 &rarr; X &rarr; 0</span>
        <span className="font-mono">
          Showing {filteredRows.length} / {totalRows}
        </span>
      </div>
    </div>
  );
};
