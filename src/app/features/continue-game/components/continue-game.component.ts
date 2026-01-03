import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from '../../../core/services/game-state.service';
import { AetherApiService } from '../../../shared/services/aether-api.service';

interface SavedCharacter {
  id: string;
  nom: string;
  niveau: number;
  job_actuel: string;
  zone_actuelle: string;
  temps_jeu: string;
  dernier_login: string;
  apparence: any;
}

@Component({
  selector: 'app-continue-game',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./continue-game.component.scss'],
  template: `
    <div class="continue-container">
      <div class="continue-header">
        <h1>Continuer une Partie</h1>
        <button class="back-btn" (click)="goBack()">
          ← Retour au menu
        </button>
      </div>

      <div class="continue-content">
        <!-- Chargement -->
        <div class="loading-state" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Recherche des personnages sauvegardés...</p>
        </div>

        <!-- Aucun personnage trouvé -->
        <div class="no-characters" *ngIf="!isLoading && characters.length === 0">
          <h2>Aucune sauvegarde trouvée</h2>
          <p>Vous devez d'abord créer un personnage pour pouvoir continuer une partie.</p>
          <button class="btn-primary" (click)="startNewGame()">
            Créer un personnage
          </button>
        </div>

        <!-- Liste des personnages -->
        <div class="characters-list" *ngIf="!isLoading && characters.length > 0">
          <div class="characters-grid">
            <div 
              class="character-card" 
              *ngFor="let character of characters; let i = index"
              [class.recommended]="i === 0"
              (click)="selectCharacter(character)">
              
              <div class="character-badge" *ngIf="i === 0">
                Dernier joué
              </div>

              <div class="character-avatar">
                <div class="avatar-preview" [style]="getAvatarStyle(character.apparence)">
                  <span class="avatar-letter">{{ character.nom.charAt(0).toUpperCase() }}</span>
                </div>
              </div>

              <div class="character-info">
                <h3>{{ character.nom }}</h3>
                <div class="character-details">
                  <div class="detail-row">
                    <span class="label">Niveau :</span>
                    <span class="value">{{ character.niveau }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Classe :</span>
                    <span class="value">{{ getJobLabel(character.job_actuel) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Zone :</span>
                    <span class="value">{{ character.zone_actuelle }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Temps de jeu :</span>
                    <span class="value">{{ character.temps_jeu }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Dernière connexion :</span>
                    <span class="value">{{ formatDate(character.dernier_login) }}</span>
                  </div>
                </div>
              </div>

              <div class="character-actions">
                <button class="btn-play" (click)="loadCharacter(character); $event.stopPropagation()">
                  ▶ Jouer
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div class="error-message" *ngIf="errorMessage">
          <div class="error-icon">⚠️</div>
          <p>{{ errorMessage }}</p>
          <button class="btn-retry" (click)="onRetry()">
            Réessayer
          </button>
        </div>
      </div>
    </div>
  `
})
export class ContinueGameComponent implements OnInit {
  private router: Router = inject(Router);
  private gameStateService: GameStateService = inject(GameStateService);
  private apiService: AetherApiService = inject(AetherApiService);

  characters: SavedCharacter[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCharacters();
  }

  async onRetry(): Promise<void> {
    await this.loadCharacters();
  }

  private async loadCharacters(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Essai de récupération des personnages sauvegardés
      // D'abord depuis l'API, puis depuis le localStorage en fallback
      try {
        const response = await this.apiService.getAllCharacters().toPromise();
        this.characters = response || [];
      } catch (apiError) {
        console.warn('API non disponible, utilisation du localStorage', apiError);
        this.loadFromLocalStorage();
      }

      // Trier par dernière connexion (plus récent en premier)
      this.characters.sort((a, b) => 
        new Date(b.dernier_login).getTime() - new Date(a.dernier_login).getTime()
      );

    } catch (error) {
      console.error('Erreur lors du chargement des personnages:', error);
      this.errorMessage = 'Impossible de charger les personnages sauvegardés.';
    } finally {
      this.isLoading = false;
    }
  }

  private loadFromLocalStorage(): void {
    const savedCharacters = localStorage.getItem('aether-saved-characters');
    if (savedCharacters) {
      this.characters = JSON.parse(savedCharacters);
    }
  }

  selectCharacter(character: SavedCharacter): void {
    // Visual feedback
    console.log('Personnage sélectionné:', character.nom);
  }

  async loadCharacter(character: SavedCharacter): Promise<void> {
    try {
      this.gameStateService.setLoading(true);
      
      // Charger le personnage dans le state du jeu (si la méthode existe)
      // this.gameStateService.setCurrentCharacter(character);
      
      // Sauvegarder comme dernier personnage joué
      localStorage.setItem('aether-last-character', character.id);
      
      // Navigation vers le jeu
      await this.router.navigate(['/game'], { 
        queryParams: { characterId: character.id } 
      });

    } catch (error) {
      console.error('Erreur lors du chargement du personnage:', error);
      this.gameStateService.setError('Impossible de charger ce personnage.');
    } finally {
      this.gameStateService.setLoading(false);
    }
  }

  getJobLabel(jobId: string): string {
    const jobLabels: Record<string, string> = {
      'guerrier': 'Guerrier',
      'mage': 'Mage',
      'archer': 'Archer',
      'voleur': 'Voleur',
      'clerc': 'Clerc'
    };
    return jobLabels[jobId] || jobId;
  }

  getAvatarStyle(apparence: any): string {
    if (!apparence?.couleur_peau) return '';
    const { r, g, b } = apparence.couleur_peau;
    return `background-color: rgb(${r}, ${g}, ${b});`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  startNewGame(): void {
    this.router.navigate(['/nouvelle-partie']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}