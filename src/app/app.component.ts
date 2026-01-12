import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { GameStateService } from '@core/services/game-state.service';
import { AuthService } from '@core/services/auth.service';
import { PlayerStatsService } from '@core/services/player-stats.service';
import { AetherApiService } from './shared/services/aether-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Aether Engine - MMO RPG Tactique';
  
  // Services injectés
  public gameStateService = inject(GameStateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private aetherApi = inject(AetherApiService);
  private playerStatsService = inject(PlayerStatsService);
  
  // Signaux Angular pour la réactivité
  gameState = this.gameStateService.getGameState();
  authState = this.authService.getAuthState();
  playerStats = this.gameStateService.getPlayerStats();
  
  // Signal pour le statut de connexion API
  isApiConnected = signal<boolean>(false);
  
  // Signal pour l'animation du titre
  titleAnimation = signal<boolean>(false);
  
  // Accès aux stats du joueur via le service
  readonly stats = this.playerStatsService.stats;
  readonly hpPercentage = this.playerStatsService.hpPercentage;
  readonly mpPercentage = this.playerStatsService.mpPercentage;
  
  // Computed pour extraire les valeurs individuelles (compatibilité template)
  currentGold = computed(() => this.stats().gold);
  playerLevel = computed(() => this.stats().level);
  playerName = computed(() => this.stats().name);
  playerHP = computed(() => this.stats().hp);
  playerMP = computed(() => this.stats().mp);

  // Navigation disponible seulement si pas en combat et authentifié
  canNavigate = computed(() => 
    this.authState().isAuthenticated && 
    this.gameStateService.canNavigate()
  );
  
  // Signal pour suivre l'URL courante
  currentUrl = signal<string>('');
  
  // Vérifier si on est sur la page d'accueil pour afficher le menu principal
  isHomePage = computed(() => this.currentUrl() === '/' || this.currentUrl() === '');

  constructor() {
    // Initialiser l'URL courante
    this.currentUrl.set(this.router.url);
    
    // Écouter les changements de route
    this.router.events.subscribe(() => {
      this.currentUrl.set(this.router.url);
    });
    
    // Écouter l'état de connexion API
    this.aetherApi.isConnected$.subscribe(connected => {
      this.isApiConnected.set(connected);
    });
    
    // Effect pour animer le titre au démarrage
    effect(() => {
      if (this.gameState().isInGame) {
        setTimeout(() => this.titleAnimation.set(true), 500);
      }
    });
  }

  ngOnInit(): void {
    // Animation du titre au démarrage
    setTimeout(() => this.titleAnimation.set(true), 1000);
    
    // Log avec style FF Tactics
    console.log('=== AETHER ENGINE INITIALIZED ===');
    console.log('Player Level:', this.playerLevel());
    console.log('Current Gold:', this.currentGold());
  }
  
  // Méthodes déléguées au service
  takeDamage(amount: number): void {
    this.playerStatsService.takeDamage(amount);
  }
  
  useMana(amount: number): void {
    this.playerStatsService.useMana(amount);
  }
}