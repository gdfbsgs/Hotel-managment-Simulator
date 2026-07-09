import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, HelpCircle, LayoutGrid, Check, Info } from 'lucide-react';
import { FloorTemplate, TileType } from '../types';
import { useHotelStore } from '../store';

interface PresetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  template: FloorTemplate | null;
  targetFloorName: string;
}

const getTilePreviewColor = (type: TileType) => {
  switch (type) {
    case 'floor': return 'bg-slate-800/80 border border-slate-700/20';
    case 'wall': return 'bg-slate-500 border border-slate-400/30';
    case 'door': return 'bg-amber-600 border border-amber-500/30';
    case 'window': return 'bg-sky-500/80 border border-sky-400/30 shadow-[0_0_4px_rgba(56,189,248,0.2)]';
    case 'bed':
    case 'bed_single': return 'bg-rose-500 border border-rose-400/30 relative after:content-["🛏️"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[6px]';
    case 'bed_double': return 'bg-rose-600 border border-rose-400/40 relative after:content-["🛌"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[7px]';
    case 'reception': return 'bg-orange-600 border border-orange-500/30';
    case 'staff': return 'bg-rose-700 border border-rose-600/30';
    case 'bathroom': return 'bg-cyan-500 border border-cyan-400/30';
    case 'plant': return 'bg-emerald-500 border border-emerald-400/30';
    case 'table': return 'bg-amber-700 border border-amber-600/30';
    case 'elevator': return 'bg-purple-500/80 border border-purple-400/40 relative after:content-["E"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[7px] after:text-white after:font-black';
    case 'stairs': return 'bg-red-600 border border-red-500/40 relative after:content-["🪜"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-[8px]';
    default: return 'bg-slate-950/60 border border-slate-900/40';
  }
};

export const PresetPreviewModal: React.FC<PresetPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  template,
  targetFloorName
}) => {
  if (!isOpen || !template) return null;

  const { floors, activeFloorIndex } = useHotelStore();
  const groundGrid = floors[0]?.grid;

  // Adapt grid to align elevators with the ground floor when on higher floors
  let previewGrid = template.grid;
  if (groundGrid && activeFloorIndex > 0) {
    const groundElevatorCoords: { x: number; y: number }[] = [];
    for (let y = 0; y < groundGrid.length; y++) {
      for (let x = 0; x < groundGrid[y].length; x++) {
        if (groundGrid[y][x] === 'elevator') {
          groundElevatorCoords.push({ x, y });
        }
      }
    }

    // Copy template grid and adjust elevator positions
    previewGrid = JSON.parse(JSON.stringify(template.grid));
    for (let y = 0; y < previewGrid.length; y++) {
      for (let x = 0; x < previewGrid[y].length; x++) {
        if (previewGrid[y][x] === 'elevator') {
          previewGrid[y][x] = 'empty';
        }
      }
    }
    groundElevatorCoords.forEach(({ x, y }) => {
      previewGrid[y][x] = 'elevator';
    });
  }

  // Analyze the layout grid to count key elements
  const counts = {
    rooms: 0,
    beds: 0,
    bathrooms: 0,
    elevators: 0,
    plants: 0,
    tables: 0,
    receptions: 0,
    stairs: 0,
    walls: 0,
  };

  previewGrid.forEach(row => {
    row.forEach(cell => {
      if (cell === 'bed') counts.beds++;
      if (cell === 'bathroom') counts.bathrooms++;
      if (cell === 'elevator') counts.elevators++;
      if (cell === 'plant') counts.plants++;
      if (cell === 'table') counts.tables++;
      if (cell === 'reception') counts.receptions++;
      if (cell === 'stairs') counts.stairs++;
      if (cell === 'wall') counts.walls++;
    });
  });

  // Calculate approximate rooms (based on beds + receptions)
  counts.rooms = counts.beds + counts.receptions;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          id="preview-modal-backdrop"
        />

        {/* Modal Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
          className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/95 z-10 flex flex-col md:flex-row"
          id="preview-modal-card"
        >
          {/* Left Side: Visual Blueprint Grid Map */}
          <div className="flex-1 p-6 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-4 w-full">
              <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500">
                <Eye size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-display">LAYOUT BLUEPRINT</h4>
                <p className="text-[10px] text-slate-500 font-mono">20 × 20 Simulation Grid</p>
              </div>
            </div>

            {/* Visual 2D Dotted Grid Display */}
            <div className="relative p-2 bg-slate-900 rounded-2xl border border-slate-800/80 shadow-inner">
              <div 
                className="grid gap-[1px] bg-slate-950 p-1.5 rounded-xl overflow-hidden border border-slate-850"
                style={{ gridTemplateColumns: `repeat(20, minmax(0, 1fr))` }}
              >
                {previewGrid.map((row, y) => (
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`w-2.5 h-2.5 rounded-sm transition-all duration-300 ${getTilePreviewColor(cell)}`}
                      title={`${cell} at ${x},${y}`}
                    />
                  ))
                ))}
              </div>
            </div>

            {/* Micro Legend Panel */}
            <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-1.5 text-[9px] text-slate-400 font-bold bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 w-full font-mono">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-rose-500 shrink-0" />
                <span>Bed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-cyan-500 shrink-0" />
                <span>Bath</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-purple-500 shrink-0" />
                <span>Elevator</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500 shrink-0" />
                <span>Plant</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-slate-500 shrink-0" />
                <span>Wall</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-orange-600 shrink-0" />
                <span>Reception</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-700 shrink-0" />
                <span>Table</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-red-600 shrink-0" />
                <span>Stairs</span>
              </div>
            </div>
          </div>

          {/* Right Side: Preset Details and Decision controls */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest font-mono">
                    {template.isBuiltIn ? "★ Built-In Template" : "⚒ Reusable Preset"}
                  </span>
                  <h3 className="text-lg font-black text-white font-display tracking-tight leading-none">
                    {template.name}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Template Description */}
              {template.description && (
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-5 bg-slate-950/30 p-3 rounded-xl border border-slate-850">
                  {template.description}
                </p>
              )}

              {/* Template Statistics Section */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-display">PRESET CONTENTS</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-xl border border-slate-850/80">
                    <span className="text-slate-500 font-semibold">Total Beds</span>
                    <span className="font-bold text-rose-400 font-mono">{counts.beds}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-xl border border-slate-850/80">
                    <span className="text-slate-500 font-semibold">Bathrooms</span>
                    <span className="font-bold text-cyan-400 font-mono">{counts.bathrooms}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-xl border border-slate-850/80">
                    <span className="text-slate-500 font-semibold">Elevators</span>
                    <span className="font-bold text-purple-400 font-mono">{counts.elevators}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-xl border border-slate-850/80">
                    <span className="text-slate-500 font-semibold">Decoration Plants</span>
                    <span className="font-bold text-emerald-400 font-mono">{counts.plants}</span>
                  </div>
                </div>
              </div>

              {/* Overwrite Caution note */}
              <div className="mt-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-2 items-start">
                <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="text-[10px] text-slate-400 font-medium leading-normal">
                  Applying this preset will completely replace the blueprint layout on <strong className="text-slate-200">{targetFloorName}</strong>. This operation is irreversible.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-850">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer select-none text-center"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 cursor-pointer select-none text-center flex items-center justify-center gap-1.5"
              >
                <Check size={14} strokeWidth={3} />
                Apply Layout
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
