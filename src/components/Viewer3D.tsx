import React, { useMemo, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Text, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useHotelStore } from '../store';
import { TileType } from '../types';

const GRID_SIZE = 20;
const TILE_SIZE = 2;
const WALL_HEIGHT = 2.5;
const FLOOR_HEIGHT = 0.1;

const FpsControls = () => {
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  
  useEffect(() => {
    // Start at a reasonable position
    camera.position.set(0, 1.5, 0);
    
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame((state, delta) => {
    const speed = 10 * delta;
    const dir = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, (keys.current['KeyS'] ? 1 : 0) - (keys.current['KeyW'] ? 1 : 0));
    const sideVector = new THREE.Vector3((keys.current['KeyD'] ? 1 : 0) - (keys.current['KeyA'] ? 1 : 0), 0, 0);
    
    dir.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed).applyEuler(camera.rotation);
    dir.y = 0; // Prevent flying
    camera.position.add(dir);
    camera.position.y = 1.5; // keep head height
  });

  return <PointerLockControls />;
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

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.85, 0.6, h * TILE_SIZE * 0.85]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh position={pillowPos}>
        <boxGeometry args={pillowArgs} />
        <meshStandardMaterial color="#ffffff" />
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
         <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.8, 0.1, h * TILE_SIZE * 0.8]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.2, 0.5, h * TILE_SIZE * 0.2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
};

const MergedReception = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.9, 1.2, h * TILE_SIZE * 0.9]} />
        <meshStandardMaterial color="#9a3412" />
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

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2, 0]} rotation={[0, windowRotation, 0]}>
        <boxGeometry args={[glassLength, WALL_HEIGHT * 0.3, TILE_SIZE * 0.2]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
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

  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2 - 0.25, 0]} rotation={[0, doorRotation, 0]}>
        <boxGeometry args={[doorLength, WALL_HEIGHT - 0.5, TILE_SIZE * 0.2]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
    </group>
  );
};

