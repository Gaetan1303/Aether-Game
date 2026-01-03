# User Story : Création de Personnage - Aether Game
*Inspiré de Final Fantasy Tactics et Tactics Ogre avec fonctionnalités MMO RPG*

## Objectif Principal
Permettre au joueur de créer un personnage unique et personnalisé dans un univers tactique médiéval-fantastique avant de démarrer sa première bataille.

## Persona
**Nom**: Maxime, 28 ans, passionné de JRPG tactiques  
**Contexte**: Fan de FF Tactics, Tactics Ogre, Fire Emblem. Recherche une expérience de création approfondie et immersive.  
**Motivation**: Créer un personnage qui lui ressemble et correspond à son style de jeu préféré.

---

## Flux de Création de Personnage

### Étape 1: Choix du Nom
**En tant que** joueur découvrant Aether Game  
**Je veux** saisir le nom de mon futur héros  
**Afin de** lui donner une identité unique dans l'univers du jeu

**Critères d'acceptation:**
- [ ] Champ de saisie avec validation (3-20 caractères)
- [ ] Vérification en temps réel de la disponibilité du nom
- [ ] Messages d'erreur clairs si nom invalide/indisponible
- [ ] Bouton "Suivant" activé uniquement si nom valide
- [ ] Possibilité de revenir en arrière via "Retour au menu"

**Interface:**
```
┌─────────────────────────────────────┐
│    CRÉATION DE PERSONNAGE        │
├─────────────────────────────────────┤
│                                     │
│  Comment souhaitez-vous nommer      │
│  votre héros ?                      │
│                                     │
│  [________________]                 │
│    Nom du personnage                │
│                                     │
│  ✓ Ce nom est disponible            │
│                                     │
│           [Suivant →]               │
│                                     │
│  [← Retour au menu]                 │
└─────────────────────────────────────┘
```

### Étape 2: Sélection du Sexe
**En tant que** joueur  
**Je veux** choisir le sexe de mon personnage  
**Afin de** définir son apparence de base

**Critères d'acceptation:**
- [ ] 3 options : Masculin, Féminin, Autre
- [ ] Sélection visuelle avec icônes représentatives
- [ ] Choix unique obligatoire
- [ ] Navigation : Précédent/Suivant

**Interface:**
```
┌─────────────────────────────────────┐
│    IDENTITÉ DE [Nom du perso]    │
├─────────────────────────────────────┤
│                                     │
│  Quel est le sexe de votre          │
│  personnage ?                       │
│                                     │
│  [♂️ Masculin]  [♀️ Féminin]  [⚧ Autre] │
│                                     │
│                                     │
│  [← Précédent]      [Suivant →]    │
└─────────────────────────────────────┘
```

### Étape 3: Personnalisation de l'Apparence
**En tant que** joueur  
**Je veux** personnaliser l'apparence physique de mon personnage  
**Afin de** créer un avatar qui me correspond visuellement

**Critères d'acceptation:**
- [ ] Aperçu 3D/2D du personnage en temps réel
- [ ] Options de personnalisation basées sur l'API `/joueurs/customisation/options`:
  - Taille (Petite, Moyenne, Grande)
  - Couleur de peau (palette RVB)
  - Style de cheveux (liste déroulante)
  - Couleur des cheveux (palette RVB)
  - Couleur des yeux (palette RVB)
  - Style de barbe (si applicable)
- [ ] Sauvegarde automatique des choix
- [ ] Bouton "Randomiser" pour générer une apparence aléatoire
- [ ] Navigation fluide entre les options

**Interface:**
```
┌───────────────────────────────────────────────────┐
│    APPARENCE DE [Nom du perso]                 │
├───────────────────────────────────────────────────┤
│                                                   │
│  [Aperçu 3D]          │  Personnalisation        │
│      du              │                          │
│   personnage         │  Taille: [Moyenne ▼]     │
│                      │                          │
│                      │  Peau: [] #D4A574      │
│                      │                          │
│                      │  Cheveux: [Long ▼]       │
│                      │  Couleur: [] #8B4513    │
│                      │                          │
│                      │  Yeux: ] #4169E1       │
│                      │                          │
│                      │  [🎲 Randomiser]          │
│                                                   │
│  [← Précédent]              [Suivant →]          │
└───────────────────────────────────────────────────┘
```

### Étape 4: Choix de la Classe
**En tant que** joueur  
**Je veux** choisir la classe de départ de mon personnage  
**Afin de** définir son style de combat et ses capacités initiales

**Critères d'acceptation:**
- [ ] Récupération des classes via l'API `/joueurs/jobs`
- [ ] Affichage des 5 classes : Guerrier, Mage, Archer, Voleur, Clerc
- [ ] Détails pour chaque classe via `/joueurs/jobs/{job_id}`:
  - Description complète
  - Stats principales
  - Compétences de base
  - Aperçu des compétences par niveau
- [ ] Interface avec cards interactives
- [ ] Sélection unique obligatoire
- [ ] Navigation avec validation

