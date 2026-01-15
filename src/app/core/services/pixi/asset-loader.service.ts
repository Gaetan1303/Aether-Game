import { Injectable, inject } from '@angular/core';
import { Assets, Texture, Spritesheet, Sprite } from 'pixi.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssetManifest, AssetBundle, LoadProgress, AssetMetadata } from './asset-loader.types';

@Injectable({ providedIn: 'root' })
export class AssetLoaderService {
  private manifest?: AssetManifest;
  private loadedBundles = new Set<string>();
  private assetCache = new Map<string, Texture>();
  
  private loadingProgress$ = new BehaviorSubject<LoadProgress | null>(null);
  private isInitialized = false;

  /**
   * Chemin de base pour les assets PixiJS
   */
  private readonly BASE_PATH = 'assets/pixi/';

  /**
   * Observable pour suivre la progression du chargement
   */
  get progress$(): Observable<LoadProgress | null> {
    return this.loadingProgress$.asObservable();
  }

  /**
   * Initialise le loader avec le manifeste
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('AssetLoader already initialized');
      return;
    }

    try {
      // Charger le manifeste
      const response = await fetch(`${this.BASE_PATH}asset-manifest.json`);
      this.manifest = await response.json();

      // Configurer Assets de PixiJS
      this.setupPixiAssets();

      this.isInitialized = true;
      console.log('AssetLoader initialized with manifest:', this.manifest);
    } catch (error) {
      console.error('Failed to initialize AssetLoader:', error);
      throw error;
    }
  }

  /**
   * Configure les bundles dans PixiJS Assets
   */
  private setupPixiAssets(): void {
    if (!this.manifest) return;

    Object.entries(this.manifest.bundles).forEach(([bundleName, bundle]) => {
      const bundleAssets: Record<string, string> = {};
      
      Object.entries(bundle.assets).forEach(([alias, path]) => {
        bundleAssets[alias] = this.BASE_PATH + path;
      });

      Assets.addBundle(bundleName, bundleAssets);
    });

    console.log('PixiJS Assets bundles configured');
  }

  /**
   * Charge un bundle complet
   */
  async loadBundle(bundleName: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isBundleAlreadyLoaded(bundleName)) {
      console.log(`Bundle "${bundleName}" already loaded`);
      return;
    }

    try {
      await this.performBundleLoad(bundleName);
    } catch (error) {
      console.error(`Failed to load bundle "${bundleName}":`, error);
      throw error;
    }
  }

  /**
   * Guard Pattern: Vérification du chargement
   */
  private isBundleAlreadyLoaded(bundleName: string): boolean {
    return this.loadedBundles.has(bundleName);
  }

  /**
   * Template Method Pattern: Chargement du bundle
   */
  private async performBundleLoad(bundleName: string): Promise<void> {
    console.log(`Loading bundle: ${bundleName}`);
    
    const bundle = await Assets.loadBundle(bundleName, (progress) => {
      this.notifyLoadProgress(bundleName, progress);
    });

    this.loadedBundles.add(bundleName);
    this.loadingProgress$.next(null);
    
    console.log(`Bundle "${bundleName}" loaded successfully`, bundle);
  }

  /**
   * Observer Pattern: Notification de progression
   */
  private notifyLoadProgress(bundleName: string, progress: number): void {
    this.loadingProgress$.next({
      bundleName,
      loaded: Math.floor(progress * 100),
      total: 100,
      percentage: progress * 100
    });
  }

  /**
   * Charge plusieurs bundles en parallèle
   */
  async loadBundles(bundleNames: string[]): Promise<void> {
    await Promise.all(bundleNames.map(name => this.loadBundle(name)));
  }

  /**
   * Charge un asset individuel
   */
  async loadAsset(alias: string): Promise<Texture> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Vérifier le cache
    if (this.assetCache.has(alias)) {
      return this.assetCache.get(alias)!;
    }

    try {
      const texture = await Assets.load<Texture>(alias);
      this.assetCache.set(alias, texture);
      return texture;
    } catch (error) {
      console.error(`Failed to load asset "${alias}":`, error);
      throw error;
    }
  }

  /**
   * Obtient une texture depuis le cache ou la charge
   */
  async getTexture(alias: string): Promise<Texture> {
    if (this.assetCache.has(alias)) {
      return this.assetCache.get(alias)!;
    }
    return this.loadAsset(alias);
  }

  /**
   * Crée un sprite depuis un alias
   */
  async getSprite(alias: string): Promise<Sprite> {
    const texture = await this.getTexture(alias);
    return new Sprite(texture);
  }

  /**
   * Décharge un bundle
   */
  async unloadBundle(bundleName: string): Promise<void> {
    if (!this.loadedBundles.has(bundleName)) {
      return;
    }

    try {
      await Assets.unloadBundle(bundleName);
      this.loadedBundles.delete(bundleName);
      
      // Nettoyer le cache des assets de ce bundle
      if (this.manifest?.bundles[bundleName]) {
        const bundleAssets = this.manifest.bundles[bundleName].assets;
        Object.keys(bundleAssets).forEach(alias => {
          this.assetCache.delete(alias);
        });
      }
      
      console.log(`Bundle "${bundleName}" unloaded`);
    } catch (error) {
      console.error(`Failed to unload bundle "${bundleName}":`, error);
    }
  }

  /**
   * Précharge tous les bundles essentiels
   */
  async preloadEssentials(): Promise<void> {
    const essentialBundles = this.getEssentialBundles();
    await this.loadBundles(essentialBundles);
  }

  /**
   * Obtient la liste des bundles essentiels (priorité 1-2)
   */
  private getEssentialBundles(): string[] {
    if (!this.manifest) return [];
    
    return Object.entries(this.manifest.bundles)
      .filter(([_, bundle]) => bundle.priority <= 2)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name, _]) => name);
  }

  /**
   * Vérifie si un bundle est chargé
   */
  isBundleLoaded(bundleName: string): boolean {
    return this.loadedBundles.has(bundleName);
  }

  /**
   * Obtient la liste des bundles chargés
   */
  getLoadedBundles(): string[] {
    return Array.from(this.loadedBundles);
  }

  /**
   * Nettoie tous les assets et le cache
   */
  async cleanup(): Promise<void> {
    const bundles = Array.from(this.loadedBundles);
    await Promise.all(bundles.map(bundle => this.unloadBundle(bundle)));
    
    this.assetCache.clear();
    this.loadedBundles.clear();
    
    console.log('AssetLoader cleaned up');
  }

  /**
   * Obtient des statistiques sur les assets chargés
   */
  getStats(): { loadedBundles: number; cachedAssets: number; memoryUsage?: number } {
    return {
      loadedBundles: this.loadedBundles.size,
      cachedAssets: this.assetCache.size,
      // TODO: Calculer l'utilisation mémoire réelle
      memoryUsage: undefined
    };
  }
}
