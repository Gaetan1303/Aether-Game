import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { GameStateService } from '@core/services/game-state.service';
import { AuthService } from '@core/services/auth.service';
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
  
  // Signaux Angular pour la réactivité
  gameState = this.gameStateService.getGameState();
  authState = this.authService.getAuthState();
  playerStats = this.gameStateService.getPlayerStats();
  
  // Signal pour le statut de connexion API
  isApiConnected = signal<boolean>(false);
  
  // Signal pour l'animation du titre
  titleAnimation = signal<boolean>(false);
  
  // Signal pour le gold du joueur (simulation)
  currentGold = signal<number>(500);
  
  // Signal pour le niveau du joueur (simulation)
  playerLevel = signal<number>(1);
  
  // Signal pour les stats du joueur
  playerHP = signal<{ current: number, max: number }>({ current: 85, max: 120 });
  playerMP = signal<{ current: number, max: number }>({ current: 45, max: 60 });

  // Navigation disponible seulement si pas en combat et authentifié
  canNavigate = computed(() => 
    this.authState().isAuthenticated && 
    this.gameStateService.canNavigate()
  );
  
  // Signal pour suivre l'URL courante
  currentUrl = signal<string>('');
  
  // Vérifier si on est sur la page d'accueil pour afficher le menu principal
  isHomePage = computed(() => this.currentUrl() === '/' || this.currentUrl() === '');
  
  // Computed pour le pourcentage de HP
  hpPercentage = computed(() => 
    (this.playerHP().current / this.playerHP().max) * 100
  );
  
  // Computed pour le pourcentage de MP
  mpPercentage = computed(() => 
    (this.playerMP().current / this.playerMP().max) * 100
  );
  
  // Computed pour le nom du joueur (simulation)
  playerName = computed(() => 'Aragorn');

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
    
    // Effect pour simuler la régénération de MP
    effect(() => {
      const interval = setInterval(() => {
        this.playerMP.update(mp => ({
          ...mp,
          current: Math.min(mp.max, mp.current + 1)
        }));
      }, 5000);
      
      return () => clearInterval(interval);
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
  
  // Méthode pour simuler la perte de HP (pour tester la barre)
  takeDamage(amount: number): void {
    this.playerHP.update(hp => ({
      ...hp,
      current: Math.max(0, hp.current - amount)
    }));
  }
  
  // Méthode pour simuler l'utilisation de MP
  useMana(amount: number): void {
    this.playerMP.update(mp => ({
      ...mp,
      current: Math.max(0, mp.current - amount)
    }));
  }
}