/**
 * Service utilitaire pour créer et gérer des spritesheets PixiJS
 */

import { Injectable } from '@angular/core';
import { Spritesheet, Texture, Assets } from 'pixi.js';

export interface SpritesheetData {
  frames: Record<string, {
    frame: { x: number; y: number; w: number; h: number };
    rotated?: boolean;
    trimmed?: boolean;
    spriteSourceSize?: { x: number; y: number; w: number; h: number };
    sourceSize?: { w: number; h: number };
  }>;
  meta: {
    scale: string;
    image?: string;
    size?: { w: number; h: number };
  };
}

@Injectable({ providedIn: 'root' })
export class SpritesheetService {
  private loadedSpritesheets = new Map<string, Spritesheet>();

  /**
   * Charge un spritesheet depuis une URL
   */
  async loadSpritesheet(url: string): Promise<Spritesheet> {
    if (this.loadedSpritesheets.has(url)) {
      return this.loadedSpritesheets.get(url)!;
    }

    try {
      const spritesheet = await Assets.load<Spritesheet>(url);
      this.loadedSpritesheets.set(url, spritesheet);
      return spritesheet;
    } catch (error) {
      console.error(`Failed to load spritesheet from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Obtient une texture depuis un spritesheet
   */
  async getTexture(spritesheetUrl: string, frameName: string): Promise<Texture> {
    const spritesheet = await this.loadSpritesheet(spritesheetUrl);
    
    if (!spritesheet.textures[frameName]) {
      throw new Error(`Frame "${frameName}" not found in spritesheet "${spritesheetUrl}"`);
    }

    return spritesheet.textures[frameName];
  }

  /**
   * Obtient toutes les textures d'un spritesheet
   */
  async getTextures(spritesheetUrl: string): Promise<Record<string, Texture>> {
    const spritesheet = await this.loadSpritesheet(spritesheetUrl);
    return spritesheet.textures;
  }

  /**
   * Obtient une animation depuis un spritesheet
   */
  async getAnimation(spritesheetUrl: string, animationName: string): Promise<Texture[]> {
    const spritesheet = await this.loadSpritesheet(spritesheetUrl);
    
    if (!spritesheet.animations[animationName]) {
      throw new Error(`Animation "${animationName}" not found in spritesheet "${spritesheetUrl}"`);
    }

    return spritesheet.animations[animationName];
  }

  /**
   * Décharge un spritesheet
   */
  unloadSpritesheet(url: string): void {
    const spritesheet = this.loadedSpritesheets.get(url);
    if (spritesheet) {
      spritesheet.destroy(true);
      this.loadedSpritesheets.delete(url);
    }
  }

  /**
   * Décharge tous les spritesheets
   */
  unloadAll(): void {
    this.loadedSpritesheets.forEach((spritesheet, url) => {
      spritesheet.destroy(true);
    });
    this.loadedSpritesheets.clear();
  }

  /**
   * Liste les frames disponibles dans un spritesheet
   */
  async listFrames(spritesheetUrl: string): Promise<string[]> {
    const spritesheet = await this.loadSpritesheet(spritesheetUrl);
    return Object.keys(spritesheet.textures);
  }

  /**
   * Liste les animations disponibles dans un spritesheet
   */
  async listAnimations(spritesheetUrl: string): Promise<string[]> {
    const spritesheet = await this.loadSpritesheet(spritesheetUrl);
    return Object.keys(spritesheet.animations);
  }

  /**
   * Vérifie si un spritesheet est chargé
   */
  isLoaded(url: string): boolean {
    return this.loadedSpritesheets.has(url);
  }

  /**
   * Obtient les statistiques
   */
  getStats(): { loadedSpritesheets: number; totalFrames: number } {
    let totalFrames = 0;
    
    this.loadedSpritesheets.forEach(spritesheet => {
      totalFrames += Object.keys(spritesheet.textures).length;
    });

    return {
      loadedSpritesheets: this.loadedSpritesheets.size,
      totalFrames
    };
  }
}
