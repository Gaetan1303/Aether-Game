/**
 * Service pour gérer le cache de textures PixiJS
 * Optimise la gestion de la mémoire et l'accès aux textures
 */

import { Injectable } from '@angular/core';
import { Texture } from 'pixi.js';

interface CacheEntry {
  texture: Texture;
  lastAccessed: number;
  accessCount: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class TextureCacheService {
  private cache = new Map<string, CacheEntry>();
  private maxCacheSize = 100; // Nombre max de textures en cache
  private maxMemoryMB = 256; // Limite mémoire en MB

  /**
   * Ajoute une texture au cache
   */
  set(key: string, texture: Texture): void {
    // Vérifier la taille du cache
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      texture,
      lastAccessed: Date.now(),
      accessCount: 0
    });
  }

  /**
   * Récupère une texture du cache
   */
  get(key: string): Texture | undefined {
    const entry = this.cache.get(key);
    
    if (entry) {
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      return entry.texture;
    }

    return undefined;
  }

  /**
   * Vérifie si une texture est dans le cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Supprime une texture du cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      entry.texture.destroy(false);
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.forEach(entry => {
      entry.texture.destroy(false);
    });
    this.cache.clear();
  }

  /**
   * Évince les textures les moins utilisées
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Trier par score (accessCount / temps depuis dernier accès)
    entries.sort((a, b) => {
      const scoreA = a[1].accessCount / (Date.now() - a[1].lastAccessed);
      const scoreB = b[1].accessCount / (Date.now() - b[1].lastAccessed);
      return scoreA - scoreB;
    });

    // Supprimer les 10% les moins utilisées
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    
    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      entry.texture.destroy(false);
      this.cache.delete(key);
    }

    console.log(`Evicted ${toRemove} textures from cache`);
  }

  /**
   * Obtient des statistiques sur le cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    totalAccesses: number;
    avgAccessCount: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, e) => sum + e.accessCount, 0);

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      totalAccesses,
      avgAccessCount: entries.length > 0 ? totalAccesses / entries.length : 0
    };
  }

  /**
   * Configure les limites du cache
   */
  configure(options: { maxCacheSize?: number; maxMemoryMB?: number }): void {
    if (options.maxCacheSize !== undefined) {
      this.maxCacheSize = options.maxCacheSize;
    }
    if (options.maxMemoryMB !== undefined) {
      this.maxMemoryMB = options.maxMemoryMB;
    }
  }
}
