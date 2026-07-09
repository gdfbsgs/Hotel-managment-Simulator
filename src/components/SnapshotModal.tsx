import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHotelStore } from '../store';
import { X, Download, Copy, Check, Palette, Camera } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MonoTheme = 'blueprint-dark' | 'technical-light' | 'cyber-slate';

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ isOpen, onClose }) => {
  const { floors, activeFloorIndex, chainName } = useHotelStore();
  const [theme, setTheme] = useState<MonoTheme>('blueprint-dark');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeFloor = floors[activeFloorIndex];
  const grid = activeFloor?.grid;
  const labels = activeFloor?.labels || [];
  const floorName = activeFloor?.name || `Level ${activeFloorIndex + 1}`;

  useEffect(() => {
    if (!isOpen || !grid || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define dimensions
    const canvasSize = 600;
    const gridOffset = 40; // margin for title block and labels
    const gridSize = 20;
    const availableSize = canvasSize - gridOffset * 2 - 20; // 500px for grid
    const tileSize = availableSize / gridSize; // 25px per tile

    // Define Theme Palette
    let colors = {
      bg: '#0a0f1d',
      gridLines: '#1e293b',
      dotMarker: '#334155',
      floorBg: '#111827',
      floorBorder: '#1f2937',
      wall: '#ffffff',
      wallStroke: '#000000',
      door: '#e2e8f0',
      window: '#38bdf8',
      bed: '#cbd5e1',
      bathroom: '#94a3b8',
      furniture: '#64748b',
      text: '#ffffff',
      accentText: '#94a3b8',
      titleBlockBg: '#0f172a',
      titleBlockBorder: '#334155',
    };

    if (theme === 'technical-light') {
      colors = {
        bg: '#f8fafc',
        gridLines: '#cbd5e1',
        dotMarker: '#94a3b8',
        floorBg: '#ffffff',
        floorBorder: '#e2e8f0',
        wall: '#0f172a',
        wallStroke: '#ffffff',
        door: '#475569',
        window: '#0284c7',
        bed: '#64748b',
        bathroom: '#475569',
        furniture: '#334155',
        text: '#0f172a',
        accentText: '#475569',
        titleBlockBg: '#f1f5f9',
        titleBlockBorder: '#cbd5e1',
      };
    } else if (theme === 'cyber-slate') {
      colors = {
        bg: '#18181b',
        gridLines: '#27272a',
        dotMarker: '#3f3f46',
        floorBg: '#202024',
        floorBorder: '#27272a',
        wall: '#a1a1aa',
        wallStroke: '#18181b',
        door: '#71717a',
        window: '#e4e4e7',
        bed: '#52525b',
        bathroom: '#52525b',
        furniture: '#3f3f46',
        text: '#f4f4f5',
        accentText: '#a1a1aa',
        titleBlockBg: '#202024',
        titleBlockBorder: '#3f3f46',
      };
    }

    // 1. Draw Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 2. Draw Grid and Background Tiles
    ctx.save();
    ctx.translate(gridOffset, gridOffset);

    // Grid bounding box
    ctx.strokeStyle = colors.gridLines;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, availableSize, availableSize);

    // Loop tiles to draw background & layout structure
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid[y]?.[x] || 'empty';
        const px = x * tileSize;
        const py = y * tileSize;

        // Draw basic grid line separators
        ctx.strokeStyle = colors.gridLines;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, tileSize, tileSize);

        if (cell === 'empty') {
          // Draw a small dot centered in empty squares for architectural guide aesthetic
          ctx.fillStyle = colors.dotMarker;
          ctx.beginPath();
          ctx.arc(px + tileSize / 2, py + tileSize / 2, 1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw floor background first
          ctx.fillStyle = colors.floorBg;
          ctx.fillRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);
        }
      }
    }

    // Loop tiles again to draw furniture & structural elements layered correctly
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid[y]?.[x] || 'empty';
        const px = x * tileSize;
        const py = y * tileSize;

        ctx.lineWidth = 1.5;

        switch (cell) {
          case 'wall':
            ctx.fillStyle = colors.wall;
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = colors.wallStroke;
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, tileSize, tileSize);
            break;

          case 'door':
            // Draw wall segments first for connecting look
            ctx.strokeStyle = colors.door;
            ctx.lineWidth = 2;
            // Draw stylized door symbol (swing arc + straight line)
            ctx.beginPath();
            ctx.moveTo(px, py + tileSize);
            ctx.lineTo(px + tileSize * 0.7, py + tileSize * 0.3);
            ctx.stroke();

            // Swing Arc
            ctx.beginPath();
            ctx.arc(px, py + tileSize, tileSize * 0.7, -Math.PI / 2, 0, false);
            ctx.strokeStyle = colors.door;
            ctx.setLineDash([2, 2]);
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
            break;

          case 'window':
            // Draw double bar window
            ctx.fillStyle = colors.floorBg;
            ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.5;
            // Left & Right framing bars
            ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            ctx.beginPath();
            ctx.moveTo(px + tileSize / 2, py);
            ctx.lineTo(px + tileSize / 2, py + tileSize);
            ctx.stroke();
            break;

          case 'bed':
          case 'bed_single':
          case 'bed_double':
            // stylized mono bed
            ctx.strokeStyle = colors.text;
            ctx.fillStyle = colors.bed;
            ctx.lineWidth = 1.2;
            // Frame
            ctx.strokeRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
            // Pillow
            ctx.strokeRect(px + 5, py + 5, tileSize - 10, tileSize * 0.25);
            // Mattress blanket diagonal hatch
            ctx.beginPath();
            ctx.moveTo(px + 5, py + tileSize * 0.55);
            ctx.lineTo(px + tileSize - 5, py + tileSize * 0.55);
            ctx.stroke();
            break;

          case 'bathroom':
            // Bathroom/toilet outline
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.2;
            // Toilet bowl circle
            ctx.beginPath();
            ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize * 0.28, 0, Math.PI * 2);
            ctx.stroke();
            // Toilet tank backbar
            ctx.strokeRect(px + tileSize * 0.15, py + tileSize * 0.1, tileSize * 0.7, tileSize * 0.18);
            break;

          case 'reception':
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.5;
            // Reception L-shape counter desk
            ctx.strokeRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
            ctx.fillStyle = colors.titleBlockBg;
            ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
            ctx.fillStyle = colors.text;
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('REC', px + tileSize / 2, py + tileSize / 2);
            break;

          case 'staff':
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.2;
            // Desk shape
            ctx.strokeRect(px + 4, py + 4, tileSize - 8, tileSize - 12);
            // Staff label or dot
            ctx.beginPath();
            ctx.arc(px + tileSize / 2, py + tileSize - 6, 2, 0, Math.PI * 2);
            ctx.fillStyle = colors.text;
            ctx.fill();
            break;

          case 'table':
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.2;
            // Dining Table
            ctx.beginPath();
            ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize * 0.25, 0, Math.PI * 2);
            ctx.stroke();
            // Chairs (small boxes/dots)
            ctx.fillStyle = colors.text;
            ctx.fillRect(px + tileSize / 2 - 1.5, py + tileSize * 0.1, 3, 2);
            ctx.fillRect(px + tileSize / 2 - 1.5, py + tileSize * 0.8, 3, 2);
            break;

          case 'plant':
            // Stylized multi-petal vector flower/leaf
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize * 0.2, 0, Math.PI * 2);
            ctx.stroke();
            // Petal lines radiating outward
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
              ctx.beginPath();
              ctx.moveTo(px + tileSize / 2, py + tileSize / 2);
              ctx.lineTo(
                px + tileSize / 2 + Math.cos(angle) * (tileSize * 0.35),
                py + tileSize / 2 + Math.sin(angle) * (tileSize * 0.35)
              );
              ctx.stroke();
            }
            break;

          case 'elevator':
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            // Elevator sliding door division lines
            ctx.beginPath();
            ctx.moveTo(px + tileSize / 2, py + 2);
            ctx.lineTo(px + tileSize / 2, py + tileSize - 2);
            ctx.stroke();
            // Stylized 'E' symbol
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('EL', px + tileSize / 2, py + tileSize / 2);
            break;

          case 'stairs':
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 1.2;
            // Stair tread boxes lines
            ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            for (let i = 1; i <= 3; i++) {
              ctx.beginPath();
              ctx.moveTo(px + 2, py + 2 + (i * (tileSize - 4)) / 4);
              ctx.lineTo(px + tileSize - 2, py + 2 + (i * (tileSize - 4)) / 4);
              ctx.stroke();
            }
            break;
        }
      }
    }

    // 3. Render Custom Map Labels
    labels.forEach((label) => {
      const lx = (label.x + 0.5) * tileSize;
      const ly = (label.y + 0.5) * tileSize;

      ctx.save();
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Measure text for solid outline backing
      const textWidth = ctx.measureText(label.text).width;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(lx - textWidth / 2 - 4, ly - 6, textWidth + 8, 12);
      ctx.strokeStyle = colors.gridLines;
      ctx.lineWidth = 1;
      ctx.strokeRect(lx - textWidth / 2 - 4, ly - 6, textWidth + 8, 12);

      // Draw label text
      ctx.fillStyle = colors.text;
      ctx.fillText(label.text, lx, ly);
      ctx.restore();
    });

    ctx.restore(); // Restore grid transform

    // 4. Draw Architectural Title Block (Bottom)
    const tbX = gridOffset;
    const tbY = canvasSize - gridOffset - 12;
    const tbW = availableSize;
    const tbH = 40;

    // Draw solid banner background
    ctx.fillStyle = colors.titleBlockBg;
    ctx.fillRect(tbX, tbY, tbW, tbH);
    ctx.strokeStyle = colors.titleBlockBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tbX, tbY, tbW, tbH);

    // Left block: Hotel project name
    ctx.fillStyle = colors.text;
    ctx.font = 'black 9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`PROJECT: ${chainName.toUpperCase()}`, tbX + 8, tbY + 8);

    ctx.fillStyle = colors.accentText;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`SCHEMATIC FLOOR PLAN layout`, tbX + 8, tbY + 22);

    // Right block: Level name and scale
    ctx.fillStyle = colors.text;
    ctx.font = 'black 9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${floorName.toUpperCase()}`, tbX + tbW - 8, tbY + 8);

    ctx.fillStyle = colors.accentText;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`GRID 20x20 • SCALE 1:100`, tbX + tbW - 8, tbY + 22);

    // Middle division vertical line
    ctx.strokeStyle = colors.titleBlockBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tbX + tbW * 0.55, tbY);
    ctx.lineTo(tbX + tbW * 0.55, tbY + tbH);
    ctx.stroke();

    // Small watermark in middle
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ARCHHOTEL`, tbX + tbW * 0.65, tbY + 16);

  }, [isOpen, theme, grid, labels, chainName, floorName, activeFloorIndex]);

  const downloadSnapshot = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `archhotel_layout_level_${activeFloorIndex}_${theme}.png`;
    link.href = url;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy direct binary to clipboard:', err);
        // Fallback or warning
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            id="snapshot-modal-backdrop"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 z-10 flex flex-col md:flex-row"
            id="snapshot-modal-card"
          >
            {/* Left Side: Drawing Canvas Area */}
            <div className="flex-1 p-6 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-center min-h-[460px] md:min-h-[520px]">
              <div className="relative border border-slate-800 rounded-2xl overflow-hidden shadow-inner max-w-full">
                <canvas 
                  ref={canvasRef} 
                  width={600} 
                  height={600} 
                  className="w-[380px] h-[380px] md:w-[460px] md:h-[460px] object-contain block bg-slate-950"
                  id="snapshot-canvas"
                />
              </div>
            </div>

            {/* Right Side: Options & Actions */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-slate-900">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500">
                      <Camera size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide font-display">Export Blueprint</h3>
                      <p className="text-[10px] text-slate-400 font-mono">Simplified Monochromatic Layout</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">Floor Summary</span>
                  <p className="text-xs font-bold text-slate-300">{floorName}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Rendered in a pure high-contrast vector architectural style. Ready for sharing, printing, or archiving.
                  </p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono flex items-center gap-1.5">
                    <Palette size={10} className="text-amber-500" />
                    <span>Stylized Theme Preset</span>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => setTheme('blueprint-dark')}
                      className={`px-3 py-2.5 rounded-xl text-left border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        theme === 'blueprint-dark'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/50 shadow'
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>Draft Blueprint (Dark)</span>
                      <span className="w-4 h-4 rounded-full bg-[#0a0f1d] border border-sky-500/40" />
                    </button>

                    <button
                      onClick={() => setTheme('technical-light')}
                      className={`px-3 py-2.5 rounded-xl text-left border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        theme === 'technical-light'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow'
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>Architect Document (Light)</span>
                      <span className="w-4 h-4 rounded-full bg-white border border-amber-500/40" />
                    </button>

                    <button
                      onClick={() => setTheme('cyber-slate')}
                      className={`px-3 py-2.5 rounded-xl text-left border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        theme === 'cyber-slate'
                          ? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/50 shadow'
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span>Cyber Slate (Industrial)</span>
                      <span className="w-4 h-4 rounded-full bg-[#18181b] border border-zinc-500/40" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-8 md:mt-0">
                <button
                  onClick={downloadSnapshot}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Layout PNG</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className={`w-full py-2.5 border rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    copied 
                      ? 'bg-emerald-950/30 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-850 text-slate-300'
                  }`}
                >
                  {copied ? <Check size={14} className="animate-bounce" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
