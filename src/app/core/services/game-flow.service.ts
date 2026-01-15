import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerStatsService } from './player-stats.service';
import { StoryService } from '../../features/story/services/story.service';
import { QuestRewardService } from '../../features/rewards/services/quest-reward.service';
import { 
  createFirstQuestStory, 
  createVictoryStory 
} from '../../features/story/models/story.models';
import { 
  createFirstQuestReward,
  calculateCombatStatistics,
  CombatStatistics 
} from '../../features/rewards/models/reward.models';

export type GamePhase = 
  | 'menu' 
  | 'character-creation' 
  | 'story-intro' 
  | 'combat' 
  | 'story-victory'
  | 'rewards';

export interface GameSession {
  id: string;
  characterName: string;
  characterClass: string;
  currentPhase: GamePhase;
  questId: string;
  startTime: number;
  combatStartTime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameFlowService {
  private router = inject(Router);
  private playerStatsService = inject(PlayerStatsService);
  private storyService = inject(StoryService);
  private rewardService = inject(QuestRewardService);

  // État de la session de jeu
  private currentSession = signal<GameSession | null>(null);
  private currentPhase = signal<GamePhase>('menu');
  
  // Données temporaires du combat
  private combatData = signal<{
    enemiesDefeated: number;
    damageDealt: number;
    damageTaken: number;
    turnsPlayed: number;
  } | null>(null);

  // Signaux en lecture seule
  readonly session = this.currentSession.asReadonly();
  readonly phase = this.currentPhase.asReadonly();

  // Computed signals
  readonly isInSession = computed(() => this.currentSession() !== null);
  readonly canContinue = computed(() => {
    const session = this.currentSession();
    return session ? session.currentPhase !== 'menu' : false;
  });

  /**
   * Démarrer une nouvelle session de jeu après création du personnage
   */
  startNewSession(characterName: string, characterClass: string): void {
    const session: GameSession = {
      id: `session_${Date.now()}`,
      characterName,
      characterClass,
      currentPhase: 'story-intro',
      questId: 'quest_001',
      startTime: Date.now()
    };

    this.currentSession.set(session);
    this.currentPhase.set('story-intro');
    
    console.log('New game session started:', session);
    
    // Sauvegarder la session
    this.saveSession();
    
    // Démarrer l'histoire d'introduction
    this.startIntroStory(characterName, characterClass);
  }

  /**
   * Démarrer l'histoire d'introduction
   */
  private startIntroStory(characterName: string, characterClass: string): void {
    const story = createFirstQuestStory(characterName, characterClass);
    
    // Définir le callback de fin d'histoire
    story.onComplete = () => {
      this.onIntroStoryComplete();
    };
    
    this.storyService.startStory(story);
    
    // Naviguer vers la page de story
    this.router.navigate(['/story']);
  }

  /**
   * Callback quand l'histoire d'intro est terminée
   */
  private onIntroStoryComplete(): void {
    console.log('📖 Intro story completed, starting combat');
    this.updatePhase('combat');
    
    // Petite pause avant de démarrer le combat
    setTimeout(() => {
      this.startCombat();
    }, 1000);
  }

  /**
   * Démarrer le combat
   */
  private startCombat(): void {
    const session = this.currentSession();
    if (!session) return;

    // Enregistrer l'heure de début du combat
    this.currentSession.update(s => s ? { ...s, combatStartTime: Date.now() } : null);
    
    // Naviguer vers le combat
    this.router.navigate(['/combat']);
    
    console.log('⚔️ Combat started');
  }

  /**
   * Terminer le combat avec victoire
   */
  completeCombat(
    enemiesDefeated: number,
    damageDealt: number,
    damageTaken: number,
    turnsPlayed: number
  ): void {
    const session = this.currentSession();
    if (!session) {
      console.error('No active session');
      return;
    }

    // Sauvegarder les données du combat
    this.combatData.set({
      enemiesDefeated,
      damageDealt,
      damageTaken,
      turnsPlayed
    });

    console.log('Combat completed:', {
      enemiesDefeated,
      damageDealt,
      damageTaken,
      turnsPlayed
    });

    // Option 1: Story de victoire puis récompenses
    this.updatePhase('story-victory');
    this.startVictoryStory();
    
    // Option 2: Directement aux récompenses (décommenter pour skip la story)
    // this.showRewards();
  }

  /**
   * Démarrer l'histoire de victoire
   */
  private startVictoryStory(): void {
    const session = this.currentSession();
    if (!session) return;

    const story = createVictoryStory(
      session.characterName,
      100, // Gold (sera remplacé par les vraies valeurs)
      150  // XP
    );

    // Callback de fin
    story.onComplete = () => {
      this.onVictoryStoryComplete();
    };

    this.storyService.startStory(story);
    this.router.navigate(['/story']);
  }

  /**
   * Callback quand l'histoire de victoire est terminée
   */
  private onVictoryStoryComplete(): void {
    console.log('📖 Victory story completed, showing rewards');
    this.showRewards();
  }

  /**
   * Afficher les récompenses
   */
  private showRewards(): void {
    const session = this.currentSession();
    const combat = this.combatData();
    
    if (!session || !combat) {
      console.error('Missing session or combat data');
      return;
    }

    this.updatePhase('rewards');

    // Calculer les statistiques
    const statistics = calculateCombatStatistics(
      combat.enemiesDefeated,
      combat.damageDealt,
      combat.damageTaken,
      combat.turnsPlayed,
      session.combatStartTime || session.startTime
    );

    // Obtenir les récompenses
    const reward = createFirstQuestReward();

    // Préparer les récompenses pour affichage
    this.rewardService.prepareRewards(reward, statistics);

    // Naviguer vers l'écran de récompenses
    this.router.navigate(['/rewards']);

    console.log('🎁 Rewards displayed');
  }

  /**
   * Terminer la session
   */
  endSession(): void {
    console.log('🏁 Session ended');
    
    this.currentSession.set(null);
    this.currentPhase.set('menu');
    this.combatData.set(null);
    
    // Nettoyer les services
    this.storyService.reset();
    this.rewardService.clearRewards();
    
    // Supprimer la sauvegarde
    localStorage.removeItem('current_game_session');
    
    // Retour au menu
    this.router.navigate(['/']);
  }

  /**
   * Mettre à jour la phase actuelle
   */
  private updatePhase(phase: GamePhase): void {
    this.currentPhase.set(phase);
    
    const session = this.currentSession();
    if (session) {
      this.currentSession.set({
        ...session,
        currentPhase: phase
      });
      this.saveSession();
    }
  }

  /**
   * Sauvegarder la session
   */
  private saveSession(): void {
    const session = this.currentSession();
    if (session) {
      localStorage.setItem('current_game_session', JSON.stringify(session));
    }
  }

  /**
   * Charger une session sauvegardée
   */
  loadSession(): GameSession | null {
    const saved = localStorage.getItem('current_game_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        this.currentSession.set(session);
        this.currentPhase.set(session.currentPhase);
        return session;
      } catch (error) {
        console.error('Failed to load session:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Reprendre une session
   */
  resumeSession(session: GameSession): void {
    this.currentSession.set(session);
    this.currentPhase.set(session.currentPhase);
    
    console.log('▶️ Resuming session:', session);
    
    // Naviguer vers la phase appropriée
    switch (session.currentPhase) {
      case 'story-intro':
      case 'story-victory':
        this.router.navigate(['/story']);
        break;
      case 'combat':
        this.router.navigate(['/combat']);
        break;
      case 'rewards':
        this.router.navigate(['/rewards']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  /**
   * Abandonner la session en cours
   */
  abandonSession(): void {
    if (confirm('Voulez-vous vraiment abandonner la partie en cours ?')) {
      this.endSession();
    }
  }

  /**
   * Obtenir le temps de jeu total
   */
  getPlayTime(): number {
    const session = this.currentSession();
    if (session) {
      return Date.now() - session.startTime;
    }
    return 0;
  }

  /**
   * Formater le temps de jeu
   */
  getFormattedPlayTime(): string {
    const ms = this.getPlayTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
