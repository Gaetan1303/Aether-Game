/**
 * Types pour les assets PixiJS
 */

export interface AssetManifest {
  version: string;
  bundles: Record<string, AssetBundle>;
  aliases?: Record<string, string>;
}

export interface AssetBundle {
  name: string;
  priority: number;
  assets: Record<string, string>;
}

export interface LoadProgress {
  bundleName: string;
  loaded: number;
  total: number;
  percentage: number;
}

export type AssetType = 'sprite' | 'texture' | 'spritesheet' | 'animation' | 'particle';

export interface AssetMetadata {
  type: AssetType;
  path: string;
  loaded: boolean;
  size?: number;
}
