import { Injectable, signal } from '@angular/core';
import * as PIXI from 'pixi.js';
import { BehaviorSubject } from 'rxjs';
import { Position3D } from '../models/position-3d.model';
import { IsoCoords } from '../models/iso-coordinates.model';
import { IsoRendererService } from './iso-renderer.service';

export interface CameraState {
  position: IsoCoords;
  zoom: number;
  rotation: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZoom: number;
    maxZoom: number;
  };
  target?: Position3D;
  following?: string; // ID de l'unité suivie
}

export interface CameraTransition {
  duration: number;
  easing: string;
  onComplete?: () => void;
}

@Injectable({ providedIn: 'root' })
export class CameraService {
  private container?: PIXI.Container;
  
  // État de la caméra (Signal Angular)
  private cameraState = signal<CameraState>({
    position: { x: 0, y: 0 },
    zoom: 1,
    rotation: 0,
    bounds: {
      minX: -1000,
      maxX: 1000,
      minY: -1000,
      maxY: 1000,
      minZoom: 0.5,
      maxZoom: 3.0
    }
  });

  // Observable pour les changements de caméra
  private cameraChanged$ = new BehaviorSubject<CameraState>(this.cameraState());

  // Configuration
  private readonly DEFAULT_ZOOM_SPEED = 0.1;
  private readonly DEFAULT_PAN_SPEED = 5;
  private readonly DEFAULT_FOLLOW_SMOOTHING = 0.1;

  // Variables de contrôle
  private isDragging = false;
  private lastMousePosition = { x: 0, y: 0 };
  private targetPosition?: IsoCoords;
  private followTarget?: { unitId: string, offset: IsoCoords };

  constructor(private isoRenderer: IsoRendererService) {}

  /**
   * Initialise la caméra avec un container Pixi
   */
  initialize(container: PIXI.Container, initialState?: Partial<CameraState>): void {
    this.container = container;
    
    if (initialState) {
      this.updateState(initialState);
    }
    
    this.setupEventHandlers();
    this.applyCameraTransform();
    
    console.log('CameraService initialized');
  }

  /**
   * Obtient l'état actuel de la caméra
   */
  getState() {
    return this.cameraState.asReadonly();
  }

  /**
   * Met à jour l'état de la caméra
   */
  private updateState(updates: Partial<CameraState>): void {
    const currentState = this.cameraState();
    const newState = { ...currentState, ...updates };
    
    // Appliquer les limites
    newState.position.x = Math.max(newState.bounds.minX, Math.min(newState.bounds.maxX, newState.position.x));
    newState.position.y = Math.max(newState.bounds.minY, Math.min(newState.bounds.maxY, newState.position.y));
    newState.zoom = Math.max(newState.bounds.minZoom, Math.min(newState.bounds.maxZoom, newState.zoom));
    
    this.cameraState.set(newState);
    this.cameraChanged$.next(newState);
    
    this.applyCameraTransform();
  }

  /**
   * Déplace la caméra vers une position donnée
   */
  panTo(target: IsoCoords, transition?: CameraTransition): void {
    if (transition) {
      this.animateTo({ position: target }, transition);
    } else {
      this.updateState({ position: target });
    }
  }

  /**
   * Déplace la caméra vers une position de grille
   */
  panToGridPosition(gridPos: Position3D, transition?: CameraTransition): void {
    const isoCoords = this.isoRenderer.toIsoCoords(gridPos);
    this.panTo(isoCoords, transition);
  }

  /**
   * Centre la caméra sur une unité
   */
  centerOnUnit(unitId: string, unitPosition: Position3D, transition?: CameraTransition): void {
    const isoCoords = this.isoRenderer.toIsoCoords(unitPosition);
    
    // Ajuster pour centrer sur l'écran
    const screenCenter = this.getScreenCenter();
    const centeredPosition = {
      x: screenCenter.x - isoCoords.x,
      y: screenCenter.y - isoCoords.y
    };
    
    if (transition) {
      this.animateTo({ position: centeredPosition, target: unitPosition }, transition);
    } else {
      this.updateState({ position: centeredPosition, target: unitPosition });
    }
  }

  /**
   * Active le suivi d'une unité
   */
  followUnit(unitId: string, offset: IsoCoords = { x: 0, y: 0 }): void {
    this.followTarget = { unitId, offset };
    this.updateState({ following: unitId });
  }

