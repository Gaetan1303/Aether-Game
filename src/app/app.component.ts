import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { GameStateService } from '@core/services/game-state.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Aether Engine - MMO RPG Tactique';
  
  // Services injectés
  public gameStateService = inject(GameStateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // États réactifs
  gameState = this.gameStateService.getGameState();
  authState = this.authService.getAuthState();
  playerStats = this.gameStateService.getPlayerStats();

  // Navigation disponible seulement si pas en combat et authentifié
  canNavigate = computed(() => 
    this.authState().isAuthenticated && 
    this.gameStateService.canNavigate()
  );

  ngOnInit(): void {
    // TODO: Vérifier l'authentification au démarrage
    // TODO: Initialiser la connexion WebSocket si authentifié
    
    // Pour le développement, simuler une entrée en jeu
    if (!this.authState().isAuthenticated) {
      console.log('Simulation login pour développement...');
      // TODO: Remplacer par vraie page de login
    }
  }

  navigateToScreen(screen: 'combat' | 'character' | 'inventory' | 'world' | 'market'): void {
    if (this.canNavigate()) {
      this.gameStateService.setCurrentScreen(screen);
      this.router.navigate([`/${screen}`]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.gameStateService.exitGame();
    // TODO: Rediriger vers page de login
  }
}