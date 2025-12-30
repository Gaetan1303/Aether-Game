import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: 'nouvelle-partie',
      loadComponent: () => import('./features/character/components/character-creation.component')
        .then(m => m.CharacterCreationComponent)
    },
  { path: '', pathMatch: 'full', loadComponent: () => import('./app.component').then(m => m.AppComponent) },
  // Les autres routes du jeu restent à traduire selon les besoins du projet
  // Exemple :
  // {
  //   path: 'charger',
  //   loadComponent: () => import('./features/save/components/load-game.component').then(m => m.LoadGameComponent)
  // },
  // {
  //   path: 'options',
  //   loadComponent: () => import('./features/options/components/options.component').then(m => m.OptionsComponent)
  // },
  // {
  //   path: 'credits',
  //   loadComponent: () => import('./features/credits/components/credits.component').then(m => m.CreditsComponent)
  // },
  // {
  //   path: 'quitter',
  //   loadComponent: () => import('./features/exit/components/exit.component').then(m => m.ExitComponent)
  // },
  { path: '**', redirectTo: '' }
];