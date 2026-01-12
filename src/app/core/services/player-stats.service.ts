import { Injectable, signal, computed, effect } from '@angular/core';

export interface PlayerStats {
  name: string;
  level: number;
  gold: number;
  hp: { current: number; max: number };
  mp: { current: number; max: number };
}

@Injectable({
  providedIn: 'root'
})
export class PlayerStatsService {
  // État privé des stats du joueur
  private playerStats = signal<PlayerStats>({
    name: 'Aragorn',
    level: 1,
    gold: 500,
    hp: { current: 85, max: 120 },
    mp: { current: 45, max: 60 }
  });

  // Accesseurs publics en lecture seule
  readonly stats = this.playerStats.asReadonly();
  
  // Computed signals pour les pourcentages
  readonly hpPercentage = computed(() => 
    (this.playerStats().hp.current / this.playerStats().hp.max) * 100
  );
  
  readonly mpPercentage = computed(() => 
    (this.playerStats().mp.current / this.playerStats().mp.max) * 100
  );

  constructor() {
    // Régénération automatique de MP toutes les 5 secondes
    this.startManaRegeneration();
  }

  /**
   * Inflige des dégâts au joueur
   */
  takeDamage(amount: number): void {
    this.playerStats.update(stats => ({
      ...stats,
      hp: {
        ...stats.hp,
        current: Math.max(0, stats.hp.current - amount)
      }
    }));
  }

  /**
   * Soigne le joueur
   */
  heal(amount: number): void {
    this.playerStats.update(stats => ({
      ...stats,
      hp: {
        ...stats.hp,
        current: Math.min(stats.hp.max, stats.hp.current + amount)
      }
    }));
  }

  /**
   * Consomme du mana
   */
  useMana(amount: number): boolean {
    const currentMana = this.playerStats().mp.current;
    if (currentMana < amount) {
      return false; // Pas assez de mana
    }

    this.playerStats.update(stats => ({
      ...stats,
      mp: {
        ...stats.mp,
        current: stats.mp.current - amount
      }
    }));
    
    return true;
  }

  /**
   * Régénère du mana
   */
  regenerateMana(amount: number): void {
    this.playerStats.update(stats => ({
      ...stats,
      mp: {
        ...stats.mp,
        current: Math.min(stats.mp.max, stats.mp.current + amount)
      }
    }));
  }

  /**
   * Ajoute ou retire de l'or
   */
  modifyGold(amount: number): void {
    this.playerStats.update(stats => ({
      ...stats,
      gold: Math.max(0, stats.gold + amount)
    }));
  }

  /**
   * Monte le joueur de niveau
   */
  levelUp(): void {
    this.playerStats.update(stats => {
      const newLevel = stats.level + 1;
      const hpIncrease = 20;
      const mpIncrease = 10;

      return {
        ...stats,
        level: newLevel,
        hp: {
          current: stats.hp.max + hpIncrease, // Full HP on level up
          max: stats.hp.max + hpIncrease
        },
        mp: {
          current: stats.mp.max + mpIncrease, // Full MP on level up
          max: stats.mp.max + mpIncrease
        }
      };
    });
  }

  /**
   * Réinitialise les stats du joueur
   */
  reset(): void {
    this.playerStats.set({
      name: 'Aragorn',
      level: 1,
      gold: 500,
      hp: { current: 120, max: 120 },
      mp: { current: 60, max: 60 }
    });
  }

  /**
   * Charge les stats depuis le stockage ou une API
   */
  loadStats(stats: PlayerStats): void {
    this.playerStats.set(stats);
  }

  /**
   * Démarre la régénération automatique de mana
   */
  private startManaRegeneration(): void {
    setInterval(() => {
      this.regenerateMana(1);
    }, 5000); // Régénère 1 MP toutes les 5 secondes
  }
}
