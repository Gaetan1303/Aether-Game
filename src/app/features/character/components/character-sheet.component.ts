import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="character-sheet">
      <h2>Feuille de Personnage</h2>
      <p>Composant en développement...</p>
    </div>
  `,
  styles: [`
    .character-sheet {
      padding: 20px;
      color: white;
    }
  `]
})
export class CharacterSheetComponent {}