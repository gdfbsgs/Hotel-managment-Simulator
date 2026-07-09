import React from 'react';
import { useHotelStore } from '../store';
import { TileType, FloorTemplate } from '../types';
import { Tooltip } from './Tooltip';
import { PresetPreviewModal } from './PresetPreviewModal';
import { 
  Square, 
  Grid, 
  DoorClosed, 
  AppWindow, 
  Bed, 
  BedDouble,
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
  Flame,
  Hand
} from 'lucide-react';

const tools: { type: TileType | 'eraser' | 'text' | 'select'; icon: React.FC<any>; label: string; color: string }[] = [
  { type: 'select', icon: Hand, label: 'Select / Move', color: 'text-amber-500' },
  { type: 'floor', icon: Grid, label: 'Floor', color: 'text-slate-400' },
  { type: 'wall', icon: Square, label: 'Wall', color: 'text-slate-800' },
  { type: 'door', icon: DoorClosed, label: 'Door', color: 'text-amber-700' },
  { type: 'window', icon: AppWindow, label: 'Window', color: 'text-sky-500' },
  { type: 'bed_single', icon: Bed, label: 'Single Bed', color: 'text-rose-400' },
  { type: 'bed_double', icon: BedDouble, label: 'Double Bed', color: 'text-rose-600' },
  { type: 'bathroom', icon: Bath, label: 'Bathroom', color: 'text-cyan-500' },
  { type: 'reception', icon: Briefcase, label: 'Reception', color: 'text-orange-800' },
  { type: 'staff', icon: Users, label: 'Staff Room', color: 'text-rose-800' },
  { type: 'table', icon: Coffee, label: 'Table', color: 'text-amber-600' },
  { type: 'plant', icon: Trees, label: 'Plant', color: 'text-emerald-500' },
  { type: 'elevator', icon: ArrowUpDown, label: 'Elevator', color: 'text-purple-600' },
  { type: 'stairs', icon: Flame, label: 'Emergency Stairs', color: 'text-red-500' },
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
    resetAll,
    floorTemplates,
    saveFloorTemplate,
    loadFloorTemplate,
    deleteFloorTemplate,
    wallColor,
    setWallColor,
    wallTexture,
    setWallTexture,
    doorColor,
    setDoorColor,
    floorColor,
    setFloorColor,
    floorTexture,
    setFloorTexture,
    bedColor,
    setBedColor,
  } = useHotelStore();

  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [previewTemplate, setPreviewTemplate] = React.useState<FloorTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  return (
    <aside className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col shrink-0 h-full text-slate-100 shadow-2xl">
      <div className="p-4 border-b border-slate-900 flex-1 overflow-y-auto scrollbar-none">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3.5 flex items-center justify-between font-display">
          <span>OBJECT LIBRARY</span>
          <span className="text-[9px] font-semibold text-sky-400 normal-case bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/30">Guides active</span>
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.type;
            return (
              <Tooltip key={tool.type} content={tool.label} position="bottom">
                <button
                  type="button"
                  onClick={() => setSelectedTool(tool.type)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center p-1 transition-all border cursor-pointer select-none ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/10 text-amber-500 font-extrabold shadow-md shadow-amber-500/5' 
                      : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <Icon size={18} className={`${isActive ? 'text-amber-500 scale-110' : tool.color} transition-transform duration-200`} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              </Tooltip>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">PROJECT HIERARCHY</h3>
            <Tooltip content="Adds a new floor level. Connect levels using Elevators to scale your operations." position="bottom">
              <button 
                onClick={addFloor}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold hover:bg-amber-500/20 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Plus size={12} /> Add Level
              </button>
            </Tooltip>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs p-1.5 rounded text-slate-400">
              <span className="font-extrabold uppercase tracking-wider text-[9px] text-slate-500 font-mono">ArchHotel Structure</span>
            </div>
            <div className="ml-2 border-l border-slate-900 space-y-1.5 py-1">
              {floors.map((floor, index) => (
                <div
                  key={floor.level}
                  onClick={() => setActiveFloor(index)}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg cursor-pointer transition-all ${
                    activeFloorIndex === index 
                      ? 'bg-amber-500/10 text-amber-500 font-extrabold border-l-2 border-amber-500 pl-2 shadow-sm shadow-amber-500/5' 
                      : 'hover:bg-slate-900/40 text-slate-400 hover:text-white pl-1.5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeFloorIndex === index ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></span>
                  <span className="truncate font-medium">{floor.name || `Level ${floor.level}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Configurations */}
        <div className="mt-6 border-t border-slate-900 pt-5">
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

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
            {floorTemplates.map((template) => (
              <div 
                key={template.id} 
                className="group relative flex items-center justify-between p-2.5 border border-slate-900 rounded-xl bg-slate-900/10 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all text-left"
              >
                <Tooltip content={template.description || "Click to preview layout before applying to the active floor"} className="flex-1" position="right">
                  <button
                    onClick={() => {
                      setPreviewTemplate(template);
                      setIsPreviewOpen(true);
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

        {/* Aesthetics & Themes Customizer */}
        <div className="mt-6 border-t border-slate-900 pt-5 pb-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-3.5">
            AESTHETICS & THEME
          </h3>
          <div className="space-y-4 text-xs">
            {/* Wall Section */}
            <div className="space-y-1.5 bg-slate-900/20 p-2 rounded-xl border border-slate-900/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Walls</div>
              <div className="flex gap-1.5">
                {[
                  { hex: "#1e293b", name: "Charcoal" },
                  { hex: "#f1f5f9", name: "Pearl" },
                  { hex: "#fef3c7", name: "Beige" },
                  { hex: "#15803d", name: "Sage" },
                  { hex: "#1e3a8a", name: "Sapphire" },
                  { hex: "#b45309", name: "Terracotta" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setWallColor(c.hex)}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      wallColor === c.hex ? 'border-amber-500 scale-110 ring-2 ring-amber-500/20' : 'border-slate-800'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {["concrete", "brick", "wood", "plaster", "stone", "stripes"].map((tex) => (
                  <button
                    key={tex}
                    type="button"
                    onClick={() => setWallTexture(tex as any)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border cursor-pointer ${
                      wallTexture === tex
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/35'
                        : 'bg-slate-900/50 text-slate-400 border-slate-900 hover:text-white'
                    }`}
                  >
                    {tex}
                  </button>
                ))}
              </div>
            </div>

            {/* Flooring Section */}
            <div className="space-y-1.5 bg-slate-900/20 p-2 rounded-xl border border-slate-900/50">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Flooring</div>
              <div className="flex gap-1.5">
                {[
                  { hex: "#334155", name: "Charcoal" },
                  { hex: "#fdfbf7", name: "Cream" },
                  { hex: "#064e3b", name: "Emerald" },
                  { hex: "#0f172a", name: "Royal" },
                  { hex: "#4c0519", name: "Ruby" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFloorColor(c.hex)}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      floorColor === c.hex ? 'border-amber-500 scale-110 ring-2 ring-amber-500/20' : 'border-slate-800'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {["terrazzo", "carpet", "parquet", "marble"].map((tex) => (
                  <button
                    key={tex}
                    type="button"
                    onClick={() => setFloorTexture(tex as any)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border cursor-pointer ${
                      floorTexture === tex
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/35'
                        : 'bg-slate-900/50 text-slate-400 border-slate-900 hover:text-white'
                    }`}
                  >
                    {tex}
                  </button>
                ))}
              </div>
            </div>

            {/* Doors & Furniture Colors */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/20 p-2 rounded-xl border border-slate-900/50">
              <div className="space-y-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Doors</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { hex: "#7c2d12", name: "Mahogany" },
                    { hex: "#b45309", name: "Oak" },
                    { hex: "#451a03", name: "Walnut" },
                    { hex: "#09090b", name: "Black" },
                    { hex: "#f8fafc", name: "White" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setDoorColor(c.hex)}
                      className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                        doorColor === c.hex ? 'border-amber-500 scale-110' : 'border-slate-800'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Beds Blanket</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { hex: "#e11d48", name: "Crimson" },
                    { hex: "#312e81", name: "Indigo" },
                    { hex: "#064e3b", name: "Emerald" },
                    { hex: "#d97706", name: "Amber" },
                    { hex: "#581c87", name: "Purple" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setBedColor(c.hex)}
                      className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                        bedColor === c.hex ? 'border-amber-500 scale-110' : 'border-slate-800'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0">
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

      <PresetPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewTemplate(null);
        }}
        onConfirm={() => {
          if (previewTemplate) {
            loadFloorTemplate(previewTemplate.id);
          }
          setIsPreviewOpen(false);
          setPreviewTemplate(null);
        }}
        template={previewTemplate}
        targetFloorName={
          floors[activeFloorIndex]?.name || `Level ${floors[activeFloorIndex]?.level || 0}`
        }
      />
    </aside>
  );
};
