import React from 'react';
import { useHotelStore } from '../store';
import { TileType } from '../types';
import { Tooltip } from './Tooltip';
import { Square, Grid2x2 as Grid, DoorClosed, AppWindow, Bed, Briefcase, Trees, Coffee, Eraser, Plus, Trash2, Type, ArrowUpDown, Bath, Users, Save, Copy, Flame } from 'lucide-react';

const tools: { type: TileType | 'eraser' | 'text'; icon: React.FC<any>; label: string; color: string; description: string }[] = [
  { type: 'floor', icon: Grid, label: 'Floor', color: 'text-slate-400', description: 'Construct floors. Guests need them to walk on and for placing other furniture.' },
  { type: 'wall', icon: Square, label: 'Wall', color: 'text-slate-800', description: 'Build sturdy walls to separate rooms and define pathways. Block guest movement.' },
  { type: 'door', icon: DoorClosed, label: 'Door', color: 'text-amber-700', description: 'Create entrance and exit points. Connects rooms together so guests and staff can pass through.' },
  { type: 'window', icon: AppWindow, label: 'Window', color: 'text-sky-500', description: 'Provides natural light and ambient views, improving the general look of your spaces.' },
  { type: 'bed', icon: Bed, label: 'Bed', color: 'text-rose-500', description: 'The key to overnight stays. Each bed supports up to 2 guests and earns nightly room rate revenue!' },
  { type: 'bathroom', icon: Bath, label: 'Bathroom', color: 'text-cyan-500', description: 'Enables guests to satisfy hygiene needs. Critical for maintaining overall guest satisfaction!' },
  { type: 'reception', icon: Briefcase, label: 'Reception', color: 'text-orange-800', description: 'Check-in and checkout hub. Crucial for admitting visitors into your building.' },
  { type: 'staff', icon: Users, label: 'Staff Room', color: 'text-rose-800', description: 'Provides a resting lounge and dispatch terminal. Hired staff return here when they are idle.' },
  { type: 'table', icon: Coffee, label: 'Table', color: 'text-amber-600', description: 'Allows guests to dine and relax. Enables room services like Premium Champagne room service for VIPs.' },
  { type: 'plant', icon: Trees, label: 'Plant', color: 'text-emerald-500', description: 'Increases the beauty of a room. Satisfies the suite comfort requirements for visiting VIP guests.' },
  { type: 'elevator', icon: ArrowUpDown, label: 'Elevator', color: 'text-purple-600', description: 'Transports guests and staff between multiple levels. Automatically syncs and duplicates across all floors!' },
  { type: 'stairs', icon: Flame, label: 'Emergency Stairs', color: 'text-red-500', description: 'Mandatory fire evacuation route connecting all room hallways to safe exits!' },
  { type: 'text', icon: Type, label: 'Label', color: 'text-slate-700', description: 'Add personalized text tags to name suite rooms, lobbies, or staff areas on your map.' },
  { type: 'eraser', icon: Eraser, label: 'Eraser', color: 'text-slate-400', description: 'Wipes away placed walls, floors, doors, and furniture so you can redesign your hotel layout.' },
];

