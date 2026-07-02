import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useHotelStore } from '../store';
import { TileType } from '../types';
import { ChevronUp, ChevronDown, Move, Eye } from 'lucide-react';

const GRID_SIZE = 20;
const TILE_SIZE = 2;
const WALL_HEIGHT = 3.8; // Taller ceiling height like in real-life luxury hotels
const FLOOR_HEIGHT = 0.1;

// --- HIGH FIDELITY PROCEDURAL TEXTURE GENERATORS ---
const createTerrazzoTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Base off-white plaster
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);
  
  // Tiled grid line overlay (luxury large terrazzo tiles)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 512, 512);
  
  // Random elegant quartz and marble chips (amber, charcoal, warm gold, cool slate)
  const colors = ['#f59e0b', '#d97706', '#64748b', '#334155', '#e2e8f0', '#cbd5e1', '#b45309'];
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
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

const createWallTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Elegant dark slate concrete
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);
  
  // Fine concrete grain speckles
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }
  ctx.fillStyle = '#334155';
  for (let i = 0; i < 200; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2.5, 2.5);
  }
  
  // Horizontal grooves for paneled modular luxury architectural feel
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let y = 0; y <= 512; y += 128) {
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
  }
  ctx.stroke();
  
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
let cachedTerrazzo: THREE.CanvasTexture | null = null;
let cachedWall: THREE.CanvasTexture | null = null;
let cachedMahogany: THREE.CanvasTexture | null = null;
let cachedWood: THREE.CanvasTexture | null = null;
let cachedFabricSheets: THREE.CanvasTexture | null = null;
let cachedFabricBlanket: THREE.CanvasTexture | null = null;
let cachedBathroom: THREE.CanvasTexture | null = null;

const getTerrazzoTexture = () => {
  if (!cachedTerrazzo) cachedTerrazzo = createTerrazzoTexture();
  return cachedTerrazzo;
};
const getWallTexture = () => {
  if (!cachedWall) cachedWall = createWallTexture();
  return cachedWall;
};
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
const getFabricBlanketTexture = () => {
  if (!cachedFabricBlanket) cachedFabricBlanket = createFabricTexture('#e11d48'); // rich crimson velvet
  return cachedFabricBlanket;
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
  const { activeFloorIndex, floors } = useHotelStore();
  const keys = useRef<{ [key: string]: boolean }>({});
  
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isDragging = useRef(false);
  const prevX = useRef(0);
  const prevY = useRef(0);
  const bobTimer = useRef(0);

  useEffect(() => {
    // Spawn exactly at the front entrance (row 14, x: 10) on the Ground Floor, looking straight ahead!
    const eyeHeight = activeFloorIndex * WALL_HEIGHT + 1.7; // Realistic human eye level (1.7m)
    camera.position.set(1, eyeHeight, 10); // Center entrance position in World Coordinates
    
    // Facing forward (straight ahead / slightly downward to see the reception)
    yaw.current = 0;
    pitch.current = -0.05;
    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch.current, yaw.current, 0);
    
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.no-pointer-lock') || target.closest('.joystick-container')) {
        return;
      }
      isDragging.current = true;
      prevX.current = e.clientX;
      prevY.current = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - prevX.current;
      const deltaY = e.clientY - prevY.current;
      prevX.current = e.clientX;
      prevY.current = e.clientY;

      yaw.current -= deltaX * 0.0035; // smooth look sensitivity
      pitch.current -= deltaY * 0.0035;
      pitch.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch.current)); // clamp gaze
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [camera, activeFloorIndex]);

  useFrame((state, delta) => {
    const speed = 7.5 * delta;
    let isMoving = false;
    
    let forward = 0;
    let strafe = 0;
    
    if (keys.current['KeyW'] || keys.current['ArrowUp']) forward += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) forward -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) strafe += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) strafe -= 1;
    
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
      const radius = 0.55; // Realistic human collision thickness radius
      const activeFloor = floors[activeFloorIndex];
      if (!activeFloor) return false;

      // Cast checks in an 8-axis perimeter ring
      const angles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];
      for (const angle of angles) {
        const testX = pos.x + Math.cos(angle) * radius;
        const testZ = pos.z + Math.sin(angle) * radius;

        // Map world coordinates back to layout grid coords
        // worldX = gridX * TILE_SIZE + TILE_SIZE/2 - offset, with offset = (GRID_SIZE * TILE_SIZE)/2 = 20
        // Therefore, gridX = (worldX + 20) / 2
        const gx = Math.floor((testX + 20) / 2);
        const gy = Math.floor((testZ + 20) / 2);

        if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
          const tile = activeFloor.grid[gy]?.[gx];
          if (tile === 'wall') {
            return true; // Collision detected!
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
    
    // Immersive head bobbing animation for realistic stride feel
    if (isMoving) {
      bobTimer.current += delta * 11;
    } else {
      bobTimer.current = Math.max(0, bobTimer.current - delta * 5);
    }
    const bobOffset = isMoving ? Math.sin(bobTimer.current) * 0.07 : 0;
    
    const baseFloorY = activeFloorIndex * WALL_HEIGHT;
    camera.position.y = baseFloorY + 1.7 + bobOffset;
  });

  return null;
};

