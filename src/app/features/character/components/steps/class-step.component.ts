import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationService } from '../../../../shared/services/character-creation.service';
import { AetherApiService } from '../../../../shared/services/aether-api.service';
import { JoueurCreateDTO, Job } from '../../../../shared/interfaces/character-creation.interface';

@Component({
  selector: 'app-class-step',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./class-step.component.scss'],
  template: `
    <div class="step-container class-step">
      <div class="step-header">
        <h2>Choisissez votre classe</h2>
        <p>Votre classe détermine votre style de combat, vos compétences et votre rôle sur le champ de bataille.</p>
      </div>

      <div class="class-selection">
        <!-- Grille des classes -->
        <div class="class-grid">
          <div 
            *ngFor="let job of availableJobs" 
            class="class-card"
            [class.selected]="isSelected(job.id)"
            (click)="selectClass(job.id)">
            
            <div class="class-icon">{{ getClassIcon(job.id) }}</div>
            <h3 class="class-name">{{ job.nom }}</h3>
            <p class="class-description">{{ job.description }}</p>
            
            <!-- Stats de base (simulées) -->
            <div class="class-stats">
              <div class="stat-item">
                <span class="stat-label">Type</span>
                <span class="stat-value">Combat</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Difficulté</span>
                <span class="stat-value">{{ getDifficultyLabel(job.id) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Détails de la classe sélectionnée -->
        <div class="class-details" *ngIf="selectedJob">
          <div class="details-card">
            <div class="details-header">
              <div class="details-icon">{{ getClassIcon(selectedJob.id) }}</div>
              <h3 class="details-title">{{ selectedJob.nom }}</h3>
            </div>
            
            <div class="details-content">
              <div class="detail-section">
                <h4>Description</h4>
                <p>{{ selectedJob.description }}</p>
                
                <h4>Spécialisation</h4>
                <p>Cette classe excelle dans {{ getSpecialization(selectedJob.id) }}.</p>
              </div>
              
              <div class="detail-section">
                <h4>Conseils de jeu</h4>
                <p>{{ getGameplayTips(selectedJob.id) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- État de chargement -->
        <div class="loading-state" *ngIf="isLoading">
          <div class="loading-spinner"></div>
          <p class="loading-text">Chargement des classes disponibles...</p>
        </div>

        <!-- État d'erreur -->
        <div class="error-state" *ngIf="hasError">
          <p class="error-message">{{ errorMessage }}</p>
          <button class="retry-button" (click)="retryLoadClasses()">
            Réessayer
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClassStepComponent {
  @Input() characterData: Partial<JoueurCreateDTO> = {};
  
  private creationService: CharacterCreationService = inject(CharacterCreationService);
  private apiService: AetherApiService = inject(AetherApiService);

  get availableJobs(): Job[] {
    return this.creationService.getAvailableJobs();
  }

  get selectedJobId(): string | null {
    return this.characterData.job_initial || null;
  }

  get selectedJob(): Job | null {
    if (!this.selectedJobId) return null;
    return this.availableJobs.find(job => job.id === this.selectedJobId) || null;
  }

  get isLoading(): boolean {
    return this.creationService.getIsLoading();
  }

  get hasError(): boolean {
    return !!this.creationService.getError();
  }

  get errorMessage(): string | null {
    return this.creationService.getError();
  }

  ngOnInit(): void {
    if (this.availableJobs.length === 0) {
      this.loadAvailableJobs();
    }
  }

  isSelected(jobId: string): boolean {
    return this.selectedJobId === jobId;
  }

  selectClass(jobId: string): void {
    if (this.isValidJobId(jobId)) {
      this.creationService.updateJobInitial(jobId as 'guerrier' | 'mage' | 'archer' | 'voleur' | 'clerc');
    }
  }

  private isValidJobId(jobId: string): jobId is 'guerrier' | 'mage' | 'archer' | 'voleur' | 'clerc' {
    return ['guerrier', 'mage', 'archer', 'voleur', 'clerc'].includes(jobId);
  }

  getClassIcon(jobId: string): string {
    // Mapping des icônes pour chaque classe (lettres simples en français)
    const icons: Record<string, string> = {
      'guerrier': 'G',
      'archer': 'A', 
      'mage': 'M',
      'voleur': 'V',
      'pretre': 'P',
      'clerc': 'C',
      'barde': 'B',
      'paladin': 'K',
      'sorcier': 'S',
      'druide': 'D',
      'moine': 'O'
    };
    return icons[jobId] || 'C';
  }

  getDifficultyLabel(jobId: string): string {
    const difficulty: Record<string, string> = {
      'guerrier': 'Facile',
      'archer': 'Moyenne',
      'mage': 'Difficile',
      'voleur': 'Moyenne',
      'pretre': 'Facile',
      'clerc': 'Facile'
    };
    return difficulty[jobId] || 'Moyenne';
  }

  getSpecialization(jobId: string): string {
    const specializations: Record<string, string> = {
      'guerrier': 'le combat au corps à corps et la défense',
      'archer': 'les attaques à distance et la précision',
      'mage': 'la magie offensive et les sorts élémentaires',
      'voleur': 'la furtivité et les attaques critiques',
      'pretre': 'les soins et le soutien aux alliés',
      'clerc': 'les soins et la protection divine'
    };
    return specializations[jobId] || 'le combat général';
  }

  getGameplayTips(jobId: string): string {
    const tips: Record<string, string> = {
      'guerrier': 'Positionnez-vous en première ligne pour protéger vos alliés et utilisez vos capacités défensives.',
      'archer': 'Restez à distance des ennemis et visez les cibles les plus faibles en premier.',
      'mage': 'Gérez votre mana avec soin et utilisez les éléments selon les faiblesses ennemies.',
      'voleur': 'Attaquez par surprise et concentrez-vous sur les ennemis isolés.',
      'pretre': 'Surveillez la santé de votre équipe et positionnez-vous à l\'abri.',
      'clerc': 'Équilibrez entre soins et sorts offensifs selon la situation.'
    };
    return tips[jobId] || 'Adaptez votre stratégie selon la situation de combat.';
  }

  private async loadAvailableJobs(): Promise<void> {
    try {
      this.creationService.setLoading(true);
      const jobsData = await this.apiService.getAvailableJobs().toPromise();
      if (jobsData?.jobs) {
        this.creationService.setAvailableJobs(jobsData.jobs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      this.creationService.setError('Impossible de charger les classes disponibles');
    } finally {
      this.creationService.setLoading(false);
    }
  }

  async retryLoadClasses(): Promise<void> {
    this.creationService.clearErrors();
    await this.loadAvailableJobs();
  }
}