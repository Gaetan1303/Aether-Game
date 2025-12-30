import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/combat', pathMatch: 'full' },
  { 
    path: 'combat', 
    loadComponent: () => import('./features/combat/components/combat-view.component')
      .then(m => m.CombatViewComponent)
  },
  { 
    path: 'character', 
    loadComponent: () => import('./features/character/components/character-sheet.component')
      .then(m => m.CharacterSheetComponent)
  },
  { 
    path: 'inventory', 
    loadComponent: () => import('./features/inventory/components/inventory-grid.component')
      .then(m => m.InventoryGridComponent)
  },
  { 
    path: 'world', 
    loadComponent: () => import('./features/world/components/world-map.component')
      .then(m => m.WorldMapComponent)
  },
  { 
    path: 'market', 
    loadComponent: () => import('./features/economy/components/market.component')
      .then(m => m.MarketComponent)
  },
  { path: '**', redirectTo: '/combat' }
];