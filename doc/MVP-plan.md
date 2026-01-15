# Plan MVP - Démo Jouable Aether Engine

**Date de création** : 13 janvier 2026  
**Objectif** : Créer une démo jouable complète avec personnage, narration, combat et récompenses

---

## Fonctionnalités MVP

### Existant (À valider)
1. **Création de personnage** 
   - Interface complète avec 5 étapes
   - Service `CharacterCreationService`
   - Composants steps (name, gender, appearance, class, summary)
   - Connexion API pour créer le personnage

2. **Système de combat** (Partiellement)
   - Moteur PixiJS isométrique
   - Modèles de données (BattleState, Unit, CombatEvent)
   - Services (PixiEngine, IsoRenderer, SpriteManager, Camera, AnimationQueue)
   - Composant `CombatViewComponent`
   - Interface utilisateur de combat

3. **Services de base** 
   - `PlayerStatsService` (gestion stats joueur)
   - `GameStateService` (état du jeu)
   - `AuthService` (authentification)
   - `WebSocketService` (communication temps réel)
   - `AetherApiService` (API REST)

### À créer

1. **Système de narration** 🆕
   - Service `StoryService`
   - Composant `StoryDialogComponent`
   - Modèle `Story` / `DialogNode`
   - Interface de dialogue style FFT

2. **Système de récompenses** 🆕
   - Service `QuestRewardService`
   - Composant `RewardPanelComponent`
   - Écran de fin de combat avec récompenses
   - Distribution XP, Gold, Items

3. **Flux de jeu principal** 🆕
   - Service `GameFlowService`
   - Orchestration : Création → Narration → Combat → Récompenses
   - Gestion des transitions entre écrans
   - Sauvegarde de progression

4. **Tests** 🆕
   - Tests unitaires pour tous les services
   - Tests d'intégration pour le flux complet
   - Tests E2E pour la démo jouable

---

## Architecture du flux MVP

```
┌─────────────────────────────────────────────────────────────┐
│                     MENU PRINCIPAL                          │
│                  (app.component)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Nouvelle Partie
┌─────────────────────────────────────────────────────────────┐
│              CRÉATION DE PERSONNAGE                         │
│         (character-creation.component)                      │
│  • 5 étapes : Nom, Genre, Apparence, Classe, Résumé         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Créer & Jouer
┌─────────────────────────────────────────────────────────────┐
│                  INTRODUCTION NARRATIVE                     │
│              (story-dialog.component)                       │
│  • Contexte de la quête                                     │
│  • Présentation de l'objectif                               │
│  • Dialogues style FFT                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Commencer le combat
┌─────────────────────────────────────────────────────────────┐
│                   COMBAT TACTIQUE                           │
│               (combat-view.component)                       │
│  • Grille isométrique 20x20                                 │
│  • Unités joueur vs ennemis                                 │
│  • Tour par tour                                            │
│  • Actions : Déplacer, Attaquer, Compétence                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Victoire
┌─────────────────────────────────────────────────────────────┐
│                 RÉCOMPENSES DE QUÊTE                        │
│              (reward-panel.component)                       │
│  • XP gagnée → Niveau up?                                   │
│  • Gold obtenu                                              │
│  • Items trouvés                                            │
│  • Statistiques du combat                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Continuer
┌─────────────────────────────────────────────────────────────┐
│                  MENU PRINCIPAL                             │
│              (Retour ou Nouvelle quête)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Structure des fichiers à créer

```
src/app/
├── core/
│   └── services/
│       ├── game-flow.service.ts         Orchestration du flux
│       └── game-flow.service.spec.ts    
│
├── features/
│   ├── story/
│   │   ├── components/
│   │   │   ├── story-dialog.component.ts       
│   │   │   ├── story-dialog.component.html     
│   │   │   ├── story-dialog.component.scss     
│   │   │   └── story-dialog.component.spec.ts  
│   │   ├── models/
│   │   │   └── story.models.ts                 
│   │   └── services/
│   │       ├── story.service.ts                
│   │       └── story.service.spec.ts           
│   │
│   └── rewards/
│       ├── components/
│       │   ├── reward-panel.component.ts       🆕
│       │   ├── reward-panel.component.html     🆕
│       │   ├── reward-panel.component.scss     🆕
│       │   └── reward-panel.component.spec.ts  🆕
│       ├── models/
│       │   └── reward.models.ts                🆕
│       └── services/
│           ├── quest-reward.service.ts         🆕
│           └── quest-reward.service.spec.ts    🆕
│
├── e2e/
│   └── demo-flow.spec.ts                       Tests E2E
│
└── testing/
    ├── integration/
    │   ├── character-to-combat.spec.ts         🆕
    │   └── combat-to-rewards.spec.ts           🆕
    └── mocks/
        ├── mock-story-data.ts                  🆕
        └── mock-combat-data.ts                 🆕
