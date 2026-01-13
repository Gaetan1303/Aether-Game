/**
 * Modèles de données pour le système de récompenses
 */

export interface QuestReward {
  id: string;
  questId: string;
  experience: number;
  gold: number;
  items: ItemReward[];
  skillPoints?: number;
  reputation?: ReputationReward[];
  unlocks?: UnlockReward[];
}

export interface ItemReward {
  itemId: string;
  name: string;
  quantity: number;
  rarity: ItemRarity;
  icon?: string;
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface ReputationReward {
  faction: string;
  amount: number;
}

export interface UnlockReward {
  type: 'job' | 'skill' | 'area' | 'feature';
  id: string;
  name: string;
}

export interface CombatStatistics {
  enemiesDefeated: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  turnsPlayed: number;
  accuracy: number; // pourcentage
  criticalHits: number;
  perfectTurns: number;
  timeElapsed: number; // en secondes
}

export interface RewardResult {
  reward: QuestReward;
  statistics: CombatStatistics;
  leveledUp: boolean;
  newLevel?: number;
  previousLevel?: number;
  appliedAt: number;
}

/**
 * Créer une récompense pour la première quête
 */
export function createFirstQuestReward(): QuestReward {
  return {
    id: 'reward_quest_001',
    questId: 'quest_001',
    experience: 150,
    gold: 100,
    items: [
      {
        itemId: 'potion_health_minor',
        name: 'Potion de soin mineure',
        quantity: 2,
        rarity: ItemRarity.COMMON,
        icon: 'potion_red'
      },
      {
        itemId: 'bread',
        name: 'Pain',
        quantity: 3,
        rarity: ItemRarity.COMMON,
        icon: 'food_bread'
      }
    ],
    reputation: [
      {
        faction: 'Royaume d\'Aether',
        amount: 10
      }
    ]
  };
}

/**
 * Calculer les statistiques d'un combat
 */
export function calculateCombatStatistics(
  enemiesDefeated: number,
  damageDealt: number,
  damageTaken: number,
  turnsPlayed: number,
  startTime: number
): CombatStatistics {
  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
  
  return {
    enemiesDefeated,
    damageDealt,
    damageTaken,
    healingDone: 0,
    turnsPlayed,
    accuracy: Math.min(100, Math.floor((damageDealt / (damageDealt + 20)) * 100)),
    criticalHits: Math.floor(Math.random() * 3), // À remplacer par vraies données
    perfectTurns: Math.floor(turnsPlayed * 0.3),
    timeElapsed
  };
}

/**
 * Calculer le bonus d'XP basé sur les performances
 */
export function calculatePerformanceBonus(stats: CombatStatistics): number {
  let bonus = 0;
  
  // Bonus pour victoire rapide
  if (stats.turnsPlayed <= 5) {
    bonus += 20;
  } else if (stats.turnsPlayed <= 10) {
    bonus += 10;
  }
  
  // Bonus pour peu de dégâts reçus
  if (stats.damageTaken < 50) {
    bonus += 15;
  }
  
  // Bonus pour précision
  if (stats.accuracy >= 90) {
    bonus += 10;
  }
  
  // Bonus pour coups critiques
  bonus += stats.criticalHits * 5;
  
  return bonus;
}

/**
 * Obtenir le texte de grade basé sur les performances
 */
export function getPerformanceGrade(stats: CombatStatistics): {
  grade: string;
  label: string;
  color: string;
} {
  const score = 
    (stats.accuracy / 100) * 40 +
    (Math.max(0, 100 - stats.turnsPlayed) / 100) * 30 +
    (Math.max(0, 500 - stats.damageTaken) / 500) * 30;
  
  if (score >= 90) {
    return { grade: 'S', label: 'Parfait', color: '#FFD700' };
  } else if (score >= 80) {
    return { grade: 'A', label: 'Excellent', color: '#4BC769' };
  } else if (score >= 70) {
    return { grade: 'B', label: 'Bien', color: '#3498DB' };
  } else if (score >= 60) {
    return { grade: 'C', label: 'Correct', color: '#95A5A6' };
  } else {
    return { grade: 'D', label: 'Passable', color: '#E74C3C' };
  }
}

/**
 * Formater le temps écoulé
 */
export function formatTimeElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Obtenir la couleur selon la rareté
 */
export function getRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: '#FFFFFF',
    [ItemRarity.UNCOMMON]: '#4BC769',
    [ItemRarity.RARE]: '#3498DB',
    [ItemRarity.EPIC]: '#9B59B6',
    [ItemRarity.LEGENDARY]: '#F39C12'
  };
  
  return colors[rarity] || colors[ItemRarity.COMMON];
}
