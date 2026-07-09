import React, { useState } from 'react';
import { useHotelStore } from '../store';
import { 
  X, 
  Layers, 
  Info, 
  Ruler, 
  Bed, 
  CheckCircle2, 
  AlertTriangle, 
  Grid, 
  ArrowUpDown, 
  Flame, 
  Bath, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FloorInfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloorInfoOverlay: React.FC<FloorInfoOverlayProps> = ({ isOpen, onClose }) => {
  const { floors, activeFloorIndex, guests } = useHotelStore();
  const [scale, setScale] = useState<number>(4.0); // Default: 2m x 2m = 4m² per tile
  const [isComplianceExpanded, setIsComplianceExpanded] = useState(true);

  if (!isOpen) return null;

  const activeFloor = floors[activeFloorIndex];
  if (!activeFloor) return null;

  const grid = activeFloor.grid;
  const labels = activeFloor.labels || [];
  const floorGuests = guests.filter(g => g.floorIndex === activeFloorIndex);

  // Stats Counters
  let totalTilesCount = 0;
  let emptyCount = 0;
  let floorCount = 0;
  let wallCount = 0;
  let doorCount = 0;
  let windowCount = 0;
  let bedCount = 0;
  let bathroomCount = 0;
  let plantCount = 0;
  let tableCount = 0;
  let elevatorCount = 0;
  let stairsCount = 0;
  let staffRoomCount = 0;
  let receptionCount = 0;

  let guestCapacity = 0;

  grid.forEach(row => {
    row.forEach(cell => {
      totalTilesCount++;
      switch (cell) {
        case 'empty': emptyCount++; break;
        case 'floor': floorCount++; break;
        case 'wall': wallCount++; break;
        case 'door': doorCount++; break;
        case 'window': windowCount++; break;
        case 'bed': 
          bedCount++; 
          guestCapacity += 2; 
          break;
        case 'bed_single': 
          bedCount++; 
          guestCapacity += 1; 
          break;
        case 'bed_double': 
          bedCount++; 
          guestCapacity += 2; 
          break;
        case 'bathroom': bathroomCount++; break;
        case 'plant': plantCount++; break;
        case 'table': tableCount++; break;
        case 'elevator': elevatorCount++; break;
        case 'stairs': stairsCount++; break;
        case 'staff': staffRoomCount++; break;
        case 'reception': receptionCount++; break;
      }
    });
  });

  const builtCount = totalTilesCount - emptyCount;

  // Area Calculations (sq meters)
  const grossArea = builtCount * scale;
  const usableArea = (builtCount - wallCount) * scale;
  const wallArea = wallCount * scale;
  const spaceEfficiency = builtCount > 0 ? ((builtCount - wallCount) / builtCount) * 100 : 0;

  // Capacity calculations
  const activeGuestsCount = floorGuests.length;
  const occupancyRate = guestCapacity > 0 ? (activeGuestsCount / guestCapacity) * 100 : 0;

  // Structural Compliance Checklist
  const hasAccess = doorCount > 0 || elevatorCount > 0 || stairsCount > 0;
  const isGroundFloor = activeFloorIndex === 0;
  const hasBathroomCheck = bathroomCount > 0 || bedCount === 0;
  const hasReceptionCheck = receptionCount > 0 || !isGroundFloor;
  const hasStairsCheck = stairsCount > 0 || isGroundFloor;
  const isVipReady = plantCount > 0 && tableCount > 0 || bedCount === 0;

  // Get descriptive scale text
  const getScaleLabel = (val: number) => {
    if (val === 1.0) return 'Compact (1m × 1m = 1 m²)';
    if (val === 2.25) return 'Standard (1.5m × 1.5m = 2.25 m²)';
    return 'Luxury (2m × 2m = 4 m²)';
  };

  return (
    <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl text-slate-100 font-sans select-none z-30 w-80 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto max-h-[85vh] overflow-y-auto scrollbar-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-blue-400" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              {activeFloor.name || `Floor ${activeFloorIndex}`} Spec
            </h4>
            <p className="text-[10px] font-mono text-slate-400">Architectural Report & Stats</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Close Stats Overlay"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scale Selector */}
      <div className="mb-3.5 bg-slate-950/40 border border-slate-850 p-2 rounded-xl">
        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center justify-between">
          <span>Grid Scale Factor</span>
          <span className="text-blue-400 font-mono text-[10px] lowercase">interactive calculation</span>
        </label>
        <div className="grid grid-cols-3 gap-1 mt-1">
          {[1.0, 2.25, 4.0].map((val) => (
            <button
              key={val}
              onClick={() => setScale(val)}
              className={`py-1 text-[9px] font-mono font-bold rounded-md border transition-all cursor-pointer ${
                scale === val 
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400' 
                  : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:bg-slate-850'
              }`}
            >
              {val === 1.0 ? '1.0 m²' : val === 2.25 ? '2.25 m²' : '4.0 m²'}
            </button>
          ))}
        </div>
        <div className="text-[9px] text-slate-500 mt-1 text-center font-medium font-mono">
          Using {getScaleLabel(scale)} scale
        </div>
      </div>

      {/* Area Statistics */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Ruler size={12} className="text-slate-500" />
          <span>Floor Plan Areas</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950/30 border border-slate-850/50 p-2 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 block uppercase">Gross Area</span>
            <span className="text-sm font-black text-slate-200 font-mono">
              {grossArea.toFixed(1)} <span className="text-[10px] text-slate-400">m²</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{builtCount} tiles total</span>
          </div>

          <div className="bg-slate-950/30 border border-slate-850/50 p-2 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 block uppercase">Usable Area</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {usableArea.toFixed(1)} <span className="text-[10px] text-slate-400">m²</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{builtCount - wallCount} tiles usable</span>
          </div>
        </div>

        {/* Space Efficiency Bar */}
        <div className="bg-slate-950/30 border border-slate-850/50 p-2.5 rounded-xl">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span>Space Efficiency</span>
            <span className="text-emerald-400 font-mono">{spaceEfficiency.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500" 
              style={{ width: `${spaceEfficiency}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
            <span>Walls: {wallArea.toFixed(1)} m² ({builtCount > 0 ? ((wallCount / builtCount) * 100).toFixed(0) : 0}%)</span>
            <span>Usable: {usableArea.toFixed(1)} m²</span>
          </div>
        </div>
      </div>

      {/* Capacity & Furniture */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Bed size={12} className="text-slate-500" />
            <span>Room Capacity & Assets</span>
          </div>
          {guestCapacity > 0 && (
            <span className="text-[9px] font-semibold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/30 font-mono">
              {activeGuestsCount} / {guestCapacity} Guests
            </span>
          )}
        </div>

        <div className="bg-slate-950/30 border border-slate-850/50 p-2.5 rounded-xl">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            <span>Overnight Capacity</span>
            <span className="text-rose-400 font-mono">
              {guestCapacity} <span className="text-[8px] text-slate-400">places</span>
            </span>
          </div>
          
          {guestCapacity > 0 ? (
            <>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850 mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, occupancyRate)}%` }}
                />
              </div>
              <div className="text-[8px] text-slate-500 flex justify-between font-mono">
                <span>Beds Placed: {bedCount}</span>
                <span>Room Occupancy: {occupancyRate.toFixed(0)}%</span>
              </div>
            </>
          ) : (
            <div className="text-[9px] text-slate-500 italic py-1 text-center font-medium">
              No beds placed on this floor yet. Guest capacity is 0.
            </div>
          )}
        </div>

        {/* Compact Furnishing Breakdown */}
        <div className="bg-slate-950/20 border border-slate-850/40 p-2 rounded-xl grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-850/30 pb-1">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Beds
            </span>
            <span className="font-mono font-black text-slate-200">{bedCount}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-850/30 pb-1">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Bathrooms
            </span>
            <span className="font-mono font-black text-slate-200">{bathroomCount}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-850/30 pb-1">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700"></span> Tables
            </span>
            <span className="font-mono font-black text-slate-200">{tableCount}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-850/30 pb-1">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Plants
            </span>
            <span className="font-mono font-black text-slate-200">{plantCount}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 pb-0.5">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Elevators
            </span>
            <span className="font-mono font-black text-slate-200">{elevatorCount}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 pb-0.5">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Stairs
            </span>
            <span className="font-mono font-black text-slate-200">{stairsCount}</span>
          </div>
        </div>
      </div>

      {/* Compliance / Architectural Analysis */}
      <div className="bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden">
        <button
          onClick={() => setIsComplianceExpanded(!isComplianceExpanded)}
          className="w-full flex items-center justify-between p-2.5 hover:bg-slate-850/30 transition-colors text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span>Compliance Audit</span>
          </div>
          {isComplianceExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {isComplianceExpanded && (
          <div className="p-2.5 border-t border-slate-850 space-y-2 text-[9px]">
            {/* Entry check */}
            <div className="flex items-start gap-2">
              {hasAccess ? (
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-200">Floor Accessibility</p>
                <p className="text-slate-400 leading-relaxed">
                  {hasAccess 
                    ? 'Connected via doors, stairs, or elevators.' 
                    : 'Warning: Missing entry points! Add stairs, doors, or elevators.'}
                </p>
              </div>
            </div>

            {/* Bathroom check */}
            <div className="flex items-start gap-2">
              {hasBathroomCheck ? (
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-200">Guest Hygiene</p>
                <p className="text-slate-400 leading-relaxed">
                  {hasBathroomCheck 
                    ? 'Adequate hygiene setups provided for overnight stays.' 
                    : 'Warning: No bathroom placed on this floor with active beds!'}
                </p>
              </div>
            </div>

            {/* Reception check */}
            {isGroundFloor && (
              <div className="flex items-start gap-2">
                {hasReceptionCheck ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-slate-200">Reception Desk</p>
                  <p className="text-slate-400 leading-relaxed">
                    {hasReceptionCheck 
                      ? 'Lobby features receptionist station.' 
                      : 'Alert: Place a reception tile on the ground floor to process check-ins!'}
                  </p>
                </div>
              </div>
            )}

            {/* Safety Stairs check */}
            {!isGroundFloor && (
              <div className="flex items-start gap-2">
                {hasStairsCheck ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-slate-200">Emergency Staircase</p>
                  <p className="text-slate-400 leading-relaxed">
                    {hasStairsCheck 
                      ? 'Emergency evacuation route is connected.' 
                      : 'Evacuation Warning: Please build fire escape emergency stairs for upper floors.'}
                  </p>
                </div>
              </div>
            )}

            {/* VIP readiness check */}
            <div className="flex items-start gap-2">
              {isVipReady ? (
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-slate-200">VIP Comfort Readiness</p>
                <p className="text-slate-400 leading-relaxed">
                  {isVipReady 
                    ? 'Premium suites include luxury decors (plants and tables).' 
                    : 'Comfort Advice: Place tables and plants to boost VIP guest satisfaction!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
