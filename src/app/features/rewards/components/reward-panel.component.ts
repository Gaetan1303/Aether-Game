import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestRewardService } from '../services/quest-reward.service';
import { 
  getPerformanceGrade, 
  formatTimeElapsed,
  getRarityColor,
  ItemReward 
} from '../models/reward.models';

@Component({
  selector: 'app-reward-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reward-panel.component.html',
  styleUrls: ['./reward-panel.component.scss']
})
export class RewardPanelComponent implements OnInit {
  private rewardService = inject(QuestRewardService);
  private router = inject(Router);

  // Signaux locaux pour les animations
  showRewards = signal<boolean>(false);
  showStatistics = signal<boolean>(false);
  showLevelUp = signal<boolean>(false);
  animationComplete = signal<boolean>(false);

  // Accès aux signaux du service
  readonly reward = this.rewardService.reward;
  readonly statistics = this.rewardService.statistics;
  readonly result = this.rewardService.result;
  readonly totalXP = this.rewardService.totalExperience;

  ngOnInit(): void {
    console.log('RewardPanelComponent initialized');
    
    // Vérifier si des récompenses sont disponibles
    if (!this.rewardService.hasReward()) {
      console.warn('No rewards available, redirecting to menu');
      this.router.navigate(['/']);
      return;
    }

    // Appliquer les récompenses
    const result = this.rewardService.applyRewards();
    
    // Sauvegarder dans l'historique
    this.rewardService.saveRewardHistory(result);
    
    // Séquence d'animation
    this.startAnimationSequence();
  }

  /**
   * Gérer l'erreur de chargement d'image
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/items/default.png';
  }

  /**
   * Démarrer la séquence d'animation
   */
  private startAnimationSequence(): void {
    // 1. Afficher les récompenses après 500ms
    setTimeout(() => {
      this.showRewards.set(true);
    }, 500);

    // 2. Afficher les statistiques après 1500ms
    setTimeout(() => {
      this.showStatistics.set(true);
    }, 1500);

    // 3. Afficher le level up si applicable après 2500ms
    setTimeout(() => {
      const result = this.result();
      if (result?.leveledUp) {
        this.showLevelUp.set(true);
      }
    }, 2500);

    // 4. Animation complète après 3000ms
    setTimeout(() => {
      this.animationComplete.set(true);
    }, 3000);
  }

  /**
   * Obtenir le grade de performance
   */
  getGrade() {
    const stats = this.statistics();
    return stats ? getPerformanceGrade(stats) : null;
  }

  /**
   * Formater le temps
   */
  formatTime(seconds: number): string {
    return formatTimeElapsed(seconds);
  }

  /**
   * Obtenir la couleur de rareté
   */
  getItemRarityColor(item: ItemReward): string {
    return getRarityColor(item.rarity);
  }

  /**
   * Continuer vers le menu
   */
  continue(): void {
    this.rewardService.clearRewards();
    this.router.navigate(['/']);
  }

  /**
   * Rejouer (nouvelle quête)
   */
  playAgain(): void {
    this.rewardService.clearRewards();
    this.router.navigate(['/story']);
  }
}
