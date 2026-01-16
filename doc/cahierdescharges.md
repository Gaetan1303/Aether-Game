# Cahier des Charges - Aether Game

**Version** : 1.0  
**Date** : 16 janvier 2026  
**Projet** : Aether Game - RPG Tactique Web  
**Équipe** : El miminette 

---

## 1. Présentation du Projet

### 1.1 Contexte

Aether Game est une application web de jeu de rôle tactique inspirée de titres classiques tels que Final Fantasy Tactics et Tactics Ogre. Le projet vise à offrir une expérience de combat stratégique au tour par tour dans un environnement fantastique médiéval, accessible directement via navigateur web sans installation nécessaire.

Le marché des RPG tactiques connaît un regain d'intérêt avec le succès de titres modernes comme Fire Emblem Three Houses et Triangle Strategy. Ce projet se positionne comme une alternative accessible, combinant profondeur stratégique et accessibilité web.

### 1.2 Objectifs

**Objectif Principal** : Créer une plateforme de jeu de rôle tactique complète permettant aux joueurs de vivre des aventures stratégiques dans un univers fantastique.

**Objectifs Spécifiques** :
- Offrir un système de création de personnage approfondi et immersif
- Développer un moteur de combat tactique au tour par tour sur grille isométrique
- Intégrer un système de progression avec expérience, niveaux et compétences
- Fournir une narration interactive guidant le joueur à travers des quêtes
- Garantir une expérience fluide avec des animations et visuels en 2D/3D via PixiJS

**Public Cible** :
- Joueurs de 18-40 ans
- Amateurs de RPG tactiques et de stratégie
- Joueurs recherchant une expérience accessible sur navigateur
- Communauté nostalgique des JRPG tactiques des années 90-2000

### 1.3 Périmètre du Projet

**Inclus dans le MVP** :
- Système complet de création de personnage
- Moteur de combat tactique isométrique
- Système de narration avec dialogues
- Gestion des récompenses (XP, or, objets)
- Interface utilisateur responsive
- Sauvegarde de progression
- Premier scénario jouable ("Les Pillards Gobelins")

**Exclus du MVP (versions futures)** :
- Multijoueur en temps réel
- Mode PvP compétitif
- Système de guildes
- Marché d'objets entre joueurs
- Création de contenu utilisateur

---

## 2. Spécifications Fonctionnelles

### 2.1 Système de Création de Personnage

**Description** : Interface en 5 étapes permettant au joueur de créer son avatar unique.

**Fonctionnalités** :

#### Étape 1 : Identité
- Saisie du nom du personnage (3-20 caractères)
- Vérification de disponibilité en temps réel
- Validation des caractères autorisés

#### Étape 2 : Genre
- Choix entre Masculin, Féminin, Autre
- Impact sur l'apparence de base et certains dialogues

#### Étape 3 : Apparence
- Personnalisation physique :
  - Taille (Petite, Moyenne, Grande)
  - Couleur de peau (palette RVB)
  - Style et couleur de cheveux
  - Couleur des yeux
  - Éléments faciaux (cicatrices, tatouages)
- Aperçu en temps réel du personnage
- Bouton "Randomiser" pour génération aléatoire

#### Étape 4 : Classe et Compétences
- Sélection de la classe de départ :
  - Guerrier (ATK+, DEF+)
  - Mage (MAG+, MP+)
  - Archer (SPD+, Portée+)
  - Prêtre (HEA+, Support)
- Distribution de points de compétences (10 points)
- Sélection de 2 compétences de départ
- Choix de la croyance (影響sur dialogues et quêtes)

#### Étape 5 : Récapitulatif
- Révision complète des choix
- Modification possible à toute étape
- Bouton "Commencer l'Aventure"

**Règles de Gestion** :
- Un nom ne peut être utilisé que par un seul joueur
- La distribution de points de compétences est limitée à 10 points au total
- Chaque classe impose des statistiques de base minimales
- Les choix de croyance influencent les dialogues NPC

### 2.2 Système de Combat Tactique

**Description** : Moteur de combat au tour par tour sur grille isométrique 3D.

**Fonctionnalités** :

