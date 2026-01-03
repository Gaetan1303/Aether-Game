import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../shared/services/character-creation.service';
import { JoueurCreateDTO, CustomisationOptions } from '../../../../shared/interfaces/character-creation.interface';

@Component({
  selector: 'app-gender-step',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./gender-step.component.scss'],
  template: `
    <div class="step-container gender-step">
      <div class="step-header">
        <h2>Quel est le sexe de votre personnage ?</h2>
        <p>Cette information déterminera l'apparence de base de votre héros.</p>
      </div>

      <div class="gender-selection">
        <div class="gender-options">
          <div 
            *ngFor="let option of genderOptions" 
            class="gender-option"
            [class.selected]="isSelected(option.value)"
            (click)="selectGender(option.value)">
            
            <div class="gender-icon">{{ option.label.charAt(0) }}</div>
            <h3>{{ option.label }}</h3>
            <p>{{ option.description }}</p>
            
            <div class="selection-indicator" *ngIf="isSelected(option.value)">
              <span class="check-mark">Sélectionné</span>
            </div>
          </div>
        </div>

        <!-- Informations additionnelles -->
        <div class="gender-info" *ngIf="selectedGender">
          <div class="info-card">
            <h4>Information sélectionnée</h4>
            <p>
              Votre personnage sera de sexe <strong>{{ getSelectedGenderLabel() }}</strong>.
              Cela influencera les options d'apparence disponibles à l'étape suivante.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GenderStepComponent {
  @Input() characterData: Partial<JoueurCreateDTO> = {};
  @Input() customizationOptions: CustomisationOptions | null = null;
  
  private creationService: CharacterCreationService = inject(CharacterCreationService);

  genderOptions = [
    {
      value: 'masculin' as const,
      label: 'Masculin',
      description: 'Personnage masculin avec les options d\'apparence traditionnellement masculines'
    },
    {
      value: 'feminin' as const,
      label: 'Féminin',
      description: 'Personnage féminin avec les options d\'apparence traditionnellement féminines'
    },
    {
      value: 'autre' as const,
      label: 'Autre',
      description: 'Personnage non-binaire avec l\'ensemble complet des options d\'apparence'
    }
  ];

  get selectedGender(): string | null {
    return this.characterData.apparence?.sexe || null;
  }

  isSelected(value: string): boolean {
    return this.selectedGender === value;
  }

  selectGender(sexe: 'masculin' | 'feminin' | 'autre'): void {
    this.creationService.updateGender(sexe);
  }

  getSelectedGenderLabel(): string {
    const selected = this.genderOptions.find(option => option.value === this.selectedGender);
    return selected?.label || '';
  }
}