  /**
   * Arrête le suivi d'unité
   */
  stopFollowing(): void {
    this.followTarget = undefined;
    this.updateState({ following: undefined });
  }

  /**
   * Met à jour la position de l'unité suivie
   */
  updateFollowTarget(unitId: string, position: Position3D): void {
    if (this.followTarget?.unitId === unitId) {
      const isoCoords = this.isoRenderer.toIsoCoords(position);
      const screenCenter = this.getScreenCenter();
      
      const targetPos = {
        x: screenCenter.x - isoCoords.x + this.followTarget.offset.x,
        y: screenCenter.y - isoCoords.y + this.followTarget.offset.y
      };
      
      // Interpolation douce vers la cible
      const currentPos = this.cameraState().position;
      const smoothedPos = {
        x: currentPos.x + (targetPos.x - currentPos.x) * this.DEFAULT_FOLLOW_SMOOTHING,
        y: currentPos.y + (targetPos.y - currentPos.y) * this.DEFAULT_FOLLOW_SMOOTHING
      };
      
      this.updateState({ position: smoothedPos });
    }
  }

  /**
   * Zoom vers un niveau donné
   */
  zoomTo(zoomLevel: number, transition?: CameraTransition): void {
    if (transition) {
      this.animateTo({ zoom: zoomLevel }, transition);
    } else {
      this.updateState({ zoom: zoomLevel });
    }
  }

  /**
   * Zoom relatif (ex: +0.2 ou -0.3)
   */
  zoomBy(delta: number, centerPoint?: IsoCoords): void {
    const currentState = this.cameraState();
    const newZoom = currentState.zoom + delta;
    
    if (centerPoint) {
      // Zoom vers un point spécifique
      const scaleFactor = newZoom / currentState.zoom;
      const newPosition = {
        x: centerPoint.x - (centerPoint.x - currentState.position.x) * scaleFactor,
        y: centerPoint.y - (centerPoint.y - currentState.position.y) * scaleFactor
      };
      
      this.updateState({ zoom: newZoom, position: newPosition });
    } else {
      this.updateState({ zoom: newZoom });
    }
  }

  /**
   * Rotation de la caméra
   */
  rotateTo(angle: number, transition?: CameraTransition): void {
    if (transition) {
      this.animateTo({ rotation: angle }, transition);
    } else {
      this.updateState({ rotation: angle });
    }
  }

  /**
   * Secoue la caméra (effet de dégâts)
   */
  shake(intensity: number = 10, duration: number = 500): void {
    // TODO: Implémenter l'effet de secousse avec GSAP
    const originalPos = this.cameraState().position;
    
    // Animation de secousse simplifiée
    let shakeCount = 0;
    const maxShakes = Math.floor(duration / 50);
    
    const shakeInterval = setInterval(() => {
      if (shakeCount >= maxShakes) {
        clearInterval(shakeInterval);
        this.updateState({ position: originalPos });
        return;
      }
      
      const shakeX = (Math.random() - 0.5) * intensity * (1 - shakeCount / maxShakes);
      const shakeY = (Math.random() - 0.5) * intensity * (1 - shakeCount / maxShakes);
      
      this.updateState({
        position: {
          x: originalPos.x + shakeX,
          y: originalPos.y + shakeY
        }
      });
      
      shakeCount++;
    }, 50);
  }

  /**
   * Cadrage automatique sur une zone
   */
  frameArea(positions: Position3D[], margin: number = 100, transition?: CameraTransition): void {
    if (positions.length === 0) return;
    
    const bounds = this.isoRenderer.getIsoBounds(positions);
    const screenSize = this.getScreenSize();
    
    // Calculer le zoom nécessaire pour voir toute la zone
    const requiredZoom = Math.min(
      (screenSize.width - margin * 2) / (bounds.maxX - bounds.minX),
      (screenSize.height - margin * 2) / (bounds.maxY - bounds.minY),
      this.cameraState().bounds.maxZoom
    );
    
    // Position pour centrer la zone
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const screenCenter = this.getScreenCenter();
    
    const targetPosition = {
      x: screenCenter.x - centerX,
      y: screenCenter.y - centerY
    };
    
    const updates: Partial<CameraState> = {
      position: targetPosition,
      zoom: requiredZoom
    };
    
    if (transition) {
      this.animateTo(updates, transition);
    } else {
      this.updateState(updates);
    }
  }

