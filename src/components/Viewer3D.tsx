import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useHotelStore } from '../store';
import { TileType } from '../types';
import { ChevronUp, ChevronDown, Move, Eye, Volume2, VolumeX, Flame, ShieldAlert, Music, Radio, Tv, Activity, X } from 'lucide-react';

const GRID_SIZE = 20;
const TILE_SIZE = 2;
const WALL_HEIGHT = 5.2; // Majestic, high-ceiling luxury hotel walls (5.2 meters)
const FLOOR_HEIGHT = 0.1;

// --- WEB AUDIO API REALISTIC CHIMES & ELEVATOR LOUNGE MUSIC SYNTHESIZERS ---
let audioCtx: AudioContext | null = null;
let musicIntervalId: any = null;
let musicNodes: any[] = [];

const playElevatorChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    
    const now = ctx.currentTime;
    // Premium double-tone electronic ding-dong chime
    playTone(523.25, now, 0.45); // C5
    playTone(659.25, now + 0.15, 0.6); // E5
  } catch (e) {
    console.warn("Audio chime disabled:", e);
  }
};

const startElevatorMusic = () => {
  try {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    
    let step = 0;
    // Elegant warm lounge jazz arpeggio progression (Gmaj7 -> Cmaj7 -> Amin7 -> D7)
    const progressions = [
      [196.00, 246.94, 293.66, 392.00], // Gmaj7
      [261.63, 329.63, 392.00, 523.25], // Cmaj7
      [220.00, 261.63, 329.63, 440.00], // Amin7
      [293.66, 369.99, 440.00, 587.33], // D7
    ];
    
    const tick = () => {
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const chord = progressions[step % progressions.length];
      step++;
      
      chord.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        
        osc.type = 'sine';
        // Delay notes slightly for a realistic Rhodes electric piano arpeggiated lounge feel
        const noteStart = now + idx * 0.12;
        osc.frequency.setValueAtTime(freq, noteStart);
        
        gain.gain.setValueAtTime(0.03, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 1.2);
        
        osc.start(noteStart);
        osc.stop(noteStart + 1.3);
        musicNodes.push(osc);
      });
    };
    
    tick();
    musicIntervalId = setInterval(tick, 1500);
  } catch (e) {
    console.warn("Music failed:", e);
  }
};

const stopElevatorMusic = () => {
  if (musicIntervalId) {
    clearInterval(musicIntervalId);
    musicIntervalId = null;
  }
  musicNodes.forEach(node => {
    try { node.stop(); } catch(e) {}
  });
  musicNodes = [];
  if (audioCtx) {
    try { audioCtx.close(); } catch(e) {}
    audioCtx = null;
  }
};

const triggerEmergencyAlarm = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    
    // Siren pitch modulation
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.3);
    osc.frequency.linearRampToValueAtTime(800, now + 0.6);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {
    console.warn("Alarm chime failed:", e);
  }
};

// --- HIGH FIDELITY PROCEDURAL TEXTURE GENERATORS ---
const createTerrazzoTexture = (color = '#334155', textureType = 'terrazzo') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Base floor color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);
  
  if (textureType === 'terrazzo') {
    // Tiled grid line overlay (luxury large terrazzo tiles)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 512);
    
    // Chips
    const chips = ['#f59e0b', '#cbd5e1', '#b45309', '#1e293b', '#e2e8f0', '#f43f5e', '#10b981'];
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = chips[Math.floor(Math.random() * chips.length)];
      ctx.beginPath();
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 9;
      const sides = 3 + Math.floor(Math.random() * 5);
      for (let s = 0; s <= sides; s++) {
        const angle = (s / sides) * Math.PI * 2;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.fill();
    }
  } else if (textureType === 'carpet') {
    // Cozy carpet grain
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 3000; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 1500; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
  } else if (textureType === 'parquet') {
    // Wooden Parquet
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    const size = 64;
    ctx.beginPath();
    for (let y = 0; y < 512; y += size) {
      for (let x = 0; x < 512; x += size) {
        ctx.strokeRect(x, y, size, size);
        // Draw wood grains inside each square block
        const dir = ((x / size) + (y / size)) % 2 === 0; // Alternating direction
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + 2, y + 2, size - 4, size - 4);
        ctx.clip();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1.5;
        if (dir) {
          // Vertical grain
          for (let gx = x + 4; gx < x + size; gx += 6) {
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx + (Math.random() - 0.5) * 4, y + size);
            ctx.stroke();
          }
        } else {
          // Horizontal grain
          for (let gy = y + 4; gy < y + size; gy += 6) {
            ctx.beginPath();
            ctx.moveTo(x, gy);
            ctx.lineTo(x + size, gy + (Math.random() - 0.5) * 4);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }
  } else if (textureType === 'marble') {
    // Elegant Marble veins
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      let sx = Math.random() * 512;
      let sy = 0;
      ctx.moveTo(sx, sy);
      while (sy < 512) {
        sx += (Math.random() - 0.5) * 40;
        sy += 20 + Math.random() * 30;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    // Minor darker veins
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let sx = 0;
      let sy = Math.random() * 512;
      ctx.moveTo(sx, sy);
      while (sx < 512) {
        sx += 20 + Math.random() * 30;
        sy += (Math.random() - 0.5) * 40;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
};

const createWoodTexture = (baseColor = '#7c2d12', grainColor = '#451a03') => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);
  
  ctx.strokeStyle = grainColor;
  ctx.lineWidth = 2;
  // Draw organic flowing mahogany wood grains
  for (let y = 0; y < 256; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < 256; x += 10) {
      const offset = Math.sin(x * 0.05 + y * 0.08) * 3.5 + Math.cos(x * 0.02) * 2;
      ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createWallTexture = (color = '#1e293b', textureType = 'concrete') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);
  
  if (textureType === 'concrete') {
    // Fine concrete grain speckles
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2.5, 2.5);
    }
    // Grooves
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let y = 0; y <= 512; y += 128) {
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
    }
    ctx.stroke();
  } else if (textureType === 'brick') {
    // Draw brick pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 3;
    const rows = 16;
    const cols = 8;
    const rh = 512 / rows;
    const cw = 512 / cols;
    ctx.beginPath();
    for (let i = 0; i <= rows; i++) {
      ctx.moveTo(0, i * rh);
      ctx.lineTo(512, i * rh);
    }
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (cw / 2);
      for (let c = 0; c <= cols + 1; c++) {
        ctx.moveTo(c * cw - offset, r * rh);
        ctx.lineTo(c * cw - offset, (r + 1) * rh);
      }
    }
    ctx.stroke();
    // Shadow overlay
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 150; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
  } else if (textureType === 'wood') {
    // Wooden planks
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let y = 0; y <= 512; y += 64) {
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
    }
    ctx.stroke();
    // Fine grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 16) {
        const offset = Math.sin(x * 0.03 + y * 0.05) * 2;
        ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
    }
  } else if (textureType === 'plaster') {
    // Stucco Plaster
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < 2000; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 1000; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (textureType === 'stone') {
    // Stacked Stone Wall
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < 512; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) {
        const rx = x + (Math.random() - 0.5) * 12;
        const ry = y + (Math.random() - 0.5) * 8;
        ctx.lineTo(rx, ry);
      }
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 48) {
      for (let x = 24; x < 512; x += 64) {
        const offset = (Math.random() - 0.5) * 16;
        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset + (Math.random() - 0.5) * 10, y + 48);
        ctx.stroke();
      }
    }
  } else if (textureType === 'stripes') {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 16, 512);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < 512; x += 8) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
    }
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createFabricTexture = (color = '#ffffff') => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);
  
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1;
  // Cross-hatch vertical fabric weaving lines
  for (let x = 0; x < 128; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  // Cross-hatch horizontal fabric weaving lines
  for (let y = 0; y < 128; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

const createBathroomTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Luxury aquamarine-cyan glassy tiles
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(0, 0, 256, 256);
  
  // Elegant grout lines
  ctx.strokeStyle = '#ecfeff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 256; i += 32) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
  }
  ctx.stroke();
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// --- SINGLETON CACHED TEXTURE ACCESSORS FOR HIGH PERFORMANCE ---
const terrazzoTextureMap = new Map<string, THREE.CanvasTexture>();
const getTerrazzoTexture = (color = '#334155', texture = 'terrazzo') => {
  const key = `${color}-${texture}`;
  if (!terrazzoTextureMap.has(key)) {
    terrazzoTextureMap.set(key, createTerrazzoTexture(color, texture));
  }
  return terrazzoTextureMap.get(key)!;
};

const wallTextureMap = new Map<string, THREE.CanvasTexture>();
const getWallTexture = (color = '#1e293b', texture = 'concrete') => {
  const key = `${color}-${texture}`;
  if (!wallTextureMap.has(key)) {
    wallTextureMap.set(key, createWallTexture(color, texture));
  }
  return wallTextureMap.get(key)!;
};

let cachedMahogany: THREE.CanvasTexture | null = null;
let cachedWood: THREE.CanvasTexture | null = null;
let cachedFabricSheets: THREE.CanvasTexture | null = null;
let cachedBathroom: THREE.CanvasTexture | null = null;

const getMahoganyTexture = () => {
  if (!cachedMahogany) cachedMahogany = createWoodTexture('#451a03', '#1c0a00');
  return cachedMahogany;
};
const getWoodTexture = () => {
  if (!cachedWood) cachedWood = createWoodTexture('#b45309', '#78350f');
  return cachedWood;
};
const getFabricSheetsTexture = () => {
  if (!cachedFabricSheets) cachedFabricSheets = createFabricTexture('#f8fafc');
  return cachedFabricSheets;
};

const fabricBlanketMap = new Map<string, THREE.CanvasTexture>();
const getFabricBlanketTexture = (color = '#e11d48') => {
  if (!fabricBlanketMap.has(color)) {
    fabricBlanketMap.set(color, createFabricTexture(color));
  }
  return fabricBlanketMap.get(color)!;
};

const getBathroomTexture = () => {
  if (!cachedBathroom) cachedBathroom = createBathroomTexture();
  return cachedBathroom;
};

interface FpsControlsProps {
  joystickRef: React.RefObject<{ x: number; y: number }>;
}

const FpsControls: React.FC<FpsControlsProps> = ({ joystickRef }) => {
  const { camera } = useThree();
  const { activeFloorIndex, floors, spectatorMode, openDoors } = useHotelStore();
  const keys = useRef<{ [key: string]: boolean }>({});
  
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isDragging = useRef(false);
  const draggingPointerId = useRef<number | null>(null);
  const prevX = useRef(0);
  const prevY = useRef(0);
  const bobTimer = useRef(0);

  useEffect(() => {
    const activeFloor = floors[activeFloorIndex];
    let spawnGx = 10;
    let spawnGy = 16;
    let foundSpawn = false;
    
    if (activeFloor) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const tile = activeFloor.grid[y][x];
          if (tile === 'floor' || tile === 'reception' || tile === 'elevator') {
            spawnGx = x;
            spawnGy = y;
            foundSpawn = true;
            break;
          }
        }
        if (foundSpawn) break;
      }
    }
    
    const spawnX = spawnGx * TILE_SIZE + TILE_SIZE / 2 - 20;
    const spawnZ = spawnGy * TILE_SIZE + TILE_SIZE / 2 - 20;
    const eyeHeight = activeFloorIndex * WALL_HEIGHT + 1.7; // Realistic human eye level (1.7m)
    camera.position.set(spawnX, eyeHeight, spawnZ);
    
    // Facing forward (straight ahead / slightly downward to see the reception)
    yaw.current = 0;
    pitch.current = -0.05;
    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch.current, yaw.current, 0);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      keys.current[e.key.toLowerCase()] = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.no-pointer-lock') || target.closest('.joystick-container')) {
        return;
      }
      if (draggingPointerId.current === null) {
        draggingPointerId.current = e.pointerId;
        isDragging.current = true;
        prevX.current = e.clientX;
        prevY.current = e.clientY;
        try {
          target.setPointerCapture(e.pointerId);
        } catch (err) {}
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || e.pointerId !== draggingPointerId.current) return;
      const deltaX = e.clientX - prevX.current;
      const deltaY = e.clientY - prevY.current;
      prevX.current = e.clientX;
      prevY.current = e.clientY;

      yaw.current -= deltaX * 0.0035; // smooth look sensitivity
      pitch.current -= deltaY * 0.0035;
      pitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch.current)); // clamp gaze
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId === draggingPointerId.current) {
        isDragging.current = false;
        draggingPointerId.current = null;
        try {
          const target = e.target as HTMLElement;
          target.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    };

    const handlePointerCancel = (e: PointerEvent) => {
      if (e.pointerId === draggingPointerId.current) {
        isDragging.current = false;
        draggingPointerId.current = null;
        try {
          const target = e.target as HTMLElement;
          target.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [camera, activeFloorIndex]);

  useFrame((state, delta) => {
    const speed = 7.5 * delta;
    let isMoving = false;
    
    let forward = 0;
    let strafe = 0;
    
    if (keys.current['KeyW'] || keys.current['ArrowUp'] || keys.current['w']) forward += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown'] || keys.current['s']) forward -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight'] || keys.current['d']) strafe += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft'] || keys.current['a']) strafe -= 1;
    
    if (joystickRef.current) {
      if (Math.abs(joystickRef.current.y) > 0.05) {
        // INVERT MOBILE JOYSTICK: pushing forward (negative y on stick) now correctly walks forward!
        forward += -joystickRef.current.y;
      }
      if (Math.abs(joystickRef.current.x) > 0.05) {
        strafe += joystickRef.current.x;
      }
    }
    
    if (forward !== 0 || strafe !== 0) {
      isMoving = true;
    }
    
    // Calculate precise directional vectors relative to camera's orientation
    const forwardVec = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current));
    forwardVec.negate(); // Invert because looking at negative Z is yaw = 0

    const rightVec = new THREE.Vector3();
    rightVec.crossVectors(forwardVec, new THREE.Vector3(0, 1, 0)).normalize();

    const dir = new THREE.Vector3();
    dir.addScaledVector(forwardVec, forward);
    dir.addScaledVector(rightVec, strafe);

    if (isMoving) {
      dir.normalize().multiplyScalar(speed);
    }
    
    // Orient the camera using the 'YXZ' rotation standard to avoid tilting artifacts
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = 0;
    
    // --- NO WALK THROUGH WALLS COLLISION SYSTEM WITH SLIDING VECTOR MECHANICS ---
    const checkCollision = (pos: THREE.Vector3) => {
      if (spectatorMode) return false; // Noclip flight bypass!
      
      const radius = 0.55; // Realistic human collision thickness radius
      const activeFloor = floors[activeFloorIndex];
      if (!activeFloor) return false;

      // Cast checks in an 8-axis perimeter ring
      const angles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];
      for (const angle of angles) {
        const testX = pos.x + Math.cos(angle) * radius;
        const testZ = pos.z + Math.sin(angle) * radius;

        // Map world coordinates back to layout grid coords
        const gx = Math.floor((testX + 20) / 2);
        const gy = Math.floor((testZ + 20) / 2);

        if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
          const tile = activeFloor.grid[gy]?.[gx];
          if (tile === 'wall') {
            return true; // Collision detected!
          }
          if (tile === 'door') {
            const doorKey = `${activeFloorIndex}-${gx}-${gy}`;
            const isOpened = openDoors[doorKey] || false;
            if (!isOpened) {
              return true; // CLOSED DOOR BLOCKS!
            }
          }
        } else {
          // Prevent walking outside extreme boundary limits
          if (Math.abs(testX) > 20 || Math.abs(testZ) > 20) {
            return true;
          }
        }
      }
      return false;
    };

    let nextPosition = camera.position.clone().add(dir);
    if (isMoving) {
      if (checkCollision(nextPosition)) {
        // Smooth slide along X axis
        const slideX = camera.position.clone();
        slideX.x += dir.x;
        if (!checkCollision(slideX)) {
          nextPosition = slideX;
        } else {
          // Smooth slide along Z axis
          const slideZ = camera.position.clone();
          slideZ.z += dir.z;
          if (!checkCollision(slideZ)) {
            nextPosition = slideZ;
          } else {
            // Block completely if wedged in a corner
            nextPosition = camera.position.clone();
          }
        }
      }
      camera.position.x = nextPosition.x;
      camera.position.z = nextPosition.z;
    }
    
    if (spectatorMode) {
      // In spectator mode, key Space/E flies up, key Shift/Q flies down!
      let lift = 0;
      if (keys.current['Space'] || keys.current['KeyE']) lift += 1;
      if (keys.current['ShiftLeft'] || keys.current['ShiftRight'] || keys.current['KeyQ']) lift -= 1;
      camera.position.y += lift * 5 * delta;
    } else {
      // Immersive head bobbing animation for realistic stride feel
      if (isMoving) {
        bobTimer.current += delta * 11;
      } else {
        bobTimer.current = Math.max(0, bobTimer.current - delta * 5);
      }
      const bobOffset = isMoving ? Math.sin(bobTimer.current) * 0.07 : 0;
      
      const baseFloorY = activeFloorIndex * WALL_HEIGHT;
      camera.position.y = baseFloorY + 1.7 + bobOffset;
    }
  });

  return null;
};

