import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-creation.component.html',
  styleUrls: ['./character-creation.component.scss']
})
export class CharacterCreationComponent {
  etape = 1;
  nom = '';
  classeSelectionnee: string | null = null;
  apparenceSelectionnee: string | null = null;

  classes = [
    { key: 'guerrier', label: 'Guerrier', icon: 'sword', desc: 'Maître du combat rapproché avec une défense solide', stats: { FOR: 8, AGI: 5, INT: 3, VIT: 7 } },
    { key: 'mage', label: 'Mage', icon: 'magic', desc: 'Lance des sorts dévastateurs à distance', stats: { FOR: 3, AGI: 4, INT: 9, VIT: 4 } },
    { key: 'archer', label: 'Archer', icon: 'target', desc: 'Expert des attaques à distance et de la précision', stats: { FOR: 5, AGI: 9, INT: 4, VIT: 5 } },
    { key: 'paladin', label: 'Paladin', icon: 'shield', desc: 'Protecteur sacré avec des capacités de soin', stats: { FOR: 6, AGI: 4, INT: 6, VIT: 8 } }
  ];

  apparences = [
    { key: 'sword', icon: 'sword' },
    { key: 'shield', icon: 'shield' },
    { key: 'bow', icon: 'bow' },
    { key: 'orb', icon: 'orb' },
    { key: 'lightning', icon: 'lightning' },
    { key: 'fire', icon: 'fire' },
    { key: 'ice', icon: 'ice' },
    { key: 'sun', icon: 'sun' }
  ];

  allerAEtape(etape: number) {
    this.etape = etape;
  }

  etapeSuivante() {
    if (this.etape < 3) this.etape++;
  }

  etapePrecedente() {
    if (this.etape > 1) this.etape--;
  }

  choisirClasse(key: string) {
    this.classeSelectionnee = key;
  }

  choisirApparence(key: string) {
    this.apparenceSelectionnee = key;
  }

  get classeCourante() {
    return this.classes.find(c => c.key === this.classeSelectionnee) || null;
  }
  get statsCourants() {
    return this.classeCourante ? this.classeCourante.stats : { FOR: 0, AGI: 0, INT: 0, VIT: 0 };
  }
  get labelClasseCourante() {
    return this.classeCourante ? this.classeCourante.label : '';
  }

  commencerAventure() {
    // TODO: Implémenter la validation et le démarrage de l'aventure
  }
}
