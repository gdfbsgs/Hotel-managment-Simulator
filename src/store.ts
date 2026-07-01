import { create } from 'zustand';
import { Floor, TileType, ViewMode, Label, AppMode, StaffNPC, GuestNPC, HotelData, StaffTask, RoomRates } from './types';
import { PRESETS } from './presets';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from './firebase';

const GRID_SIZE = 20;

const createEmptyGrid = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('empty'));

interface HotelStore {
  user: User | null;
  floors: Floor[];
  money: number;
  staff: StaffNPC[];
  guests: GuestNPC[];
  activeFloorIndex: number;
  viewMode: ViewMode;
  appMode: AppMode;
  selectedTool: TileType | 'eraser' | 'text';
  roomRates: RoomRates;
  
  setUser: (user: User | null) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  saveToCloud: () => Promise<void>;
  loadFromCloud: (uid: string) => Promise<void>;

  hireStaff: (role: StaffNPC['role']) => void;
  assignTask: (staffId: string, task: StaffTask) => void;
  setRoomRate: (type: 'standard' | 'suite', rate: number) => void;
  addMoney: (amount: number) => void;
  tickNPCs: () => void;
  processGuests: () => void;

  setTile: (x: number, y: number, type: TileType | 'eraser') => void;
  addLabel: (floorIndex: number, label: Label) => void;
  removeLabel: (floorIndex: number, id: string) => void;
  addFloor: () => void;
  setActiveFloor: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setAppMode: (mode: AppMode) => void;
  setSelectedTool: (tool: TileType | 'eraser' | 'text') => void;
  loadPreset: (presetId: string) => void;
  resetAll: () => void;
}

