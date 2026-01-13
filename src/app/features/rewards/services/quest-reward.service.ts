import { Injectable, signal, computed, inject } from '@angular/core';
import { PlayerStatsService } from '../../../core/services/player-stats.service';
import { 
  QuestReward, 
  CombatStatistics, 
  RewardResult,
  calculatePerformanceBonus 
} from '../models/reward.models';

@Injectable({
  providedIn: 'root'
})
export class QuestRewardService {
  private playerStatsService = inject(PlayerStatsService);

  // État des récompenses en attente
  private pendingReward = signal<QuestReward | null>(null);
  private pendingStatistics = signal<CombatStatistics | null>(null);
  private rewardResult = signal<RewardResult | null>(null);
  private isDisplaying = signal<boolean>(false);

  // Signaux en lecture seule
  readonly reward = this.pendingReward.asReadonly();
  readonly statistics = this.pendingStatistics.asReadonly();
  readonly result = this.rewardResult.asReadonly();
  readonly displaying = this.isDisplaying.asReadonly();

  // Computed signals
  readonly totalExperience = computed(() => {
    const reward = this.pendingReward();
    const stats = this.pendingStatistics();
    
    if (!reward || !stats) return 0;
    
    const baseXP = reward.experience;
    const bonus = calculatePerformanceBonus(stats);
    return baseXP + bonus;
  });

  readonly hasReward = computed(() => {
    return this.pendingReward() !== null;
  });

  /**
   * Préparer les récompenses pour affichage
   */
  prepareRewards(reward: QuestReward, statistics: CombatStatistics): void {
    this.pendingReward.set(reward);
    this.pendingStatistics.set(statistics);
    this.isDisplaying.set(true);
    
    console.log('Rewards prepared:', {
      experience: this.totalExperience(),
      gold: reward.gold,
      items: reward.items.length
    });
  }

  /**
   * Appliquer les récompenses au personnage
   */
  applyRewards(): RewardResult {
    const reward = this.pendingReward();
    const stats = this.pendingStatistics();
    
    if (!reward || !stats) {
      throw new Error('No rewards to apply');
    }

    const currentStats = this.playerStatsService.stats();
    const previousLevel = currentStats.level;
    
    // Calculer l'XP totale avec bonus
    const totalXP = this.totalExperience();
    
    // Ajouter l'XP (pourrait déclencher un level up dans le service)
    const xpToAdd = totalXP;
    this.addExperienceWithLevelUp(xpToAdd);
    
    // Ajouter l'or
    this.playerStatsService.modifyGold(reward.gold);
    
    // TODO: Ajouter les items à l'inventaire quand le système sera implémenté
    
    // Vérifier si level up
    const newStats = this.playerStatsService.stats();
    const leveledUp = newStats.level > previousLevel;
    
    // Créer le résultat
    const result: RewardResult = {
      reward,
      statistics: stats,
      leveledUp,
      newLevel: leveledUp ? newStats.level : undefined,
      previousLevel: leveledUp ? previousLevel : undefined,
      appliedAt: Date.now()
    };
    
    this.rewardResult.set(result);
    
    console.log('Rewards applied:', result);
    
    return result;
  }

  /**
   * Ajouter de l'XP avec gestion du level up
   */
  private addExperienceWithLevelUp(xp: number): void {
    const currentStats = this.playerStatsService.stats();
    
    // Pour l'instant, simple calcul
    // TODO: Intégrer avec un vrai système de progression
    const xpForNextLevel = 100 * currentStats.level;
    
    if (xp >= xpForNextLevel) {
      // Level up!
      this.playerStatsService.levelUp();
    }
  }

  /**
   * Calculer les récompenses basées sur le combat
   */
  calculateRewardsFromCombat(
    questId: string,
    enemiesDefeated: number,
    statistics: CombatStatistics
  ): QuestReward {
    // Base XP et gold selon le nombre d'ennemis
    const baseXP = enemiesDefeated * 50;
    const baseGold = enemiesDefeated * 30;
    
    // Bonus basé sur les performances
    const performanceBonus = calculatePerformanceBonus(statistics);
    
    return {
      id: `reward_${questId}_${Date.now()}`,
      questId,
      experience: baseXP + performanceBonus,
      gold: baseGold + Math.floor(performanceBonus * 0.5),
      items: this.generateRandomItems(enemiesDefeated)
    };
  }

  /**
   * Générer des items aléatoires
   */
  private generateRandomItems(enemyCount: number): any[] {
    const items = [];
    const itemPool = [
      { id: 'potion_health_minor', name: 'Potion de soin mineure', rarity: 'common', icon: 'potion_red' },
      { id: 'potion_mana_minor', name: 'Potion de mana mineure', rarity: 'common', icon: 'potion_blue' },
      { id: 'bread', name: 'Pain', rarity: 'common', icon: 'food_bread' }
    ];
    
    // 1 item par ennemi vaincu
    for (let i = 0; i < Math.min(enemyCount, 3); i++) {
      const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
      items.push({
        itemId: randomItem.id,
        name: randomItem.name,
        quantity: Math.floor(Math.random() * 2) + 1,
        rarity: randomItem.rarity,
        icon: randomItem.icon
      });
    }
    
    return items;
  }

  /**
   * Terminer l'affichage des récompenses
   */
  clearRewards(): void {
    this.pendingReward.set(null);
    this.pendingStatistics.set(null);
    this.rewardResult.set(null);
    this.isDisplaying.set(false);
  }

  /**
   * Sauvegarder les récompenses obtenues
   */
  saveRewardHistory(result: RewardResult): void {
    const history = this.loadRewardHistory();
    history.push(result);
    
    // Garder seulement les 50 dernières récompenses
    const recentHistory = history.slice(-50);
    
    localStorage.setItem('reward_history', JSON.stringify(recentHistory));
  }

  /**
   * Charger l'historique des récompenses
   */
  loadRewardHistory(): RewardResult[] {
    const saved = localStorage.getItem('reward_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load reward history:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Obtenir les statistiques totales
   */
  getTotalStatistics(): {
    totalGoldEarned: number;
    totalXPEarned: number;
    totalQuestsCompleted: number;
  } {
    const history = this.loadRewardHistory();
    
    return {
      totalGoldEarned: history.reduce((sum, r) => sum + r.reward.gold, 0),
      totalXPEarned: history.reduce((sum, r) => sum + r.reward.experience, 0),
      totalQuestsCompleted: history.length
    };
  }
}