#### Grille de Combat
- Grille isométrique (X, Y, Z) avec obstacles et élévations
- Déplacement basé sur la statistique de Mouvement
- Zone de contrôle (ZOC) autour des unités ennemies
- Effets de terrain (eau, feu, poison)

#### Tour de Jeu
- Initiative basée sur la vitesse (SPD)
- Phase de déplacement
- Phase d'action (attaque, compétence, objet, défense)
- Phase de fin de tour (effets persistants)

#### Actions Disponibles
- **Attaque** : Dégâts physiques basés sur ATK vs DEF
- **Compétence** : Capacités spéciales consommant MP
- **Objet** : Utilisation de consommables
- **Défendre** : +50% DEF jusqu'au prochain tour
- **Attendre** : Passer son tour

#### Système de Ciblage
- Ciblage simple (1 unité)
- Zone d'effet (AoE) circulaire ou linéaire
- Ciblage de ligne (Row)
- Validation de portée (Manhattan/Euclidienne)

#### Statistiques de Combat
- **PV** : Points de vie
- **MP** : Points de magie
- **ATK** : Attaque physique
- **DEF** : Défense physique
- **MAG** : Puissance magique
- **RES** : Résistance magique
- **SPD** : Vitesse (initiative)
- **MOV** : Points de mouvement

**Règles de Gestion** :
- Un tour se termine lorsque toutes les unités ont agi
- Les effets de statut se résolvent en début de tour
- La victoire survient lorsque tous les ennemis sont vaincus
- La défaite survient si toutes les unités alliées sont KO

### 2.3 Système de Progression

**Fonctionnalités** :

#### Expérience et Niveaux
- Gain d'XP par combat (défaite d'ennemis, objectifs)
- Montée de niveau automatique au seuil requis
- Courbe exponentielle : XP requis = niveau² × 100
- Niveau max : 50

#### Récompenses de Combat
- Or : Variable selon difficulté du combat
- Expérience : Répartie entre unités survivantes
- Objets : Butin aléatoire selon table de loot
- Bonus de performance :
  - Victoire rapide (< 10 tours) : +20% XP
  - Sans perte : +30% XP
  - Précision élevée (>90%) : +15% XP

#### Points de Compétences
- 1 point par niveau
- Utilisables pour :
  - Augmenter les statistiques (+1 stat = 1 point)
  - Débloquer nouvelles compétences
  - Améliorer compétences existantes

### 2.4 Système de Narration

**Description** : Système de dialogues et événements narratifs.

**Fonctionnalités** :

#### Dialogues
- Interface style Final Fantasy Tactics
- Boîte de dialogue avec portrait du personnage
- Texte progressif avec effet de frappe
- Choix multiples influençant la narration
- Système de branches narratives

#### Événements de Quête
- Introduction narrative avant combat
- Objectifs contextualisés
- Événements mid-combat (renforts, objectifs dynamiques)
- Conclusion narrative après victoire
- Écran de récompenses détaillé

**Règles de Gestion** :
- Les choix de dialogue peuvent affecter les récompenses
- Certaines quêtes sont débloquées par des choix narratifs
- La croyance du personnage influence les options disponibles

### 2.5 Gestion de l'Inventaire

**Fonctionnalités** :
- Stockage de 50 objets maximum
- Catégories : Consommables, Équipement, Clés, Matériaux
- Équipement : Arme, Armure, Accessoire (3 slots)
- Utilisation en combat et hors combat
- Système de rareté : Commun, Rare, Épique, Légendaire

---

## 3. Spécifications Techniques

### 3.1 Architecture

**Type d'Architecture** : Application web monopage (SPA) avec architecture hexagonale

**Composants Principaux** :

#### Frontend
- **Framework** : Angular 19.0.0
- **Rendu Graphique** : PixiJS 8.0.0
- **Gestion d'État** : Angular Signals
- **Communication** : RxJS 7.8.0
- **Style** : SCSS avec mixins personnalisés

#### Backend (API)
- **Framework** : À définir (Node.js/Express ou Go)
- **Base de Données** : PostgreSQL
- **Authentification** : JWT
- **WebSocket** : Socket.io pour temps réel

