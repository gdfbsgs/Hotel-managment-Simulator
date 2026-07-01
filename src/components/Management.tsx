import React from 'react';
import { useHotelStore } from '../store';
import { Building2, Users, BedDouble, Square, CheckCircle, ArrowDownToLine, DollarSign } from 'lucide-react';

export const Management: React.FC = () => {
  const { floors, loadPreset, staff, hireStaff, assignTask, money } = useHotelStore();

  let totalBeds = 0;
  let totalArea = 0;
  let totalElevators = 0;
  let totalPlants = 0;

  floors.forEach(floor => {
    floor.grid.forEach(row => {
      row.forEach(cell => {
        if (cell === 'bed') totalBeds++;
        if (cell !== 'empty') totalArea += 4; // 2x2m
        if (cell === 'elevator') totalElevators++;
        if (cell === 'plant') totalPlants++;
      })
    })
  });

  // Calculate approximate rooms (based on beds / labels)
  const roomCount = Math.floor(totalBeds / 2) || floors.reduce((acc, f) => acc + (f.labels?.length || 0), 0);

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Property Management</h2>
          <p className="text-slate-500">Overview and statistics for your current building project.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase">Treasury</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-700">${money.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BedDouble size={20} /></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase">Guest Capacity</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{totalBeds * 2} <span className="text-lg text-slate-500">Guests</span></p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Building2 size={20} /></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase">Floors</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{floors.length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase">Active Staff</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{staff.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Staff Management</h3>
              <p className="text-sm text-slate-500">Hire staff to run your hotel. They cost money up front and take a daily salary.</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="border border-slate-200 rounded p-4 text-center">
                <h4 className="font-bold text-slate-800 mb-1">Receptionist</h4>
                <p className="text-xs text-slate-500 mb-3">Cost: $1,000 | Salary: $100</p>
                <button 
                  onClick={() => hireStaff('receptionist')}
                  disabled={money < 1000}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  Hire Receptionist
                </button>
              </div>
              <div className="border border-slate-200 rounded p-4 text-center">
                <h4 className="font-bold text-slate-800 mb-1">Cleaner</h4>
                <p className="text-xs text-slate-500 mb-3">Cost: $500 | Salary: $50</p>
                <button 
                  onClick={() => hireStaff('cleaner')}
                  disabled={money < 500}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  Hire Cleaner
                </button>
              </div>
              <div className="border border-slate-200 rounded p-4 text-center">
                <h4 className="font-bold text-slate-800 mb-1">Manager</h4>
                <p className="text-xs text-slate-500 mb-3">Cost: $2,000 | Salary: $200</p>
                <button 
                  onClick={() => hireStaff('manager')}
                  disabled={money < 2000}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  Hire Manager
                </button>
              </div>
            </div>

            {staff.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Current Staff</h4>
                <div className="space-y-2">
                  {staff.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{s.role}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <select 
                          value={s.currentTask || 'Idle'} 
                          onChange={(e) => assignTask(s.id, e.target.value as any)}
                          className="px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="Idle">Idle</option>
                          <option value="Clean Room">Clean Room</option>
                          <option value="Maintain Elevator">Maintain Elevator</option>
                          <option value="Check-in Guests">Check-in Guests</option>
                          <option value="Patrol">Patrol</option>
                        </select>
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm font-bold text-slate-700">Salary: ${s.salary}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Guest Visitors</h3>
              <p className="text-sm text-slate-500">Live monitoring of guests in your hotel.</p>
            </div>
          </div>
          <div className="p-5">
            {useHotelStore().guests.length > 0 ? (
              <div className="space-y-2">
                {useHotelStore().guests.map(g => (
                  <div key={g.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-800">{g.name}</p>
                      <p className="text-xs text-slate-500">Floor: {g.floorIndex}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                        g.state === 'in-room' ? 'bg-blue-100 text-blue-700' :
                        g.state === 'checking-in' ? 'bg-emerald-100 text-emerald-700' :
                        g.state === 'checking-out' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {g.state.replace(/-/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No guests currently in the hotel. Ensure you have Reception and Beds.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Dynamic Pricing</h3>
            <p className="text-sm text-slate-500">Set base nightly rates for different room types.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Standard Room Rate</p>
                <p className="text-xs text-slate-500">Base rate for regular beds.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">$</span>
                <input 
                  type="number" 
                  min="10" 
                  max="1000"
                  value={useHotelStore().roomRates?.standard || 50} 
                  onChange={(e) => useHotelStore.getState().setRoomRate('standard', parseInt(e.target.value) || 50)}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Suite Rate</p>
                <p className="text-xs text-slate-500">Premium rate for high-end rooms.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">$</span>
                <input 
                  type="number" 
                  min="50" 
                  max="5000"
                  value={useHotelStore().roomRates?.suite || 120} 
                  onChange={(e) => useHotelStore.getState().setRoomRate('suite', parseInt(e.target.value) || 120)}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Quick Actions & Presets</h3>
            <p className="text-sm text-slate-500">Load a pre-designed layout. Warning: This will overwrite your current project.</p>
          </div>
          <div className="p-5">
            <div className="mb-6 p-4 border border-violet-200 bg-violet-50 rounded-xl">
              <h4 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
                <span className="text-lg">✨</span> Generate AI Hotel (Free via OpenRouter)
              </h4>
              <p className="text-xs text-violet-600 mb-3">Uses Llama 3.3 70B Instruct Free tier on OpenRouter.</p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const prompt = (e.target as any).prompt.value;
                  if (!prompt) return;
                  
                  const btn = (e.target as any).submitBtn;
                  const prevText = btn.innerText;
                  btn.innerText = "Generating...";
                  btn.disabled = true;

                  try {
                    const res = await fetch('/api/generate-hotel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt })
                    });
                    const data = await res.json();
                    if (data.grid) {
                      // Custom action to overwrite floor 0
                      useHotelStore.setState((state) => {
                        const newFloors = [...state.floors];
                        // Need to parse string array back into TileType array
                        const charToTile: Record<string, any> = {
                          ' ': 'empty', '.': 'floor', '#': 'wall', 'D': 'door', 'W': 'window',
                          'B': 'bed', 'b': 'bathroom', 'R': 'reception', 'S': 'staff', 'P': 'plant',
                          'T': 'table', 'E': 'elevator'
                        };
                        const grid = data.grid.map((row: string) => 
                          row.split('').map(c => charToTile[c] || 'empty')
                        );
                        newFloors[0] = { level: 0, name: 'AI Generated Floor', grid, labels: data.labels || [] };
                        return { floors: newFloors, activeFloorIndex: 0 };
                      });
                    } else {
                      alert("Failed to generate: " + JSON.stringify(data));
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Error generating hotel.");
                  } finally {
                    btn.innerText = prevText;
                    btn.disabled = false;
                  }
                }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  name="prompt"
                  placeholder="e.g. A small motel with 5 rooms and a cafe" 
                  className="flex-1 px-3 py-2 rounded border border-violet-200 focus:outline-none focus:border-violet-400 text-sm"
                />
                <button name="submitBtn" type="submit" className="px-4 py-2 bg-violet-600 text-white rounded text-sm font-bold hover:bg-violet-700 transition-colors">
                  Generate
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => { loadPreset('small-hotel'); }}
                className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ArrowDownToLine size={24} /></div>
                <div>
                  <h4 className="font-bold text-slate-800">Small Hotel</h4>
                  <p className="text-xs text-slate-500">2 Floors: Lobby & Standard Rooms</p>
                </div>
              </button>

            <button 
              onClick={() => { loadPreset('luxury-suite'); }}
              className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
            >
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><ArrowDownToLine size={24} /></div>
              <div>
                <h4 className="font-bold text-slate-800">Luxury Penthouse</h4>
                <p className="text-xs text-slate-500">1 Floor: Spacious layout</p>
              </div>
            </button>
            
              <button 
                onClick={() => { loadPreset('auto-preset'); }}
                className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
              >
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><ArrowDownToLine size={24} /></div>
                <div>
                  <h4 className="font-bold text-slate-800">Auto Base</h4>
                  <p className="text-xs text-slate-500">1 Floor: 3 Rooms, Reception, Staff</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Floor Details</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {floors.map((floor, i) => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{floor.name || `Level ${floor.level}`}</h4>
                  <p className="text-xs text-slate-500">Labels: {floor.labels?.length || 0}</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    <CheckCircle size={14} /> Validated
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