**Interface:**
```
┌─────────────────────────────────────────────────────────────┐
│    CLASSE DE [Nom du perso]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Choisissez votre voie :                                   │
│                                                             │
│  [GUERRIER]  [MAGE]  [ARCHER]  [VOLEUR]  [CLERC]  │
│     Tank         Magique    Distance    Furtif     Soigneur │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │   GUERRIER                        │                   │
│  │  Maître du combat rapproché         │                   │
│  │                                     │                   │
│  │  Stats: ATK ★★★ DEF ★★★ HP ★★★     │                   │
│  │  Compétences: Charge, Garde, Coup  │                   │
│  │  Puissant                           │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  [← Précédent]                        [Suivant →]         │
└─────────────────────────────────────────────────────────────┘
```

### Étape 5: Validation et Résumé
**En tant que** joueur  
**Je veux** voir un résumé complet de mon personnage avant validation  
**Afin de** confirmer mes choix et démarrer l'aventure

**Critères d'acceptation:**
- [ ] Fiche personnage complète avec :
  - Nom et classe choisis
  - Aperçu visuel final du personnage
  - Stats de base calculées
  - Compétences initiales
  - Description de la classe
- [ ] Bouton "Modifier" pour chaque section (retour aux étapes précédentes)
- [ ] Bouton "Créer le Personnage" pour validation finale
- [ ] Appel API `/joueurs` ou `/joueurs/create` lors de la validation
- [ ] Lancement automatique du jeu via `/game/combat/start`

**Interface:**
```
┌─────────────────────────────────────────────────────────────┐
│    FICHE DE [Nom du perso]                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Aperçu Final]    │   Récapitulatif                      │
│     du            │                                        │
│  personnage       │  Nom: [Nom]                         │
│                   │  Sexe: [Masculin]                   │
│                   │  Classe: [Guerrier]                 │
│                   │                                        │
│                   │   Stats de Base:                      │
│                   │  HP: 120  MP: 30  ATK: 85             │
│                   │  DEF: 90  SPD: 45  MOV: 3             │
│                   │                                        │
│                   │   Compétences:                        │
│                   │  • Charge (Actif)                     │
│                   │  • Garde (Réaction)                   │
│                   │  • Coup Puissant (Actif)             │
│                                                             │
│                   [ CRÉER & JOUER !]                     │
│                                                             │
│  [← Précédent]                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Intégration Technique

### Services API Requis
```typescript
// Character Creation Service
- getCustomizationOptions() → GET /joueurs/customisation/options
- getAvailableJobs() → GET /joueurs/jobs  
- getJobDetails(jobId) → GET /joueurs/jobs/{job_id}
- createCharacter(characterData) → POST /joueurs/create
- startFirstCombat(playerId) → POST /game/combat/start
```

### Routing Angular
```
/character-creation
├── /name          (Étape 1)
├── /gender        (Étape 2)  
├── /appearance    (Étape 3)
├── /class         (Étape 4)
└── /summary       (Étape 5)
```

### État de l'Application
```typescript
interface CharacterCreationState {
  currentStep: number;
  characterData: {
    nom: string;
    apparence: ApparencePhysiqueDTO;
    job_initial: string;
  };
  customizationOptions: CustomisationOptions;
  availableJobs: Job[];
  selectedJobDetails: Job | null;
}
```

---

## Critères de Succès

### Fonctionnels
- [ ] Création complète du personnage en 5 étapes fluides
- [ ] Intégration complète avec l'API backend
- [ ] Validation des données à chaque étape
- [ ] Sauvegarde du personnage en base
- [ ] Lancement automatique du premier combat

### Techniques
- [ ] Interface responsive (mobile/desktop)
- [ ] Gestion d'erreur robuste avec retry
- [ ] Performance optimisée (lazy loading, cache)
- [ ] Accessibilité WCAG niveau AA
- [ ] Tests unitaires > 85% de couverture

### UX/UI
- [ ] Design cohérent avec l'univers FF Tactics
- [ ] Animations fluides entre les étapes
- [ ] Feedback visuel permanent
- [ ] Temps de création < 5 minutes
- [ ] Taux d'abandon < 15%

---

## Acceptance Scenarios

### Scénario Principal : Création Réussie
```gherkin
GIVEN je suis un nouveau joueur
WHEN je commence la création de personnage
AND je remplis toutes les étapes (nom, sexe, apparence, classe)  
AND je valide ma création
THEN mon personnage est créé en base de données
AND je suis dirigé vers mon premier combat
```

### Scénario Alternatif : Modification en Cours
```gherkin
GIVEN je suis à l'étape de résumé
WHEN je clique sur "Modifier" pour l'apparence
THEN je retourne à l'étape d'apparence
AND mes données précédentes sont pré-remplies
AND je peux modifier et continuer
```

### Scénario d'Erreur : Nom Indisponible
```gherkin
GIVEN je suis à l'étape de saisie du nom
WHEN je saisis un nom déjà utilisé
THEN un message d'erreur s'affiche
AND le bouton "Suivant" reste désactivé
AND je peux saisir un nouveau nom
```

---

*Cette user story servira de référence pour le développement complet du système de création de personnage dans Aether Game.*