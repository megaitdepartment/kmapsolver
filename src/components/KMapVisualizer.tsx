import React, { useRef } from 'react';
import { SolverResult, Implicant, VariableCount } from '../types';
import { getMapStructure, getMintermFromCoord } from '../utils/kmapSolver';
import { downloadSvg, downloadPng } from '../utils/svgExport';
import { Download, ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles } from 'lucide-react';

interface KMapVisualizerProps {
  result: SolverResult;
  cellValues: Record<number, '0' | '1' | 'X'>;
  onCellClick: (minterm: number) => void;
  hoveredImplicantId: string | null;
  onHoverImplicant: (id: string | null) => void;
  showMintermIndices: boolean;
  onToggleMintermIndices: () => void;
}

export const KMapVisualizer: React.FC<KMapVisualizerProps> = ({
  result,
  cellValues,
  onCellClick,
  hoveredImplicantId,
  onHoverImplicant,
  showMintermIndices,
  onToggleMintermIndices,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = React.useState<number>(1);

  const { variableCount, variables, selectedPrimeImplicants, form } = result;
  const struct = getMapStructure(variableCount, variables);

  const CELL_SIZE = variableCount <= 3 ? 64 : variableCount === 4 ? 56 : variableCount === 5 ? 46 : 40;
  const PADDING_LEFT = variableCount <= 3 ? 75 : 68;
  const PADDING_TOP = variableCount <= 3 ? 65 : 56;
  const PADDING_RIGHT = 24;
  const PADDING_BOTTOM = 24;

  // Single sub-map width and height
  const mapWidth = struct.cols * CELL_SIZE;
  const mapHeight = struct.rows * CELL_SIZE;

  // Total dimensions
  const subMapsCount = struct.subMapsCount || 1;
  const SUBMAP_GAP = variableCount >= 5 ? 40 : 50;
  const totalSvgWidth = PADDING_LEFT + subMapsCount * mapWidth + (subMapsCount - 1) * SUBMAP_GAP + PADDING_RIGHT;
  const totalSvgHeight = PADDING_TOP + mapHeight + PADDING_BOTTOM;

  /**
   * Calculate SVG coordinates for a given cell in a subMap
   */
  const getCellRect = (row: number, col: number, subMap: number = 0) => {
    const x = PADDING_LEFT + subMap * (mapWidth + SUBMAP_GAP) + col * CELL_SIZE;
    const y = PADDING_TOP + row * CELL_SIZE;
    return { x, y, width: CELL_SIZE, height: CELL_SIZE };
  };

  /**
   * Render grouping loops for an implicant
   * Handles interior rectangles, left-right wraps, top-bottom wraps, and 4-corner wraps!
   */
  const renderImplicantLoop = (pi: Implicant, isHovered: boolean, isDimmed: boolean) => {
    const opacity = isDimmed ? 0.25 : 1;
    const strokeWidth = isHovered ? 3.5 : 2.5;

    // Group cells by subMap
    const bySubMap = new Map<number, Array<{ row: number; col: number; minterm: number }>>();
    pi.cells.forEach(c => {
      const list = bySubMap.get(c.subMap) || [];
      list.push(c);
      bySubMap.set(c.subMap, list);
    });

    const elements: React.ReactNode[] = [];

    bySubMap.forEach((cellsInMap, subMapIdx) => {
      const rows = Array.from(new Set(cellsInMap.map(c => c.row))).sort((a, b) => a - b);
      const cols = Array.from(new Set(cellsInMap.map(c => c.col))).sort((a, b) => a - b);

      const numRows = struct.rows;
      const numCols = struct.cols;

      const subMapXOffset = PADDING_LEFT + subMapIdx * (mapWidth + SUBMAP_GAP);
      const subMapYOffset = PADDING_TOP;

      // Rule 1: Single cell grouping -> Circle 'O' as specified in standard k-map format
      if (cellsInMap.length === 1) {
        const cell = cellsInMap[0];
        const cx = subMapXOffset + cell.col * CELL_SIZE + CELL_SIZE / 2;
        const cy = subMapYOffset + cell.row * CELL_SIZE + CELL_SIZE / 2;
        const r = CELL_SIZE * 0.38;

        elements.push(
          <circle
            key={`single-circle-${pi.id}-${subMapIdx}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={pi.fillColor}
            stroke={pi.borderColor}
            strokeWidth={strokeWidth}
            strokeDasharray={pi.isEssential ? undefined : '5,3'}
            opacity={opacity}
            className="transition-all duration-200 pointer-events-none"
          />
        );
        return;
      }

      const spansTopBottomWrap =
        numRows === 4 && rows.length === 2 && rows[0] === 0 && rows[1] === 3;
      const spansLeftRightWrap =
        numCols === 4 && cols.length === 2 && cols[0] === 0 && cols[1] === 3;

      // Rule 2: 4 Corners Wrap (m0, m2, m8, m10) -> Curved corner arcs with border extensions
      if (spansTopBottomWrap && spansLeftRightWrap && rows.length === 2 && cols.length === 2) {
        const EXT = 14;
        const inset = 6;
        const cornerArcRadius = 24;

        // Top-Left (row 0, col 0)
        const x0 = subMapXOffset;
        const y0 = subMapYOffset;
        const tlStroke = `M ${x0 + CELL_SIZE - inset} ${y0 - EXT} V ${y0 + 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${x0 + 12} ${y0 + CELL_SIZE - inset} H ${x0 - EXT}`;
        const tlFill = `M ${x0 + CELL_SIZE - inset} ${y0 - EXT} V ${y0 + 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${x0 + 12} ${y0 + CELL_SIZE - inset} H ${x0 - EXT} V ${y0 - EXT} Z`;

        // Top-Right (row 0, col 3)
        const x3 = subMapXOffset + 3 * CELL_SIZE;
        const trStroke = `M ${x3 + inset} ${y0 - EXT} V ${y0 + 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${x3 + CELL_SIZE - 12} ${y0 + CELL_SIZE - inset} H ${x3 + CELL_SIZE + EXT}`;
        const trFill = `M ${x3 + inset} ${y0 - EXT} V ${y0 + 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${x3 + CELL_SIZE - 12} ${y0 + CELL_SIZE - inset} H ${x3 + CELL_SIZE + EXT} V ${y0 - EXT} Z`;

        // Bottom-Left (row 3, col 0)
        const y3 = subMapYOffset + 3 * CELL_SIZE;
        const blStroke = `M ${x0 + CELL_SIZE - inset} ${y3 + CELL_SIZE + EXT} V ${y3 + CELL_SIZE - 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${x0 + 12} ${y3 + inset} H ${x0 - EXT}`;
        const blFill = `M ${x0 + CELL_SIZE - inset} ${y3 + CELL_SIZE + EXT} V ${y3 + CELL_SIZE - 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 0 ${x0 + 12} ${y3 + inset} H ${x0 - EXT} V ${y3 + CELL_SIZE + EXT} Z`;

        // Bottom-Right (row 3, col 3)
        const brStroke = `M ${x3 + inset} ${y3 + CELL_SIZE + EXT} V ${y3 + CELL_SIZE - 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${x3 + CELL_SIZE - 12} ${y3 + inset} H ${x3 + CELL_SIZE + EXT}`;
        const brFill = `M ${x3 + inset} ${y3 + CELL_SIZE + EXT} V ${y3 + CELL_SIZE - 12} A ${cornerArcRadius} ${cornerArcRadius} 0 0 1 ${x3 + CELL_SIZE - 12} ${y3 + inset} H ${x3 + CELL_SIZE + EXT} V ${y3 + CELL_SIZE + EXT} Z`;

        const cornerShapes = [
          { stroke: tlStroke, fill: tlFill },
          { stroke: trStroke, fill: trFill },
          { stroke: blStroke, fill: blFill },
          { stroke: brStroke, fill: brFill },
        ];

        elements.push(
          <g key={`corners-${pi.id}-${subMapIdx}`} opacity={opacity} className="pointer-events-none">
            {cornerShapes.map((c, i) => (
              <g key={i}>
                <path d={c.fill} fill={pi.fillColor} stroke="none" />
                <path
                  d={c.stroke}
                  fill="none"
                  stroke={pi.borderColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={pi.isEssential ? undefined : '5,3'}
                />
              </g>
            ))}
          </g>
        );
        return;
      }

      // Rule 3: Left-Right Wrap (open brackets extending past left and right borders)
      if (spansLeftRightWrap) {
        const rowMin = Math.min(...rows);
        const rowMax = Math.max(...rows);
        const EXT = 14;
        const inset = 6;
        const radius = 12;

        const topY = subMapYOffset + rowMin * CELL_SIZE + inset;
        const bottomY = subMapYOffset + (rowMax + 1) * CELL_SIZE - inset;

        // Left open bracket (column 0)
        const innerLeftX = subMapXOffset + CELL_SIZE - inset;
        const leftStroke = `M ${subMapXOffset - EXT} ${topY} H ${innerLeftX - radius} A ${radius} ${radius} 0 0 1 ${innerLeftX} ${topY + radius} V ${bottomY - radius} A ${radius} ${radius} 0 0 1 ${innerLeftX - radius} ${bottomY} H ${subMapXOffset - EXT}`;
        const leftFill = `M ${subMapXOffset - EXT} ${topY} H ${innerLeftX - radius} A ${radius} ${radius} 0 0 1 ${innerLeftX} ${topY + radius} V ${bottomY - radius} A ${radius} ${radius} 0 0 1 ${innerLeftX - radius} ${bottomY} H ${subMapXOffset - EXT} Z`;

        // Right open bracket (column 3)
        const innerRightX = subMapXOffset + 3 * CELL_SIZE + inset;
        const outerRightX = subMapXOffset + 4 * CELL_SIZE + EXT;
        const rightStroke = `M ${outerRightX} ${topY} H ${innerRightX + radius} A ${radius} ${radius} 0 0 0 ${innerRightX} ${topY + radius} V ${bottomY - radius} A ${radius} ${radius} 0 0 0 ${innerRightX + radius} ${bottomY} H ${outerRightX}`;
        const rightFill = `M ${outerRightX} ${topY} H ${innerRightX + radius} A ${radius} ${radius} 0 0 0 ${innerRightX} ${topY + radius} V ${bottomY - radius} A ${radius} ${radius} 0 0 0 ${innerRightX + radius} ${bottomY} H ${outerRightX} Z`;

        elements.push(
          <g key={`lr-wrap-${pi.id}-${subMapIdx}`} opacity={opacity} className="pointer-events-none">
            {/* Left bracket */}
            <path d={leftFill} fill={pi.fillColor} stroke="none" />
            <path
              d={leftStroke}
              fill="none"
              stroke={pi.borderColor}
              strokeWidth={strokeWidth}
              strokeDasharray={pi.isEssential ? undefined : '5,3'}
            />
            {/* Right bracket */}
            <path d={rightFill} fill={pi.fillColor} stroke="none" />
            <path
              d={rightStroke}
              fill="none"
              stroke={pi.borderColor}
              strokeWidth={strokeWidth}
              strokeDasharray={pi.isEssential ? undefined : '5,3'}
            />
          </g>
        );
        return;
      }

      // Rule 4: Top-Bottom Wrap (open brackets extending past top and bottom borders)
      if (spansTopBottomWrap) {
        const colMin = Math.min(...cols);
        const colMax = Math.max(...cols);
        const EXT = 14;
        const inset = 6;
        const radius = 12;

        const leftX = subMapXOffset + colMin * CELL_SIZE + inset;
        const rightX = subMapXOffset + (colMax + 1) * CELL_SIZE - inset;

        // Top open bracket (row 0)
        const innerTopY = subMapYOffset + CELL_SIZE - inset;
        const outerTopY = subMapYOffset - EXT;
        const topStroke = `M ${leftX} ${outerTopY} V ${innerTopY - radius} A ${radius} ${radius} 0 0 0 ${leftX + radius} ${innerTopY} H ${rightX - radius} A ${radius} ${radius} 0 0 0 ${rightX} ${innerTopY - radius} V ${outerTopY}`;
        const topFill = `M ${leftX} ${outerTopY} V ${innerTopY - radius} A ${radius} ${radius} 0 0 0 ${leftX + radius} ${innerTopY} H ${rightX - radius} A ${radius} ${radius} 0 0 0 ${rightX} ${innerTopY - radius} V ${outerTopY} Z`;

        // Bottom open bracket (row 3)
        const innerBottomY = subMapYOffset + 3 * CELL_SIZE + inset;
        const outerBottomY = subMapYOffset + 4 * CELL_SIZE + EXT;
        const bottomStroke = `M ${leftX} ${outerBottomY} V ${innerBottomY + radius} A ${radius} ${radius} 0 0 1 ${leftX + radius} ${innerBottomY} H ${rightX - radius} A ${radius} ${radius} 0 0 1 ${rightX} ${innerBottomY + radius} V ${outerBottomY}`;
        const bottomFill = `M ${leftX} ${outerBottomY} V ${innerBottomY + radius} A ${radius} ${radius} 0 0 1 ${leftX + radius} ${innerBottomY} H ${rightX - radius} A ${radius} ${radius} 0 0 1 ${rightX} ${innerBottomY + radius} V ${outerBottomY} Z`;

        elements.push(
          <g key={`tb-wrap-${pi.id}-${subMapIdx}`} opacity={opacity} className="pointer-events-none">
            {/* Top bracket */}
            <path d={topFill} fill={pi.fillColor} stroke="none" />
            <path
              d={topStroke}
              fill="none"
              stroke={pi.borderColor}
              strokeWidth={strokeWidth}
              strokeDasharray={pi.isEssential ? undefined : '5,3'}
            />
            {/* Bottom bracket */}
            <path d={bottomFill} fill={pi.fillColor} stroke="none" />
            <path
              d={bottomStroke}
              fill="none"
              stroke={pi.borderColor}
              strokeWidth={strokeWidth}
              strokeDasharray={pi.isEssential ? undefined : '5,3'}
            />
          </g>
        );
        return;
      }

      // Rule 5: Standard Contiguous Rectangular/Square Loop (Pairs, Quads, Octets, Full-Map)
      const colMin = Math.min(...cols);
      const colMax = Math.max(...cols);
      const rowMin = Math.min(...rows);
      const rowMax = Math.max(...rows);

      const inset = 5;
      const x = subMapXOffset + colMin * CELL_SIZE + inset;
      const y = subMapYOffset + rowMin * CELL_SIZE + inset;
      const width = (colMax - colMin + 1) * CELL_SIZE - inset * 2;
      const height = (rowMax - rowMin + 1) * CELL_SIZE - inset * 2;

      elements.push(
        <rect
          key={`standard-${pi.id}-${subMapIdx}`}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={12}
          ry={12}
          fill={pi.fillColor}
          stroke={pi.borderColor}
          strokeWidth={strokeWidth}
          strokeDasharray={pi.isEssential ? undefined : '5,3'}
          opacity={opacity}
          className="transition-all duration-200 pointer-events-none"
        />
      );
    });

    // 5-Variable Inter-Map Link Indicator (if this group spans both sub-maps)
    if (bySubMap.size > 1) {
      const x1 = PADDING_LEFT + mapWidth - 10;
      const x2 = PADDING_LEFT + mapWidth + SUBMAP_GAP + 10;
      const yMid = PADDING_TOP + mapHeight / 2;

      elements.push(
        <g key={`3d-link-${pi.id}`} opacity={opacity}>
          <line
            x1={x1}
            y1={yMid}
            x2={x2}
            y2={yMid}
            stroke={pi.borderColor}
            strokeWidth={2}
            strokeDasharray="4,4"
          />
          <circle cx={(x1 + x2) / 2} cy={yMid} r={4} fill={pi.borderColor} />
        </g>
      );
    }

    return <g key={pi.id}>{elements}</g>;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Top Visualizer Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50/80 border-b border-slate-200 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">K-Map</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {variableCount}V ({1 << variableCount} cells)
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {form}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Minterm Subscript Indices */}
          <button
            id="toggle-minterm-indices-btn"
            onClick={onToggleMintermIndices}
            className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
              showMintermIndices
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle cell decimal index tags"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">m#</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              id="zoom-out-btn"
              onClick={() => setZoom(z => Math.max(0.65, z - 0.15))}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-500">{Math.round(zoom * 100)}%</span>
            <button
              id="zoom-in-btn"
              onClick={() => setZoom(z => Math.min(1.5, z + 0.15))}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="zoom-reset-btn"
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-slate-100 text-slate-600 border-l border-slate-200 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download SVG */}
          <button
            id="download-svg-quick-btn"
            onClick={() => svgRef.current && downloadSvg(svgRef.current, `kmap-${variableCount}var.svg`)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-2xs"
            title="Download Clean Vector SVG for textbook publication"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SVG</span>
          </button>

          {/* Download High-Res PNG */}
          <button
            id="download-png-quick-btn"
            onClick={() => svgRef.current && downloadPng(svgRef.current, `kmap-${variableCount}var-300dpi.png`, 3)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1 shadow-2xs"
            title="Download 300 DPI High-Res PNG image"
          >
            <Download className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">PNG</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 min-h-0 overflow-auto flex justify-center items-center p-2 sm:p-4 bg-slate-50/40">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150"
        >
          <svg
            ref={svgRef}
            width={totalSvgWidth}
            height={totalSvgHeight}
            viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
            className="select-none drop-shadow-xs"
          >
            <defs>
              {/* Drop shadow filter for active loops */}
              <filter id="loop-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Background Canvas */}
            <rect width={totalSvgWidth} height={totalSvgHeight} fill="#ffffff" rx={8} />

            {/* Render Each Sub-Map (1 map for 2-4 vars, 2 for 5-vars, 4 for 6-vars) */}
            {Array.from({ length: subMapsCount }).map((_, subIdx) => {
              const subX = PADDING_LEFT + subIdx * (mapWidth + SUBMAP_GAP);
              const subY = PADDING_TOP;

              // Sub-Map title (e.g. A = 0 / A = 1 for 5 vars, AB = 00 for 6 vars)
              let subMapTitle = '';
              if (variableCount === 5) {
                subMapTitle = `${struct.splitVars?.[0]} = ${subIdx}`;
              } else if (variableCount === 6) {
                subMapTitle = `${struct.splitVars?.join('')} = ${struct.splitCodes?.[subIdx]}`;
              }

              return (
                <g key={`submap-${subIdx}`}>
                  {/* Sub-map header if multi-map */}
                  {subMapTitle && (
                    <text
                      x={subX + mapWidth / 2}
                      y={subY - 36}
                      textAnchor="middle"
                      className="font-bold text-sm fill-slate-800"
                    >
                      Sub-map [{subMapTitle}]
                    </text>
                  )}

                  {/* Diagonal Split Header for Variables in Upper Left Corner */}
                  <g>
                    {/* Corner box background */}
                    <rect
                      x={subX - 52}
                      y={subY - 32}
                      width={52}
                      height={32}
                      fill="#f8fafc"
                      stroke="#cbd5e1"
                      strokeWidth={1}
                      rx={2}
                    />
                    {/* Diagonal Slash */}
                    <line
                      x1={subX - 52}
                      y1={subY - 32}
                      x2={subX}
                      y2={subY}
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                    />
                    {/* Column Variables (Top-Right of slash, e.g. DE) */}
                    <text
                      x={subX - 6}
                      y={subY - 18}
                      textAnchor="end"
                      className="font-bold text-xs fill-indigo-700 font-mono select-none"
                    >
                      {struct.colVars.join('')}
                    </text>
                    {/* Row Variables (Bottom-Left of slash, e.g. BC) */}
                    <text
                      x={subX - 46}
                      y={subY - 8}
                      textAnchor="start"
                      className="font-bold text-xs fill-slate-700 font-mono select-none"
                    >
                      {struct.rowVars.join('')}
                    </text>
                  </g>

                  {/* Column Gray Code Headers */}
                  {struct.colCodes.map((codeStr, c) => (
                    <text
                      key={`col-${c}`}
                      x={subX + c * CELL_SIZE + CELL_SIZE / 2}
                      y={subY - 12}
                      textAnchor="middle"
                      className="font-mono font-semibold text-xs fill-slate-700"
                    >
                      {codeStr}
                    </text>
                  ))}

                  {/* Row Gray Code Headers (Only on first submap) */}
                  {subIdx === 0 &&
                    struct.rowCodes.map((codeStr, r) => (
                      <text
                        key={`row-${r}`}
                        x={subX - 14}
                        y={subY + r * CELL_SIZE + CELL_SIZE / 2 + 4}
                        textAnchor="end"
                        className="font-mono font-semibold text-xs fill-slate-700"
                      >
                        {codeStr}
                      </text>
                    ))}

                  {/* Grid Cells */}
                  {Array.from({ length: struct.rows }).map((_, r) =>
                    Array.from({ length: struct.cols }).map((_, c) => {
                      const m = getMintermFromCoord(r, c, subIdx, variableCount);
                      const val = cellValues[m] ?? '0';
                      const cellX = subX + c * CELL_SIZE;
                      const cellY = subY + r * CELL_SIZE;

                      // Highlight active 1 or X
                      const isOne = val === '1';
                      const isX = val === 'X';

                      return (
                        <g
                          key={`cell-${m}`}
                          onClick={() => onCellClick(m)}
                          className="cursor-pointer group"
                        >
                          {/* Cell Background */}
                          <rect
                            x={cellX}
                            y={cellY}
                            width={CELL_SIZE}
                            height={CELL_SIZE}
                            fill={isOne ? '#f8fafc' : isX ? '#faf5ff' : '#ffffff'}
                            stroke="#cbd5e1"
                            strokeWidth={1}
                            className="transition-colors group-hover:fill-indigo-50/70"
                          />

                          {/* Cell Minterm Index Tag */}
                          {showMintermIndices && (
                            <text
                              x={cellX + CELL_SIZE - 6}
                              y={cellY + 14}
                              textAnchor="end"
                              className="font-mono text-[10px] fill-slate-400 select-none group-hover:fill-indigo-500 font-medium"
                            >
                              {m}
                            </text>
                          )}

                          {/* Value Character (0, 1, or X) */}
                          <text
                            x={cellX + CELL_SIZE / 2}
                            y={cellY + CELL_SIZE / 2 + 7}
                            textAnchor="middle"
                            className={`font-mono text-xl font-bold select-none transition-transform group-hover:scale-110 ${
                              isOne
                                ? 'fill-slate-900 font-extrabold'
                                : isX
                                ? 'fill-purple-600 font-bold'
                                : 'fill-slate-300'
                            }`}
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })
                  )}

                  {/* Outer Submap Border */}
                  <rect
                    x={subX}
                    y={subY}
                    width={mapWidth}
                    height={mapHeight}
                    fill="none"
                    stroke="#475569"
                    strokeWidth={2}
                  />
                </g>
              );
            })}

            {/* Implicant Grouping Loops Overlay */}
            {selectedPrimeImplicants.map(pi => {
              const isHovered = hoveredImplicantId === pi.id;
              const isDimmed = hoveredImplicantId !== null && !isHovered;
              return renderImplicantLoop(pi, isHovered, isDimmed);
            })}
          </svg>
        </div>
      </div>

      {/* Implicants Color Legend & Hover Pills */}
      {selectedPrimeImplicants.length > 0 && (
        <div className="px-3 py-2 bg-white border-t border-slate-200 shrink-0 max-h-[110px] overflow-y-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Groups ({selectedPrimeImplicants.length})
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Hover to isolate &bull; Click cell to toggle 0 / 1 / X
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedPrimeImplicants.map((pi, idx) => {
              const isHovered = hoveredImplicantId === pi.id;
              const termLabel = form === 'SOP' ? pi.termString : pi.posTermString;

              return (
                <button
                  key={pi.id}
                  id={`legend-pi-${idx}`}
                  onMouseEnter={() => onHoverImplicant(pi.id)}
                  onMouseLeave={() => onHoverImplicant(null)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-mono font-medium transition-all ${
                    isHovered
                      ? 'ring-2 ring-indigo-400 shadow-sm scale-105'
                      : 'hover:border-slate-300 shadow-2xs'
                  }`}
                  style={{
                    backgroundColor: isHovered ? pi.fillColor : '#ffffff',
                    borderColor: pi.borderColor,
                    color: pi.borderColor,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: pi.borderColor }}
                  />
                  <span className="font-bold text-xs">{termLabel}</span>
                  <span className="text-[10px] opacity-75 font-sans">
                    ({pi.size})
                  </span>
                  {pi.isEssential && (
                    <span className="text-[9px] font-sans font-bold px-1 rounded bg-amber-100 text-amber-800">
                      EPI
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