  /**
   * Convertit des coordonnées écran en coordonnées monde
   */
  screenToWorld(screenCoords: IsoCoords): IsoCoords {
    const state = this.cameraState();
    return {
      x: (screenCoords.x - state.position.x) / state.zoom,
      y: (screenCoords.y - state.position.y) / state.zoom
    };
  }

  /**
   * Convertit des coordonnées monde en coordonnées écran
   */
  worldToScreen(worldCoords: IsoCoords): IsoCoords {
    const state = this.cameraState();
    return {
      x: worldCoords.x * state.zoom + state.position.x,
      y: worldCoords.y * state.zoom + state.position.y
    };
  }

  /**
   * Vérifie si une position est visible à l'écran
   */
  isPositionVisible(worldPos: IsoCoords, margin: number = 0): boolean {
    const screenPos = this.worldToScreen(worldPos);
    const screenSize = this.getScreenSize();
    
    return screenPos.x >= -margin &&
           screenPos.x <= screenSize.width + margin &&
           screenPos.y >= -margin &&
           screenPos.y <= screenSize.height + margin;
  }

  /**
   * Définit les limites de mouvement de la caméra
   */
  setBounds(bounds: Partial<CameraState['bounds']>): void {
    const currentState = this.cameraState();
    this.updateState({
      bounds: { ...currentState.bounds, ...bounds }
    });
  }

  private setupEventHandlers(): void {
    if (!this.container?.parent) return;
    
    const canvas = this.container.parent as any; // Le canvas Pixi
    
    // Événements de souris pour le pan
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('wheel', this.onWheel.bind(this));
    
    // Événements tactiles pour mobile
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private applyCameraTransform(): void {
    if (!this.container) return;
    
    const state = this.cameraState();
    
    this.container.position.set(state.position.x, state.position.y);
    this.container.scale.set(state.zoom);
    this.container.rotation = state.rotation;
  }

  private animateTo(updates: Partial<CameraState>, transition: CameraTransition): void {
    // TODO: Implémenter l'animation avec GSAP ou animation service
    console.log('Camera animation requested:', updates, transition);
    
    // Pour l'instant, appliquer directement
    this.updateState(updates);
    
    if (transition.onComplete) {
      setTimeout(transition.onComplete, transition.duration);
    }
  }

  private getScreenCenter(): IsoCoords {
    const size = this.getScreenSize();
    return { x: size.width / 2, y: size.height / 2 };
  }

  private getScreenSize(): { width: number, height: number } {
    // TODO: Obtenir la vraie taille de l'écran depuis le container Pixi
    return { width: 1280, height: 720 };
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) { // Middle click ou Ctrl+click
      this.isDragging = true;
      this.lastMousePosition = { x: event.clientX, y: event.clientY };
      this.stopFollowing(); // Arrêter le suivi si on commence à faire du pan
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastMousePosition.x;
      const deltaY = event.clientY - this.lastMousePosition.y;
      
      const currentPos = this.cameraState().position;
      this.updateState({
        position: {
          x: currentPos.x + deltaX,
          y: currentPos.y + deltaY
        }
      });
      
      this.lastMousePosition = { x: event.clientX, y: event.clientY };
    }
  }

  private onMouseUp(event: MouseEvent): void {
    if (event.button === 1 || event.button === 0) {
      this.isDragging = false;
    }
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const zoomDelta = -event.deltaY * this.DEFAULT_ZOOM_SPEED * 0.001;
    const mousePos = { x: event.clientX, y: event.clientY };
    
    this.zoomBy(zoomDelta, mousePos);
  }

  private onTouchStart(event: TouchEvent): void {
    // TODO: Implémenter les gestes tactiles
  }

  private onTouchMove(event: TouchEvent): void {
    // TODO: Implémenter les gestes tactiles
  }

  private onTouchEnd(event: TouchEvent): void {
    // TODO: Implémenter les gestes tactiles
  }

  /**
   * Nettoyage
   */
  destroy(): void {
    if (this.container?.parent) {
      const canvas = this.container.parent as any;
      canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
      canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
      canvas.removeEventListener('wheel', this.onWheel.bind(this));
    }
    
    this.cameraChanged$.complete();
    console.log('CameraService destroyed');
  }

  // TODO: Ajouter presets de caméra (vue tactique, vue rapprochée, etc.)
  // TODO: Ajouter systèmes de waypoints pour la caméra
  // TODO: Ajouter effets cinématiques
  // TODO: Ajouter support multi-touch avancé
}