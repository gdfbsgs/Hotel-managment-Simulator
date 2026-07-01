export type TileType = 'empty' | 'floor' | 'wall' | 'door' | 'window' | 'bed' | 'reception' | 'plant' | 'table' | 'elevator' | 'bathroom' | 'staff';

export interface Label {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface Floor {
  level: number;
  name?: string;
  grid: TileType[][];
  labels?: Label[];
}

export type ViewMode = '2D' | '3D' | 'Walk';
export type AppMode = 'Design' | 'Management' | 'Analytics';

export type StaffTask = 'Idle' | 'Clean Room' | 'Maintain Elevator' | 'Check-in Guests' | 'Patrol';

export interface StaffNPC {
  id: string;
  name: string;
  role: 'receptionist' | 'cleaner' | 'manager';
  salary: number;
  currentTask?: StaffTask;
}

export type GuestState = 'wandering' | 'checking-in' | 'going-to-room' | 'in-room' | 'checking-out' | 'leaving';

export interface GuestNPC {
  id: string;
  name: string;
  roomAssigned?: string;
  stayDuration: number;
  spent: number;
  state: GuestState;
  need?: 'hungry' | 'tired' | 'none';
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  floorIndex: number;
}

export interface RoomRates {
  standard: number;
  suite: number;
}

export interface HotelData {
  floors: Floor[];
  money: number;
  staff: StaffNPC[];
  guests: GuestNPC[];
  name?: string;
  roomRates?: RoomRates;
}
