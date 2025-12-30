import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GameState {
  isInGame: boolean;
  currentScreen: 'menu' | 'combat' | 'character' | 'inventory' | 'world' | 'market';
  playerId: string | null;
  currentCombatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface PlayerStats {
  level: number;
  experience: number;
  gold: number;
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private gameState = signal<GameState>({
    isInGame: false,
    currentScreen: 'menu',
    playerId: null,
    currentCombatId: null,
    isLoading: false,
    error: null
  });

  private playerStats = signal<PlayerStats | null>(null);

  // Computed values
  readonly isInCombat = computed(() => this.gameState().currentCombatId !== null);
  readonly canNavigate = computed(() => !this.gameState().isLoading && !this.isInCombat());

  getGameState() {
    return this.gameState.asReadonly();
  }

  getPlayerStats() {
    return this.playerStats.asReadonly();
  }

  enterGame(playerId: string): void {
    this.gameState.update(state => ({
      ...state,
      isInGame: true,
      playerId,
      currentScreen: 'combat' // Start in combat by default
    }));
  }

  exitGame(): void {
    this.gameState.update(state => ({
      ...state,
      isInGame: false,
      playerId: null,
      currentCombatId: null,
      currentScreen: 'menu'
    }));
  }

  setCurrentScreen(screen: GameState['currentScreen']): void {
    if (this.canNavigate()) {
      this.gameState.update(state => ({
        ...state,
        currentScreen: screen
      }));
    }
  }

  enterCombat(combatId: string): void {
    this.gameState.update(state => ({
      ...state,
      currentCombatId: combatId,
      currentScreen: 'combat'
    }));
  }

  exitCombat(): void {
    this.gameState.update(state => ({
      ...state,
      currentCombatId: null
    }));
  }

  setLoading(isLoading: boolean): void {
    this.gameState.update(state => ({
      ...state,
      isLoading
    }));
  }

  setError(error: string | null): void {
    this.gameState.update(state => ({
      ...state,
      error
    }));
  }

  updatePlayerStats(stats: Partial<PlayerStats>): void {
    this.playerStats.update(current => 
      current ? { ...current, ...stats } : stats as PlayerStats
    );
  }

  // TODO: Ajouter gestion d'inventaire global
  // TODO: Ajouter système de notifications/alertes
  // TODO: Ajouter sauvegarde automatique de l'état
  // TODO: Ajouter métriques de performance (FPS, ping, etc.)
}