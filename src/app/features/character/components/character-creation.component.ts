import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil, combineLatest } from 'rxjs';
import { CharacterCreationService } from '../../../shared/services/character-creation.service';
import { AetherApiService } from '../../../shared/services/aether-api.service';
import { 
  CharacterCreationState, 
  CharacterCreationStep,
  JoueurResponseDTO
} from '../../../shared/interfaces/character-creation.interface';

// Import des composants d'étapes
import { NameStepComponent } from './steps/name-step.component';
import { GenderStepComponent } from './steps/gender-step.component';
import { AppearanceStepComponent } from './steps/appearance-step.component';
import { ClassStepComponent } from './steps/class-step.component';
import { SummaryStepComponent } from './steps/summary-step.component';

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [
    CommonModule,
    NameStepComponent,
    GenderStepComponent,
    AppearanceStepComponent,
    ClassStepComponent,
    SummaryStepComponent
  ],
  templateUrl: './character-creation.component.html',
  styleUrls: ['./character-creation.component.scss']
})
export class CharacterCreationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router: Router = inject(Router);
  public creationService: CharacterCreationService = inject(CharacterCreationService);
  private apiService: AetherApiService = inject(AetherApiService);

  // États observables
  state$: Observable<CharacterCreationState> = this.creationService.state$;
  steps$: Observable<CharacterCreationStep[]> = this.creationService.steps$;
  isConnected$: Observable<boolean> = this.apiService.isConnected$;

  ngOnInit(): void {
    console.log('🎭 Initialisation du système de création de personnage Aether');
    this.initializeCreation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialiser la création de personnage
   */
  private async initializeCreation(): Promise<void> {
    try {
      this.creationService.setLoading(true);
      
      // Charger les données nécessaires en parallèle
      const [customizationOptions, jobsData] = await Promise.all([
        this.apiService.getCustomisationOptions().toPromise(),
        this.apiService.getAvailableJobs().toPromise()
      ]);

      if (customizationOptions) {
        this.creationService.setCustomizationOptions(customizationOptions);
      }

      if (jobsData?.jobs) {
        this.creationService.setAvailableJobs(jobsData.jobs);
      }

      console.log('Données de création chargées');
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.creationService.setError('Impossible de charger les données de création');
    } finally {
      this.creationService.setLoading(false);
    }
  }

  // ===== NAVIGATION =====

  /**
   * Aller à l'étape suivante
   */
  nextStep(): void {
    this.creationService.nextStep();
  }

  /**
   * Aller à l'étape précédente
   */
  previousStep(): void {
    this.creationService.previousStep();
  }

  /**
   * Aller directement à une étape
   */
  goToStep(stepId: number): void {
    this.creationService.goToStep(stepId);
  }

  /**
   * Vérifier si on peut aller à l'étape suivante
   */
  canGoNext(): boolean {
    return this.creationService.canGoNext();
  }

  /**
   * Vérifier si on peut aller à l'étape précédente
   */
  canGoPrevious(): boolean {
    return this.creationService.canGoPrevious();
  }

  // ===== ACTIONS FINALES =====

  /**
   * Créer le personnage et lancer le jeu
   */
  async createCharacterAndStartGame(): Promise<void> {
    try {
      this.creationService.setLoading(true);
      this.creationService.setError(null);

      const characterData = this.creationService.getCompleteCharacterData();
      if (!characterData) {
        throw new Error('Données de personnage incomplètes');
      }

      console.log('Création du personnage:', characterData);

      // Créer le personnage via l'API
      let createdCharacter: JoueurResponseDTO | undefined;
      try {
        // Essayer l'endpoint RESTful en premier
        createdCharacter = await this.apiService.createCharacter(characterData).toPromise();
      } catch (error) {
        console.log('Fallback vers l\'endpoint legacy');
        // Fallback vers l'endpoint legacy
        createdCharacter = await this.apiService.createCharacterLegacy(characterData).toPromise();
      }

      if (!createdCharacter) {
        throw new Error('Impossible de créer le personnage');
      }

      console.log('✅ Personnage créé:', createdCharacter);

      // Démarrer le premier combat
      const combatResult = await this.apiService.startFirstCombat(createdCharacter.id).toPromise();
      console.log('🎯 Premier combat démarré:', combatResult);

      // Redirection vers le jeu
      this.router.navigate(['/game'], {
        queryParams: { 
          character: createdCharacter.id,
          newPlayer: 'true'
        }
      });

    } catch (error: any) {
      console.error('❌ Erreur lors de la création:', error);
      this.creationService.setError(error.message || 'Erreur lors de la création du personnage');
    } finally {
      this.creationService.setLoading(false);
    }
  }

  /**
   * Annuler et retourner au menu principal
   */
  cancelCreation(): void {
    if (confirm('Êtes-vous sûr de vouloir abandonner la création de votre personnage ?')) {
      this.creationService.reset();
      this.router.navigate(['/']);
    }
  }

  /**
   * Redémarrer la création
   */
  restartCreation(): void {
    if (confirm('Êtes-vous sûr de vouloir recommencer la création ?')) {
      this.creationService.reset();
      this.initializeCreation();
    }
  }

  // ===== UTILITAIRES =====

  /**
   * Obtenir le titre de l'étape actuelle
   */
  getCurrentStepTitle(steps: CharacterCreationStep[], currentStep: number): string {
    const step = steps.find(s => s.id === currentStep);
    return step?.title || 'Création de Personnage';
  }

  /**
   * Obtenir le pourcentage de progression
   */
  getProgress(currentStep: number): number {
    return Math.round((currentStep / 5) * 100);
  }
}