const getMergedBlocks = (grid: TileType[][], type: TileType, rotations?: number[][]) => {
  const height = grid.length;
  const width = grid[0].length;
  const visited = Array(height).fill(0).map(() => Array(width).fill(false));
  const blocks: {x: number, y: number, w: number, h: number, rotation: number}[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === type && !visited[y][x]) {
        const rVal = rotations?.[y]?.[x] ?? 0;
        let w = 1;
        while (x + w < width && grid[y][x + w] === type && !visited[y][x + w] && (rotations?.[y]?.[x + w] ?? 0) === rVal) {
          w++;
        }
        let h = 1;
        let canExpand = true;
        while (y + h < height && canExpand) {
          for (let i = 0; i < w; i++) {
            if (grid[y + h][x + i] !== type || visited[y + h][x + i] || (rotations?.[y + h][x + i] ?? 0) !== rVal) {
              canExpand = false;
              break;
            }
          }
          if (canExpand) h++;
        }
        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            visited[y + dy][x + dx] = true;
          }
        }
        blocks.push({ x, y, w, h, rotation: rVal });
      }
    }
  }
  return blocks;
};

const MergedBed = ({ x, y, w, h, grid, rotation = 0 }: { x: number, y: number, w: number, h: number, grid: TileType[][], rotation?: number }) => {
  const { graphicsQuality, floorColor, floorTexture, bedColor } = useHotelStore();
  const roughnessVal = graphicsQuality === 'ultra' ? 0.15 : graphicsQuality === 'high' ? 0.35 : graphicsQuality === 'medium' ? 0.6 : 0.95;

  let touchesTop = false, touchesBottom = false, touchesLeft = false, touchesRight = false;
  for (let i = 0; i < w; i++) {
    if (y > 0 && grid[y-1][x+i] === 'wall') touchesTop = true;
    if (y + h < grid.length && grid[y+h][x+i] === 'wall') touchesBottom = true;
  }
  for (let i = 0; i < h; i++) {
    if (x > 0 && grid[y+i][x-1] === 'wall') touchesLeft = true;
    if (x + w < grid[0].length && grid[y+i][x+w] === 'wall') touchesRight = true;
  }

  // Position of dual pillows, headboard, nightstands, and lamp relative to the frame
  let pillow1Pos: [number, number, number] = [-0.4, 0.72, -h * TILE_SIZE * 0.38];
  let pillow2Pos: [number, number, number] = [0.4, 0.72, -h * TILE_SIZE * 0.38];
  let headboardPos: [number, number, number] = [0, 0.9, -h * TILE_SIZE * 0.46];
  let headboardArgs: [number, number, number] = [w * TILE_SIZE * 0.9, 1.2, 0.1];
  
  let ns1Pos: [number, number, number] = [-w * TILE_SIZE * 0.45, 0.35, -h * TILE_SIZE * 0.38];
  let ns2Pos: [number, number, number] = [w * TILE_SIZE * 0.45, 0.35, -h * TILE_SIZE * 0.38];

  let sheetPos: [number, number, number] = [0, 0.46, -h * TILE_SIZE * 0.12];
  let sheetArgs: [number, number, number] = [w * TILE_SIZE * 0.82, 0.48, h * TILE_SIZE * 0.5];
  let blanketPos: [number, number, number] = [0, 0.48, h * TILE_SIZE * 0.12];
  let blanketArgs: [number, number, number] = [w * TILE_SIZE * 0.84, 0.5, h * TILE_SIZE * 0.55];

  if (touchesLeft && !touchesTop && !touchesBottom) {
    pillow1Pos = [-w * TILE_SIZE * 0.38, 0.72, -0.4];
    pillow2Pos = [-w * TILE_SIZE * 0.38, 0.72, 0.4];
    headboardPos = [-w * TILE_SIZE * 0.46, 0.9, 0];
    headboardArgs = [0.1, 1.2, h * TILE_SIZE * 0.9];
    ns1Pos = [-w * TILE_SIZE * 0.38, 0.35, -h * TILE_SIZE * 0.45];
    ns2Pos = [-w * TILE_SIZE * 0.38, 0.35, h * TILE_SIZE * 0.45];
    sheetPos = [-w * TILE_SIZE * 0.12, 0.46, 0];
    sheetArgs = [w * TILE_SIZE * 0.5, 0.48, h * TILE_SIZE * 0.82];
    blanketPos = [w * TILE_SIZE * 0.12, 0.48, 0];
    blanketArgs = [w * TILE_SIZE * 0.55, 0.5, h * TILE_SIZE * 0.84];
  } else if (touchesRight && !touchesTop && !touchesBottom) {
    pillow1Pos = [w * TILE_SIZE * 0.38, 0.72, -0.4];
    pillow2Pos = [w * TILE_SIZE * 0.38, 0.72, 0.4];
    headboardPos = [w * TILE_SIZE * 0.46, 0.9, 0];
    headboardArgs = [0.1, 1.2, h * TILE_SIZE * 0.9];
    ns1Pos = [w * TILE_SIZE * 0.38, 0.35, -h * TILE_SIZE * 0.45];
    ns2Pos = [w * TILE_SIZE * 0.38, 0.35, h * TILE_SIZE * 0.45];
    sheetPos = [w * TILE_SIZE * 0.12, 0.46, 0];
    sheetArgs = [w * TILE_SIZE * 0.5, 0.48, h * TILE_SIZE * 0.82];
    blanketPos = [-w * TILE_SIZE * 0.12, 0.48, 0];
    blanketArgs = [w * TILE_SIZE * 0.55, 0.5, h * TILE_SIZE * 0.84];
  } else if (touchesBottom && !touchesTop) {
    pillow1Pos = [-0.4, 0.72, h * TILE_SIZE * 0.38];
    pillow2Pos = [0.4, 0.72, h * TILE_SIZE * 0.38];
    headboardPos = [0, 0.9, h * TILE_SIZE * 0.46];
    headboardArgs = [w * TILE_SIZE * 0.9, 1.2, 0.1];
    ns1Pos = [-w * TILE_SIZE * 0.45, 0.35, h * TILE_SIZE * 0.38];
    ns2Pos = [w * TILE_SIZE * 0.45, 0.35, h * TILE_SIZE * 0.38];
    sheetPos = [0, 0.46, h * TILE_SIZE * 0.12];
    sheetArgs = [w * TILE_SIZE * 0.82, 0.48, h * TILE_SIZE * 0.5];
    blanketPos = [0, 0.48, -h * TILE_SIZE * 0.12];
    blanketArgs = [w * TILE_SIZE * 0.84, 0.5, h * TILE_SIZE * 0.55];
  }

  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;

  const fabricSheets = getFabricSheetsTexture();
  const fabricBlanket = getFabricBlanketTexture(bedColor);
  const woodTexture = getWoodTexture();

  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* 1. TERRAZZO FLOOR SLAB UNDERNEATH - matches standard flooring tile */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={roughnessVal} />
      </mesh>

      {/* 2. REALISTIC WOOD BED FRAME */}
      <mesh position={[0, 0.15 + FLOOR_HEIGHT, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.94, 0.2, h * TILE_SIZE * 0.94]} />
         <meshStandardMaterial map={woodTexture} roughness={0.6} />
      </mesh>

      {/* 3. HEADBOARD */}
      <mesh position={[headboardPos[0], headboardPos[1] + FLOOR_HEIGHT, headboardPos[2]]}>
        <boxGeometry args={headboardArgs} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>

      {/* 4. BED NIGHTSTANDS */}
      <mesh position={[ns1Pos[0], ns1Pos[1] + FLOOR_HEIGHT, ns1Pos[2]]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>
      <mesh position={[ns2Pos[0], ns2Pos[1] + FLOOR_HEIGHT, ns2Pos[2]]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial map={woodTexture} roughness={0.5} />
      </mesh>

      {/* 5. GLOWING BEDSIDE LAMPS */}
      {/* Lamp 1 */}
      <group position={[ns1Pos[0], ns1Pos[1] + 0.25 + FLOOR_HEIGHT, ns1Pos[2]]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.15, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
        {graphicsQuality !== 'low' && (
          <pointLight position={[0, 0.15, 0]} color="#f59e0b" intensity={0.5} distance={2.5} />
        )}
      </group>
      {/* Lamp 2 */}
      <group position={[ns2Pos[0], ns2Pos[1] + 0.25 + FLOOR_HEIGHT, ns2Pos[2]]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.15, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
        {graphicsQuality !== 'low' && (
          <pointLight position={[0, 0.15, 0]} color="#f59e0b" intensity={0.5} distance={2.5} />
        )}
      </group>

      {/* 6. COZY LAYERED MATTRESS & BLANKET */}
      {/* White Base Sheets Mattress */}
      <mesh position={[sheetPos[0], sheetPos[1] + FLOOR_HEIGHT, sheetPos[2]]}>
        <boxGeometry args={sheetArgs} />
        <meshStandardMaterial map={fabricSheets} roughness={0.9} />
      </mesh>
      {/* Folded Crimson Blanket */}
      <mesh position={[blanketPos[0], blanketPos[1] + FLOOR_HEIGHT, blanketPos[2]]}>
        <boxGeometry args={blanketArgs} />
        <meshStandardMaterial map={fabricBlanket} roughness={0.85} />
      </mesh>

      {/* 7. DUAL FLUFFY PILLOWS */}
      <mesh position={[pillow1Pos[0], pillow1Pos[1] + FLOOR_HEIGHT, pillow1Pos[2]]}>
        <boxGeometry args={[0.42, 0.08, 0.28]} />
        <meshStandardMaterial map={fabricSheets} roughness={0.95} />
      </mesh>
      <mesh position={[pillow2Pos[0], pillow2Pos[1] + FLOOR_HEIGHT, pillow2Pos[2]]}>
        <boxGeometry args={[0.42, 0.08, 0.28]} />
        <meshStandardMaterial map={fabricSheets} roughness={0.95} />
      </mesh>
    </group>
  );
};

const MergedTable = ({ x, y, w, h, rotation = 0 }: { x: number, y: number, w: number, h: number, rotation?: number }) => {
  const { graphicsQuality, floorColor, floorTexture } = useHotelStore();
  const roughnessVal = graphicsQuality === 'ultra' ? 0.15 : graphicsQuality === 'high' ? 0.35 : graphicsQuality === 'medium' ? 0.6 : 0.95;
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;

  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* TERRAZZO FLOOR SLAB UNDERNEATH */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={roughnessVal} />
      </mesh>
      {/* Wooden tabletop */}
      <mesh position={[0, 0.55 + FLOOR_HEIGHT, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.8, 0.08, h * TILE_SIZE * 0.8]} />
        <meshStandardMaterial map={getWoodTexture()} roughness={0.5} />
      </mesh>
      {/* Center column stand */}
      <mesh position={[0, 0.28 + FLOOR_HEIGHT, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const MergedReception = ({ x, y, w, h, rotation = 0 }: { x: number, y: number, w: number, h: number, rotation?: number }) => {
  const { graphicsQuality, floorColor, floorTexture } = useHotelStore();
  const roughnessVal = graphicsQuality === 'ultra' ? 0.15 : graphicsQuality === 'high' ? 0.35 : graphicsQuality === 'medium' ? 0.6 : 0.95;
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;

  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Terrazzo desk base slab */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={roughnessVal} />
      </mesh>
      {/* Mahogany Front Desk Counter */}
      <mesh position={[0, 0.55 + FLOOR_HEIGHT, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.9, 1.1, h * TILE_SIZE * 0.9]} />
        <meshStandardMaterial map={getMahoganyTexture()} roughness={0.5} />
      </mesh>
      {/* Brass / Golden decorative horizontal accent stripe */}
      <mesh position={[0, 0.7 + FLOOR_HEIGHT, h * TILE_SIZE * 0.46]}>
        <boxGeometry args={[w * TILE_SIZE * 0.91, 0.06, 0.02]} />
        <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
  );
};

const MergedWindow = ({ x, y, w, h, grid, rotation = 0 }: { x: number, y: number, w: number, h: number, grid: TileType[][], rotation?: number }) => {
  const { graphicsQuality, floorColor, floorTexture } = useHotelStore();
  const roughnessVal = graphicsQuality === 'ultra' ? 0.15 : graphicsQuality === 'high' ? 0.35 : graphicsQuality === 'medium' ? 0.6 : 0.95;

  let windowRotation = 0;
  if (w > h) windowRotation = 0;
  else if (h > w) windowRotation = Math.PI / 2;
  else {
    const top = y > 0 ? grid[y - 1][x] : null;
    const bottom = y + h < grid.length ? grid[y + h][x] : null;
    if (top === 'wall' || bottom === 'wall') windowRotation = Math.PI / 2;
  }
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  const glassLength = windowRotation === 0 ? w * TILE_SIZE : h * TILE_SIZE;

  // Window height scale: 65% of WALL_HEIGHT for gorgeous panoramic floor-to-ceiling glass
  const windowHeight = WALL_HEIGHT * 0.65;

  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* TERRAZZO FLOOR SLAB UNDERNEATH */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={roughnessVal} />
      </mesh>
      {/* Window glass pane */}
      <mesh position={[0, WALL_HEIGHT / 2, 0]} rotation={[0, windowRotation, 0]}>
        <boxGeometry args={[glassLength, windowHeight, TILE_SIZE * 0.15]} />
        <meshStandardMaterial color="#a5f3fc" transparent opacity={0.65} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const MergedDoor = ({ x, y, w, h, grid, rotation = 0 }: { x: number, y: number, w: number, h: number, grid: TileType[][], rotation?: number }) => {
  const { activeFloorIndex, openDoors, toggleDoor, doorColor, floorColor, floorTexture } = useHotelStore();
  const [hovered, setHovered] = useState(false);
  const hingeRef = useRef<THREE.Group>(null);
  
  let doorRotation = 0;
  if (w > h) doorRotation = 0; 
  else if (h > w) doorRotation = Math.PI / 2;
  else {
    const top = y > 0 ? grid[y - 1][x] : null;
    const bottom = y + h < grid.length ? grid[y + h][x] : null;
    if (top === 'wall' || bottom === 'wall') doorRotation = Math.PI / 2;
  }
  
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  const doorLength = doorRotation === 0 ? w * TILE_SIZE * 0.95 : h * TILE_SIZE * 0.95;
  const doorHeight = 2.2;
  
  const doorKey = `${activeFloorIndex}-${x}-${y}`;
  const isOpened = openDoors[doorKey] || false;
  
  useFrame(() => {
    if (!hingeRef.current) return;
    const targetRot = isOpened ? -Math.PI / 1.8 : 0;
    hingeRef.current.rotation.y = THREE.MathUtils.lerp(hingeRef.current.rotation.y, targetRot, 0.15);
  });

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Floor Slab matching the floor tiles */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={0.4} />
      </mesh>
      
      {/* Overhead metallic transom */}
      {WALL_HEIGHT > doorHeight && (
        <mesh position={[0, (WALL_HEIGHT + doorHeight) / 2, 0]} rotation={[0, doorRotation, 0]}>
          <boxGeometry args={[w * TILE_SIZE, WALL_HEIGHT - doorHeight, TILE_SIZE * 0.22]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.15} />
        </mesh>
      )}

      {/* Hinge group rotated in world space */}
      <group rotation={[0, doorRotation, 0]}>
        {/* Hinge position offset */}
        <group ref={hingeRef} position={[-doorLength / 2, 0, 0]}>
          {/* Door slab relative to hinge */}
          <mesh 
            position={[doorLength / 2, doorHeight / 2, 0]}
            onClick={(e) => {
              e.stopPropagation();
              toggleDoor(activeFloorIndex, x, y);
            }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
          >
            <boxGeometry args={[doorLength, doorHeight, TILE_SIZE * 0.16]} />
            <meshStandardMaterial 
              color={doorColor || "#b45309"} 
              roughness={0.6}
              emissive={hovered ? "#eab308" : "#000000"}
              emissiveIntensity={hovered ? 0.25 : 0}
            />
          </mesh>
          {/* Sleek metallic door handle */}
          <mesh position={[doorLength * 0.85, doorHeight * 0.5, TILE_SIZE * 0.11]}>
            <boxGeometry args={[0.04, 0.15, 0.03]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const MergedBathroom = ({ x, y, w, h, rotation = 0 }: { x: number, y: number, w: number, h: number, rotation?: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      {/* Beautiful Aqua Mosaic tiles */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getBathroomTexture()} roughness={0.3} />
      </mesh>
      {/* Porcelain sink vanity counter */}
      <mesh position={[0, 0.4 + FLOOR_HEIGHT, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.5, 0.8, h * TILE_SIZE * 0.5]} />
         <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} />
      </mesh>
    </group>
  );
};

const MergedStaff = ({ x, y, w, h, rotation = 0 }: { x: number, y: number, w: number, h: number, rotation?: number }) => {
  const { floorColor, floorTexture } = useHotelStore();
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]} rotation={[0, -rotation * Math.PI / 180, 0]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.5 + FLOOR_HEIGHT, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.7, 0.1, h * TILE_SIZE * 0.3]} />
         <meshStandardMaterial color="#9f1239" />
      </mesh>
      <mesh position={[0, 0.65 + FLOOR_HEIGHT, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.2, 0.3, h * TILE_SIZE * 0.1]} />
         <meshStandardMaterial color="#e11d48" />
      </mesh>
    </group>
  );
};

const MovingCabin = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const { activeFloorIndex, floors } = useHotelStore();
  const [currentY, setCurrentY] = useState(activeFloorIndex * WALL_HEIGHT);
  
  const targetY = activeFloorIndex * WALL_HEIGHT;
  
  useFrame(() => {
    setCurrentY((prev) => THREE.MathUtils.lerp(prev, targetY, 0.08));
  });
  
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  
  return (
    <group position={[centerX, currentY, centerZ]}>
      {/* Glass & Steel cabin box */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[w * TILE_SIZE * 0.88, 2.5, h * TILE_SIZE * 0.88]} />
        <meshStandardMaterial 
          color="#38bdf8" 
          metalness={0.9} 
          roughness={0.1} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Metal floor and ceiling of cabin */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[w * TILE_SIZE * 0.86, 0.1, h * TILE_SIZE * 0.86]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[w * TILE_SIZE * 0.86, 0.1, h * TILE_SIZE * 0.86]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Golden handrails and trim inside the cabin */}
      <mesh position={[0, 1.0, -h * TILE_SIZE * 0.4]}>
        <boxGeometry args={[w * TILE_SIZE * 0.8, 0.06, 0.06]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Inner glowing light */}
      <pointLight color="#38bdf8" intensity={1.5} distance={5} position={[0, 2.0, 0]} />
    </group>
  );
};

const MergedElevator = ({ x, y, w, h, floorLevel, floorIndex }: { x: number, y: number, w: number, h: number, floorLevel: number, floorIndex: number }) => {
  const { activeFloorIndex, isElevatorMoving, floors, elevatorSystemMode } = useHotelStore();
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Auto-align upper-floor elevator shafts with the ground floor (floor 0) elevator position to guarantee pristine vertical columns
  let alignedX = x;
  let alignedY = y;
  const groundFloor = floors[0];
  if (groundFloor && floorIndex > 0) {
    const groundElevators = getMergedBlocks(groundFloor.grid, 'elevator');
    let bestBlock = groundElevators[0];
    let minDistance = Infinity;
    for (const b of groundElevators) {
      const dist = Math.abs(b.x - x) + Math.abs(b.y - y);
      if (dist < minDistance) {
        minDistance = dist;
        bestBlock = b;
      }
    }
    // Snap if within 3 tiles of ground floor elevator to prevent minor alignment/template offsets
    if (bestBlock && minDistance <= 3) {
      alignedX = bestBlock.x;
      alignedY = bestBlock.y;
    }
  }

  const centerX = alignedX * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = alignedY * TILE_SIZE + (h * TILE_SIZE) / 2;

  // Doors are open only if the elevator is stationary on this floor!
  const isDoorsOpen = !isElevatorMoving && activeFloorIndex === floorIndex;

  useFrame(() => {
    if (!leftDoorRef.current || !rightDoorRef.current) return;
    
    // Left door slides left, right door slides right
    const targetLeftX = isDoorsOpen ? -w * TILE_SIZE * 0.45 : -w * TILE_SIZE * 0.23;
    const targetRightX = isDoorsOpen ? w * TILE_SIZE * 0.45 : w * TILE_SIZE * 0.23;

    leftDoorRef.current.position.x = THREE.MathUtils.lerp(leftDoorRef.current.position.x, targetLeftX, 0.12);
    rightDoorRef.current.position.x = THREE.MathUtils.lerp(rightDoorRef.current.position.x, targetRightX, 0.12);
  });

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Terrazzo marble elevator landing */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
      </mesh>
      
      {/* Premium metallic brass shaft box */}
      <mesh position={[0, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.92, WALL_HEIGHT, h * TILE_SIZE * 0.92]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} transparent opacity={0.92} />
      </mesh>
      
      {/* Sliding Gold Door - Left */}
      <group ref={leftDoorRef} position={[-w * TILE_SIZE * 0.23, 1.2, h * TILE_SIZE * 0.46 + 0.01]}>
        <mesh>
          <boxGeometry args={[w * TILE_SIZE * 0.44, 2.4, 0.08]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Sliding Gold Door - Right */}
      <group ref={rightDoorRef} position={[w * TILE_SIZE * 0.23, 1.2, h * TILE_SIZE * 0.46 + 0.01]}>
        <mesh>
          <boxGeometry args={[w * TILE_SIZE * 0.44, 2.4, 0.08]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* KONE POLARIS CALL PANEL STANCHION */}
      <mesh position={[w * TILE_SIZE * 0.42, 0.8, h * TILE_SIZE * 0.48 + 0.15]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh 
        position={[w * TILE_SIZE * 0.42, 1.5, h * TILE_SIZE * 0.48 + 0.15]}
        onClick={(e) => {
          e.stopPropagation();
          if (elevatorSystemMode === 'standard') {
            window.dispatchEvent(new CustomEvent('open-standard-portal', { detail: { floorIndex } }));
          } else {
            window.dispatchEvent(new CustomEvent('open-kone-portal', { detail: { floorIndex } }));
          }
        }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        <boxGeometry args={[0.18, 0.3, 0.05]} />
        <meshStandardMaterial 
          color={isDoorsOpen ? "#10b981" : "#0284c7"} 
          emissive={isDoorsOpen ? "#10b981" : "#0284c7"} 
          emissiveIntensity={hovered ? 0.9 : 0.4} 
        />
      </mesh>
    </group>
  );
};

const MergedWall = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const { wallColor, wallTexture } = useHotelStore();
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <mesh position={[centerX, WALL_HEIGHT / 2, centerZ]} castShadow receiveShadow>
      <boxGeometry args={[w * TILE_SIZE, WALL_HEIGHT, h * TILE_SIZE]} />
      <meshStandardMaterial map={getWallTexture(wallColor, wallTexture)} roughness={0.5} />
    </mesh>
  );
};

const MergedFloor = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const { floorColor, floorTexture } = useHotelStore();
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <mesh position={[centerX, FLOOR_HEIGHT / 2, centerZ]} receiveShadow>
      <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
      <meshStandardMaterial map={getTerrazzoTexture(floorColor, floorTexture)} roughness={0.4} />
    </mesh>
  );
};

