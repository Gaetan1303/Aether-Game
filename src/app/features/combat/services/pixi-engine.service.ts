import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({ providedIn: 'root' })
export class PixiEngineService {
  private app?: PIXI.Application;
  private isInitialized = false;
  
  // Layers pour la séparation visuelle
  public terrainLayer!: PIXI.Container;
  public unitsLayer!: PIXI.Container;
  public effectsLayer!: PIXI.Container;
  public uiLayer!: PIXI.Container;
  public debugLayer!: PIXI.Container;

  // Configuration par défaut
  private readonly DEFAULT_CONFIG = {
    width: 1280,
    height: 720,
    backgroundColor: 0x1a1a1a,
    resolution: window.devicePixelRatio || 1,
    antialias: true,
    autoDensity: true
  };

  async initialize(canvas: HTMLCanvasElement, config?: Partial<PIXI.ApplicationOptions>): Promise<void> {
    if (this.isInitialized) {
      console.warn('PixiEngine already initialized');
      return;
    }

    try {
      this.app = new PIXI.Application();
      
      const finalConfig = {
        ...this.DEFAULT_CONFIG,
        ...config,
        canvas
      };

      await this.app.init(finalConfig);
      
      this.setupLayers();
      this.setupEventHandlers();
      this.setupTicker();
      
      this.isInitialized = true;
      console.log('PixiEngine initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize PixiEngine:', error);
      throw error;
    }
  }

  private setupLayers(): void {
    // Création des layers avec tri automatique
    this.terrainLayer = new PIXI.Container();
    this.unitsLayer = new PIXI.Container();
    this.effectsLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
    this.debugLayer = new PIXI.Container();
    
    // Configuration du tri par profondeur
    this.terrainLayer.sortableChildren = true;
    this.unitsLayer.sortableChildren = true;
    this.effectsLayer.sortableChildren = true;
    this.uiLayer.sortableChildren = true;
    this.debugLayer.sortableChildren = true;
    
    // Ajout des layers au stage dans l'ordre correct
    this.app!.stage.addChild(this.terrainLayer);
    this.app!.stage.addChild(this.unitsLayer);
    this.app!.stage.addChild(this.effectsLayer);
    this.app!.stage.addChild(this.uiLayer);
    this.app!.stage.addChild(this.debugLayer);
    
    console.log('Pixi layers setup complete');
  }

  private setupEventHandlers(): void {
    // Gestion du redimensionnement
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private setupTicker(): void {
    if (!this.app) return;
    
    // Configuration du ticker pour de meilleures performances
    this.app.ticker.maxFPS = 60;
    this.app.ticker.minFPS = 30;
    
    // Ajouter des callbacks de mise à jour ici
    this.app.ticker.add((deltaTime) => {
      this.update(deltaTime.deltaTime);
      // Notification aux services dépendants
      this.updateCallbacks.forEach(callback => {
        try {
          callback(deltaTime.deltaTime);
        } catch (error) {
          console.warn('Erreur dans callback de mise à jour:', error);
        }
      });
    });
  }

  private update(deltaTime: number): void {
    // Mettre à jour les animations
    this.updateAnimations(deltaTime);
    // Mettre à jour les particules (si implémenté)
    this.updateParticles(deltaTime);
    // Nettoyer les objets obsolètes
    this.cleanup();
  }

  private updateCallbacks: ((deltaTime: number) => void)[] = [];
  
  registerUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallbacks.push(callback);
  }
  
  private updateAnimations(deltaTime: number): void {
    // Mise à jour basique des animations PIXI
    if (this.app?.stage) {
      this.app.stage.children.forEach(child => {
        if (child.alpha < 1 && child.visible) {
          // Animation fade-in simple
          child.alpha = Math.min(1, child.alpha + deltaTime * 0.02);
        }
      });
    }
  }
  
  private updateParticles(deltaTime: number): void {
    // Placeholder pour le système de particules futur
  }
  
