import { Injectable } from '@angular/core';
import { Position3D } from '../models/position-3d.model';
import { IsoCoords } from '../models/iso-coordinates.model';

@Injectable({ providedIn: 'root' })
export class IsoRendererService {
  // Configuration isométrique
  private readonly TILE_WIDTH = 64;
  private readonly TILE_HEIGHT = 32;
  private readonly TILE_DEPTH = 16;
  
  // Décalages pour centrer la grille
  private readonly GRID_OFFSET_X = 640;
  private readonly GRID_OFFSET_Y = 100;
  
  // Angles isométriques (en radians)
  private readonly ISO_ANGLE = Math.PI / 4; // 45 degrés
  
  /**
   * Convertit des coordonnées de grille 3D en coordonnées écran 2D isométriques
   */
  toIsoCoords(pos: Position3D): IsoCoords {
    // Formule isométrique classique
    const isoX = (pos.x - pos.y) * (this.TILE_WIDTH / 2) + this.GRID_OFFSET_X;
    const isoY = (pos.x + pos.y) * (this.TILE_HEIGHT / 2) + this.GRID_OFFSET_Y - (pos.z * this.TILE_DEPTH);
    
    return { x: isoX, y: isoY };
  }
  
  /**
   * Convertit des coordonnées écran en coordonnées de grille 3D
   */
  toGridCoords(screenX: number, screenY: number, z: number = 0): Position3D {
    // Ajuster pour les décalages
    const adjustedX = screenX - this.GRID_OFFSET_X;
    const adjustedY = screenY - this.GRID_OFFSET_Y + (z * this.TILE_DEPTH);
    
    // Transformation inverse isométrique
    const gridX = Math.floor((adjustedX / (this.TILE_WIDTH / 2) + adjustedY / (this.TILE_HEIGHT / 2)) / 2);
    const gridY = Math.floor((adjustedY / (this.TILE_HEIGHT / 2) - adjustedX / (this.TILE_WIDTH / 2)) / 2);
    
    return { x: gridX, y: gridY, z };
  }
  
  /**
   * Calcule l'index Z pour l'ordre de rendu (depth sorting)
   */
  calculateZIndex(pos: Position3D): number {
    // Plus on est vers le bas-droite, plus on doit être devant
    // La hauteur Z ajoute aussi de la profondeur
    return (pos.x + pos.y) * 10 + pos.z;
  }
  
  /**
   * Calcule le Z-index pour l'ordre de rendu avec précision décimale
   */
  calculatePreciseZIndex(pos: Position3D): number {
    return (pos.x + pos.y) + (pos.z * 0.1);
  }
  
  /**
   * Vérifie si des coordonnées écran correspondent à une position de grille valide
   */
  isValidScreenCoords(screenX: number, screenY: number, gridWidth: number, gridHeight: number): boolean {
    const gridPos = this.toGridCoords(screenX, screenY);
    return gridPos.x >= 0 && gridPos.x < gridWidth && 
           gridPos.y >= 0 && gridPos.y < gridHeight;
  }
  
  /**
   * Calcule la distance isométrique entre deux positions écran
   */
  getScreenDistance(coords1: IsoCoords, coords2: IsoCoords): number {
    const dx = coords1.x - coords2.x;
    const dy = coords1.y - coords2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Convertit une liste de positions 3D en chemin isométrique
   */
  convertPathToIsoCoords(path: Position3D[]): IsoCoords[] {
    return path.map(pos => this.toIsoCoords(pos));
  }
  
  /**
   * Calcule l'angle de rotation isométrique pour une direction
   */
  getIsoAngleForDirection(from: Position3D, to: Position3D): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    // Conversion en angle isométrique
    let angle = Math.atan2(dy, dx);
    
    // Ajustement pour le rendu isométrique
    angle -= this.ISO_ANGLE;
    
    return angle;
  }
  
