import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="market">
      <h2>Marché</h2>
      <p>Composant en développement...</p>
    </div>
  `,
  styles: [`
    .market {
      padding: 20px;
      color: white;
    }
  `]
})
export class MarketComponent {}