export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export function createPosition3D(x: number = 0, y: number = 0, z: number = 0): Position3D {
  return { x, y, z };
}

export function isValidPosition(pos: Position3D, maxX: number, maxY: number, maxZ: number = 10): boolean {
  return pos.x >= 0 && pos.x < maxX && 
         pos.y >= 0 && pos.y < maxY && 
         pos.z >= 0 && pos.z < maxZ;
}

export function distanceBetween(pos1: Position3D, pos2: Position3D): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function manhattanDistance(pos1: Position3D, pos2: Position3D): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
}

export function positionEquals(pos1: Position3D, pos2: Position3D): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y && pos1.z === pos2.z;
}

export function addPositions(pos1: Position3D, pos2: Position3D): Position3D {
  return {
    x: pos1.x + pos2.x,
    y: pos1.y + pos2.y,
    z: pos1.z + pos2.z
  };
}

export function subtractPositions(pos1: Position3D, pos2: Position3D): Position3D {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y,
    z: pos1.z - pos2.z
  };
}