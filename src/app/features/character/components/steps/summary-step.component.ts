import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../shared/services/character-creation.service';
import { AetherApiService } from '../../../../shared/services/aether-api.service';
import { JoueurCreateDTO, Job, CustomisationOptions } from '../../../../shared/interfaces/character-creation.interface';

@Component({
  selector: 'app-summary-step',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./summary-step.component.scss'],
  template: `
    <div class="step-container summary-step">
      <div class="step-header">
        <h2>Validation de votre héros</h2>
        <p>Vérifiez tous les détails de votre personnage avant de démarrer l'aventure dans Aether Game !</p>
      </div>

      <div class="character-summary">
        
        <!-- Aperçu visuel du personnage -->
        <div class="character-showcase">
          <div class="showcase-container">
            <div class="character-portrait" [style]="getPortraitStyles()">
              <div class="portrait-avatar">
                <div class="avatar-head"></div>
                <div class="avatar-body"></div>
              </div>
              <div class="portrait-overlay">
                <div class="portrait-frame"></div>
              </div>
            </div>
            
            <div class="character-title">
              <h3>{{ characterData.nom }}</h3>
              <p class="character-subtitle">
                {{ getGenderLabel() }} {{ getJobLabel() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="character-details">
          
          <!-- Informations générales -->
          <div class="details-section">
            <h4 class="section-title">Informations générales</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nom</span>
                <span class="info-value">{{ characterData.nom }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Sexe</span>
                <span class="info-value">{{ getGenderLabel() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Taille</span>
                <span class="info-value">{{ getTailleLabel() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Classe</span>
                <span class="info-value">{{ getJobLabel() }}</span>
              </div>
            </div>
          </div>

          <!-- Apparence -->
          <div class="details-section">
            <h4 class="section-title">Apparence</h4>
            <div class="appearance-preview">
              <div class="color-samples">
                <div class="color-sample">
                  <span class="color-label">Peau</span>
                  <div class="color-circle" [style.background]="getSkinColorHex()"></div>
                </div>
                <div class="color-sample">
                  <span class="color-label">Cheveux</span>
                  <div class="color-circle" [style.background]="getHairColorHex()"></div>
                </div>
                <div class="color-sample">
                  <span class="color-label">Yeux</span>
                  <div class="color-circle" [style.background]="getEyeColorHex()"></div>
                </div>
              </div>
              
              <div class="style-info">
                <div class="style-item">
                  <span class="style-label">Cheveux</span>
                  <span class="style-value">{{ getHairStyleLabel() }}</span>
                </div>
                <div class="style-item" *ngIf="characterData.apparence?.sexe === 'masculin' && characterData.apparence?.style_barbe !== 'aucune'">
                  <span class="style-label">Barbe</span>
                  <span class="style-value">{{ getBeardStyleLabel() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations de classe -->
          <div class="details-section" *ngIf="selectedJob">
            <h4 class="section-title">Classe sélectionnée</h4>
            <div class="class-info">
              <div class="class-preview">
                <div class="class-icon">{{ getJobIcon() }}</div>
                <div class="class-details">
                  <h5>{{ selectedJob.nom }}</h5>
                  <p>{{ selectedJob.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="action-buttons">
        <button class="edit-button" (click)="goToStep(1)">
          Modifier le nom
        </button>
        <button class="edit-button" (click)="goToStep(2)">
          Modifier le sexe
        </button>
        <button class="edit-button" (click)="goToStep(3)">
          Modifier l'apparence
        </button>
        <button class="edit-button" (click)="goToStep(4)">
          Modifier la classe
        </button>
      </div>

      <!-- Validation finale -->
      <div class="final-validation">
        <div class="validation-card">
          <h4>Êtes-vous prêt à commencer l'aventure ?</h4>
          <p>Une fois confirmé, votre personnage sera créé et vous serez dirigé vers le premier combat !</p>
          
          <div class="validation-buttons">
            <button 
              class="confirm-button" 
              [disabled]="!isCharacterComplete() || isCreating"
              (click)="createCharacterAndStart()">
              <span *ngIf="!isCreating">Confirmer et commencer l'aventure</span>
              <span *ngIf="isCreating">Création en cours...</span>
            </button>
          </div>
          
          <div class="validation-feedback" *ngIf="!isCharacterComplete()">
            <p class="incomplete-warning">
              Veuillez compléter toutes les étapes avant de continuer.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SummaryStepComponent {
  @Input() characterData: Partial<JoueurCreateDTO> = {};
  @Input() customizationOptions: CustomisationOptions | null = null;
  
  private creationService: CharacterCreationService = inject(CharacterCreationService);
  private apiService: AetherApiService = inject(AetherApiService);

  isCreating = false;

  get selectedJob(): Job | null {
    if (!this.characterData.job_initial) return null;
    return this.creationService.getAvailableJobs()
      .find((job: Job) => job.id === this.characterData.job_initial) || null;
  }

  getGenderLabel(): string {
    const sexe = this.characterData.apparence?.sexe;
    const labels = { 'masculin': 'Masculin', 'feminin': 'Féminin', 'autre': 'Autre' };
    return labels[sexe as keyof typeof labels] || 'Non spécifié';
  }

  getTailleLabel(): string {
    const taille = this.characterData.apparence?.taille;
    const labels = { 'petite': 'Petite taille', 'moyenne': 'Taille moyenne', 'grande': 'Grande taille' };
    return labels[taille as keyof typeof labels] || 'Non spécifié';
  }

  getJobLabel(): string {
    return this.selectedJob?.nom || 'Aucune classe sélectionnée';
  }

  getJobIcon(): string {
    if (!this.selectedJob) return 'C';
    const icons: Record<string, string> = {
      'guerrier': 'G',
      'archer': 'A',
      'mage': 'M',
      'voleur': 'V',
      'pretre': 'P',
      'clerc': 'C'
    };
    return icons[this.selectedJob.id] || 'C';
  }

  getSkinColorHex(): string {
    const color = this.characterData.apparence?.couleur_peau;
    return color ? this.apiService.rgbToHex(color.r, color.g, color.b) : '#f5deb3';
  }

  getHairColorHex(): string {
    const color = this.characterData.apparence?.couleur_cheveux;
    return color ? this.apiService.rgbToHex(color.r, color.g, color.b) : '#8b4513';
  }

  getEyeColorHex(): string {
    const color = this.characterData.apparence?.couleur_yeux;
    return color ? this.apiService.rgbToHex(color.r, color.g, color.b) : '#4682b4';
  }

  getHairStyleLabel(): string {
    const style = this.characterData.apparence?.style_cheveux;
    const labels = {
      'court': 'Cheveux courts',
      'long': 'Cheveux longs',
      'bouclé': 'Cheveux bouclés',
      'tressé': 'Cheveux tressés',
      'rasé': 'Crâne rasé'
    };
    return labels[style as keyof typeof labels] || 'Non spécifié';
  }

  getBeardStyleLabel(): string {
    const style = this.characterData.apparence?.style_barbe;
    const labels = {
      'aucune': 'Sans barbe',
      'courte': 'Barbe courte',
      'longue': 'Barbe longue',
      'moustache': 'Moustache',
      'bouc': 'Bouc'
    };
    return labels[style as keyof typeof labels] || 'Sans barbe';
  }

  getPortraitStyles(): string {
    const skinColor = this.getSkinColorHex();
    const hairColor = this.getHairColorHex();
    
    return `
      background: linear-gradient(135deg, ${skinColor} 30%, ${hairColor} 70%);
      border: 3px solid ${hairColor};
    `;
  }

  isCharacterComplete(): boolean {
    return !!(
      this.characterData.nom &&
      this.characterData.apparence?.sexe &&
      this.characterData.apparence?.taille &&
      this.characterData.apparence?.couleur_peau &&
      this.characterData.apparence?.couleur_cheveux &&
      this.characterData.apparence?.couleur_yeux &&
      this.characterData.apparence?.style_cheveux &&
      this.characterData.job_initial
    );
  }

  goToStep(step: number): void {
    this.creationService.goToStep(step);
  }

  async createCharacterAndStart(): Promise<void> {
    if (!this.isCharacterComplete() || this.isCreating) return;

    try {
      this.isCreating = true;
      
      // Créer le personnage via l'API
      const response = await this.apiService.createCharacter(this.characterData as JoueurCreateDTO).toPromise();
      
      if (response) {
        // Lancer le premier combat avec l'ID du joueur
        const gameResponse = await this.apiService.startFirstCombat(response.id).toPromise();
        
        if (gameResponse) {
          console.log('Personnage créé et jeu lancé avec succès !');
          // Ici vous pourriez rediriger vers le jeu ou afficher un message de succès
        } else {
          throw new Error('Échec du lancement du jeu');
        }
      } else {
        throw new Error('Échec de la création du personnage');
      }
      
    } catch (error) {
      console.error('Erreur lors de la création du personnage:', error);
      this.creationService.setError('Une erreur est survenue lors de la création de votre personnage');
    } finally {
      this.isCreating = false;
    }
  }
}