const TileModel = ({ type, position }: { type: TileType; position: [number, number, number] }) => {
  const [px, py, pz] = position;
  switch (type) {
    case 'floor':
      return (
        <mesh position={[px, py + FLOOR_HEIGHT / 2, pz]}>
          <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
          {/* Apply Terrazzo Lobby Flooring */}
          <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
        </mesh>
      );
    case 'wall':
      return (
        <mesh position={[px, py + WALL_HEIGHT / 2, pz]}>
          <boxGeometry args={[TILE_SIZE, WALL_HEIGHT, TILE_SIZE]} />
          {/* Apply Slate Concrete paneled walls */}
          <meshStandardMaterial map={getWallTexture()} roughness={0.5} />
        </mesh>
      );
    case 'plant':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#16a34a" roughness={0.9} />
          </mesh>
        </group>
      );
    case 'elevator':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
          </mesh>
          <mesh position={[0, WALL_HEIGHT / 2, 0]}>
            <boxGeometry args={[TILE_SIZE * 0.9, WALL_HEIGHT, TILE_SIZE * 0.9]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    case 'stairs':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
          </mesh>
          <mesh position={[0, WALL_HEIGHT / 2, 0]}>
            <boxGeometry args={[TILE_SIZE * 0.9, WALL_HEIGHT, TILE_SIZE * 0.9]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.2, 0.2, -0.2]}>
            <boxGeometry args={[0.3, 0.4, 0.3]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.3]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0.2, 0.8, 0.2]}>
            <boxGeometry args={[0.3, 0.4, 0.3]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      );
    case 'bathroom':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial map={getBathroomTexture()} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
             <boxGeometry args={[TILE_SIZE * 0.5, 0.8, TILE_SIZE * 0.5]} />
             <meshStandardMaterial color="#ffffff" roughness={0.05} />
          </mesh>
        </group>
      );
    case 'staff':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
             <boxGeometry args={[TILE_SIZE * 0.7, 0.1, TILE_SIZE * 0.3]} />
             <meshStandardMaterial color="#9f1239" />
          </mesh>
        </group>
      );
    default:
      return null;
  }
};

