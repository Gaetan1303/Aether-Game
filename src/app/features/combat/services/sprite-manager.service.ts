import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SpritePoolConfig {
  textureKey: string;
  poolSize: number;
  autoExpand: boolean;
  maxSize?: number;
}

export interface ManagedSprite {
  id: string;
  sprite: PIXI.Sprite;
  isInUse: boolean;
  lastUsed: number;
  poolKey: string;
  userData?: any;
}

@Injectable({ providedIn: 'root' })
export class SpriteManagerService {
  private pools = new Map<string, ManagedSprite[]>();
  private activeSprites = new Map<string, ManagedSprite>();
  private textures = new Map<string, PIXI.Texture>();
  
  // Statistiques
  private stats$ = new BehaviorSubject({
    totalSprites: 0,
    activeSprites: 0,
    availableSprites: 0,
    poolsCount: 0,
    memoryUsage: 0
  });

  // Configuration par défaut
  private readonly DEFAULT_POOL_SIZE = 10;
  private readonly DEFAULT_MAX_SIZE = 50;
  private readonly CLEANUP_INTERVAL = 30000; // 30 secondes
  private readonly MAX_IDLE_TIME = 60000; // 1 minute

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Initialise le gestionnaire avec les textures de base
   */
  async initialize(textureUrls: Record<string, string>): Promise<void> {
    try {
      // Charger toutes les textures qui ont une URL valide
      for (const [key, url] of Object.entries(textureUrls)) {
        if (url && url.trim() !== '') {
          const texture = await PIXI.Assets.load(url);
          this.textures.set(key, texture);
        }
      }
      
      console.log(`SpriteManager initialized with ${this.textures.size} textures`);
      this.updateStats();
      
    } catch (error) {
      console.error('Failed to initialize SpriteManager:', error);
      throw error;
    }
  }

  /**
   * Enregistre une texture générée programmatiquement
   */
  registerTexture(key: string, texture: PIXI.Texture): void {
    this.textures.set(key, texture);
    console.log(`Texture '${key}' registered`);
  }

  /**
   * Crée un pool de sprites pour une texture donnée
   */
  createPool(config: SpritePoolConfig): void {
    const { textureKey, poolSize, autoExpand, maxSize } = config;
    
    if (this.pools.has(textureKey)) {
      console.warn(`Pool for texture '${textureKey}' already exists`);
      return;
    }
    
    const texture = this.textures.get(textureKey);
    if (!texture) {
      throw new Error(`Texture '${textureKey}' not found. Initialize textures first.`);
    }
    
    const pool: ManagedSprite[] = [];
    
    // Créer les sprites initiaux
    for (let i = 0; i < poolSize; i++) {
      const sprite = new PIXI.Sprite(texture);
      const managedSprite: ManagedSprite = {
        id: `${textureKey}_${i}_${Date.now()}`,
        sprite,
        isInUse: false,
        lastUsed: 0,
        poolKey: textureKey
      };
      
      // Configuration par défaut des sprites
      sprite.anchor.set(0.5, 1); // Ancré en bas-centre pour l'isométrique
      sprite.visible = false;
      
      pool.push(managedSprite);
    }
    
    this.pools.set(textureKey, pool);
    console.log(`Created pool '${textureKey}' with ${poolSize} sprites`);
    
    this.updateStats();
  }

  /**
   * Obtient un sprite du pool
   */
  getSprite(textureKey: string, userData?: any): ManagedSprite | null {
    const pool = this.pools.get(textureKey);
    if (!pool) {
      console.error(`Pool '${textureKey}' not found`);
      return null;
    }
    
    // Chercher un sprite disponible
    let availableSprite = pool.find(sprite => !sprite.isInUse);
    
    // Si aucun sprite disponible et auto-expansion activée
    if (!availableSprite) {
      const config = this.getPoolConfig(textureKey);
      if (config.autoExpand && pool.length < (config.maxSize || this.DEFAULT_MAX_SIZE)) {
        availableSprite = this.expandPool(textureKey) || undefined;
      }
    }
    
    if (!availableSprite) {
      console.warn(`No available sprites in pool '${textureKey}'`);
      return null;
    }
    
    // Marquer comme utilisé
    availableSprite.isInUse = true;
    availableSprite.lastUsed = Date.now();
    availableSprite.userData = userData;
    availableSprite.sprite.visible = true;
    
    this.activeSprites.set(availableSprite.id, availableSprite);
    this.updateStats();
    
    return availableSprite;
  }

  /**
   * Libère un sprite pour le remettre dans le pool
   */
  releaseSprite(spriteId: string): void {
    const managedSprite = this.activeSprites.get(spriteId);
    if (!managedSprite) {
      console.warn(`Sprite '${spriteId}' not found in active sprites`);
      return;
    }
    
    // Réinitialiser le sprite
    const sprite = managedSprite.sprite;
    sprite.visible = false;
    sprite.position.set(0, 0);
    sprite.rotation = 0;
    sprite.scale.set(1, 1);
    sprite.alpha = 1;
    sprite.tint = 0xFFFFFF;
    
    // Marquer comme disponible
    managedSprite.isInUse = false;
    managedSprite.userData = undefined;
    
    this.activeSprites.delete(spriteId);
    this.updateStats();
  }

  /**
   * Libère tous les sprites actifs d'un pool
   */
  releaseAllSprites(textureKey?: string): void {
    const spritesToRelease = textureKey 
      ? Array.from(this.activeSprites.values()).filter(s => s.poolKey === textureKey)
      : Array.from(this.activeSprites.values());
    
    spritesToRelease.forEach(sprite => this.releaseSprite(sprite.id));
  }

