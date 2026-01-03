import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameStateService } from '../../../core/services/game-state.service';

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  language: string;
  difficulty: string;
  autoSave: boolean;
  graphicsQuality: string;
}

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./options.component.scss'],
  template: `
    <div class="options-container">
      <div class="options-header">
        <h1>Options du Jeu</h1>
        <button class="back-btn" (click)="goBack()">
          ← Retour au menu
        </button>
      </div>

      <div class="options-content">
        <div class="options-section">
          <h2>Audio</h2>
          <div class="option-group">
            <label class="option-item">
              <input type="checkbox" [(ngModel)]="settings.soundEnabled">
              <span>Effets sonores</span>
            </label>
            <div class="slider-group" *ngIf="settings.soundEnabled">
              <label>Volume des effets : {{ settings.soundVolume }}%</label>
              <input type="range" min="0" max="100" [(ngModel)]="settings.soundVolume">
            </div>
          </div>
          
          <div class="option-group">
            <label class="option-item">
              <input type="checkbox" [(ngModel)]="settings.musicEnabled">
              <span>Musique</span>
            </label>
            <div class="slider-group" *ngIf="settings.musicEnabled">
              <label>Volume de la musique : {{ settings.musicVolume }}%</label>
              <input type="range" min="0" max="100" [(ngModel)]="settings.musicVolume">
            </div>
          </div>
        </div>

        <div class="options-section">
          <h2>Gameplay</h2>
          <div class="option-group">
            <label>Difficulté :</label>
            <select [(ngModel)]="settings.difficulty">
              <option value="facile">Facile</option>
              <option value="normale">Normale</option>
              <option value="difficile">Difficile</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <div class="option-group">
            <label class="option-item">
              <input type="checkbox" [(ngModel)]="settings.autoSave">
              <span>Sauvegarde automatique</span>
            </label>
          </div>
        </div>

        <div class="options-section">
          <h2>Graphiques</h2>
          <div class="option-group">
            <label>Qualité graphique :</label>
            <select [(ngModel)]="settings.graphicsQuality">
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
        </div>

        <div class="options-section">
          <h2>Interface</h2>
          <div class="option-group">
            <label>Langue :</label>
            <select [(ngModel)]="settings.language">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      <div class="options-actions">
        <button class="btn-secondary" (click)="resetDefaults()">
          Valeurs par défaut
        </button>
        <button class="btn-primary" (click)="saveSettings()">
          Sauvegarder
        </button>
      </div>
    </div>
  `
})
export class OptionsComponent {
  private router: Router = inject(Router);
  private gameStateService: GameStateService = inject(GameStateService);

  settings: GameSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 80,
    musicVolume: 60,
    language: 'fr',
    difficulty: 'normale',
    autoSave: true,
    graphicsQuality: 'moyenne'
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('aether-game-settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  saveSettings(): void {
    localStorage.setItem('aether-game-settings', JSON.stringify(this.settings));
    console.log('Paramètres sauvegardés !');
    // Optionnel: ajouter une notification visuelle ici
  }

  resetDefaults(): void {
    this.settings = {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 80,
      musicVolume: 60,
      language: 'fr',
      difficulty: 'normale',
      autoSave: true,
      graphicsQuality: 'moyenne'
    };
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}