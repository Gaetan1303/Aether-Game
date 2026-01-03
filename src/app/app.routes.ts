import { Routes } from '@angular/router';

export const routes: Routes = [
  // Nouvelle partie - Création de personnage
  {
    path: 'nouvelle-partie',
    loadComponent: () => import('./features/new-game/new-game.component')
      .then(m => m.NewGameComponent)
  },
  
  // Continuer - Charger un personnage existant
  {
    path: 'continuer',
    loadComponent: () => import('./features/continue-game/components/continue-game.component')
      .then(m => m.ContinueGameComponent)
  },
  
  // Options - Paramètres du jeu
  {
    path: 'options',
    loadComponent: () => import('./features/options/components/options.component')
      .then(m => m.OptionsComponent)
  },
  
  // Quitter - Confirmation de sortie
  {
    path: 'quitter',
    loadComponent: () => import('./features/quit/components/quit.component')
      .then(m => m.QuitComponent)
  },
  
  // Redirection par défaut
  { path: '**', redirectTo: '' }
];