  private cleanup(): void {
    // Nettoie les objets invisibles ou détruits
    if (this.app?.stage) {
      const toRemove = this.app.stage.children.filter(child => 
        child.alpha <= 0 || (child as any).isDestroyed
      );
      toRemove.forEach(child => this.app!.stage.removeChild(child));
    }
  }

  private handleResize(): void {
    if (!this.app) return;
    
    const canvas = this.app.canvas;
    const parent = canvas.parentElement;
    if (!parent) return;
    
    const newWidth = parent.clientWidth;
    const newHeight = parent.clientHeight;
    
    this.app.renderer.resize(newWidth, newHeight);
    console.log(`Canvas resized to ${newWidth}x${newHeight}`);
  }

  private handleVisibilityChange(): void {
    if (!this.app) return;
    
    if (document.hidden) {
      // Pause le ticker quand la page n'est pas visible
      this.app.ticker.stop();
      console.log('Pixi ticker paused');
    } else {
      // Reprend le ticker
      this.app.ticker.start();
      console.log('Pixi ticker resumed');
    }
  }

  // API publique
  getApp(): PIXI.Application {
    if (!this.app || !this.isInitialized) {
      throw new Error('PixiEngine not initialized');
    }
    return this.app;
  }

  getRenderer(): PIXI.Renderer {
    return this.getApp().renderer;
  }

  getStage(): PIXI.Container {
    return this.getApp().stage;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.app;
  }

  // Utilitaires pour le chargement des textures
  async loadTextures(urls: string[]): Promise<Record<string, PIXI.Texture>> {
    const textures: Record<string, PIXI.Texture> = {};
    
    try {
      for (const url of urls) {
        const texture = await PIXI.Assets.load(url);
        const name = url.split('/').pop()?.split('.')[0] || url;
        textures[name] = texture;
      }
      
      console.log(`Loaded ${Object.keys(textures).length} textures`);
      return textures;
      
    } catch (error) {
      console.error('Failed to load textures:', error);
      throw error;
    }
  }

  // Nettoyage des ressources
  clearLayer(layer: PIXI.Container): void {
    while (layer.children.length > 0) {
      const child = layer.removeChildAt(0);
      if (child instanceof PIXI.Sprite) {
        child.destroy();
      }
    }
  }

  clearAllLayers(): void {
    this.clearLayer(this.terrainLayer);
    this.clearLayer(this.unitsLayer);
    this.clearLayer(this.effectsLayer);
    this.clearLayer(this.uiLayer);
    this.clearLayer(this.debugLayer);
  }

  // Gestion du debug
  setDebugMode(enabled: boolean): void {
    this.debugLayer.visible = enabled;
  }

  addDebugGraphics(graphics: PIXI.Graphics): void {
    this.debugLayer.addChild(graphics);
  }

  // Capture d'écran
  async takeScreenshot(): Promise<string> {
    if (!this.app) throw new Error('PixiEngine not initialized');
    
    const base64 = this.app.renderer.extract.base64(this.app.stage);
    return base64;
  }

  // Statistiques de performance
  getStats(): any {
    if (!this.app) return null;
    
    return {
      fps: this.app.ticker.FPS,
      deltaTime: this.app.ticker.deltaTime,
      elapsedMS: this.app.ticker.elapsedMS,
      terrainObjects: this.terrainLayer.children.length,
      unitObjects: this.unitsLayer.children.length,
      effectObjects: this.effectsLayer.children.length,
      uiObjects: this.uiLayer.children.length,
      totalObjects: this.app.stage.children.reduce((sum, layer) => sum + layer.children.length, 0)
    };
  }

  destroy(): void {
    if (this.app) {
      window.removeEventListener('resize', this.handleResize.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      this.app.destroy(true, { children: true, texture: true });
      this.app = undefined;
      this.isInitialized = false;
      
      console.log('PixiEngine destroyed');
    }
  }

  // TODO: Ajouter gestion des filtres/shaders
  // TODO: Ajouter système de particules
  // TODO: Ajouter gestion du post-processing
  // TODO: Ajouter métriques avancées de performance
}