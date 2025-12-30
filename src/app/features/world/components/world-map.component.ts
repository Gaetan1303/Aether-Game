import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-map">
      <h2>Carte du Monde</h2>
      <p>Composant en développement...</p>
    </div>
  `,
  styles: [`
    .world-map {
      padding: 20px;
      color: white;
    }
  `]
})
export class WorldMapComponent {}