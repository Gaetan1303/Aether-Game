import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterCreationService } from '../../../../shared/services/character-creation.service';
import { AetherApiService } from '../../../../shared/services/aether-api.service';
import { JoueurCreateDTO, CustomisationOptions, CouleurDTO } from '../../../../shared/interfaces/character-creation.interface';

@Component({
  selector: 'app-appearance-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./appearance-step.component.scss'],
  template: `
    <div class="step-container appearance-step">
      <div class="step-header">
        <h2>Personnalisez l'apparence de votre héros</h2>
        <p>Créez l'apparence parfaite qui correspond à votre vision du personnage.</p>
      </div>

      <div class="appearance-editor">
        <!-- Aperçu du personnage -->
        <div class="character-preview">
          <div class="preview-container">
            <div class="character-avatar" [style]="getAvatarStyles()">
              <div class="avatar-silhouette">
                <div class="avatar-head"></div>
                <div class="avatar-body"></div>
              </div>
            </div>
            <div class="preview-info">
              <h4>{{ characterData.nom || 'Votre Héros' }}</h4>
              <p>{{ getGenderLabel() }} • {{ getTailleLabel() }}</p>
            </div>
          </div>
        </div>

        <!-- Options de personnalisation -->
        <div class="customization-panel">
          
          <!-- Taille -->
          <div class="option-group">
            <label class="option-label">
              Taille du personnage
            </label>
            <div class="size-options">
              <button 
                *ngFor="let taille of tailleOptions"
                class="size-option"
                [class.selected]="currentAppearance.taille === taille.value"
                (click)="updateTaille(taille.value)">
                {{ taille.label }}
              </button>
            </div>
          </div>

          <!-- Couleur de peau -->
          <div class="option-group">
            <label class="option-label">
              Couleur de peau
            </label>
            <div class="color-section">
              <div class="color-presets">
                <button 
                  *ngFor="let preset of skinColorPresets"
                  class="color-preset"
                  [style.background]="rgbToHex(preset)"
                  [class.selected]="isSkinColorSelected(preset)"
                  (click)="updateSkinColor(preset)"
                  [title]="'Couleur personnalisée'">
                </button>
              </div>
              <input 
                type="color" 
                [value]="rgbToHex(currentAppearance.couleur_peau)"
                (change)="onSkinColorChange($event)"
                class="color-picker">
            </div>
          </div>

          <!-- Style de cheveux -->
          <div class="option-group">
            <label class="option-label">
              Style de cheveux
            </label>
            <select 
              [(ngModel)]="currentAppearance.style_cheveux"
              (change)="updateHairStyle($event)"
              class="style-select">
              <option *ngFor="let style of hairStyles" [value]="style.value">
                {{ style.label }}
              </option>
            </select>
          </div>

          <!-- Couleur de cheveux -->
          <div class="option-group">
            <label class="option-label">
              Couleur de cheveux
            </label>
            <div class="color-section">
              <div class="color-presets">
                <button 
                  *ngFor="let preset of hairColorPresets"
                  class="color-preset"
                  [style.background]="rgbToHex(preset)"
                  [class.selected]="isHairColorSelected(preset)"
                  (click)="updateHairColor(preset)"
                  [title]="'Couleur personnalisée'">
                </button>
              </div>
              <input 
                type="color" 
                [value]="rgbToHex(currentAppearance.couleur_cheveux)"
                (change)="onHairColorChange($event)"
                class="color-picker">
            </div>
          </div>

          <!-- Couleur des yeux -->
          <div class="option-group">
            <label class="option-label">
              Couleur des yeux
            </label>
            <div class="color-section">
              <div class="color-presets">
                <button 
                  *ngFor="let preset of eyeColorPresets"
                  class="color-preset"
                  [style.background]="rgbToHex(preset)"
                  [class.selected]="isEyeColorSelected(preset)"
                  (click)="updateEyeColor(preset)"
                  [title]="'Couleur personnalisée'">
                </button>
              </div>
              <input 
                type="color" 
                [value]="rgbToHex(currentAppearance.couleur_yeux)"
                (change)="onEyeColorChange($event)"
                class="color-picker">
            </div>
          </div>

          <!-- Style de barbe (si masculin) -->
          <div class="option-group" *ngIf="currentAppearance.sexe === 'masculin'">
            <label class="option-label">
              Style de barbe
            </label>
            <select 
              [(ngModel)]="currentAppearance.style_barbe"
              (change)="updateBeardStyle($event)"
              class="style-select">
              <option *ngFor="let style of beardStyles" [value]="style.value">
                {{ style.label }}
              </option>
            </select>
          </div>

          <!-- Bouton randomiser -->
          <div class="randomize-section">
            <button class="randomize-button" (click)="randomizeAppearance()">
              <span>Apparence aléatoire</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AppearanceStepComponent {
  @Input() characterData: Partial<JoueurCreateDTO> = {};
  @Input() customizationOptions: CustomisationOptions | null = null;
  
  private creationService: CharacterCreationService = inject(CharacterCreationService);
  private apiService: AetherApiService = inject(AetherApiService);

  get currentAppearance() {
    return this.characterData.apparence!;
  }

  tailleOptions: Array<{ value: 'petite' | 'moyenne' | 'grande', label: string }> = [
    { value: 'petite', label: 'Petite' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'grande', label: 'Grande' }
  ];

  hairStyles = [
    { value: 'court', label: 'Cheveux courts' },
    { value: 'long', label: 'Cheveux longs' },
    { value: 'bouclé', label: 'Cheveux bouclés' },
    { value: 'tressé', label: 'Cheveux tressés' },
    { value: 'rasé', label: 'Crâne rasé' }
  ];

  beardStyles = [
    { value: 'aucune', label: 'Sans barbe' },
    { value: 'courte', label: 'Barbe courte' },
    { value: 'longue', label: 'Barbe longue' },
    { value: 'moustache', label: 'Moustache' },
    { value: 'bouc', label: 'Bouc' }
  ];

  // Couleurs prédéfinies
  skinColorPresets: CouleurDTO[] = [
    { r: 255, g: 220, b: 177 }, // Clair
    { r: 240, g: 184, b: 160 }, // Moyen clair
    { r: 212, g: 165, b: 116 }, // Moyen
    { r: 181, g: 131, b: 90 },  // Moyen foncé
    { r: 139, g: 94, b: 60 },   // Foncé
    { r: 101, g: 67, b: 33 }    // Très foncé
  ];

  hairColorPresets: CouleurDTO[] = [
    { r: 255, g: 255, b: 0 },   // Blond
    { r: 139, g: 69, b: 19 },   // Brun
    { r: 0, g: 0, b: 0 },       // Noir
    { r: 165, g: 42, b: 42 },   // Roux
    { r: 192, g: 192, b: 192 }, // Gris
    { r: 255, g: 255, b: 255 }  // Blanc
  ];

  eyeColorPresets: CouleurDTO[] = [
    { r: 139, g: 69, b: 19 },   // Marron
    { r: 65, g: 105, b: 225 },  // Bleu
    { r: 34, g: 139, b: 34 },   // Vert
    { r: 128, g: 128, b: 128 }, // Gris
    { r: 255, g: 165, b: 0 },   // Ambre
    { r: 75, g: 0, b: 130 }     // Violet
  ];

  getAvatarStyles(): string {
    if (!this.currentAppearance) return '';
    
    const skinColor = this.rgbToHex(this.currentAppearance.couleur_peau);
    const hairColor = this.rgbToHex(this.currentAppearance.couleur_cheveux);
    
    return `
      background: linear-gradient(135deg, ${skinColor} 30%, ${hairColor} 100%);
      color: ${skinColor};
    `;
  }

  getGenderLabel(): string {
    const sexe = this.currentAppearance?.sexe;
    const labels = { 'masculin': 'Masculin', 'feminin': 'Féminin', 'autre': 'Autre' };
    return labels[sexe as keyof typeof labels] || '';
  }

  getTailleLabel(): string {
    const taille = this.currentAppearance?.taille;
    const labels = { 'petite': 'Petite taille', 'moyenne': 'Taille moyenne', 'grande': 'Grande taille' };
    return labels[taille as keyof typeof labels] || '';
  }

  updateTaille(taille: 'petite' | 'moyenne' | 'grande'): void {
    this.creationService.updateAppearance({ taille });
  }

  updateSkinColor(couleur: CouleurDTO): void {
    this.creationService.updateAppearance({ couleur_peau: couleur });
  }

  updateHairColor(couleur: CouleurDTO): void {
    this.creationService.updateAppearance({ couleur_cheveux: couleur });
  }

  updateEyeColor(couleur: CouleurDTO): void {
    this.creationService.updateAppearance({ couleur_yeux: couleur });
  }

  updateHairStyle(event: any): void {
    this.creationService.updateAppearance({ style_cheveux: event.target.value });
  }

  updateBeardStyle(event: any): void {
    this.creationService.updateAppearance({ style_barbe: event.target.value });
  }

  onSkinColorChange(event: any): void {
    const color = this.hexToRgb(event.target.value);
    if (color) this.updateSkinColor(color);
  }

  onHairColorChange(event: any): void {
    const color = this.hexToRgb(event.target.value);
    if (color) this.updateHairColor(color);
  }

  onEyeColorChange(event: any): void {
    const color = this.hexToRgb(event.target.value);
    if (color) this.updateEyeColor(color);
  }

  isSkinColorSelected(color: CouleurDTO): boolean {
    const current = this.currentAppearance?.couleur_peau;
    return current?.r === color.r && current?.g === color.g && current?.b === color.b;
  }

  isHairColorSelected(color: CouleurDTO): boolean {
    const current = this.currentAppearance?.couleur_cheveux;
    return current?.r === color.r && current?.g === color.g && current?.b === color.b;
  }

  isEyeColorSelected(color: CouleurDTO): boolean {
    const current = this.currentAppearance?.couleur_yeux;
    return current?.r === color.r && current?.g === color.g && current?.b === color.b;
  }

  randomizeAppearance(): void {
    this.creationService.randomizeAppearance();
  }

  rgbToHex(color: CouleurDTO): string {
    return this.apiService.rgbToHex(color.r, color.g, color.b);
  }

  hexToRgb(hex: string): CouleurDTO | null {
    return this.apiService.hexToRgb(hex);
  }
}