const getMergedBlocks = (grid: TileType[][], type: TileType) => {
  const height = grid.length;
  const width = grid[0].length;
  const visited = Array(height).fill(0).map(() => Array(width).fill(false));
  const blocks: {x: number, y: number, w: number, h: number}[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === type && !visited[y][x]) {
        let w = 1;
        while (x + w < width && grid[y][x + w] === type && !visited[y][x + w]) {
          w++;
        }
        let h = 1;
        let canExpand = true;
        while (y + h < height && canExpand) {
          for (let i = 0; i < w; i++) {
            if (grid[y + h][x + i] !== type || visited[y + h][x + i]) {
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
        blocks.push({ x, y, w, h });
      }
    }
  }
  return blocks;
};

const MergedBed = ({ x, y, w, h, grid }: { x: number, y: number, w: number, h: number, grid: TileType[][] }) => {
  let touchesTop = false, touchesBottom = false, touchesLeft = false, touchesRight = false;
  for (let i = 0; i < w; i++) {
    if (y > 0 && grid[y-1][x+i] === 'wall') touchesTop = true;
    if (y + h < grid.length && grid[y+h][x+i] === 'wall') touchesBottom = true;
  }
  for (let i = 0; i < h; i++) {
    if (x > 0 && grid[y+i][x-1] === 'wall') touchesLeft = true;
    if (x + w < grid[0].length && grid[y+i][x+w] === 'wall') touchesRight = true;
  }

  let pillowPos: [number, number, number] = [0, 0.75, -h * TILE_SIZE * 0.45 + 0.4];
  let pillowArgs: [number, number, number] = [w * TILE_SIZE * 0.6, 0.1, 0.4];

  if (touchesLeft && !touchesTop && !touchesBottom) {
    pillowPos = [-w * TILE_SIZE * 0.45 + 0.4, 0.75, 0];
    pillowArgs = [0.4, 0.1, h * TILE_SIZE * 0.6];
  } else if (touchesRight && !touchesTop && !touchesBottom) {
    pillowPos = [w * TILE_SIZE * 0.45 - 0.4, 0.75, 0];
    pillowArgs = [0.4, 0.1, h * TILE_SIZE * 0.6];
  } else if (touchesBottom && !touchesTop) {
    pillowPos = [0, 0.75, h * TILE_SIZE * 0.45 - 0.4];
    pillowArgs = [w * TILE_SIZE * 0.6, 0.1, 0.4];
  }

  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;

  const fabricSheets = getFabricSheetsTexture();
  const fabricBlanket = getFabricBlanketTexture();

  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Wood Base Bed Frame */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getWoodTexture()} roughness={0.7} />
      </mesh>
      {/* Cozy Mattress with Crimson Blanket */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.85, 0.6, h * TILE_SIZE * 0.85]} />
        <meshStandardMaterial map={fabricBlanket} roughness={0.9} />
      </mesh>
      {/* White Pillow sheets */}
      <mesh position={pillowPos}>
        <boxGeometry args={pillowArgs} />
        <meshStandardMaterial map={fabricSheets} roughness={0.95} />
      </mesh>
    </group>
  );
};

const MergedTable = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Wooden tabletop */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.8, 0.1, h * TILE_SIZE * 0.8]} />
        <meshStandardMaterial map={getWoodTexture()} roughness={0.65} />
      </mesh>
      {/* Center column stand */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.2, 0.5, h * TILE_SIZE * 0.2]} />
        <meshStandardMaterial map={getMahoganyTexture()} roughness={0.8} />
      </mesh>
    </group>
  );
};

const MergedReception = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Terrazzo desk base slab */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
      </mesh>
      {/* Mahogany Front Desk Counter */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.9, 1.2, h * TILE_SIZE * 0.9]} />
        <meshStandardMaterial map={getMahoganyTexture()} roughness={0.7} />
      </mesh>
    </group>
  );
};