const MergedBathroom = ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) => {
  const centerX = x * TILE_SIZE + (w * TILE_SIZE) / 2;
  const centerZ = y * TILE_SIZE + (h * TILE_SIZE) / 2;
  return (
    <group position={[centerX, 0, centerZ]}>
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#cffafe" />
      </mesh>
      {/* Bathtub/Sink block */}
      <mesh position={[0, 0.4, 0]}>
         <boxGeometry args={[w * TILE_SIZE * 0.5, 0.8, h * TILE_SIZE * 0.5]} />
         <meshStandardMaterial color="#ffffff" />
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
      {/* Staff desk */}
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
      <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
         <boxGeometry args={[w * TILE_SIZE, FLOOR_HEIGHT, h * TILE_SIZE]} />
         <meshStandardMaterial color="#c084fc" />
      </mesh>
      <mesh position={[0, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[w * TILE_SIZE * 0.9, WALL_HEIGHT, h * TILE_SIZE * 0.9]} />
        <meshStandardMaterial color="#6b21a8" transparent opacity={0.9} />
      </mesh>
      {/* Elevator Doors on one side */}
      <mesh position={[0, WALL_HEIGHT / 2 - 0.25, h * TILE_SIZE * 0.45 + 0.05]}>
        <boxGeometry args={[w * TILE_SIZE * 0.5, WALL_HEIGHT - 0.5, 0.1]} />
        <meshStandardMaterial color="#d8b4fe" />
      </mesh>
    </group>
  );
};

const TileModel = ({ type, position }: { type: TileType, position: [number, number, number] }) => {
  const [px, py, pz] = position;
  switch (type) {
    case 'floor':
      return (
        <mesh position={[px, py + FLOOR_HEIGHT / 2, pz]}>
          <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      );
    case 'wall':
      return (
        <mesh position={[px, py + WALL_HEIGHT / 2, pz]}>
          <boxGeometry args={[TILE_SIZE, WALL_HEIGHT, TILE_SIZE]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      );
    case 'plant':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      );
    case 'elevator':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial color="#c084fc" />
          </mesh>
          <mesh position={[0, WALL_HEIGHT / 2, 0]}>
            <boxGeometry args={[TILE_SIZE * 0.9, WALL_HEIGHT, TILE_SIZE * 0.9]} />
            <meshStandardMaterial color="#6b21a8" />
          </mesh>
        </group>
      );
    case 'bathroom':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial color="#cffafe" />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
             <boxGeometry args={[TILE_SIZE * 0.5, 0.8, TILE_SIZE * 0.5]} />
             <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    case 'staff':
      return (
        <group position={[px, py, pz]}>
          <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
             <boxGeometry args={[TILE_SIZE, FLOOR_HEIGHT, TILE_SIZE]} />
             <meshStandardMaterial color="#ffe4e6" />
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
  const { floors, guests } = useHotelStore();

  const offsetX = (GRID_SIZE * TILE_SIZE) / 2;
  const offsetZ = (GRID_SIZE * TILE_SIZE) / 2;

  // Types that are merged visually
  const mergedTypes = ['bed', 'table', 'reception', 'window', 'door', 'elevator', 'bathroom', 'staff'];

  return (
    <div className="flex-1 bg-slate-200 w-full h-full relative cursor-move">
      {mode === 'Walk' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium pointer-events-none">
          Click to look around • WASD to walk • ESC to release mouse
        </div>
      )}
      <Canvas camera={mode === 'Walk' ? undefined : { position: [25, 25, 25], fov: 50 }}>
        {mode === 'Walk' ? <FpsControls /> : <OrbitControls makeDefault />}
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.5} />
        
        {/* Ground Plane */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#cbd5e1" />
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
                    // Skip rendering individual tiles for merged types
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
                      0.2, // Slightly above the floor
                      label.y * TILE_SIZE + TILE_SIZE / 2
                    ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={1.5}
                    color="#1e293b"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#ffffff"
                  >
                    {label.text}
                  </Text>
                ))}

                {/* Render guests for this floor */}
                {guests.filter(g => g.floorIndex === floor.level).map(guest => (
                  <group 
                    key={guest.id} 
                    position={[
                      guest.x * TILE_SIZE + TILE_SIZE / 2, 
                      0.8, // Half height of guest cylinder
                      guest.y * TILE_SIZE + TILE_SIZE / 2
                    ]}
                  >
                    {/* Body */}
                    <mesh>
                      <cylinderGeometry args={[0.3, 0.3, 1.6, 16]} />
                      <meshStandardMaterial color="#3b82f6" />
                    </mesh>
                    {/* Head */}
                    <mesh position={[0, 1, 0]}>
                      <sphereGeometry args={[0.3, 16, 16]} />
                      <meshStandardMaterial color="#fca5a5" />
                    </mesh>
                    {/* Status indicator floating above head */}
                    <Text
                      position={[0, 1.6, 0]}
                      fontSize={0.4}
                      color="#1e293b"
                      anchorX="center"
                      anchorY="middle"
                      outlineWidth={0.02}
                      outlineColor="#ffffff"
                    >
                      {guest.state}
                    </Text>
                    {/* Needs indicator floating above state */}
                    {guest.need && guest.need !== 'none' && (
                      <Text
                        position={[0, 2.2, 0]}
                        fontSize={0.6}
                        anchorX="center"
                        anchorY="middle"
                      >
                        {guest.need === 'hungry' ? '🍔' : '💤'}
                      </Text>
                    )}
                  </group>
                ))}
              </group>
            );
          })}
        </group>

        <OrbitControls 
          makeDefault 
          target={[0, 5, 0]} 
          minDistance={5} 
          maxDistance={100} 
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
        <div className="inline-block bg-white/90 backdrop-blur-sm px-4 py-2 rounded shadow-sm border border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          Left Click: Rotate | Right Click: Pan | Scroll: Zoom
        </div>
      </div>
    </div>
  );
};