  /**
   * Calcule le rectangle de sélection isométrique pour une zone
   */
  getIsoBounds(positions: Position3D[]): { 
    minX: number, 
    maxX: number, 
    minY: number, 
    maxY: number 
  } {
    if (positions.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    
    const isoCoords = positions.map(pos => this.toIsoCoords(pos));
    
    const minX = Math.min(...isoCoords.map(coord => coord.x));
    const maxX = Math.max(...isoCoords.map(coord => coord.x));
    const minY = Math.min(...isoCoords.map(coord => coord.y));
    const maxY = Math.max(...isoCoords.map(coord => coord.y));
    
    return { minX, maxX, minY, maxY };
  }
  
  /**
   * Calcule les positions de grille adjacentes à une position donnée
   */
  getAdjacentPositions(pos: Position3D, includesDiagonals: boolean = true): Position3D[] {
    const adjacent: Position3D[] = [];
    
    // Directions cardinales
    const cardinalDirections = [
      { x: -1, y: 0, z: 0 },  // Ouest
      { x: 1, y: 0, z: 0 },   // Est
      { x: 0, y: -1, z: 0 },  // Nord
      { x: 0, y: 1, z: 0 }    // Sud
    ];
    
    // Directions diagonales
    const diagonalDirections = [
      { x: -1, y: -1, z: 0 }, // Nord-Ouest
      { x: 1, y: -1, z: 0 },  // Nord-Est
      { x: -1, y: 1, z: 0 },  // Sud-Ouest
      { x: 1, y: 1, z: 0 }    // Sud-Est
    ];
    
    const directions = includesDiagonals 
      ? [...cardinalDirections, ...diagonalDirections]
      : cardinalDirections;
    
    for (const dir of directions) {
      adjacent.push({
        x: pos.x + dir.x,
        y: pos.y + dir.y,
        z: pos.z + dir.z
      });
    }
    
    return adjacent;
  }
  
  /**
   * Calcule les positions dans un rayon donné
   */
  getPositionsInRange(center: Position3D, range: number, includeCenter: boolean = false): Position3D[] {
    const positions: Position3D[] = [];
    
    for (let x = center.x - range; x <= center.x + range; x++) {
      for (let y = center.y - range; y <= center.y + range; y++) {
        for (let z = center.z - range; z <= center.z + range; z++) {
          const pos = { x, y, z };
          
          // Calculer la distance Manhattan
          const distance = Math.abs(pos.x - center.x) + 
                          Math.abs(pos.y - center.y) + 
                          Math.abs(pos.z - center.z);
          
          if (distance <= range && (includeCenter || distance > 0)) {
            positions.push(pos);
          }
        }
      }
    }
    
    return positions;
  }
  
  /**
   * Interpolation linéaire entre deux positions isométriques
   */
  lerpIsoCoords(from: IsoCoords, to: IsoCoords, t: number): IsoCoords {
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };
  }
  
  /**
   * Calcule la position isométrique pour un sprite centré
   */
  getCenteredSpritePosition(pos: Position3D, spriteWidth: number, spriteHeight: number): IsoCoords {
    const isoCoords = this.toIsoCoords(pos);
    
    return {
      x: isoCoords.x - spriteWidth / 2,
      y: isoCoords.y - spriteHeight + this.TILE_HEIGHT / 2
    };
  }
  
  /**
   * Configuration du renderer
   */
  getConfig() {
    return {
      tileWidth: this.TILE_WIDTH,
      tileHeight: this.TILE_HEIGHT,
      tileDepth: this.TILE_DEPTH,
      gridOffsetX: this.GRID_OFFSET_X,
      gridOffsetY: this.GRID_OFFSET_Y,
      isoAngle: this.ISO_ANGLE
    };
  }
  
  /**
   * Met à jour la configuration du renderer
   */
  updateConfig(config: {
    tileWidth?: number,
    tileHeight?: number,
    tileDepth?: number,
    gridOffsetX?: number,
    gridOffsetY?: number
  }): void {
    // TODO: Implémenter la mise à jour dynamique de la configuration
    console.log('Config update requested:', config);
  }
  
  // TODO: Ajouter support pour différents styles isométriques
  // TODO: Ajouter optimisations de culling pour grandes grilles
  // TODO: Ajouter support pour terrains en pente
  // TODO: Ajouter gestion des ombres isométriques
}