const MergedWindow = ({ x, y, w, h, grid }: { x: number, y: number, w: number, h: number, grid: TileType[][] }) => {
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
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2, 0]} rotation={[0, windowRotation, 0]}>
        <boxGeometry args={[glassLength, windowHeight, TILE_SIZE * 0.15]} />
        <meshStandardMaterial color="#a5f3fc" transparent opacity={0.65} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const MergedDoor = ({ x, y, w, h, grid }: { x: number, y: number, w: number, h: number, grid: TileType[][] }) => {
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
  const doorLength = doorRotation === 0 ? w * TILE_SIZE * 0.9 : h * TILE_SIZE * 0.9;

  // Hardcode door height to a highly realistic 2.2 meters instead of matching full WALL_HEIGHT
  const doorHeight = 2.2;

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
      </mesh>
      {/* Mahogany Wood Door Slab */}
      <mesh position={[0, doorHeight / 2, 0]} rotation={[0, doorRotation, 0]}>
        <boxGeometry args={[doorLength, doorHeight, TILE_SIZE * 0.18]} />
        <meshStandardMaterial map={getMahoganyTexture()} roughness={0.7} />
      </mesh>
      {/* Metallic Door Frame / Transom overhead */}
      {WALL_HEIGHT > doorHeight && (
        <mesh position={[0, (WALL_HEIGHT + doorHeight) / 2, 0]} rotation={[0, doorRotation, 0]}>
          <boxGeometry args={[w * TILE_SIZE, WALL_HEIGHT - doorHeight, TILE_SIZE * 0.22]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.15} />
        </mesh>
      )}
    </group>
  );
};

const MergedBathroom = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Beautiful Aqua Mosaic tiles */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getBathroomTexture()} roughness={0.3} />
      </mesh>
      {/* Porcelain sink vanity counter */}
      <mesh position={[0, 0.4, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.5, 0.8, h * TILE_SIZE * 0.5]} />
         <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.1} />
      </mesh>
    </group>
  );
};

const MergedStaff = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#ffe4e6" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.7, 0.1, h * TILE_SIZE * 0.3]} />
         <meshStandardMaterial color="#9f1239" />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.2, 0.3, h * TILE_SIZE * 0.1]} />
         <meshStandardMaterial color="#e11d48" />
      </mesh>
    </group>
  );
};

const MergedElevator = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      {/* Terrazzo marble elevator landing */}
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial map={getTerrazzoTexture()} roughness={0.4} />
      </mesh>
      {/* Premium metallic brass shaft box */}
      <mesh position={[0, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.9, WALL_HEIGHT, h * TILE_SIZE * 0.9]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} transparent opacity={0.95} />
      </mesh>
      {/* Gold metallic sliding Elevator Doors */}
      <mesh position={[0, 1.2, h * TILE_SIZE * 0.45 + 0.05]}>
        <boxGeometry args={[w * TILE_SIZE * 0.5, 2.4, 0.1]} />
        <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.05} />
      </mesh>
    </group>
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

export const Viewer3D: React.FC<{ mode?: string }> = ({ mode = '3D' }) => {
  const { floors, guests, activeFloorIndex, setActiveFloor } = useHotelStore();

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
  const mergedTypes = ['bed', 'table', 'reception', 'window', 'door', 'elevator', 'bathroom', 'staff'];

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
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        
        {/* Ground Plane */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        <group position={[-offsetX, 0, -offsetZ]}>
          {floors.map((floor) => {
            const bedBlocks = getMergedBlocks(floor.grid, 'bed');
            const tableBlocks = getMergedBlocks(floor.grid, 'table');
            const receptionBlocks = getMergedBlocks(floor.grid, 'reception');
            const windowBlocks = getMergedBlocks(floor.grid, 'window');
            const doorBlocks = getMergedBlocks(floor.grid, 'door');
            const elevatorBlocks = getMergedBlocks(floor.grid, 'elevator');
            const bathroomBlocks = getMergedBlocks(floor.grid, 'bathroom');
            const staffBlocks = getMergedBlocks(floor.grid, 'staff');

            return (
              <group key={floor.level} position={[0, floor.level * WALL_HEIGHT, 0]}>
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
                {bedBlocks.map((b, i) => <MergedBed key={`bed-${i}`} {...b} grid={floor.grid} />)}
                {tableBlocks.map((b, i) => <MergedTable key={`table-${i}`} {...b} />)}
                {receptionBlocks.map((b, i) => <MergedReception key={`rec-${i}`} {...b} />)}
                {windowBlocks.map((b, i) => <MergedWindow key={`win-${i}`} {...b} grid={floor.grid} />)}
                {doorBlocks.map((b, i) => <MergedDoor key={`door-${i}`} {...b} grid={floor.grid} />)}
                {elevatorBlocks.map((b, i) => <MergedElevator key={`ele-${i}`} {...b} />)}
                {bathroomBlocks.map((b, i) => <MergedBathroom key={`bath-${i}`} {...b} />)}
                {staffBlocks.map((b, i) => <MergedStaff key={`staff-${i}`} {...b} />)}
                
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
                {guests.filter(g => g.floorIndex === floor.level).map(guest => {
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
                      <mesh castShadow receiveShadow>
                        <cylinderGeometry args={[0.3, 0.3, 1.6, 16]} />
                        <meshStandardMaterial color={guest.isVip ? "#f59e0b" : "#2563eb"} metalness={guest.isVip ? 0.7 : 0} roughness={guest.isVip ? 0.1 : 0.5} />
                      </mesh>
                      <mesh position={[0, 1, 0]} castShadow>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshStandardMaterial color={guest.isVip ? "#fef08a" : "#fca5a5"} />
                      </mesh>
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
    </div>
  );
};