export const Sidebar: React.FC = () => {
  const { 
    selectedTool, 
    setSelectedTool, 
    floors, 
    activeFloorIndex, 
    setActiveFloor, 
    addFloor,
    resetAll,
    floorTemplates,
    saveFloorTemplate,
    loadFloorTemplate,
    deleteFloorTemplate,
    elevatorSystemMode,
    setElevatorSystemMode
  } = useHotelStore();

  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  return (
    <aside className="w-64 border-r border-[#1c2638] bg-[#0a0e14] flex flex-col shrink-0 h-full text-slate-100 shadow-2xl">
      <div className="p-4 border-b border-[#1c2638] flex-1 overflow-y-auto scrollbar-none">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5 flex items-center justify-between font-display">
          <span>OBJECT LIBRARY</span>
          <span className="text-[9px] font-semibold text-[#43c397] normal-case bg-[#1fa87c]/10 px-2 py-0.5 rounded border border-[#1fa87c]/20">Guides active</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.type;
            return (
              <Tooltip key={tool.type} content={tool.description} className="w-full">
                <button
                  onClick={() => setSelectedTool(tool.type)}
                  className={`w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center p-2 transition-all border cursor-pointer select-none ${
                    isActive 
                      ? 'bg-[#1fa87c]/10 border-[#1fa87c]/50 ring-2 ring-[#1fa87c]/10 text-[#43c397] font-extrabold shadow-md shadow-[#1fa87c]/5' 
                      : 'bg-[#151d2b]/40 border-[#1c2638] hover:bg-[#151d2b]/70 hover:border-[#2a3a52] text-slate-300'
                  }`}
                >
                  <Icon size={18} className={`mb-1.5 ${isActive ? 'text-[#43c397] scale-110' : tool.color} transition-transform duration-200`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-[#43c397]' : 'text-slate-400'}`}>{tool.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>

        {selectedTool === 'elevator' && (
          <div className="mt-4 p-3 bg-[#1fa87c]/10 border border-[#1fa87c]/20 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#43c397] font-mono">
              <ArrowUpDown size={12} />
              <span>Elevator System Setup</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Choose whether elevators operate under standard logic or intelligent KONE Polaris DCS.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => setElevatorSystemMode('standard')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                  elevatorSystemMode === 'standard'
                    ? 'bg-[#1fa87c] text-white border-[#43c397] font-black shadow-md shadow-[#1fa87c]/10'
                    : 'bg-[#151d2b] border-[#1c2638] text-slate-400 hover:text-white'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setElevatorSystemMode('dcs')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                  elevatorSystemMode === 'dcs'
                    ? 'bg-[#1fa87c] text-white border-[#43c397] font-black shadow-md shadow-[#1fa87c]/10'
                    : 'bg-[#151d2b] border-[#1c2638] text-slate-400 hover:text-white'
                }`}
              >
                KONE DCS
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">PROJECT HIERARCHY</h3>
            <Tooltip content="Adds a new floor level. Connect levels using Elevators to scale your operations." position="bottom">
              <button 
                onClick={addFloor}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1fa87c]/10 text-[#43c397] border border-[#1fa87c]/20 rounded-lg text-[10px] font-bold hover:bg-[#1fa87c]/20 hover:text-[#7eddb8] transition-colors cursor-pointer"
              >
                <Plus size={12} /> Add Level
              </button>
            </Tooltip>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs p-1.5 rounded text-slate-400">
              <span className="font-extrabold uppercase tracking-wider text-[9px] text-slate-500 font-mono">ArchHotel Structure</span>
            </div>
            <div className="ml-2 border-l border-[#1c2638] space-y-1.5 py-1">
              {floors.map((floor, index) => (
                <div
                  key={floor.level}
                  onClick={() => setActiveFloor(index)}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg cursor-pointer transition-all ${
                    activeFloorIndex === index 
                      ? 'bg-[#1fa87c]/10 text-[#43c397] font-extrabold border-l-2 border-[#1fa87c] pl-2 shadow-sm shadow-[#1fa87c]/5' 
                      : 'hover:bg-[#151d2b]/40 text-slate-400 hover:text-white pl-1.5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeFloorIndex === index ? 'bg-[#1fa87c] animate-pulse' : 'bg-slate-700'}`}></span>
                  <span className="truncate font-medium">{floor.name || `Level ${floor.level}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Configurations */}
        <div className="mt-6 border-t border-[#1c2638] pt-5">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">FLOOR TEMPLATES</h3>
            <Tooltip content="Save the current active floor layout as a reusable template." position="bottom">
              <button 
                onClick={() => setIsSaving(!isSaving)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg text-[10px] font-bold hover:bg-sky-500/20 transition-colors cursor-pointer"
              >
                <Save size={12} /> Save Layout
              </button>
            </Tooltip>
          </div>

          {isSaving && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newTemplateName.trim()) {
                saveFloorTemplate(newTemplateName.trim());
                setNewTemplateName('');
                setIsSaving(false);
              }
            }} className="mb-3 space-y-2 bg-[#151d2b] p-2 rounded-xl border border-[#1c2638]">
              <input 
                type="text" 
                placeholder="Template name (e.g. Lobby 2D)" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-[#1c2638] rounded-lg focus:outline-none focus:border-[#1fa87c] bg-[#0a0e14] text-white"
                autoFocus
              />
              <div className="flex gap-1.5 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsSaving(false)}
                  className="px-2.5 py-1 text-[10px] text-slate-400 hover:bg-[#1c2638] rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newTemplateName.trim()}
                  className="px-2.5 py-1 text-[10px] bg-[#fbbf24] text-[#0a0e14] hover:bg-[#d97706] disabled:opacity-50 rounded font-black shadow-lg shadow-[#fbbf24]/10"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
            {floorTemplates.map((template) => (
              <div 
                key={template.id} 
                className="group relative flex items-center justify-between p-2.5 border border-[#1c2638] rounded-xl bg-[#151d2b]/10 hover:bg-[#1fa87c]/5 hover:border-[#1fa87c]/30 transition-all text-left"
              >
                <Tooltip content={template.description || "Click to load layout onto the active floor"} className="flex-1" position="right">
                  <button
                    onClick={() => {
                      const activeFloorGrid = floors[activeFloorIndex]?.grid;
                      const isBlank = !activeFloorGrid || activeFloorGrid.every(row => row.every(cell => cell === 'empty'));
                      if (isBlank) {
                        loadFloorTemplate(template.id);
                      } else {
                        const activeFloorName = floors[activeFloorIndex]?.name || `Level ${floors[activeFloorIndex]?.level}`;
                        if (window.confirm(`Overwrite "${activeFloorName}" layout with "${template.name}"?`)) {
                          loadFloorTemplate(template.id);
                        }
                      }
                    }}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="font-extrabold text-slate-200 text-xs truncate max-w-[140px]">{template.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {template.isBuiltIn ? "Built-In Layout" : "Custom Layout"}
                    </div>
                  </button>
                </Tooltip>

                {!template.isBuiltIn && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete template "${template.name}"?`)) {
                        deleteFloorTemplate(template.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#0a0e14] border-t border-[#1c2638] shrink-0">
        <Tooltip content="WARNING: Wipes all floors, hires, and configurations, starting fresh from Ground Floor." className="w-full">
          <button 
            onClick={() => {
              resetAll();
            }}
            className="w-full py-2.5 bg-rose-950/10 hover:bg-rose-950/25 border border-rose-900/35 text-rose-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Trash2 size={13} />
            Reset Project
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
