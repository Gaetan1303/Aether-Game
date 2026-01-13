import { Routes } from '@angular/router';

export const routes: Routes = [
  // Nouvelle partie - Création de personnage
  {
    path: 'nouvelle-partie',
    loadComponent: () => import('./features/new-game/new-game.component')
      .then(m => m.NewGameComponent)
  },
  
  // Narration / Story
  {
    path: 'story',
    loadComponent: () => import('./features/story/components/story-dialog.component')
      .then(m => m.StoryDialogComponent)
  },
  
  // Combat
  {
    path: 'combat',
    loadComponent: () => import('./features/combat/components/combat-view.component')
      .then(m => m.CombatViewComponent)
  },
  
  // Récompenses
  {
    path: 'rewards',
    loadComponent: () => import('./features/rewards/components/reward-panel.component')
      .then(m => m.RewardPanelComponent)
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