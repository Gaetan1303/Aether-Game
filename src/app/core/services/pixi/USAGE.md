# Guide d'utilisation - Asset Loader Service

## 🚀 Démarrage rapide

### 1. Initialisation

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { AssetLoaderService } from '@core/services/pixi';

export class GameComponent implements OnInit {
  private assetLoader = inject(AssetLoaderService);

  async ngOnInit() {
    // Initialiser le service
    await this.assetLoader.initialize();
    
    // Précharger les assets essentiels
    await this.assetLoader.preloadEssentials();
  }
}
```

### 2. Charger des bundles

```typescript
// Charger un bundle
await this.assetLoader.loadBundle('characters');

// Charger plusieurs bundles
await this.assetLoader.loadBundles(['core', 'units', 'terrain']);
```

### 3. Utiliser des assets

```typescript
// Obtenir une texture
const texture = await this.assetLoader.getTexture('hero-idle');

// Créer un sprite
const sprite = await this.assetLoader.getSprite('warrior');

// Utiliser dans PixiJS
const container = new PIXI.Container();
container.addChild(sprite);
```

## 📊 Suivre la progression du chargement

```typescript
export class LoadingComponent {
  private assetLoader = inject(AssetLoaderService);
  
  progress$ = this.assetLoader.progress$;
}
```

```html
@if (progress$ | async; as progress) {
  <div class="loading-bar">
    <p>Loading {{ progress.bundleName }}... {{ progress.percentage }}%</p>
    <div class="bar" [style.width.%]="progress.percentage"></div>
  </div>
}
```

## 🎮 Exemple complet avec PixiJS

```typescript
import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import * as PIXI from 'pixi.js';
import { AssetLoaderService, SpritesheetService } from '@core/services/pixi';

@Component({
  selector: 'app-game',
  template: '<canvas #gameCanvas></canvas>'
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private assetLoader = inject(AssetLoaderService);
  private spritesheetService = inject(SpritesheetService);
  private app?: PIXI.Application;

  async ngOnInit() {
    // 1. Initialiser PixiJS
    this.app = new PIXI.Application();
    await this.app.init({
      canvas: this.canvasRef.nativeElement,
      width: 800,
      height: 600
    });

    // 2. Charger les assets
    await this.assetLoader.initialize();
    await this.assetLoader.loadBundles(['core', 'characters']);

    // 3. Créer des sprites
    const hero = await this.assetLoader.getSprite('hero-idle');
    hero.x = 400;
    hero.y = 300;
    this.app.stage.addChild(hero);

    // 4. Utiliser un spritesheet pour les animations
    const walkFrames = await this.spritesheetService.getAnimation(
      'assets/pixi/spritesheets/hero-walk.json',
      'walk'
    );
    
    const animatedSprite = new PIXI.AnimatedSprite(walkFrames);
    animatedSprite.play();
    this.app.stage.addChild(animatedSprite);
  }

  ngOnDestroy() {
    this.app?.destroy();
    this.assetLoader.cleanup();
  }
}
```

## 🔧 Gestion de la mémoire

```typescript
// Décharger un bundle non utilisé
await this.assetLoader.unloadBundle('effects');

// Vérifier les stats
const stats = this.assetLoader.getStats();
console.log('Bundles chargés:', stats.loadedBundles);
console.log('Assets en cache:', stats.cachedAssets);

// Nettoyer tout
await this.assetLoader.cleanup();
```

## 📦 Ajouter de nouveaux assets

1. Placez vos fichiers dans `assets/pixi/`
2. Mettez à jour `asset-manifest.json`:

```json
{
  "bundles": {
    "monsters": {
      "name": "Monster Sprites",
      "priority": 3,
      "assets": {
        "dragon": "sprites/monsters/dragon.png",
        "goblin": "sprites/monsters/goblin.png"
      }
    }
  }
}
```

3. Chargez le bundle:

```typescript
await this.assetLoader.loadBundle('monsters');
const dragon = await this.assetLoader.getSprite('dragon');
```

## 🎨 Créer des spritesheets

Utilisez TexturePacker ou Free Texture Packer pour générer:
- `hero-walk.json` (métadonnées)
- `hero-walk.png` (image)

Format JSON attendu:
```json
{
  "frames": {
    "walk-1.png": { "frame": { "x": 0, "y": 0, "w": 32, "h": 32 } },
    "walk-2.png": { "frame": { "x": 32, "y": 0, "w": 32, "h": 32 } }
  },
  "meta": {
    "image": "hero-walk.png",
    "size": { "w": 512, "h": 512 }
  },
  "animations": {
    "walk": ["walk-1.png", "walk-2.png"]
  }
}
```

## ⚡ Optimisations

1. **Préchargement** : Chargez les assets essentiels au démarrage
2. **Lazy loading** : Chargez les bundles à la demande
3. **Déchargement** : Libérez la mémoire des bundles inutilisés
4. **Cache** : Les textures sont automatiquement mises en cache
5. **Compression** : Optimisez vos images avec TinyPNG

## 🐛 Debugging

```typescript
// Vérifier si un bundle est chargé
if (this.assetLoader.isBundleLoaded('characters')) {
  console.log('Characters loaded');
}

// Lister les bundles chargés
console.log('Loaded:', this.assetLoader.getLoadedBundles());

// Statistiques
console.log('Stats:', this.assetLoader.getStats());
```
