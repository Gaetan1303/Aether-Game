export interface IsoCoords {
  x: number;
  y: number;
}

export function createIsoCoords(x: number = 0, y: number = 0): IsoCoords {
  return { x, y };
}

export function isoCoordsEquals(coords1: IsoCoords, coords2: IsoCoords): boolean {
  return coords1.x === coords2.x && coords1.y === coords2.y;
}

export function addIsoCoords(coords1: IsoCoords, coords2: IsoCoords): IsoCoords {
  return {
    x: coords1.x + coords2.x,
    y: coords1.y + coords2.y
  };
}

export function subtractIsoCoords(coords1: IsoCoords, coords2: IsoCoords): IsoCoords {
  return {
    x: coords1.x - coords2.x,
    y: coords1.y - coords2.y
  };
}

export function distanceBetweenIsoCoords(coords1: IsoCoords, coords2: IsoCoords): number {
  const dx = coords1.x - coords2.x;
  const dy = coords1.y - coords2.y;
  return Math.sqrt(dx * dx + dy * dy);
}