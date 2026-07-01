import React, { useState } from 'react';
import { useHotelStore } from '../store';
import { TileType } from '../types';
import { ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';

const GRID_SIZE = 20;
const BASE_TILE_SIZE = 40; // in pixels

const getTileColor = (type: TileType | 'eraser' | 'text') => {
  switch (type) {
    case 'floor': return 'bg-slate-100';
    case 'wall': return 'bg-slate-800';
    case 'door': return 'bg-amber-700';
    case 'window': return 'bg-sky-400 opacity-80';
    case 'bed': return 'bg-rose-500';
    case 'reception': return 'bg-orange-800';
    case 'staff': return 'bg-rose-800';
    case 'bathroom': return 'bg-cyan-400';
    case 'plant': return 'bg-emerald-500';
    case 'table': return 'bg-amber-600';
    case 'elevator': return 'bg-purple-500 border border-purple-700 relative after:content-["E"] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-white after:text-[10px] after:font-bold';
    default: return 'bg-white';
  }
};

export const Editor2D: React.FC = () => {
  const { floors, activeFloorIndex, selectedTool, setTile, addLabel, removeLabel, guests } = useHotelStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [drawAxis, setDrawAxis] = useState<'x' | 'y' | null>(null);

  const [labelPrompt, setLabelPrompt] = useState<{x: number, y: number} | null>(null);
  const [labelText, setLabelText] = useState('');

  const activeFloor = floors[activeFloorIndex];
  const grid = activeFloor?.grid;
  const labels = activeFloor?.labels || [];
  const prevFloor = activeFloorIndex > 0 ? floors[activeFloorIndex - 1] : null;

  const floorGuests = guests.filter(g => g.floorIndex === activeFloorIndex);

  if (!grid) return null;

  const handlePointerDown = (x: number, y: number) => {
    if (selectedTool === 'text') {
      setLabelPrompt({x, y});
      setLabelText('');
      return;
    }
    
    setIsDrawing(true);
    setStartPos({x, y});
    setDrawAxis(null);
    setTile(x, y, selectedTool);
  };

  const handlePointerEnter = (x: number, y: number) => {
    if (isDrawing && selectedTool !== 'text') {
      if (snapToGrid && startPos) {
        let currentAxis = drawAxis;
        if (!currentAxis) {
          if (x !== startPos.x) {
            currentAxis = 'x';
            setDrawAxis('x');
          } else if (y !== startPos.y) {
            currentAxis = 'y';
            setDrawAxis('y');
          }
        }
        
        if (currentAxis === 'x' && y !== startPos.y) return;
        if (currentAxis === 'y' && x !== startPos.x) return;
      }
      setTile(x, y, selectedTool);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    setStartPos(null);
    setDrawAxis(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-1 hover:bg-slate-100 rounded text-slate-500" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-medium text-slate-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-1 hover:bg-slate-100 rounded text-slate-500" title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoom(1)} className="p-1 hover:bg-slate-100 rounded text-slate-500 ml-1" title="Reset Zoom">
            <Maximize size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-[10px] uppercase font-bold text-slate-400 cursor-pointer" onClick={() => setSnapToGrid(!snapToGrid)}>
            Snap to Grid (Orthogonal)
          </label>
          <button 
            className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${snapToGrid ? 'bg-blue-500' : 'bg-slate-300'}`}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${snapToGrid ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>
      <div 
        className="flex flex-1 items-center justify-center p-8 overflow-auto touch-none relative"
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#64748b 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative z-10 bg-white p-2 rounded-xl shadow-2xl border border-slate-300">
          <div className="relative">
            <div 
              className="grid bg-slate-200 gap-[1px] border border-slate-300 overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {grid.map((row, y) => (
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`${selectedTool === 'text' ? 'cursor-text' : 'cursor-crosshair'} select-none ${getTileColor(cell)} transition-colors duration-75 hover:opacity-80 relative`}
                    style={{ width: `${BASE_TILE_SIZE * zoom}px`, height: `${BASE_TILE_SIZE * zoom}px` }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handlePointerDown(x, y);
                    }}
                    onPointerEnter={(e) => {
                      e.preventDefault();
                      handlePointerEnter(x, y);
                    }}
                    draggable={false}
                  >
                    {prevFloor && prevFloor.grid[y][x] !== 'empty' && cell === 'empty' && (
                      <div className="absolute inset-0 border-[2px] border-slate-300/30 border-dashed pointer-events-none" />
                    )}
                  </div>
                ))
              ))}
            </div>
            
            {labels.map((label) => (
              <div
                key={label.id}
                className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none group"
                style={{
                  left: `${(label.x + 0.5) * (BASE_TILE_SIZE * zoom) + (label.x * 1)}px`, // accounting for 1px gap
                  top: `${(label.y + 0.5) * (BASE_TILE_SIZE * zoom) + (label.y * 1)}px`,
                  zIndex: 20
                }}
              >
                <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow border border-slate-200 text-slate-700 font-bold whitespace-nowrap pointer-events-auto flex items-center gap-1"
                     style={{ fontSize: `${Math.max(10, 12 * zoom)}px` }}>
                  {label.text}
                  {selectedTool === 'eraser' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeLabel(activeFloorIndex, label.id); }}
                      className="text-red-500 hover:bg-red-50 p-0.5 rounded -mr-1"
                      title="Delete Label"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {floorGuests.map(guest => (
              <div
                key={guest.id}
                className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-1000 ease-linear"
                style={{
                  left: `${(guest.x + 0.5) * (BASE_TILE_SIZE * zoom) + (guest.x * 1)}px`,
                  top: `${(guest.y + 0.5) * (BASE_TILE_SIZE * zoom) + (guest.y * 1)}px`,
                  width: `${BASE_TILE_SIZE * zoom * 0.6}px`,
                  height: `${BASE_TILE_SIZE * zoom * 0.6}px`,
                }}
                title={guest.name}
              >
                <div className="w-full h-full bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold" style={{ fontSize: `${Math.max(8, 10 * zoom)}px` }}>
                  {guest.name[0]}
                </div>
              </div>
            ))}

            {labelPrompt && (
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-white p-2 rounded shadow-xl border border-slate-300 z-50 pointer-events-auto"
                style={{
                  left: `${(labelPrompt.x + 0.5) * (BASE_TILE_SIZE * zoom) + (labelPrompt.x * 1)}px`,
                  top: `${(labelPrompt.y + 0.5) * (BASE_TILE_SIZE * zoom) + (labelPrompt.y * 1)}px`
                }}
              >
                <input 
                  autoFocus
                  type="text" 
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                  placeholder="Enter label..."
                  className="px-2 py-1 text-sm border border-slate-200 rounded outline-none focus:border-blue-500 w-32"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (labelText.trim()) {
                        addLabel(activeFloorIndex, {
                          id: Math.random().toString(36).substr(2, 9),
                          x: labelPrompt.x,
                          y: labelPrompt.y,
                          text: labelText.trim()
                        });
                      }
                      setLabelPrompt(null);
                    } else if (e.key === 'Escape') {
                      setLabelPrompt(null);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (labelText.trim()) {
                      addLabel(activeFloorIndex, {
                        id: Math.random().toString(36).substr(2, 9),
                        x: labelPrompt.x,
                        y: labelPrompt.y,
                        text: labelText.trim()
                      });
                    }
                    setLabelPrompt(null);
                  }}
                  className="px-2 py-1 text-xs bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button 
                  onClick={() => setLabelPrompt(null)}
                  className="px-2 py-1 text-xs bg-slate-100 text-slate-600 font-bold rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
