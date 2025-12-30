import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-grid">
      <h2>Inventaire</h2>
      <p>Composant en développement...</p>
    </div>
  `,
  styles: [`
    .inventory-grid {
      padding: 20px;
      color: white;
    }
  `]
})
export class InventoryGridComponent {}