const EnvironmentScenery: React.FC<{ sceneryTheme?: 'city' | 'beach' | 'mountain' | 'forest' | 'desert' }> = ({ sceneryTheme = 'city' }) => {
  // We can render random scenic elements scattered around the hotel
  // Let's seed random coords so they remain static on re-renders
  const cityBuildings = React.useMemo(() => {
    const buildings = [];
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const distance = 45 + Math.random() * 40;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const width = 5 + Math.random() * 7;
      const height = 18 + Math.random() * 38;
      const depth = 5 + Math.random() * 7;
      const hue = Math.random() * 30 + 200; // Blueish skyscraper lights
      buildings.push({ x, z, width, height, depth, color: `hsl(${hue}, 20%, 30%)` });
    }
    return buildings;
  }, []);

  const palms = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const distance = 25 + Math.random() * 15;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({ x, z, scale: 0.6 + Math.random() * 0.8 });
    }
    return items;
  }, []);

  const mountains = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const distance = 60 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const height = 25 + Math.random() * 25;
      const radius = 12 + Math.random() * 10;
      items.push({ x, z, height, radius });
    }
    return items;
  }, []);

  const forestTrees = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 24 + Math.random() * 35;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({ x, z, height: 2 + Math.random() * 3, scale: 0.7 + Math.random() * 0.6 });
    }
    return items;
  }, []);

  const desertDunes = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 30 + Math.random() * 35;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({ x, z, rx: 15 + Math.random() * 15, rz: 8 + Math.random() * 8, h: 2 + Math.random() * 2 });
    }
    return items;
  }, []);

  // NEW: Memoized scenic components for Beach theme
  const beachLoungers = React.useMemo(() => {
    const items = [];
    const colors = ['#f43f5e', '#0ea5e9', '#eab308', '#10b981', '#a855f7'];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 22 + Math.random() * 10;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        rotY: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return items;
  }, []);

  const beachIslands = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 100 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        radius: 12 + Math.random() * 14,
        height: 5 + Math.random() * 5
      });
    }
    return items;
  }, []);

  // NEW: Memoized clouds for Mountain theme
  const mountainClouds = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 40 + Math.random() * 30;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        y: 16 + Math.random() * 8,
        scale: 2 + Math.random() * 2
      });
    }
    return items;
  }, []);

  const mountainRocks = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 16 + Math.random() * 15;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        scale: 0.3 + Math.random() * 0.7,
        rotY: Math.random() * Math.PI * 2
      });
    }
    return items;
  }, []);

  // NEW: Memoized forest floor details (mushrooms and logs)
  const forestMushrooms = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 15;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        scale: 0.15 + Math.random() * 0.15
      });
    }
    return items;
  }, []);

  const forestLogs = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 16 + Math.random() * 12;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        rotY: Math.random() * Math.PI,
        scale: 0.7 + Math.random() * 0.5
      });
    }
    return items;
  }, []);

  // NEW: Memoized desert details
  const desertMesas = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 65 + Math.random() * 25;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      items.push({
        x,
        z,
        w: 14 + Math.random() * 10,
        h: 12 + Math.random() * 12,
        d: 10 + Math.random() * 8
      });
    }
    return items;
  }, []);

  // NEW: Memoized city elements (roads and cars)
  const cityRoads = React.useMemo(() => {
    const items = [];
    items.push({ x: 0, z: 28, w: 220, d: 4 });
    items.push({ x: 0, z: -28, w: 220, d: 4 });
    items.push({ x: 28, z: 0, w: 4, d: 220 });
    items.push({ x: -28, z: 0, w: 4, d: 220 });
    return items;
  }, []);

  const cityCars = React.useMemo(() => {
    const items = [];
    const colors = ['#f43f5e', '#3b82f6', '#fbbf24', '#10b981', '#f8fafc', '#334155'];
    for (let i = 0; i < 16; i++) {
      const onVertical = Math.random() > 0.5;
      const d = onVertical ? 28 : (Math.random() > 0.5 ? 28 : -28);
      const along = (Math.random() - 0.5) * 110;
      items.push({
        x: onVertical ? (Math.random() > 0.5 ? 28 : -28) : along,
        z: onVertical ? along : (Math.random() > 0.5 ? 28 : -28),
        rotY: onVertical ? 0 : Math.PI / 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.8 + Math.random() * 0.3
      });
    }
    return items;
  }, []);

  if (sceneryTheme === 'beach') {
    return (
      <group>
        {/* Ocean plane overlay */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#0284c7" opacity={0.65} transparent roughness={0.1} />
        </mesh>
        
        {/* Distant islands on the horizon */}
        {beachIslands.map((is, idx) => (
          <group key={`is-${idx}`} position={[is.x, -1, is.z]}>
            <mesh position={[0, is.height / 2, 0]}>
              <coneGeometry args={[is.radius, is.height, 5]} />
              <meshStandardMaterial color="#b5a285" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, is.height * 0.9, 0]}>
              <coneGeometry args={[is.radius * 0.8, is.height * 0.4, 5]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Sand transition ring */}
        <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[16, 45, 32]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>

        {/* Loungers and umbrellas */}
        {beachLoungers.map((bl, idx) => (
          <group key={`bl-${idx}`} position={[bl.x, 0, bl.z]} rotation={[0, bl.rotY, 0]}>
            {/* Lounger Chair */}
            <mesh position={[0, 0.08, 0]}>
              <boxGeometry args={[1.4, 0.1, 0.6]} />
              <meshStandardMaterial color={bl.color} roughness={0.8} />
            </mesh>
            {/* Umbrella Pole */}
            <mesh position={[0.7, 1.2, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Umbrella Top */}
            <mesh position={[0.7, 2.4, 0]}>
              <coneGeometry args={[1.1, 0.5, 6]} />
              <meshStandardMaterial color={bl.color} roughness={0.6} flatShading />
            </mesh>
          </group>
        ))}

        {/* Palm Trees */}
        {palms.map((p, idx) => (
          <group key={idx} position={[p.x, 0, p.z]} scale={[p.scale, p.scale, p.scale]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.15, 0.25, 5, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
            <mesh position={[0, 5, 0]} rotation={[0, 0, 0.2]}>
              <coneGeometry args={[1.5, 1, 5]} />
              <meshStandardMaterial color="#166534" roughness={0.7} />
            </mesh>
            <mesh position={[0, 4.8, 0]} rotation={[0.2, 2, -0.1]}>
              <coneGeometry args={[1.6, 0.8, 5]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (sceneryTheme === 'mountain') {
    return (
      <group>
        {/* Snowy Horizon Mountains */}
        {mountains.map((m, idx) => (
          <group key={idx} position={[m.x, 0, m.z]}>
            <mesh position={[0, m.height / 2, 0]}>
              <coneGeometry args={[m.radius, m.height, 6]} />
              <meshStandardMaterial color="#475569" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0, m.height * 0.8, 0]}>
              <coneGeometry args={[m.radius * 0.3, m.height * 0.4, 6]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Floating Clouds */}
        {mountainClouds.map((cl, idx) => (
          <group key={`cl-${idx}`} position={[cl.x, cl.y, cl.z]} scale={[cl.scale, cl.scale, cl.scale]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshStandardMaterial color="#f8fafc" opacity={0.8} transparent flatShading />
            </mesh>
            <mesh position={[0.7, -0.1, 0]} scale={[0.8, 0.8, 0.8]}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshStandardMaterial color="#f8fafc" opacity={0.8} transparent flatShading />
            </mesh>
            <mesh position={[-0.7, -0.1, 0]} scale={[0.8, 0.8, 0.8]}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshStandardMaterial color="#f8fafc" opacity={0.8} transparent flatShading />
            </mesh>
          </group>
        ))}

        {/* Scattered Rocks */}
        {mountainRocks.map((rk, idx) => (
          <mesh key={`rk-${idx}`} position={[rk.x, 0, rk.z]} scale={[rk.scale, rk.scale, rk.scale]} rotation={[0, rk.rotY, 0]}>
            <sphereGeometry args={[1.5, 4, 4]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} flatShading />
          </mesh>
        ))}

        {/* Pines */}
        {forestTrees.slice(0, 30).map((t, idx) => (
          <group key={idx} position={[t.x, 0, t.z]} scale={[t.scale, t.scale, t.scale]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 1.6, 6]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
              <coneGeometry args={[0.7, 1.4, 6]} />
              <meshStandardMaterial color="#065f46" flatShading />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <coneGeometry args={[0.5, 1.1, 6]} />
              <meshStandardMaterial color="#047857" flatShading />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (sceneryTheme === 'forest') {
    return (
      <group>
        {/* Red spotted mushrooms */}
        {forestMushrooms.map((m, idx) => (
          <group key={`mu-${idx}`} position={[m.x, 0, m.z]} scale={[m.scale, m.scale, m.scale]}>
            {/* Stem */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.12, 0.18, 1, 6]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Cap */}
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[0.6, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#ef4444" roughness={0.3} />
            </mesh>
            {/* Little white speck */}
            <mesh position={[0, 1.5, 0]} scale={[0.1, 0.1, 0.1]}>
              <sphereGeometry args={[1, 4, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Fallen Logs */}
        {forestLogs.map((log, idx) => (
          <mesh key={`log-${idx}`} position={[log.x, 0.3, log.z]} rotation={[Math.PI / 2, log.rotY, 0]} scale={[log.scale, log.scale, log.scale]}>
            <cylinderGeometry args={[0.25, 0.28, 2.5, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
        ))}

        {/* Lots of green trees */}
        {forestTrees.map((t, idx) => (
          <group key={idx} position={[t.x, 0, t.z]} scale={[t.scale, t.scale, t.scale]}>
            <mesh position={[0, t.height / 2, 0]}>
              <cylinderGeometry args={[0.15, 0.22, t.height, 8]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
            <mesh position={[0, t.height + 0.6, 0]}>
              <sphereGeometry args={[1.1, 8, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.8} />
            </mesh>
            <mesh position={[0.4, t.height + 1.1, -0.2]} scale={[0.8, 0.8, 0.8]}>
              <sphereGeometry args={[1.0, 8, 8]} />
              <meshStandardMaterial color="#15803d" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (sceneryTheme === 'desert') {
    return (
      <group>
        {/* Sandy dunes */}
        {desertDunes.map((d, idx) => (
          <mesh key={idx} position={[d.x, -0.05, d.z]} scale={[d.rx, d.h, d.rz]} rotation={[0.1, Math.random(), 0]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshStandardMaterial color="#eab308" roughness={1.0} flatShading />
          </mesh>
        ))}

        {/* Red Monument Mesas in distance */}
        {desertMesas.map((me, idx) => (
          <mesh key={`me-${idx}`} position={[me.x, me.h / 2 - 0.2, me.z]}>
            <boxGeometry args={[me.w, me.h, me.d]} />
            <meshStandardMaterial color="#c2410c" roughness={0.9} flatShading />
          </mesh>
        ))}

        {/* Palm Trees / Cacti */}
        {palms.slice(0, 12).map((p, idx) => (
          <group key={idx} position={[p.x, 0, p.z]} scale={[p.scale * 0.8, p.scale * 0.8, p.scale * 0.8]}>
            {/* Saguaro Cactus Base */}
            <mesh position={[0, 1.8, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 3.6, 8]} />
              <meshStandardMaterial color="#15803d" roughness={0.9} />
            </mesh>
            {/* Saguaro Cactus Arm 1 */}
            <group position={[0, 1.8, 0]}>
              <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.14, 0.14, 1.0, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
              <mesh position={[1.0, 1.1, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 1.4, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            </group>
            {/* Saguaro Cactus Arm 2 */}
            <group position={[0, 1.0, 0]} rotation={[0, Math.PI, 0]}>
              <mesh position={[0.5, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.14, 0.14, 1.0, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
              <mesh position={[1.0, 1.1, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 1.4, 8]} />
                <meshStandardMaterial color="#15803d" />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    );
  }

  // DEFAULT/CITY Skyline & Infrastructure
  return (
    <group>
      {/* City Roads */}
      {cityRoads.map((rd, idx) => (
        <group key={`rd-${idx}`}>
          <mesh position={[rd.x, 0.005, rd.z]}>
            <boxGeometry args={[rd.w, 0.02, rd.d]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          {/* Yellow dash in middle */}
          <mesh position={[rd.x, 0.015, rd.z]}>
            <boxGeometry args={[rd.w, 0.01, 0.15]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {/* City Cars */}
      {cityCars.map((car, idx) => (
        <group key={`car-${idx}`} position={[car.x, 0.25, car.z]} rotation={[0, car.rotY, 0]} scale={[car.scale, car.scale, car.scale]}>
          <mesh>
            <boxGeometry args={[1.6, 0.4, 0.8]} />
            <meshStandardMaterial color={car.color} roughness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0.3, 0]}>
            <boxGeometry args={[0.9, 0.3, 0.7]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Buildings Skyline */}
      {cityBuildings.map((b, idx) => (
        <group key={idx} position={[b.x, b.height / 2 - 0.1, b.z]}>
          <mesh>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial color={b.color} roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Red beacon warning light on tall skyscrapers */}
          {b.height > 30 && (
            <mesh position={[0, b.height / 2 + 0.5, 0]}>
              <sphereGeometry args={[0.25, 4, 4]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

export const Viewer3D: React.FC<{ mode?: string }> = ({ mode = '3D' }) => {
  const { floors, guests, staff, activeFloorIndex, setActiveFloor, hotelLocation } = useHotelStore();

  // --- KONE Polaris DCS Elevator States & Logic ---
  const [konePortalOpen, setKonePortalOpen] = useState(false);
  const [koneOriginFloor, setKoneOriginFloor] = useState(activeFloorIndex);
  const [koneTargetFloor, setKoneTargetFloor] = useState(activeFloorIndex);
  const [koneCabin, setKoneCabin] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [koneStatus, setKoneStatus] = useState<'idle' | 'dispatching' | 'transit' | 'arrived' | 'emergency'>('idle');
  const [koneMusicChannel, setKoneMusicChannel] = useState<'none' | 'lounge'>('none');
  const [koneVoiceLog, setKoneVoiceLog] = useState<string[]>([
    "KONE Polaris DCS online. Destination-ready."
  ]);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);
  
  // Standard Elevator Mode Portal States
  const [standardPortalOpen, setStandardPortalOpen] = useState(false);
  const [standardOriginFloor, setStandardOriginFloor] = useState(activeFloorIndex);
  
  const { isElevatorMoving, callElevator } = useHotelStore();

  const addVoiceLog = (msg: string) => {
    setKoneVoiceLog(prev => [msg, ...prev.slice(0, 10)]);
  };

  useEffect(() => {
    const handleOpenKone = (e: CustomEvent<{ floorIndex: number }>) => {
      const idx = e.detail.floorIndex ?? activeFloorIndex;
      setKoneOriginFloor(idx);
      setKoneTargetFloor(idx);
      setKonePortalOpen(true);
      setKoneStatus('idle');
      const floorObj = floors[idx] || floors[0];
      const floorName = floorObj?.name || `Floor ${idx + 1}`;
      addVoiceLog(`Stanchion called from ${floorName}. Standing by.`);
    };
    const handleOpenStandard = (e: CustomEvent<{ floorIndex: number }>) => {
      const idx = e.detail.floorIndex ?? activeFloorIndex;
      setStandardOriginFloor(idx);
      setStandardPortalOpen(true);
    };
    window.addEventListener('open-kone-portal' as any, handleOpenKone);
    window.addEventListener('open-standard-portal' as any, handleOpenStandard);
    return () => {
      window.removeEventListener('open-kone-portal' as any, handleOpenKone);
      window.removeEventListener('open-standard-portal' as any, handleOpenStandard);
    };
  }, [floors, activeFloorIndex]);

  const handleSelectDestination = (floorIndex: number) => {
    if (floorIndex === koneOriginFloor) {
      addVoiceLog("DCS Error: Already at designated floor.");
      return;
    }
    setKoneTargetFloor(floorIndex);
    setKoneStatus('dispatching');
    setDispatchLogs([
      "DCS: Scanning hotel shaft load...",
      "DCS: Performing group traffic dispatch...",
      "DCS: Minimizing energy transit indices..."
    ]);
    const floorObj = floors[floorIndex] || floors[0];
    const floorName = floorObj?.name || `Floor ${floorIndex + 1}`;
    addVoiceLog(`Optimizing route to ${floorName}...`);
    
    setTimeout(() => {
      const cabins: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      const designated = cabins[Math.floor(Math.random() * cabins.length)];
      setKoneCabin(designated);
      setKoneStatus('transit');
      addVoiceLog(`DCS: Take CABIN ${designated} directly.`);
      callElevator(floorIndex);
    }, 1500);
  };

  useEffect(() => {
    if (!isElevatorMoving && koneStatus === 'transit') {
      setKoneStatus('arrived');
      playElevatorChime();
      const floorObj = floors[koneTargetFloor] || floors[0];
      const floorName = floorObj?.name || `Floor ${koneTargetFloor + 1}`;
      addVoiceLog(`Cabin ${koneCabin} has landed on ${floorName}. Welcome.`);
      setKoneOriginFloor(koneTargetFloor);
    }
  }, [isElevatorMoving, koneStatus, floors, koneCabin, koneTargetFloor]);

  useEffect(() => {
    if (koneMusicChannel === 'none') {
      stopElevatorMusic();
    } else {
      stopElevatorMusic();
      startElevatorMusic();
    }
    return () => {
      stopElevatorMusic();
    };
  }, [koneMusicChannel]);

  const offsetX = (GRID_SIZE * TILE_SIZE) / 2;
  const offsetZ = (GRID_SIZE * TILE_SIZE) / 2;

  // Visual Joystick Touch / Gesture State
  const joystickRef = useRef({ x: 0, y: 0 });
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickContainerRef = useRef<HTMLDivElement>(null);

  const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // @ts-ignore
    e.target.setPointerCapture?.(e.pointerId);
    setJoystickActive(true);
    updateJoystick(e);
  };

  const handleJoystickMove = (e: PointerEvent) => {
    if (!joystickActive) return;
    updateJoystick(e);
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    joystickRef.current = { x: 0, y: 0 };
  };

  const updateJoystick = (e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    if (!joystickContainerRef.current) return;
    const rect = joystickContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    
    const maxRadius = 35; // Cap joystick reach
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    setJoystickPos({ x: dx, y: dy });
    joystickRef.current = { x: dx / maxRadius, y: dy / maxRadius };
  };

  useEffect(() => {
    if (joystickActive) {
      const handleGlobalPointerMove = (e: PointerEvent) => {
        updateJoystick(e);
      };
      const handleGlobalPointerUp = () => {
        handleJoystickEnd();
      };
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => {
        window.removeEventListener('pointermove', handleGlobalPointerMove);
        window.removeEventListener('pointerup', handleGlobalPointerUp);
      };
    }
  }, [joystickActive]);

  // Types that are merged visually
  const mergedTypes = ['bed', 'bed_single', 'bed_double', 'table', 'reception', 'window', 'door', 'elevator', 'bathroom', 'staff', 'wall', 'floor'];

  return (
    <div className={`flex-1 bg-slate-950 w-full h-full relative overflow-hidden select-none touch-none`}>
      {mode === 'Walk' ? (
        <>
          {/* Top-center instruction overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/95 text-slate-200 px-5 py-2.5 rounded-full border border-slate-800 backdrop-blur-md text-xs font-bold pointer-events-none shadow-2xl flex items-center gap-2">
            <Eye size={14} className="text-amber-500 animate-pulse" />
            <span>Drag / Swipe to look around • Keyboard WASD or Joystick to walk</span>
          </div>

          {/* TRANSFLUCENT VIRTUAL JOYSTICK FOR MOBILE */}
          <div className="absolute bottom-6 left-6 z-20 joystick-container">
            <div 
              ref={joystickContainerRef}
              onPointerDown={handleJoystickStart}
              className="w-24 h-24 rounded-full border-2 border-slate-600/30 bg-slate-950/60 backdrop-blur-md flex items-center justify-center relative touch-none pointer-events-auto shadow-2xl cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div 
                className="w-10 h-10 rounded-full bg-amber-500/90 shadow-lg flex items-center justify-center absolute transition-all duration-75 border border-amber-400"
                style={{
                  transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                  touchAction: 'none'
                }}
              >
                <Move size={14} className="text-slate-950" />
              </div>
            </div>
          </div>

          {/* VIRTUAL ELEVATOR FLOOR CONTROLLER */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 bg-slate-900/95 border border-slate-800 p-2.5 rounded-xl backdrop-blur-md shadow-2xl no-pointer-lock">
            <span className="text-[9px] font-black text-slate-400 text-center uppercase tracking-wider mb-1.5">Elevator</span>
            <button
              onClick={() => activeFloorIndex < floors.length - 1 && setActiveFloor(activeFloorIndex + 1)}
              disabled={activeFloorIndex >= floors.length - 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-lg text-amber-500 font-bold flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronUp size={20} />
            </button>
            <span className="text-center text-xs font-extrabold text-white py-1">{activeFloorIndex + 1}F</span>
            <button
              onClick={() => activeFloorIndex > 0 && setActiveFloor(activeFloorIndex - 1)}
              disabled={activeFloorIndex <= 0}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-lg text-amber-500 font-bold flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </>
      ) : (
        <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none z-10">
          <div className="inline-block bg-slate-900/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-2xl border border-slate-850 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Left Click: Rotate | Right Click: Pan | Scroll: Zoom
          </div>
        </div>
      )}

      {/* 3D RENDER CANVAS */}
      <Canvas camera={{ position: mode === 'Walk' ? [0, 1.7, 0] : [25, 25, 25], fov: mode === 'Walk' ? 70 : 50 }}>
        {mode === 'Walk' ? (
          <FpsControls joystickRef={joystickRef} />
        ) : (
          <OrbitControls 
            makeDefault 
            target={[0, 5, 0]} 
            minDistance={5} 
            maxDistance={100} 
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        )}
        <Sky 
          sunPosition={hotelLocation?.sceneryTheme === 'desert' ? [100, 5, 10] : [100, 20, 100]} 
          turbidity={hotelLocation?.sceneryTheme === 'desert' ? 2.5 : 0.1} 
          rayleigh={hotelLocation?.sceneryTheme === 'desert' ? 2.0 : 0.5} 
        />
        <ambientLight intensity={hotelLocation?.sceneryTheme === 'desert' ? 0.45 : 0.4} color={hotelLocation?.sceneryTheme === 'desert' ? '#ffedd5' : '#ffffff'} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.5} 
          castShadow 
          color={hotelLocation?.sceneryTheme === 'desert' ? '#f97316' : '#ffffff'}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        
        {/* Ground Plane */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial 
            color={
              hotelLocation?.sceneryTheme === 'beach' ? '#ca8a04' :
              hotelLocation?.sceneryTheme === 'mountain' ? '#15803d' :
              hotelLocation?.sceneryTheme === 'forest' ? '#14532d' :
              hotelLocation?.sceneryTheme === 'desert' ? '#eab308' :
              '#0f172a'
            } 
          />
        </mesh>

        <EnvironmentScenery sceneryTheme={hotelLocation?.sceneryTheme} />

        <group position={[-offsetX, 0, -offsetZ]}>
          {/* Render the physical moving elevator cabins for all elevator shafts! */}
          {(() => {
            const firstFloor = floors[0];
            if (!firstFloor) return null;
            const elevatorBlocks = getMergedBlocks(firstFloor.grid, 'elevator');
            return elevatorBlocks.map((b, i) => (
              <MovingCabin key={`cabin-${i}`} {...b} />
            ));
          })()}

          {floors.map((floor, floorIndex) => {
            // Only render adjacent floors in Walk mode to maximize performance!
            const isVisible = mode !== 'Walk' || Math.abs(floorIndex - activeFloorIndex) <= 1;
            if (!isVisible) return null;

            const normalizedGrid = floor.grid.map(row => row.map(tile => {
              if (tile === 'bed_single' || tile === 'bed_double') return 'bed';
              return tile;
            }));

            const bedBlocks = getMergedBlocks(normalizedGrid, 'bed', floor.rotations);
            const tableBlocks = getMergedBlocks(normalizedGrid, 'table', floor.rotations);
            const receptionBlocks = getMergedBlocks(normalizedGrid, 'reception', floor.rotations);
            const windowBlocks = getMergedBlocks(normalizedGrid, 'window', floor.rotations);
            const doorBlocks = getMergedBlocks(normalizedGrid, 'door', floor.rotations);
            const elevatorBlocks = getMergedBlocks(normalizedGrid, 'elevator');
            const bathroomBlocks = getMergedBlocks(normalizedGrid, 'bathroom', floor.rotations);
            const staffBlocks = getMergedBlocks(normalizedGrid, 'staff', floor.rotations);
            const wallBlocks = getMergedBlocks(normalizedGrid, 'wall');
            const floorBlocks = getMergedBlocks(normalizedGrid, 'floor');

            return (
              <group key={floor.level} position={[0, floorIndex * WALL_HEIGHT, 0]}>
                {floor.grid.map((row, y) => (
                  row.map((cell, x) => {
                    if (mergedTypes.includes(cell)) return null;
                    return (
                      <TileModel 
                        key={`${floor.level}-${x}-${y}`} 
                        type={cell} 
                        position={[x * TILE_SIZE + TILE_SIZE / 2, 0, y * TILE_SIZE + TILE_SIZE / 2]} 
                      />
                    );
                  })
                ))}
                
                {/* Render merged blocks */}
                {wallBlocks.map((b, i) => <MergedWall key={`wall-${i}`} {...b} />)}
                {floorBlocks.map((b, i) => <MergedFloor key={`floor-${i}`} {...b} />)}
                {bedBlocks.map((b, i) => <MergedBed key={`bed-${i}`} {...b} grid={normalizedGrid} />)}
                {tableBlocks.map((b, i) => <MergedTable key={`table-${i}`} {...b} />)}
                {receptionBlocks.map((b, i) => <MergedReception key={`rec-${i}`} {...b} />)}
                {windowBlocks.map((b, i) => <MergedWindow key={`win-${i}`} {...b} grid={normalizedGrid} />)}
                {doorBlocks.map((b, i) => <MergedDoor key={`door-${i}`} {...b} grid={normalizedGrid} />)}
                {elevatorBlocks.map((b, i) => <MergedElevator key={`ele-${i}`} {...b} floorLevel={floor.level} floorIndex={floorIndex} />)}
                {bathroomBlocks.map((b, i) => <MergedBathroom key={`bath-${i}`} {...b} />)}
                {staffBlocks.map((b, i) => <MergedStaff key={`staff-${i}`} {...b} />)}

                {/* Render Staff NPCs dynamically positioned on this active floor */}
                {staff
                  .filter(s => s.floorIndex === activeFloorIndex && s.x !== undefined && s.y !== undefined)
                  .map(s => {
                    const roleColors = {
                      receptionist: { blazer: '#1e3a8a', pants: '#172554', tie: '#fbbf24', hair: '#1c1917', label: '#60a5fa' },
                      cleaner: { blazer: '#1e293b', pants: '#0f172a', tie: '#475569', hair: '#7c2d12', label: '#94a3b8' },
                      manager: { blazer: '#111827', pants: '#030712', tie: '#fbbf24', hair: '#451a03', label: '#fbbf24' }
                    }[s.role] || { blazer: '#334155', pants: '#1e293b', tie: '#94a3b8', hair: '#000000', label: '#e2e8f0' };

                    return (
                      <group 
                        key={s.id} 
                        position={[
                          s.x! * TILE_SIZE + TILE_SIZE / 2, 
                          0.8, 
                          s.y! * TILE_SIZE + TILE_SIZE / 2
                        ]}
                      >
                        {/* Legs */}
                        <mesh position={[-0.1, -0.5, 0]} castShadow>
                          <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
                          <meshStandardMaterial color={roleColors.pants} roughness={0.7} />
                        </mesh>
                        <mesh position={[0.1, -0.5, 0]} castShadow>
                          <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
                          <meshStandardMaterial color={roleColors.pants} roughness={0.7} />
                        </mesh>

                        {/* Shoes */}
                        <mesh position={[-0.1, -0.76, 0.04]} castShadow>
                          <boxGeometry args={[0.12, 0.08, 0.22]} />
                          <meshStandardMaterial color="#0f172a" roughness={0.9} />
                        </mesh>
                        <mesh position={[0.1, -0.76, 0.04]} castShadow>
                          <boxGeometry args={[0.12, 0.08, 0.22]} />
                          <meshStandardMaterial color="#0f172a" roughness={0.9} />
                        </mesh>

                        {/* Torso / Blazer */}
                        <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
                          <boxGeometry args={[0.42, 0.55, 0.26]} />
                          <meshStandardMaterial 
                            color={roleColors.blazer} 
                            metalness={s.role === 'manager' ? 0.3 : 0} 
                            roughness={0.5} 
                          />
                        </mesh>

                        {/* Professional White Collar */}
                        <mesh position={[0, 0.19, 0.02]} castShadow>
                          <boxGeometry args={[0.22, 0.05, 0.16]} />
                          <meshStandardMaterial color="#ffffff" roughness={0.4} />
                        </mesh>

                        {/* Role Tie / Bowtie */}
                        <mesh position={[0, 0.1, 0.14]} rotation={[0.05, 0, 0]}>
                          <coneGeometry args={[0.035, 0.14, 4]} />
                          <meshStandardMaterial color={roleColors.tie} roughness={0.4} />
                        </mesh>

                        {/* Stylized Arms */}
                        <mesh position={[-0.26, -0.1, 0]} rotation={[0, 0, 0.1]} castShadow>
                          <cylinderGeometry args={[0.055, 0.045, 0.48, 8]} />
                          <meshStandardMaterial color={roleColors.blazer} roughness={0.6} />
                        </mesh>
                        <mesh position={[0.26, -0.1, 0]} rotation={[0, 0, -0.1]} castShadow>
                          <cylinderGeometry args={[0.055, 0.045, 0.48, 8]} />
                          <meshStandardMaterial color={roleColors.blazer} roughness={0.6} />
                        </mesh>

                        {/* Head with Skin Tone */}
                        <mesh position={[0, 0.4, 0]} castShadow>
                          <sphereGeometry args={[0.2, 16, 16]} />
                          <meshStandardMaterial color="#ffedd5" roughness={0.3} />
                        </mesh>

                        {/* Eyes */}
                        <mesh position={[-0.07, 0.43, 0.16]}>
                          <sphereGeometry args={[0.025, 8, 8]} />
                          <meshStandardMaterial color="#0f172a" roughness={0.2} />
                        </mesh>
                        <mesh position={[0.07, 0.43, 0.16]}>
                          <sphereGeometry args={[0.025, 8, 8]} />
                          <meshStandardMaterial color="#0f172a" roughness={0.2} />
                        </mesh>

                        {/* Hair */}
                        <mesh position={[0, 0.48, -0.04]} castShadow>
                          <sphereGeometry args={[0.21, 12, 12]} />
                          <meshStandardMaterial color={roleColors.hair} roughness={0.8} />
                        </mesh>

                        {/* Cleaner's Broom Tool */}
                        {s.role === 'cleaner' && (
                          <group position={[0.28, -0.15, 0.12]} rotation={[0.4, 0, -0.2]}>
                            {/* Handle */}
                            <mesh>
                              <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
                              <meshStandardMaterial color="#b45309" roughness={0.7} />
                            </mesh>
                            {/* Brush head */}
                            <mesh position={[0, -0.55, 0]}>
                              <boxGeometry args={[0.22, 0.1, 0.12]} />
                              <meshStandardMaterial color="#fcd34d" roughness={0.9} />
                            </mesh>
                          </group>
                        )}

                        {/* Manager's inspection notebook */}
                        {s.role === 'manager' && (
                          <mesh position={[-0.22, -0.12, 0.14]} rotation={[0.2, 0.5, 0.1]}>
                            <boxGeometry args={[0.18, 0.22, 0.03]} />
                            <meshStandardMaterial color="#9f1239" roughness={0.3} />
                          </mesh>
                        )}

                        {/* Floating Text above staff member's head */}
                        <Text
                          position={[0, 1.5, 0]}
                          fontSize={0.32}
                          color={roleColors.label}
                          anchorX="center"
                          anchorY="middle"
                          outlineWidth={0.03}
                          outlineColor="#090d16"
                        >
                          {`${s.name} (${s.role.toUpperCase()})`}
                        </Text>
                        <Text
                          position={[0, 1.12, 0]}
                          fontSize={0.24}
                          color="#cbd5e1"
                          anchorX="center"
                          anchorY="middle"
                          outlineWidth={0.02}
                          outlineColor="#090d16"
                        >
                          {s.currentTask ? `⚡ ${s.currentTask}` : '⚡ Idle'}
                        </Text>
                      </group>
                    );
                  })}
                
                {/* Render labels */}
                {floor.labels?.map((label) => (
                  <Text
                    key={label.id}
                    position={[
                      label.x * TILE_SIZE + TILE_SIZE / 2, 
                      0.2, 
                      label.y * TILE_SIZE + TILE_SIZE / 2
                    ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={1.5}
                    color="#f8fafc"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#0f172a"
                  >
                    {label.text}
                  </Text>
                ))}

                {/* Render guests for this floor */}
                {guests.filter(g => g.floorIndex === floorIndex || g.floorIndex === floor.level).map(guest => {
                  const vipEmojis = {
                    champagne: '🍾',
                    valet: '🤵',
                    suite: '🌸',
                    spa: '🛁'
                  };
                  return (
                    <group 
                      key={guest.id} 
                      position={[
                        guest.x * TILE_SIZE + TILE_SIZE / 2, 
                        0.8, 
                        guest.y * TILE_SIZE + TILE_SIZE / 2
                      ]}
                    >
                      {/* Realistic Trouser Legs */}
                      <mesh position={[-0.1, -0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
                        <meshStandardMaterial color={guest.isVip ? "#1e293b" : "#1e3a8a"} roughness={0.7} />
                      </mesh>
                      <mesh position={[0.1, -0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
                        <meshStandardMaterial color={guest.isVip ? "#1e293b" : "#1e3a8a"} roughness={0.7} />
                      </mesh>

                      {/* Realistic Shoes */}
                      <mesh position={[-0.1, -0.76, 0.04]} castShadow>
                        <boxGeometry args={[0.12, 0.08, 0.22]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.9} />
                      </mesh>
                      <mesh position={[0.1, -0.76, 0.04]} castShadow>
                        <boxGeometry args={[0.12, 0.08, 0.22]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.9} />
                      </mesh>

                      {/* Smart Torso / Suit Jacket */}
                      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.42, 0.55, 0.26]} />
                        <meshStandardMaterial 
                          color={guest.isVip ? "#d97706" : "#2563eb"} 
                          metalness={guest.isVip ? 0.4 : 0} 
                          roughness={guest.isVip ? 0.3 : 0.6} 
                        />
                      </mesh>

                      {/* Stylish Suit Collar */}
                      <mesh position={[0, 0.2, 0.02]} castShadow>
                        <boxGeometry args={[0.22, 0.06, 0.16]} />
                        <meshStandardMaterial color="#ffffff" roughness={0.4} />
                      </mesh>

                      {/* Red VIP Bowtie or Necktie */}
                      {guest.isVip && (
                        <mesh position={[0, 0.12, 0.14]} rotation={[0.1, 0, 0]}>
                          <coneGeometry args={[0.045, 0.16, 4]} />
                          <meshStandardMaterial color="#dc2626" roughness={0.4} />
                        </mesh>
                      )}

                      {/* Stylized Arms */}
                      <mesh position={[-0.26, -0.1, 0]} rotation={[0, 0, 0.15]} castShadow>
                        <cylinderGeometry args={[0.055, 0.045, 0.48, 8]} />
                        <meshStandardMaterial color={guest.isVip ? "#d97706" : "#2563eb"} roughness={0.6} />
                      </mesh>
                      <mesh position={[0.26, -0.1, 0]} rotation={[0, 0, -0.15]} castShadow>
                        <cylinderGeometry args={[0.055, 0.045, 0.48, 8]} />
                        <meshStandardMaterial color={guest.isVip ? "#d97706" : "#2563eb"} roughness={0.6} />
                      </mesh>

                      {/* Realistic Head with Skin Tone */}
                      <mesh position={[0, 0.4, 0]} castShadow>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial color={guest.isVip ? "#fed7aa" : "#ffedd5"} roughness={0.3} />
                      </mesh>

                      {/* Detailed Eyes looking forward */}
                      <mesh position={[-0.07, 0.43, 0.16]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.2} />
                      </mesh>
                      <mesh position={[0.07, 0.43, 0.16]}>
                        <sphereGeometry args={[0.025, 8, 8]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.2} />
                      </mesh>

                      {/* Hair overlay */}
                      <mesh position={[0, 0.48, -0.04]} castShadow>
                        <sphereGeometry args={[0.21, 12, 12]} />
                        <meshStandardMaterial color={guest.isVip ? "#451a03" : "#7c2d12"} roughness={0.8} />
                      </mesh>

                      {/* Majestic Royal Crown for VIP guests */}
                      {guest.isVip && (
                        <mesh position={[0, 0.62, 0]}>
                          <cylinderGeometry args={[0.14, 0.1, 0.14, 8, 1, true]} />
                          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
                        </mesh>
                      )}
                      <Text
                        position={[0, 1.6, 0]}
                        fontSize={0.4}
                        color={guest.isVip ? "#f59e0b" : "#e2e8f0"}
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.03}
                        outlineColor="#090d16"
                      >
                        {guest.isVip ? `👑 VIP: ${guest.state}` : guest.state}
                      </Text>
                      {guest.feedback && Date.now() < guest.feedback.visibleUntil ? (
                        <Text
                          position={[0, 2.3, 0]}
                          fontSize={0.35}
                          color={
                            guest.feedback.type === 'happy' ? '#34d399' :
                            guest.feedback.type === 'angry' ? '#fb7185' :
                            '#cbd5e1'
                          }
                          anchorX="center"
                          anchorY="middle"
                          outlineWidth={0.03}
                          outlineColor="#090d16"
                        >
                          {`${guest.feedback.emoji} "${guest.feedback.text}"`}
                        </Text>
                      ) : guest.isVip && guest.vipNeed ? (
                        <Text
                          position={[0, 2.2, 0]}
                          fontSize={0.7}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {vipEmojis[guest.vipNeed] || '⭐'}
                        </Text>
                      ) : guest.need && guest.need !== 'none' ? (
                        <Text
                          position={[0, 2.2, 0]}
                          fontSize={0.6}
                          anchorX="center"
                          anchorY="middle"
                        >
                          {guest.need === 'hungry' ? '🍔' : '💤'}
                        </Text>
                      ) : null}
                    </group>
                  );
                })}
              </group>
            );
          })}
        </group>
      </Canvas>

      {/* KONE POLARIS DCS INTERACTIVE HUD PORTAL */}
      {konePortalOpen && (
        <div id="kone-polaris-modal" className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            {/* Header branding */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    KONE Polaris DCS
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Destination Control System • v4.8</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setKonePortalOpen(false);
                  stopElevatorMusic();
                  setKoneMusicChannel('none');
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Interactive Screen */}
            <div className="p-5 flex-1 flex flex-col gap-5">
              {/* Telemetry Display */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl font-mono text-[11px] text-slate-300 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute right-2 top-2 text-[9px] text-emerald-500/30 font-black tracking-widest flex items-center gap-1">
                  <Activity size={10} className="animate-pulse" />
                  <span>LIVE COUPLING</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>CURRENT FLOOR: <span className="text-emerald-400 font-bold">{floors[koneOriginFloor]?.name ? floors[koneOriginFloor].name.split(':')[0] : `Floor ${koneOriginFloor + 1}`}</span></div>
                  <div>TARGET FLOOR: <span className="text-blue-400 font-bold">{floors[koneTargetFloor]?.name ? floors[koneTargetFloor].name.split(':')[0] : `Floor ${koneTargetFloor + 1}`}</span></div>
                  <div>DISPATCH STATUS: <span className={`font-black ${koneStatus === 'transit' ? 'text-amber-400 animate-pulse' : koneStatus === 'arrived' ? 'text-emerald-400' : 'text-slate-400'}`}>{koneStatus.toUpperCase()}</span></div>
                  <div>CABIN ASSIGNED: <span className="text-amber-500 font-bold">{koneStatus === 'idle' ? 'STANDBY' : `CABIN ${koneCabin}`}</span></div>
                </div>

                {/* Simulated Shaft Graphic */}
                <div className="mt-2.5 border-t border-slate-900 pt-2.5 flex items-center justify-between">
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                    <div 
                      className={`h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ${isElevatorMoving ? 'w-1/2 animate-pulse' : 'w-full'}`} 
                    />
                  </div>
                </div>
              </div>

              {/* Status/Logs Terminal */}
              <div className="flex-1 min-h-[100px] bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-1.5 overflow-y-auto max-h-[140px] font-mono text-[10px]">
                {koneStatus === 'dispatching' && (
                  <div className="flex flex-col gap-1 text-amber-500">
                    {dispatchLogs.map((log, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="animate-spin text-amber-500">⏳</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
                {koneStatus !== 'dispatching' && koneVoiceLog.map((log, i) => (
                  <div key={i} className={`text-slate-400 border-l-2 pl-2 ${i === 0 ? 'text-emerald-400 border-emerald-500 font-bold' : 'border-slate-800'}`}>
                    {log}
                  </div>
                ))}
              </div>

              {/* Floor Selection Grid (Polaris Target UI) */}
              {koneStatus === 'idle' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Destination Floor:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {floors.map((floor, floorIndex) => {
                      const isCurrent = floorIndex === koneOriginFloor;
                      const labelText = floor.name 
                        ? (floor.name.includes('Floor') ? floor.name.split(':')[0].replace('Floor ', '') + 'F' : floor.name.split(':')[0]) 
                        : `${floor.level + 1}F`;
                      return (
                        <button
                          key={floorIndex}
                          onClick={() => handleSelectDestination(floorIndex)}
                          className={`py-3.5 px-2 rounded-xl border font-mono font-black text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-850 hover:border-slate-750 text-white active:scale-95'
                          }`}
                          disabled={isCurrent}
                        >
                          <span className="truncate max-w-full">{labelText}</span>
                          <span className="text-[8px] font-normal text-slate-500 mt-1">
                            {isCurrent ? 'Current' : 'Select'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transit Screen */}
              {koneStatus === 'transit' && (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-3">
                  <div className="relative w-14 h-14 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin flex items-center justify-center">
                    <span className="font-mono text-xs font-black text-amber-500">{koneCabin}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider animate-pulse">Transit In Progress</h4>
                    <p className="text-xs text-slate-400 mt-1">Please stand clear of the sliding doors.</p>
                  </div>
                </div>
              )}

              {/* Arrived Screen */}
              {koneStatus === 'arrived' && (
                <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <span className="font-bold text-xl">✓</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Arrived on {floors[koneTargetFloor]?.name ? floors[koneTargetFloor].name.split(':')[0] : `Floor ${koneTargetFloor + 1}`}</h4>
                    <p className="text-xs text-slate-400 mt-1">DCS dispatch cycle complete.</p>
                  </div>
                  <button
                    onClick={() => setKoneStatus('idle')}
                    className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white px-4 py-2 rounded-lg transition-all cursor-pointer font-bold"
                  >
                    Select Another Floor
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Controls Panel (Emergency Stop, Audio channels) */}
            <div className="bg-slate-950 p-4 border-t border-slate-850 flex items-center justify-between">
              {/* Elevator Audio Playlist switcher */}
              <div className="flex items-center gap-2">
                <Music size={14} className="text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Music:</span>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex gap-1">
                  <button
                    onClick={() => setKoneMusicChannel('none')}
                    className={`px-2 py-1 text-[9px] font-bold rounded transition-all cursor-pointer uppercase ${koneMusicChannel === 'none' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Mute
                  </button>
                  <button
                    onClick={() => setKoneMusicChannel('lounge')}
                    className={`px-2 py-1 text-[9px] font-bold rounded transition-all cursor-pointer uppercase ${koneMusicChannel === 'lounge' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Jazz
                  </button>
                </div>
              </div>

              {/* EMERGENCY ALARM */}
              <button
                onClick={() => {
                  triggerEmergencyAlarm();
                  addVoiceLog("WARNING: Emergency Alarm broadcast active.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer hover:shadow-lg active:scale-95"
              >
                <ShieldAlert size={12} />
                <span>Alarm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STANDARD ELEVATOR INTERACTIVE HUD PORTAL */}
      {standardPortalOpen && (
        <div id="standard-elevator-modal" className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    Standard Elevator
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Analog Point-to-Point Controller</p>
                </div>
              </div>
              <button 
                onClick={() => setStandardPortalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Standard Floor Selection Grid */}
            <div className="p-6 flex flex-col gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Select Destination Floor</span>
              <div className="grid grid-cols-3 gap-3">
                {floors.map((floor, idx) => {
                  const isCurrent = idx === standardOriginFloor;
                  return (
                    <button
                      key={floor.level}
                      onClick={() => {
                        if (idx === standardOriginFloor) return;
                        callElevator(idx);
                        setActiveFloor(idx);
                        setStandardPortalOpen(false);
                      }}
                      disabled={isCurrent}
                      className={`py-3 rounded-xl border font-mono text-sm font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-blue-500/10 border-blue-500 text-blue-400 opacity-60 cursor-not-allowed'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-blue-500 hover:text-slate-950 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-lg">{idx + 1}F</span>
                      <span className="text-[8px] font-sans font-bold uppercase truncate max-w-full px-1">{floor.name?.split(':')[0] || `Level ${floor.level}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