  /**
   * Obtient un sprite par son ID
   */
  getSpriteById(spriteId: string): ManagedSprite | null {
    return this.activeSprites.get(spriteId) || null;
  }

  /**
   * Met à jour la position d'un sprite avec des coordonnées isométriques
   */
  updateSpritePosition(spriteId: string, x: number, y: number, zIndex?: number): void {
    const managedSprite = this.getSpriteById(spriteId);
    if (!managedSprite) return;
    
    managedSprite.sprite.position.set(x, y);
    
    if (zIndex !== undefined) {
      managedSprite.sprite.zIndex = zIndex;
    }
  }

  /**
   * Met à jour les propriétés visuelles d'un sprite
   */
  updateSpriteVisuals(spriteId: string, properties: {
    alpha?: number,
    tint?: number,
    scale?: number | { x: number, y: number },
    rotation?: number,
    visible?: boolean
  }): void {
    const managedSprite = this.getSpriteById(spriteId);
    if (!managedSprite) return;
    
    const sprite = managedSprite.sprite;
    
    if (properties.alpha !== undefined) sprite.alpha = properties.alpha;
    if (properties.tint !== undefined) sprite.tint = properties.tint;
    if (properties.rotation !== undefined) sprite.rotation = properties.rotation;
    if (properties.visible !== undefined) sprite.visible = properties.visible;
    
    if (properties.scale !== undefined) {
      if (typeof properties.scale === 'number') {
        sprite.scale.set(properties.scale);
      } else {
        sprite.scale.set(properties.scale.x, properties.scale.y);
      }
    }
  }

  /**
   * Ajoute une texture au gestionnaire
   */
  addTexture(key: string, texture: PIXI.Texture): void {
    this.textures.set(key, texture);
  }

  /**
   * Obtient une texture par sa clé
   */
  getTexture(key: string): PIXI.Texture | null {
    return this.textures.get(key) || null;
  }

  /**
   * Obtient les statistiques en temps réel
   */
  getStats(): Observable<any> {
    return this.stats$.asObservable();
  }

  /**
   * Obtient les statistiques actuelles
   */
  getCurrentStats(): any {
    return this.stats$.value;
  }

  private expandPool(textureKey: string): ManagedSprite | null {
    const pool = this.pools.get(textureKey);
    const texture = this.textures.get(textureKey);
    
    if (!pool || !texture) return null;
    
    const sprite = new PIXI.Sprite(texture);
    const managedSprite: ManagedSprite = {
      id: `${textureKey}_${pool.length}_${Date.now()}`,
      sprite,
      isInUse: false,
      lastUsed: 0,
      poolKey: textureKey
    };
    
    sprite.anchor.set(0.5, 1);
    sprite.visible = false;
    
    pool.push(managedSprite);
    
    console.log(`Expanded pool '${textureKey}' to ${pool.length} sprites`);
    return managedSprite;
  }

  private getPoolConfig(textureKey: string): SpritePoolConfig {
    // TODO: Stocker et retourner la vraie configuration
    return {
      textureKey,
      poolSize: this.DEFAULT_POOL_SIZE,
      autoExpand: true,
      maxSize: this.DEFAULT_MAX_SIZE
    };
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupUnusedSprites();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanupUnusedSprites(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [poolKey, pool] of this.pools.entries()) {
      const unusedSprites = pool.filter(
        sprite => !sprite.isInUse && 
                  now - sprite.lastUsed > this.MAX_IDLE_TIME
      );
      
      // Garder au moins la taille minimale du pool
      const minPoolSize = this.getPoolConfig(poolKey).poolSize;
      const toRemove = Math.max(0, unusedSprites.length - minPoolSize);
      
      if (toRemove > 0) {
        const spritesToRemove = unusedSprites.slice(0, toRemove);
        spritesToRemove.forEach(sprite => {
          sprite.sprite.destroy();
          const index = pool.indexOf(sprite);
          if (index > -1) pool.splice(index, 1);
        });
        
        cleanedCount += spritesToRemove.length;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} unused sprites`);
      this.updateStats();
    }
  }

  private updateStats(): void {
    let totalSprites = 0;
    let availableSprites = 0;
    
    for (const pool of this.pools.values()) {
      totalSprites += pool.length;
      availableSprites += pool.filter(sprite => !sprite.isInUse).length;
    }
    
    this.stats$.next({
      totalSprites,
      activeSprites: this.activeSprites.size,
      availableSprites,
      poolsCount: this.pools.size,
      memoryUsage: this.estimateMemoryUsage()
    });
  }

  private estimateMemoryUsage(): number {
    // Estimation approximative en KB
    let usage = 0;
    for (const pool of this.pools.values()) {
      usage += pool.length * 0.1; // ~100 bytes par sprite
    }
    return usage;
  }

  /**
   * Détruit tous les pools et libère la mémoire
   */
  destroy(): void {
    // Détruire tous les sprites
    for (const pool of this.pools.values()) {
      pool.forEach(managedSprite => {
        managedSprite.sprite.destroy();
      });
    }
    
    // Nettoyer les maps
    this.pools.clear();
    this.activeSprites.clear();
    this.textures.clear();
    
    this.updateStats();
    console.log('SpriteManager destroyed');
  }

  // TODO: Ajouter support pour les sprite sheets animés
  // TODO: Ajouter préchargement intelligent des sprites
  // TODO: Ajouter métriques de performance détaillées
  // TODO: Ajouter compression/optimisation automatique
}