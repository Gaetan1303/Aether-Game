/**
 * Exemple d'utilisation de AssetLoaderService
 */

import { Component, OnInit, inject } from '@angular/core';
import { AssetLoaderService } from '@core/services/pixi';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <h3>Asset Loading Example</h3>
      
      @if (progress$ | async; as progress) {
        <div class="loading">
          <p>Loading {{ progress.bundleName }}...</p>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progress.percentage"></div>
          </div>
        </div>
      }
      
      <button (click)="loadCoreAssets()">Load Core Assets</button>
      <button (click)="loadCharacters()">Load Characters</button>
      <button (click)="loadAll()">Load All</button>
      
      <div class="stats">
        <p>Loaded Bundles: {{ stats.loadedBundles }}</p>
        <p>Cached Assets: {{ stats.cachedAssets }}</p>
      </div>
    </div>
  `
})
export class ExampleComponent implements OnInit {
  private assetLoader = inject(AssetLoaderService);
  
  progress$ = this.assetLoader.progress$;
  stats = { loadedBundles: 0, cachedAssets: 0 };

  async ngOnInit() {
    // Initialiser le loader
    await this.assetLoader.initialize();
    
    // Précharger les assets essentiels
    await this.assetLoader.preloadEssentials();
    
    this.updateStats();
  }

  async loadCoreAssets() {
    await this.assetLoader.loadBundle('core');
    this.updateStats();
  }

  async loadCharacters() {
    await this.assetLoader.loadBundle('characters');
    this.updateStats();
  }

  async loadAll() {
    await this.assetLoader.loadBundles(['core', 'characters', 'units', 'terrain', 'effects']);
    this.updateStats();
  }

  updateStats() {
    this.stats = this.assetLoader.getStats();
  }
}