#### Architecture Frontend
```
src/
├── app/
│   ├── core/              # Services singleton
│   │   ├── services/
│   │   └── interceptors/
│   ├── features/          # Modules fonctionnels
│   │   ├── character/
│   │   ├── combat/
│   │   ├── story/
│   │   ├── rewards/
│   │   └── inventory/
│   └── shared/            # Composants partagés
│       ├── components/
│       ├── services/
│       └── interfaces/
└── assets/                # Ressources statiques
    └── pixi/              # Assets PixiJS
```

### 3.2 Technologies Utilisées

**Frontend** :
- TypeScript 5.6.0
- Angular CLI avec esbuild
- PixiJS pour rendu 2D/isométrique
- Angular Material (composants UI)
- RxJS pour programmation réactive

**Outils de Développement** :
- Jasmine + Karma pour tests unitaires
- ESLint pour qualité de code
- Git pour versioning
- VS Code comme IDE recommandé

**Design Patterns Implémentés** :
- Singleton (services Angular)
- Facade (AssetLoaderService, PixiEngineService)
- Observer (RxJS, Signals)
- State Management (GameStateService)
- Builder (configuration de combat)
- Template Method (validation, chargement)
- Guard Pattern (protection de routes)
- Dependency Injection (Angular DI)

### 3.3 API REST

**Endpoints Principaux** :

