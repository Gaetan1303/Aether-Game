import { Component, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-game',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewGameComponent {
  // Signaux pour la création de personnage
  selectedClass = signal('Guerrier');
  selectedRace = signal('Humain');
  characterName = signal('');
  difficulty = signal('Normal');
  
  // Classes disponibles
  classes = [
    'Guerrier', 'Mage', 'Archer', 'Voleur', 'Clerc', 'Chevalier'
  ];
  
  // Races disponibles
  races = [
    'Humain', 'Elfe', 'Nain', 'Halfelin'
  ];
  
  // Niveaux de difficulté
  difficulties = [
    'Facile', 'Normal', 'Difficile', 'Expert'
  ];
  
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