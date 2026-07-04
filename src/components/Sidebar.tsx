import React from 'react';
import { useHotelStore } from '../store';
import { TileType } from '../types';
import { Tooltip } from './Tooltip';
import { 
  Square, 
  Grid, 
  DoorClosed, 
  AppWindow, 
  Bed, 
  Briefcase, 
  Trees, 
  Coffee,
  Eraser,
  Plus,
  Trash2,
  Type,
  ArrowUpDown,
  Bath,
  Users,
  Save,
  Copy,
  Flame
} from 'lucide-react';

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
    deleteFloorTemplate
  } = useHotelStore();

  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 h-full text-zinc-100 shadow-xl shadow-black/80">
      <div className="p-4 border-b border-zinc-800 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span className="text-zinc-400">Object Library</span>
          <span className="text-[9px] font-medium text-sky-400 normal-case bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-850/20">Hover for guides</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.type;
            return (
              <Tooltip key={tool.type} content={tool.description} className="w-full">
                <button
                  onClick={() => setSelectedTool(tool.type)}
                  className={`w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center p-2 transition-all border ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/10 text-amber-500 font-extrabold shadow-lg shadow-amber-500/5' 
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-750 text-zinc-300'
                  }`}
                >
                  <Icon size={20} className={`mb-1.5 ${isActive ? 'text-amber-500 scale-110' : tool.color} transition-transform duration-200`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[9px] font-bold tracking-wide ${isActive ? 'text-amber-500' : 'text-zinc-400'}`}>{tool.label}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Project Hierarchy</h3>
            <Tooltip content="Adds a new floor level. Connect levels using Elevators to scale your operations." position="bottom">
              <button 
                onClick={addFloor}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-bold hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
              >
                <Plus size={12} /> Add Floor
              </button>
            </Tooltip>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs p-1.5 rounded text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-[9px] text-zinc-500">ArchHotel Structure</span>
            </div>
            <div className="ml-2 border-l border-zinc-800 space-y-1.5 py-1">
              {floors.map((floor, index) => (
                <div
                  key={floor.level}
                  onClick={() => setActiveFloor(index)}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg cursor-pointer transition-all ${
                    activeFloorIndex === index 
                      ? 'bg-amber-500/10 text-amber-500 font-extrabold border-l-2 border-amber-500 pl-2 shadow-sm shadow-amber-500/5' 
                      : 'hover:bg-zinc-900/60 text-zinc-400 hover:text-white pl-1.5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeFloorIndex === index ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                  <span className="truncate">{floor.name || `Level ${floor.level}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Configurations */}
        <div className="mt-6 border-t border-zinc-800 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Floor Templates</h3>
            <Tooltip content="Save the current active floor layout as a reusable template." position="bottom">
              <button 
                onClick={() => setIsSaving(!isSaving)}
                className="flex items-center gap-1 px-2 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md text-[10px] font-bold hover:bg-sky-500/20 transition-colors"
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
            }} className="mb-3 space-y-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
              <input 
                type="text" 
                placeholder="Template name (e.g. Lobby 2D)" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-zinc-800 rounded-lg focus:outline-none focus:border-amber-500 bg-zinc-950 text-white"
                autoFocus
              />
              <div className="flex gap-1.5 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsSaving(false)}
                  className="px-2.5 py-1 text-[10px] text-zinc-400 hover:bg-zinc-800 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newTemplateName.trim()}
                  className="px-2.5 py-1 text-[10px] bg-amber-500 text-zinc-950 hover:bg-amber-600 disabled:opacity-50 rounded font-black shadow-lg shadow-amber-500/10"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950">
            {floorTemplates.map((template) => (
              <div 
                key={template.id} 
                className="group relative flex items-center justify-between p-2 border border-zinc-800 rounded-xl bg-zinc-900/20 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all text-left"
              >
                <Tooltip content={template.description || "Click to load layout onto the active floor"} className="flex-1" position="right">
                  <button
                    onClick={() => {
                      const activeFloorName = floors[activeFloorIndex]?.name || `Level ${floors[activeFloorIndex]?.level}`;
                      if (window.confirm(`Overwrite "${activeFloorName}" layout with "${template.name}"?`)) {
                        loadFloorTemplate(template.id);
                      }
                    }}
                    className="w-full text-left"
                  >
                    <div className="font-bold text-zinc-250 text-xs truncate max-w-[140px]">{template.name}</div>
                    <div className="text-[9px] text-zinc-500">
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
                    className="text-zinc-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 absolute right-1.5 top-1/2 -translate-y-1/2"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <Tooltip content="WARNING: Wipes all floors, hires, and configurations, starting fresh from Ground Floor." className="w-full">
          <button 
            onClick={() => {
              resetAll();
            }}
            className="w-full py-2 bg-rose-950/15 hover:bg-rose-950/30 border border-rose-900/20 text-rose-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Reset Project
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