#### Authentification
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/refresh
```

#### Personnages
```
POST   /api/joueurs                    # Créer personnage
GET    /api/joueurs/{id}               # Récupérer personnage
PUT    /api/joueurs/{id}               # Mettre à jour
GET    /api/joueurs/customisation/options  # Options de personnalisation
```

#### Combat
```
POST   /api/combats                    # Démarrer combat
GET    /api/combats/{id}               # État du combat
POST   /api/combats/{id}/actions       # Exécuter action
GET    /api/combats/{id}/history       # Historique événements
```

#### Progression
```
GET    /api/joueurs/{id}/stats         # Statistiques
POST   /api/joueurs/{id}/level-up      # Montée de niveau
GET    /api/joueurs/{id}/inventory     # Inventaire
POST   /api/joueurs/{id}/equip         # Équiper objet
```

### 3.4 Performance et Optimisation

**Objectifs de Performance** :
- Temps de chargement initial < 3 secondes
- FPS constant à 60 lors des combats
- Temps de réponse API < 200ms (95e percentile)
- Bundle JavaScript initial < 500 KB
- Lazy loading des modules non critiques

**Stratégies d'Optimisation** :
- Code splitting par routes
- Lazy loading des assets PixiJS par bundles
- Cache LRU pour textures
- Virtualisation des listes longues
- Debounce sur les inputs utilisateur
- Service Worker pour cache offline

### 3.5 Sécurité

**Mesures de Sécurité** :
- Authentification JWT avec refresh tokens
- HTTPS obligatoire en production
- Protection CSRF
- Validation des entrées côté client et serveur
- Rate limiting sur API
- Sanitisation des inputs pour prévenir XSS
- Hashage bcrypt pour mots de passe

### 3.6 Compatibilité

**Navigateurs Supportés** :
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Résolutions** :
- Desktop : 1920×1080 minimum
- Tablette : 1024×768 minimum
- Mobile : Responsive (non optimisé pour MVP)

---

## 4. Interfaces Utilisateur

### 4.1 Principes de Design

**Style Visuel** :
- Inspiration Final Fantasy Tactics / Tactics Ogre
- Palette de couleurs médiévale-fantastique
- Typographie lisible (famille serif pour textes narratifs)
- Animations fluides et contextuelles
- Feedback visuel immédiat sur interactions

**Principes UX** :
- Clarté de l'information (stats, objectifs)
- Navigation intuitive
- Tutoriel interactif pour nouveaux joueurs
- Raccourcis clavier pour joueurs expérimentés
- Messages d'erreur constructifs

### 4.2 Écrans Principaux

#### Écran d'Accueil
- Logo Aether Game
- Menu principal : Nouvelle Partie, Continuer, Options, Quitter
- Musique d'ambiance
- Animations de fond subtiles

#### Création de Personnage
- 5 étapes avec barre de progression
- Aperçu en temps réel du personnage
- Navigation : Précédent, Suivant, Annuler
- Récapitulatif final avant validation

#### Interface de Combat
- Grille isométrique centrale
- Panneau d'informations d'unité (gauche)
- Liste des actions disponibles (droite)
- Timeline d'initiative (haut)
- Log de combat (bas)
- Mini-carte (coin supérieur droit)

#### Écran de Récompenses
- Résumé statistiques de combat
- Liste des récompenses obtenues
- Animations de montée de niveau
- Distribution de points de compétences
- Bouton "Continuer"

---

## 5. Exigences Non Fonctionnelles

### 5.1 Disponibilité
- Disponibilité cible : 99.5% (hors maintenance programmée)
- Maintenance programmée : Mardi 2h-4h du matin
- Temps de récupération maximal : 2 heures

### 5.2 Scalabilité
- Support de 1000 utilisateurs simultanés (MVP)
- Architecture permettant scale horizontal
- Cache distribué (Redis) pour sessions
- CDN pour assets statiques

### 5.3 Maintenabilité
- Code coverage tests unitaires > 85%
- Documentation technique complète
- Respect des conventions Angular
- Revues de code obligatoires
- CI/CD automatisé

### 5.4 Accessibilité
- Niveau WCAG 2.1 AA visé
- Navigation clavier complète
- Contraste de couleurs suffisant
- Textes alternatifs sur images
- Support lecteurs d'écran (partiellement)

### 5.5 Conformité
- RGPD : Consentement cookies, droit à l'effacement
- Conditions d'utilisation et politique de confidentialité
- Modération de contenu utilisateur
- Sauvegarde données personnelles chiffrées

---

## 6. Planning et Livrables

### 6.1 Phases du Projet

#### Phase 1 : Fondations (Semaines 1-2) - COMPLÉTÉ
- [x] Architecture Angular
- [x] Intégration PixiJS
- [x] Services de base (Auth, GameState, API)
- [x] Tests unitaires fondamentaux

#### Phase 2 : Création de Personnage (Semaines 3-4) - COMPLÉTÉ
- [x] Interface de création complète
- [x] Validation et sauvegarde
- [x] Connexion API backend
- [x] Tests d'intégration

#### Phase 3 : Moteur de Combat (Semaines 5-8) - EN COURS
- [x] Rendu isométrique PixiJS
- [x] Gestion de caméra et animations
- [x] Services de combat (PixiEngine, SpriteManager)
- [ ] Logique de combat complète (actions, IA)
- [ ] Tests de combat

#### Phase 4 : Narration et Récompenses (Semaines 9-10) - EN COURS
- [x] Service de narration (StoryService)
- [x] Composant de dialogue
- [x] Service de récompenses (QuestRewardService)
- [x] Écran de fin de combat
- [ ] Tests de flux complet

#### Phase 5 : Flux Complet MVP (Semaines 11-12) - EN COURS
- [x] Service d'orchestration (GameFlowService)
- [ ] Premier scénario jouable
- [ ] Transitions animées entre phases
- [ ] Sauvegarde de progression
- [ ] Tests E2E

#### Phase 6 : Polish et Déploiement (Semaines 13-14)
- [ ] Optimisations performance
- [ ] Debug et corrections
- [ ] Documentation utilisateur
- [ ] Déploiement production

### 6.2 Livrables

**Livrable 1 : Prototype fonctionnel** (Fin Phase 3)
- Création de personnage + Combat basique
- Documentation technique
- Tests unitaires > 80%

**Livrable 2 : MVP Complet** (Fin Phase 5)
- Flux complet Création → Combat → Récompenses
- Premier scénario jouable
- Documentation utilisateur
- Tests E2E

**Livrable 3 : Version Production** (Fin Phase 6)
- Application déployée et accessible
- Monitoring et logs
- Guide de maintenance
- Support utilisateur

### 6.3 Métriques de Succès

**Techniques** :
- Build réussi sans erreurs
-  29/29 tests unitaires passent (100%)
-  Bundle < 500 KB (361.28 KB actuel)
-  Tests E2E > 90% de couverture

**Fonctionnelles** :
-  Temps de création de personnage < 5 minutes
-  Taux de complétion du premier combat > 80%
-  Taux d'abandon < 15%
-  Satisfaction utilisateur > 4/5

**Performance** :
-  Temps de chargement < 3s (actuellement 6.4s build)
-  60 FPS constant en combat
-  Temps de réponse API < 200ms

---

## 7. Risques et Contraintes

### 7.1 Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Complexité du moteur de combat | Moyenne | Élevé | Architecture modulaire, tests rigoureux |
| Performance PixiJS sur navigateurs anciens | Faible | Moyen | Détection de capacités, mode dégradé |
| Charge serveur insuffisante | Moyenne | Élevé | Architecture scalable, monitoring |
| Dérive du planning | Élevée | Moyen | Sprints courts, réévaluation hebdomadaire |
| Bugs critiques en production | Moyenne | Élevé | Tests automatisés, staging environment |

### 7.2 Contraintes

**Techniques** :
- Compatibilité navigateurs modernes uniquement
- Dépendance à PixiJS (pas de fallback Canvas)
- Performance limitée par capacités client

**Humaines** :
- Équipe réduite (1-2 développeurs)
- Compétences Angular et PixiJS requises
- Disponibilité temps partiel

**Budgétaires** :
- Hébergement cloud limité
- Pas de budget marketing
- Ressources graphiques limitées

**Temporelles** :
- MVP attendu dans 14 semaines
- Pas de marge pour retards majeurs

---

## 8. Maintenance et Évolution

### 8.1 Stratégie de Maintenance

**Maintenance Corrective** :
- Hotfix < 24h pour bugs critiques
- Patch hebdomadaire pour bugs mineurs
- Monitoring 24/7 avec alertes

**Maintenance Évolutive** :
- Nouvelles fonctionnalités chaque mois
- Rééquilibrage des classes trimestriellement
- Nouveaux scénarios tous les 2 mois

### 8.2 Évolutions Prévues (Post-MVP)

**Version 1.1** (3 mois après MVP) :
- 3 nouveaux scénarios
- Système de talents avancé
- Mode difficulté personnalisé
- Succès et achievements

**Version 2.0** (6 mois après MVP) :
- Mode coopératif 2 joueurs
- 2 nouvelles classes
- Système de craft d'objets
- Campagne principale (10 chapitres)

**Version 3.0** (12 mois après MVP) :
- Mode PvP asynchrone
- Système de guildes
- Création de contenu communautaire
- Application mobile native

---

## 9. Glossaire

**Termes Techniques** :
- **SPA** : Single Page Application, application web monopage
- **DDD** : Domain-Driven Design, conception dirigée par le domaine
- **JWT** : JSON Web Token, standard d'authentification
- **RxJS** : Reactive Extensions for JavaScript, bibliothèque de programmation réactive
- **Signals** : Système de réactivité Angular pour gestion d'état
- **Lazy Loading** : Chargement différé de modules non critiques

**Termes Métier** :
- **RPG** : Role-Playing Game, jeu de rôle
- **JRPG** : Japanese Role-Playing Game
- **ATB** : Active Time Battle, système de tour par tour actif
- **AoE** : Area of Effect, zone d'effet
- **ZOC** : Zone of Control, zone de contrôle
- **NPC** : Non-Player Character, personnage non joueur
- **XP** : Experience Points, points d'expérience
- **MP** : Magic Points, points de magie
- **KO** : Knock Out, hors combat

**Acronymes Projet** :
- **MVP** : Minimum Viable Product, produit minimum viable
- **CI/CD** : Continuous Integration/Continuous Deployment
- **WCAG** : Web Content Accessibility Guidelines
- **RGPD** : Règlement Général sur la Protection des Données

---

## 10. Annexes

### 10.1 Références

- [Documentation Angular](https://angular.io/)
- [Documentation PixiJS](https://pixijs.com/)
- [Architecture DDD](doc/agregats.md)
- [User Stories](doc/user_story.md)
- [Plan MVP](doc/MVP-plan.md)
- [Design Patterns](DESIGN_PATTERNS.md)

### 10.2 Contacts

**Chef de Projet** : Le Cartel de Mimine
**Lead Développeur** : Mimine 

