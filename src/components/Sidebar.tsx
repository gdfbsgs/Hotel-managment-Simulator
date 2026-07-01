import React from 'react';
import { useHotelStore } from '../store';
import { TileType } from '../types';
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
  Users
} from 'lucide-react';

const tools: { type: TileType | 'eraser' | 'text'; icon: React.FC<any>; label: string; color: string }[] = [
  { type: 'floor', icon: Grid, label: 'Floor', color: 'text-slate-400' },
  { type: 'wall', icon: Square, label: 'Wall', color: 'text-slate-800' },
  { type: 'door', icon: DoorClosed, label: 'Door', color: 'text-amber-700' },
  { type: 'window', icon: AppWindow, label: 'Window', color: 'text-sky-500' },
  { type: 'bed', icon: Bed, label: 'Bed', color: 'text-rose-500' },
  { type: 'bathroom', icon: Bath, label: 'Bathroom', color: 'text-cyan-500' },
  { type: 'reception', icon: Briefcase, label: 'Reception', color: 'text-orange-800' },
  { type: 'staff', icon: Users, label: 'Staff Room', color: 'text-rose-800' },
  { type: 'table', icon: Coffee, label: 'Table', color: 'text-amber-600' },
  { type: 'plant', icon: Trees, label: 'Plant', color: 'text-emerald-500' },
  { type: 'elevator', icon: ArrowUpDown, label: 'Elevator', color: 'text-purple-600' },
  { type: 'text', icon: Type, label: 'Label', color: 'text-slate-700' },
  { type: 'eraser', icon: Eraser, label: 'Eraser', color: 'text-slate-400' },
];

export const Sidebar: React.FC = () => {
  const { 
    selectedTool, 
    setSelectedTool, 
    floors, 
    activeFloorIndex, 
    setActiveFloor, 
    addFloor,
    resetAll
  } = useHotelStore();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-slate-100 flex-1 overflow-y-auto">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Object Library</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.type;
            return (
              <button
                key={tool.type}
                onClick={() => setSelectedTool(tool.type)}
                className={`aspect-[4/3] rounded flex flex-col items-center justify-center p-2 transition-all border ${
                  isActive 
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500/50' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} className={`mb-1.5 ${tool.color}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-medium ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Hierarchy</h3>
            <button 
              onClick={addFloor}
              className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold hover:bg-slate-200 transition-colors"
            >
              <Plus size={12} /> Add Floor
            </button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer">
              <span className="font-medium text-slate-700">ArchHotel Structure</span>
            </div>
            <div className="ml-4 border-l-2 border-slate-100 space-y-1 py-1">
              {floors.map((floor, index) => (
                <div
                  key={floor.level}
                  onClick={() => setActiveFloor(index)}
                  className={`flex items-center gap-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                    activeFloorIndex === index 
                      ? 'bg-blue-50 text-blue-700 font-semibold' 
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeFloorIndex === index ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                  <span>{floor.name || `Level ${floor.level}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <button 
          onClick={() => {
            resetAll();
          }}
          className="w-full py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={14} />
          Reset Project
        </button>
      </div>
    </aside>
  );
};
