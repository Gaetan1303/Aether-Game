import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterCreationService } from '../../../../shared/services/character-creation.service';
import { AetherApiService } from '../../../../shared/services/aether-api.service';
import { JoueurCreateDTO } from '../../../../shared/interfaces/character-creation.interface';

@Component({
  selector: 'app-name-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./name-step.component.scss'],
  template: `
    <div class="step-container name-step">
      <div class="step-header">
        <h2>Comment souhaitez-vous nommer votre héros ?</h2>
        <p>Choisissez un nom unique qui vous représentera dans l'univers d'Aether Game.</p>
      </div>

      <div class="name-input-section">
        <div class="input-group">
          <label for="characterName">
            Nom du personnage
          </label>
          
          <input 
            id="characterName"
            type="text" 
            [(ngModel)]="currentName"
            (input)="onNameChange($event)"
            placeholder="Entrez le nom de votre héros"
            maxlength="20"
            class="character-name-input"
            [class.invalid]="currentName.length > 0 && currentName.length < 3"
          >
          
          <div class="input-info">
            <div class="char-counter">{{ currentName.length }}/20 caractères</div>
            <div class="validation-feedback" *ngIf="currentName.length > 0">
              <span *ngIf="isNameValid" class="valid">Nom valide</span>
              <span *ngIf="!isNameValid && currentName.length < 3" class="invalid">Minimum 3 caractères</span>
              <span *ngIf="!isNameValid && currentName.length >= 3" class="invalid">Caractères autorisés: lettres, chiffres, - et _</span>
            </div>
          </div>
        </div>

        <!-- Suggestions de noms -->
        <div class="name-suggestions" *ngIf="currentName.length === 0">
          <h4>Suggestions de noms</h4>
          <div class="suggestion-pills">
            <button 
              *ngFor="let suggestion of nameSuggestions" 
              class="suggestion-pill"
              (click)="selectSuggestion(suggestion)">
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Validation en temps réel -->
        <div class="name-validation" *ngIf="isCheckingName">
          <div class="checking-indicator">
            <div class="spinner"></div>
            <span>Vérification de la disponibilité...</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NameStepComponent {
  @Input() characterData: Partial<JoueurCreateDTO> = {};
  
  private creationService: CharacterCreationService = inject(CharacterCreationService);
  private apiService = inject(AetherApiService);

  currentName = '';
  isCheckingName = false;
  
  nameSuggestions = [
    'Héros', 'Aventurier', 'Chevalier', 'Tacticien', 'Stratège',
    'Vaillant', 'Audacieux', 'Brave', 'Noble', 'Légende'
  ];

  ngOnInit(): void {
    // Initialiser avec le nom existant s'il y en a un
    if (this.characterData.nom) {
      this.currentName = this.characterData.nom;
    }
  }

  get isNameValid(): boolean {
    return this.currentName.length >= 3 && 
           this.currentName.length <= 20 && 
           /^[a-zA-Z0-9_-]+$/.test(this.currentName);
  }

  onNameChange(event: any): void {
    const value = event.target.value;
    this.currentName = value;
    
    // Mettre à jour le service
    this.creationService.updateName(value);
    
    // Validation en temps réel (simulation)
    if (this.isNameValid) {
      this.checkNameAvailability(value);
    }
  }

  selectSuggestion(name: string): void {
    this.currentName = name;
    this.creationService.updateName(name);
    this.checkNameAvailability(name);
  }

  private async checkNameAvailability(name: string): Promise<void> {
    if (!this.isNameValid) return;
    
    try {
      this.isCheckingName = true;
      const result = await this.apiService.checkNameAvailability(name).toPromise();
      // Le résultat de validation est géré par le service
      console.log('Nom disponible:', result?.available);
    } catch (error) {
      console.warn('Erreur lors de la vérification du nom:', error);
    } finally {
      this.isCheckingName = false;
    }
  }
}