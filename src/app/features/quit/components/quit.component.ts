import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quit-container">
      <div class="quit-modal">
        <div class="quit-header">
          <h1>Quitter le Jeu</h1>
        </div>
        
        <div class="quit-content">
          <div class="quit-message">
            <p>Êtes-vous sûr de vouloir quitter le jeu ?</p>
            <p class="warning-text">Toutes les modifications non sauvegardées seront perdues.</p>
          </div>
          
          <div class="quit-actions">
            <button 
              class="btn-cancel" 
              (click)="cancel()"
              type="button">
              Annuler
            </button>
            
            <button 
              class="btn-quit" 
              (click)="confirmQuit()"
              type="button">
              Quitter
            </button>
          </div>
        </div>
        
        <div class="quit-footer">
          <p>Merci d'avoir joué à Aether Game !</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./quit.component.scss']
})
export class QuitComponent {
  constructor(private router: Router) {}

  cancel(): void {
    // Retourner au menu principal
    this.router.navigate(['/']);
  }

  confirmQuit(): void {
    // Sauvegarder les données si nécessaire
    this.saveGameData();
    
    // Afficher un message de remerciement
    this.showFarewell();
    
    // Fermer l'application (fonctionne seulement dans un environnement natif)
    setTimeout(() => {
      this.closeApplication();
    }, 2000);
  }

  private saveGameData(): void {
    try {
      // Récupérer les données importantes du jeu
      const gameState = {
        lastSaved: new Date().toISOString(),
        quitReason: 'normal_exit'
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('aether_game_last_session', JSON.stringify(gameState));
      
      // Nettoyer les données temporaires si nécessaire
      sessionStorage.clear();
      
    } catch (error) {
      console.warn('Impossible de sauvegarder les données:', error);
    }
  }

  private showFarewell(): void {
    // Afficher une notification de remerciement
    const farewell = document.createElement('div');
    farewell.className = 'farewell-message';
    farewell.innerHTML = `
      <div class="farewell-content">
        <h3>Au revoir !</h3>
        <p>Merci d'avoir joué à Aether Game.</p>
        <p>À bientôt pour de nouvelles aventures !</p>
      </div>
    `;
    
    document.body.appendChild(farewell);
    
    // Retirer le message après 2 secondes
    setTimeout(() => {
      document.body.removeChild(farewell);
    }, 1800);
  }

  private closeApplication(): void {
    try {
      // Tentative de fermeture pour les applications Electron
      if ((window as any).electronAPI?.quit) {
        (window as any).electronAPI.quit();
        return;
      }
      
      // Tentative pour les PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      
      // Fermer l'onglet du navigateur (peut être bloqué par certains navigateurs)
      window.close();
      
      // Si rien ne fonctionne, rediriger vers une page de fermeture
      window.location.href = 'about:blank';
      
    } catch (error) {
      console.log('Impossible de fermer l\'application automatiquement');
      
      // Afficher instructions manuelles à l'utilisateur
      alert('Veuillez fermer manuellement l\'onglet ou l\'application.');
    }
  }
}