export const useHotelStore = create<HotelStore>((set, get) => ({
  user: null,
  floors: [{ level: 0, name: 'Ground Floor', grid: createEmptyGrid(), labels: [] }],
  money: 10000,
  staff: [],
  guests: [],
  activeFloorIndex: 0,
  viewMode: '2D',
  appMode: 'Design',
  selectedTool: 'floor',
  roomRates: { standard: 50, suite: 120 },

  setUser: (user) => set({ user }),
  
  login: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      set({ user: result.user });
      await get().loadFromCloud(result.user.uid);
    } catch (error) {
      console.error("Login failed", error);
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
    get().loadPreset('auto-preset'); // load default on logout
  },

  saveToCloud: async () => {
    const { user, floors, money, staff, guests, roomRates } = get();
    if (!user) return;
    try {
      const data: HotelData = { floors, money, staff, guests, roomRates };
      await setDoc(doc(db, 'hotels', user.uid), data);
      alert('Saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    }
  },

  loadFromCloud: async (uid) => {
    try {
      const docSnap = await getDoc(doc(db, 'hotels', uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as HotelData;
        set({ 
          floors: data.floors, 
          money: data.money || 10000, 
          staff: data.staff || [], 
          guests: data.guests || [],
          roomRates: data.roomRates || { standard: 50, suite: 120 },
          activeFloorIndex: 0 
        });
      } else {
        // new user, auto-load preset
        get().loadPreset('auto-preset');
        get().saveToCloud(); // save it right away
      }
    } catch (e) {
      console.error(e);
    }
  },

  setRoomRate: (type, rate) => set((state) => ({
    roomRates: { ...state.roomRates, [type]: rate }
  })),

  hireStaff: (role) => set((state) => {
    const costs = { receptionist: 1000, cleaner: 500, manager: 2000 };
    const cost = costs[role];
    if (state.money >= cost) {
      const newStaff: StaffNPC = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Staff ${state.staff.length + 1}`,
        role,
        salary: cost / 10
      };
      return { money: state.money - cost, staff: [...state.staff, newStaff] };
    }
    return state;
  }),

  assignTask: (staffId, task) => set((state) => ({
    staff: state.staff.map(s => s.id === staffId ? { ...s, currentTask: task } : s)
  })),

  addMoney: (amount) => set((state) => ({ money: state.money + amount })),

  processGuests: () => set((state) => {
    // Basic tick logic to earn money from guests
    let newMoney = state.money;
    let capacity = 0;
    
    // Calculate capacity based on beds
    state.floors.forEach(f => {
      f.grid.forEach(row => {
        row.forEach(cell => {
          if (cell === 'bed') capacity += 2; // Assuming double beds mostly
        });
      });
    });

    const inRoomCount = state.guests.filter(g => g.state === 'in-room').length;
    // Assuming half standard, half suite for demo purposes since we don't track room types strictly on tiles yet
    const standardIncome = Math.ceil(inRoomCount / 2) * (state.roomRates?.standard || 50);
    const suiteIncome = Math.floor(inRoomCount / 2) * (state.roomRates?.suite || 100);
    const income = standardIncome + suiteIncome; 
    const expenses = state.staff.reduce((acc, s) => acc + s.salary, 0);
    newMoney = newMoney + income - expenses;

    return { money: newMoney };
  }),

  tickNPCs: () => set((state) => {
    let newGuests = [...state.guests];
    
    // Spawn new guests occasionally
    let bedCount = 0;
    state.floors.forEach(f => f.grid.forEach(r => r.forEach(c => { if (c === 'bed') bedCount++; })));
    const capacity = bedCount * 2;
    
    if (newGuests.length < capacity && Math.random() < 0.1) {
      // Find reception
      let receptionX = 10, receptionY = 10, receptionFloor = 0;
      let foundReception = false;
      for (let f = 0; f < state.floors.length; f++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            if (state.floors[f].grid[y][x] === 'reception') {
              receptionX = x; receptionY = y; receptionFloor = f;
              foundReception = true; break;
            }
          }
          if (foundReception) break;
        }
        if (foundReception) break;
      }
      
      newGuests.push({
        id: Math.random().toString(36).substr(2, 9),
        name: `Guest ${Math.floor(Math.random() * 1000)}`,
        stayDuration: 0,
        spent: 0,
        state: 'checking-in',
        x: 10, y: 19, // Spawn at bottom center
        floorIndex: 0,
        targetX: receptionX,
        targetY: receptionY
      });
    }

    newGuests = newGuests.map(guest => {
      const g = { ...guest };
      g.stayDuration++;

      // Randomly get a need if they don't have one and are in a valid state
      if (!g.need || g.need === 'none') {
        if (Math.random() < 0.05 && (g.state === 'in-room' || g.state === 'wandering')) {
          g.need = Math.random() > 0.5 ? 'hungry' : 'tired';
        }
      } else {
        // Resolve need after some time
        if (Math.random() < 0.1) {
           g.need = 'none';
        }
      }
      
      // Move towards target
      if (g.targetX !== undefined && g.targetY !== undefined) {
        const dx = g.targetX - g.x;
        const dy = g.targetY - g.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0.5) {
          g.x += (dx / dist) * 0.5;
          g.y += (dy / dist) * 0.5;
        } else {
          // Reached target
          if (g.state === 'checking-in') {
            g.state = 'going-to-room';
            // Find a bed
            let foundBed = false;
            for (let f = 0; f < state.floors.length; f++) {
              for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                  if (state.floors[f].grid[y][x] === 'bed' && !newGuests.some(og => og.id !== g.id && og.targetX === x && og.targetY === y)) {
                    g.targetX = x; g.targetY = y;
                    g.floorIndex = f;
                    foundBed = true; break;
                  }
                }
                if (foundBed) break;
              }
              if (foundBed) break;
            }
            if (!foundBed) {
              g.state = 'leaving';
              g.targetX = 10; g.targetY = 19; g.floorIndex = 0;
            }
          } else if (g.state === 'going-to-room') {
            g.state = 'in-room';
            g.targetX = undefined; g.targetY = undefined;
          } else if (g.state === 'checking-out') {
            g.state = 'leaving';
            g.targetX = 10; g.targetY = 19; g.floorIndex = 0;
          } else if (g.state === 'leaving') {
            return { ...g, state: 'done' as GuestState }; // mark for removal
          }
        }
      } else if (g.state === 'in-room') {
        if (g.stayDuration > 30) { // Stay for 30 ticks
          g.state = 'checking-out';
          // Find reception again
          let receptionX = 10, receptionY = 10, receptionFloor = 0;
          for (let f = 0; f < state.floors.length; f++) {
            for (let y = 0; y < GRID_SIZE; y++) {
              for (let x = 0; x < GRID_SIZE; x++) {
                if (state.floors[f].grid[y][x] === 'reception') {
                  receptionX = x; receptionY = y; receptionFloor = f; break;
                }
              }
            }
          }
          g.targetX = receptionX; g.targetY = receptionY;
          g.floorIndex = receptionFloor;
        }
      } else if (g.state === 'wandering') {
        // Not really using wandering, but maybe later
      }
      
      return g;
    });

    // Remove guests that are done
    newGuests = newGuests.filter(g => (g.state as any) !== 'done');

    return { guests: newGuests };
  }),

  setTile: (x, y, tool) => set((state) => {
    if (tool === 'text') return state; // handled by addLabel
    
    // Auto-place elevators on all floors
    if (tool === 'elevator') {
       const newFloors = state.floors.map(floor => {
          const newGrid = [...floor.grid];
          newGrid[y] = [...newGrid[y]];
          newGrid[y][x] = 'elevator';
          return { ...floor, grid: newGrid };
       });
       return { floors: newFloors };
    }

    const newFloors = [...state.floors];
    const newGrid = [...newFloors[state.activeFloorIndex].grid];
    newGrid[y] = [...newGrid[y]];
    newGrid[y][x] = tool === 'eraser' ? 'empty' : tool;
    newFloors[state.activeFloorIndex] = { ...newFloors[state.activeFloorIndex], grid: newGrid };
    return { floors: newFloors };
  }),

  addLabel: (floorIndex, label) => set((state) => {
    const newFloors = [...state.floors];
    const floor = newFloors[floorIndex];
    const newLabels = [...(floor.labels || []), label];
    newFloors[floorIndex] = { ...floor, labels: newLabels };
    return { floors: newFloors };
  }),

  removeLabel: (floorIndex, id) => set((state) => {
    const newFloors = [...state.floors];
    const floor = newFloors[floorIndex];
    if (!floor.labels) return state;
    newFloors[floorIndex] = { ...floor, labels: floor.labels.filter(l => l.id !== id) };
    return { floors: newFloors };
  }),

  addFloor: () => set((state) => {
    const prevGrid = state.floors[state.floors.length - 1]?.grid;
    const newGrid = createEmptyGrid();
    
    // Copy elevators up
    if (prevGrid) {
      for (let y = 0; y < prevGrid.length; y++) {
        for (let x = 0; x < prevGrid[y].length; x++) {
          if (prevGrid[y][x] === 'elevator') {
            newGrid[y][x] = 'elevator';
          }
        }
      }
    }

    return {
      floors: [...state.floors, { level: state.floors.length, name: `Level ${state.floors.length}`, grid: newGrid, labels: [] }],
      activeFloorIndex: state.floors.length
    };
  }),

  setActiveFloor: (index) => set({ activeFloorIndex: index }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAppMode: (mode) => set({ appMode: mode }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  loadPreset: (presetId) => set((state) => {
    if (PRESETS[presetId]) {
      const floors = JSON.parse(JSON.stringify(PRESETS[presetId]));
      return { floors, activeFloorIndex: 0, appMode: 'Design', viewMode: '2D' };
    }
    return state;
  }),

  resetAll: () => set({ floors: [{ level: 0, name: 'Ground Floor', grid: createEmptyGrid(), labels: [] }], activeFloorIndex: 0, money: 10000, staff: [], guests: [] })
}));