```

---

## Scénario de la démo

### Acte 1 : Création du héros
**Personnage** : Le joueur crée son héros (nom, apparence, classe)

### Acte 2 : L'appel à l'aventure
**Narration** :
> *"Bienvenue, [Nom du héros]. Vous êtes un [Classe] fraîchement arrivé dans le royaume d'Aether. 
> Des gobelins pillent les fermes aux abords de la ville. 
> Le conseil vous confie votre première mission : éliminer la menace."*
> 
> **Objectif** : Vaincre tous les ennemis

### Acte 3 : Première bataille
**Combat** :
- Grille 20x20 en isométrique
- **Équipe Joueur** : 2 unités (Héros + Allié)
- **Équipe Ennemie** : 3 gobelins
- Tour par tour avec actions : Déplacer, Attaquer, Compétence, Attendre

### Acte 4 : Récompenses
**Fin de combat** :
- **XP** : +150 (Niveau 1 → 2?)
- **Gold** : +100
- **Items** : Potion de soin x2
- Statistiques : Dégâts infligés, tours joués, précision

---

## Checklist de développement

### Phase 1 : Systèmes de base
- [ ] Créer `StoryService` avec gestion de dialogues
- [ ] Créer `StoryDialogComponent` avec UI FFT
- [ ] Créer `QuestRewardService` avec calcul XP/Gold
- [ ] Créer `RewardPanelComponent` avec animations
- [ ] Créer `GameFlowService` pour orchestrer le tout

### Phase 2 : Intégration
- [ ] Connecter création personnage → narration
- [ ] Connecter narration → combat
- [ ] Connecter combat → récompenses
- [ ] Implémenter sauvegarde de progression
- [ ] Gérer les transitions animées

### Phase 3 : Tests
- [ ] Tests unitaires pour tous les nouveaux services
- [ ] Tests d'intégration pour le flux complet
- [ ] Tests E2E de la démo du début à la fin
- [ ] Validation de tous les composants existants

### Phase 4 : Polish
- [ ] Animations de transitions
- [ ] Sons et musiques (optionnel)
- [ ] Messages d'erreur conviviaux
- [ ] Indicateurs de chargement
- [ ] Optimisation des performances

---

## Stratégie de tests

### Tests unitaires (Jasmine/Karma)
```typescript
// Exemples
describe('StoryService', () => {
  it('should load story data');
  it('should advance to next dialog node');
  it('should handle dialog choices');
});

describe('QuestRewardService', () => {
  it('should calculate XP based on enemies defeated');
  it('should apply level up when XP threshold reached');
  it('should distribute gold correctly');
});
```

### Tests d'intégration
```typescript
describe('Character to Combat Flow', () => {
  it('should create character and start story');
  it('should transition from story to combat');
});

describe('Combat to Rewards Flow', () => {
  it('should display rewards after victory');
  it('should apply rewards to player stats');
});
```

### Tests E2E (Cypress/Playwright)
```typescript
describe('MVP Demo Flow', () => {
  it('should complete full game flow', () => {
    // 1. Créer personnage
    // 2. Lire narration
    // 3. Combattre
    // 4. Recevoir récompenses
    // 5. Retour menu
  });
});
```

---

## Métriques de succès

- Le joueur peut créer un personnage en < 2 minutes
- La narration s'affiche correctement et est lisible
- Le combat se lance sans erreur
- Les actions de combat fonctionnent (déplacement, attaque)
- La victoire déclenche l'écran de récompenses
- Les récompenses s'appliquent au personnage
- Le flux complet est jouable du début à la fin
- Tous les tests passent (unitaires, intégration, E2E)
- Aucune erreur console critique
- Temps de chargement < 3 secondes entre chaque écran

---

## Ordre d'exécution

1. **Créer les modèles de données** (Story, Reward)
2. **Créer les services** (StoryService, QuestRewardService, GameFlowService)
3. **Créer les composants UI** (StoryDialog, RewardPanel)
4. **Intégrer le flux** (Routing, Transitions)
5. **Écrire les tests** (Unitaires → Intégration → E2E)
6. **Tester la démo** manuellement
7. **Corriger les bugs**
8. **Optimiser et polir**

---

## Objectif final

Une démo jouable où le joueur peut :
1. Créer un personnage unique
2. Découvrir l'histoire de sa première quête
3. Combattre des ennemis en tactique tour par tour
4. Obtenir des récompenses et progresser

**Temps de jeu estimé** : 10-15 minutes  
**Rejouabilité** : Différentes classes, choix de personnage
