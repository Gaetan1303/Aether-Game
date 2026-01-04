import { Component, signal, computed, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AetherApiService } from '../../shared/services/aether-api.service';

@Component({
  selector: 'app-new-game',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewGameComponent implements OnInit {
  private aetherApi = inject(AetherApiService);
  
  // Signaux pour la connexion API
  isLoading = signal<boolean>(false);
  apiError = signal<string>('');
  
  // Signaux pour la création de personnage
  selectedClass = signal('Guerrier');
  selectedRace = signal('Humain');
  selectedGender = signal('Masculin');
  selectedSize = signal('Moyen');
  characterName = signal('');
  difficulty = signal('Normal');
  
  // Signaux pour l'apparence physique
  skinColor = signal({ r: 255, g: 220, b: 177 }); // Teint par défaut
  hairColor = signal({ r: 139, g: 69, b: 19 });   // Châtain
  eyeColor = signal({ r: 101, g: 67, b: 33 });    // Marron
  hairStyle = signal('court');
  beardStyle = signal('');
  
  // Signaux pour les compétences et alignement
  selectedSkills = signal<string[]>([]);
  selectedGod = signal('');
  selectedAlignment = signal('Neutre');
  
  // Gestion des sous-pages
  currentStep = signal<'appearance' | 'class' | 'divine'>('appearance');
  
  // Options de customisation
  races = ['Humain', 'Elfe', 'Nain', 'Halfling'];
  sexes = ['Masculin', 'Féminin'];
  tailles = ['Petit', 'Moyen', 'Grand'];
  difficulties = ['Facile', 'Normal', 'Difficile', 'Expert'];
  
  // Options d'apparence
  hairStyles = ['court', 'long', 'bouclé', 'tressé', 'chauve'];
  beardStyles = ['', 'courte', 'longue', 'tressée', 'bouc'];
  skinTones = [
    { name: 'Claire', color: { r: 255, g: 220, b: 177 } },
    { name: 'Moyenne', color: { r: 210, g: 180, b: 140 } },
    { name: 'Mate', color: { r: 160, g: 120, b: 90 } },
    { name: 'Sombre', color: { r: 120, g: 80, b: 50 } }
  ];
  hairColors = [
    { name: 'Châtain', color: { r: 139, g: 69, b: 19 } },
    { name: 'Blond', color: { r: 218, g: 165, b: 32 } },
    { name: 'Noir', color: { r: 28, g: 28, b: 28 } },
    { name: 'Roux', color: { r: 165, g: 42, b: 42 } },
    { name: 'Blanc', color: { r: 220, g: 220, b: 220 } }
  ];
  eyeColors = [
    { name: 'Marron', color: { r: 101, g: 67, b: 33 } },
    { name: 'Bleu', color: { r: 70, g: 130, b: 180 } },
    { name: 'Vert', color: { r: 34, g: 139, b: 34 } },
    { name: 'Gris', color: { r: 119, g: 136, b: 153 } },
    { name: 'Violet', color: { r: 138, g: 43, b: 226 } }
  ];
  
  // Compétences par classe
  skillsByClass: Record<string, string[]> = {
    'Guerrier': ['Épée', 'Bouclier', 'Charge', 'Défense'],
    'Mage': ['Feu', 'Glace', 'Foudre', 'Soin'],
    'Archer': ['Tir précis', 'Tir multiple', 'Piège', 'Camouflage'],
    'Voleur': ['Crochetage', 'Furtivité', 'Poison', 'Critique'],
    'Clerc': ['Soin', 'Bénédiction', 'Protection', 'Résurrection']
  };
  
  // Dieux et alignements
  gods = ['Aucun', 'Bahamut', 'Shiva', 'Ifrit', 'Odin', 'Phoenix'];
  alignments = ['Loyal Bon', 'Neutre Bon', 'Chaotique Bon', 'Loyal Neutre', 'Neutre', 'Chaotique Neutre', 'Loyal Mauvais', 'Neutre Mauvais', 'Chaotique Mauvais'];
  
  // Jobs disponibles depuis l'API
  availableJobs = signal<any[]>([]);
  
  // Méthodes pour la navigation entre les étapes
  nextStep() {
    const steps = ['appearance', 'class', 'divine'] as const;
    const currentIndex = steps.indexOf(this.currentStep());
    if (currentIndex < steps.length - 1) {
      this.currentStep.set(steps[currentIndex + 1]);
    }
  }
  
  previousStep() {
    const steps = ['appearance', 'class', 'divine'] as const;
    const currentIndex = steps.indexOf(this.currentStep());
    if (currentIndex > 0) {
      this.currentStep.set(steps[currentIndex - 1]);
    }
  }
  
  // Méthodes de validation d'accès aux étapes
  canAccessClassStep(): boolean {
    return this.characterName().trim().length >= 3;
  }
  
  canAccessDivineStep(): boolean {
    return this.canAccessClassStep() && this.selectedSkills().length > 0;
  }
  
  // Computed pour les compétences disponibles
  availableSkills = computed(() => {
    return this.skillsByClass[this.selectedClass()] || [];
  });
  
  // Méthodes pour la personnalisation
  updateSkinColor(color: { r: number; g: number; b: number }) {
    this.skinColor.set(color);
  }
  
  updateHairColor(color: { r: number; g: number; b: number }) {
    this.hairColor.set(color);
  }
  
  updateEyeColor(color: { r: number; g: number; b: number }) {
    this.eyeColor.set(color);
  }
  
  toggleSkill(skill: string) {
    const current = this.selectedSkills();
    if (current.includes(skill)) {
      this.selectedSkills.set(current.filter(s => s !== skill));
    } else if (current.length < 3) { // Limite de 3 compétences
      this.selectedSkills.set([...current, skill]);
    }
  }
  
  ngOnInit() {
    this.loadCustomisationOptions();
    this.loadJobsFromApi();
  }
  
  private loadCustomisationOptions() {
    this.aetherApi.getCustomisationOptions().subscribe({
      next: (options) => {
        // Charger les options de customisation depuis l'API
        if (options.sexes) this.sexes = options.sexes;
        if (options.tailles) this.tailles = options.tailles;
        console.log('Options de customisation chargées:', options);
      },
      error: (error) => {
        console.warn('Options de customisation non disponibles, utilisation des valeurs par défaut');
      }
    });
  }
  
  private loadJobsFromApi() {
    this.isLoading.set(true);
    this.aetherApi.getAvailableJobs().subscribe({
      next: (response) => {
        this.availableJobs.set(response.jobs);
        this.isLoading.set(false);
        console.log('Jobs chargés depuis l\'API:', response);
      },
      error: (error) => {
        console.warn('Impossible de charger les jobs depuis l\'API, utilisation des valeurs par défaut');
        this.apiError.set('Connexion API indisponible');
        this.isLoading.set(false);
      }
    });
  }
  
  /**
   * Créer le personnage en utilisant l'API
   */
  createCharacter() {
    if (!this.characterName().trim()) {
      this.apiError.set('Le nom du personnage est requis');
      return;
    }
    
    // Mapping des sexes et tailles vers les types acceptés par l'API
    const sexeMap: Record<string, 'masculin' | 'feminin' | 'autre'> = {
      'Masculin': 'masculin',
      'Féminin': 'feminin',
      'Autre': 'autre'
    };
    
    const tailleMap: Record<string, 'petite' | 'moyenne' | 'grande'> = {
      'Petit': 'petite',
      'Moyen': 'moyenne',
      'Grand': 'grande'
    };
    
    const sexe = sexeMap[this.selectedGender()] || 'masculin';
    const taille = tailleMap[this.selectedSize()] || 'moyenne';
    // Mapping des classes vers les types acceptés par l'API
    const classMap: Record<string, 'guerrier' | 'mage' | 'archer' | 'voleur' | 'clerc'> = {
      'Guerrier': 'guerrier',
      'Mage': 'mage',
      'Archer': 'archer',
      'Voleur': 'voleur',
      'Clerc': 'clerc'
    };
    
    const jobInitial = classMap[this.selectedClass()] || 'guerrier';
    
    const joueurData = {
      nom: this.characterName().trim(),
      apparence: {
        sexe: sexe,
        taille: taille,
        couleur_peau: this.skinColor(),
        couleur_cheveux: this.hairColor(),
        couleur_yeux: this.eyeColor(),
        style_cheveux: this.hairStyle(),
        style_barbe: this.beardStyle()
      },
      job_initial: jobInitial,
      competences_initiales: this.selectedSkills(),
      divinite: this.selectedGod(),
      alignement: this.selectedAlignment(),
      difficulte: this.difficulty().toLowerCase()
    };
    
    this.isLoading.set(true);
    this.apiError.set('');
    
    // Essayer d'abord l'endpoint RESTful, puis le legacy
    this.aetherApi.createJoueur(joueurData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Personnage créé avec succès:', response);
        // Rediriger vers une page de succès ou le jeu
        alert(`Personnage "${response.nom}" créé avec succès !`);
      },
      error: (error) => {
        // Essayer l'endpoint legacy en cas d'échec
        this.aetherApi.createJoueurLegacy(joueurData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            console.log('Personnage créé avec succès (legacy):', response);
            alert(`Personnage "${response.nom}" créé avec succès !`);
          },
          error: (legacyError) => {
            this.isLoading.set(false);
            this.apiError.set('Erreur lors de la création du personnage');
            console.error('Erreur création personnage:', error, legacyError);
          }
        });
      }
    });
  }
  
  // Classes disponibles (fallback si API indisponible)
  classes = [
    'Guerrier', 'Mage', 'Archer', 'Voleur', 'Clerc', 'Chevalier'
  ];
  
  // Computed pour afficher les jobs API ou les classes par défaut
  displayClasses = computed(() => {
    return this.availableJobs().length > 0 
      ? this.availableJobs().map(job => job.nom || job.name)
      : this.classes;
  });

  // Stats calculées basées sur la classe et race
  baseStats = computed(() => {
    const classBonus = this.getClassBonus(this.selectedClass());
    const raceBonus = this.getRaceBonus(this.selectedRace());
    
    return {
      strength: 10 + classBonus.str + raceBonus.str,
      magic: 10 + classBonus.mag + raceBonus.mag,
      agility: 10 + classBonus.agi + raceBonus.agi,
      vitality: 10 + classBonus.vit + raceBonus.vit
    };
  });
  
  private getClassBonus(className: string) {
    const bonuses: Record<string, any> = {
      'Guerrier': { str: 5, mag: -2, agi: 1, vit: 3 },
      'Mage': { str: -2, mag: 6, agi: 2, vit: -1 },
      'Archer': { str: 2, mag: 1, agi: 5, vit: 0 },
      'Voleur': { str: 1, mag: 2, agi: 6, vit: -2 },
      'Clerc': { str: 0, mag: 4, agi: -1, vit: 4 },
      'Chevalier': { str: 4, mag: -1, agi: -2, vit: 6 }
    };
    return bonuses[className] || { str: 0, mag: 0, agi: 0, vit: 0 };
  }
  
  private getRaceBonus(raceName: string) {
    const bonuses: Record<string, any> = {
      'Humain': { str: 0, mag: 0, agi: 0, vit: 0 },
      'Elfe': { str: -1, mag: 3, agi: 2, vit: -1 },
      'Nain': { str: 2, mag: -1, agi: -2, vit: 3 },
      'Halfelin': { str: -2, mag: 1, agi: 3, vit: 1 }
    };
    return bonuses[raceName] || { str: 0, mag: 0, agi: 0, vit: 0 };
  }
  
  startGame() {
    if (!this.characterName().trim()) {
      alert('Veuillez entrer un nom pour votre personnage');
      return;
    }
    
    const gameData = {
      name: this.characterName(),
      class: this.selectedClass(),
      race: this.selectedRace(),
      difficulty: this.difficulty(),
      stats: this.baseStats()
    };
    
    console.log('Démarrage du jeu avec:', gameData);
    // Ici on pourrait naviguer vers le jeu principal
  }
}