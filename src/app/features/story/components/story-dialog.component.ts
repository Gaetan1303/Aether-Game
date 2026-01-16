import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { StoryService } from '../services/story.service';
import { DialogNode, Story } from '../models/story.models';

@Component({
  selector: 'app-story-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-dialog.component.html',
  styleUrls: ['./story-dialog.component.scss']
})
export class StoryDialogComponent implements OnInit, OnDestroy {
  storyService = inject(StoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signaux locaux
  isTextAnimating = signal<boolean>(false);
  displayedText = signal<string>('');
  private fullText = '';
  private textIndex = 0;
  private animationInterval?: ReturnType<typeof setInterval>;

  // Accès aux signaux du service
  readonly story = this.storyService.story;
  readonly currentNode = this.storyService.node;
  readonly isPlaying = this.storyService.playing;
  readonly isComplete = this.storyService.isComplete;
  readonly hasChoices = this.storyService.hasChoices;
  readonly canAdvance = this.storyService.canAdvance;

  // Vitesse d'animation du texte (ms par caractère)
  readonly textSpeed = 30;

  ngOnInit(): void {
    console.log('StoryDialogComponent initialized');
    
    // Vérifier si une histoire est déjà en cours
    if (!this.isPlaying()) {
      // Charger l'histoire d'introduction par défaut
      this.loadIntroductionStory();
    }
    
    // Observer les changements de nœud pour animer le texte
    const node = this.currentNode();
    if (node) {
      this.startTextAnimation(node.text);
    }
  }
  
  /**
   * Charger l'histoire d'introduction (démo MVP)
   */
  private loadIntroductionStory(): void {
    const playerName = localStorage.getItem('currentPlayerName') || 'Aventurier';
    
    const introStory: Story = {
      id: 'intro_tutorial',
      title: 'Le Début de l\'Aventure',
      description: 'Introduction au monde d\'Aether',
      initialNodeId: 'intro_01',
      nodes: [
        {
          id: 'intro_01',
          text: `Bienvenue dans le monde d'Aether, ${playerName}. Votre légende commence aujourd'hui...`,
          speaker: 'Narrateur',
          position: 'center',
          nextNodeId: 'intro_02'
        },
        {
          id: 'intro_02',
          text: 'Les ténèbres menacent le royaume. Les anciens dieux ont appelé des héros pour repousser cette menace.',
          speaker: 'Narrateur',
          position: 'center',
          nextNodeId: 'intro_03'
        },
        {
          id: 'intro_03',
          text: `${playerName}, votre première épreuve vous attend. Prouvez votre valeur dans le champ de bataille !`,
          speaker: 'Narrateur',
          position: 'center'
        }
      ],
      onComplete: () => {
        console.log('Histoire d\'introduction terminée');
      }
    };
    
    this.storyService.startStory(introStory);
  }

  ngOnDestroy(): void {
    this.stopTextAnimation();
  }

  /**
   * Démarrer l'animation du texte
   */
  private startTextAnimation(text: string): void {
    this.stopTextAnimation();
    
    this.fullText = text;
    this.textIndex = 0;
    this.displayedText.set('');
    this.isTextAnimating.set(true);

    this.animationInterval = setInterval(() => {
      if (this.textIndex < this.fullText.length) {
        this.displayedText.set(this.fullText.substring(0, this.textIndex + 1));
        this.textIndex++;
      } else {
        this.stopTextAnimation();
      }
    }, this.textSpeed);
  }

  /**
   * Arrêter l'animation du texte
   */
  private stopTextAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = undefined;
    }
    this.isTextAnimating.set(false);
  }

  /**
   * Afficher instantanément tout le texte (skip animation)
   */
  skipTextAnimation(): void {
    if (this.isTextAnimating()) {
      this.stopTextAnimation();
      this.displayedText.set(this.fullText);
    }
  }

  /**
   * Avancer au prochain dialogue
   */
  advance(): void {
    const node = this.currentNode();
    
    // Si le texte est en cours d'animation, le finir d'abord
    if (this.isTextAnimating()) {
      this.skipTextAnimation();
      return;
    }

    // Sinon, avancer
    this.storyService.advance();
    
    // Démarrer l'animation du nouveau texte
    const newNode = this.currentNode();
    if (newNode) {
      this.startTextAnimation(newNode.text);
    }

    // Si l'histoire est terminée, rediriger
    if (this.isComplete()) {
      this.onStoryComplete();
    }
  }

  /**
   * Faire un choix de dialogue
   */
  makeChoice(choiceId: string): void {
    // Terminer l'animation en cours
    this.skipTextAnimation();
    
    // Avancer avec le choix
    this.storyService.advance(choiceId);
    
    // Animer le nouveau texte
    const newNode = this.currentNode();
    if (newNode) {
      this.startTextAnimation(newNode.text);
    }

    // Vérifier si terminé
    if (this.isComplete()) {
      this.onStoryComplete();
    }
  }

  /**
   * Callback quand l'histoire est terminée
   */
  private onStoryComplete(): void {
    console.log('Story completed, transitioning to combat...');
    
    // Petite pause avant la transition
    setTimeout(() => {
      this.storyService.stopStory();
      this.router.navigate(['/combat']);
    }, 2000);
  }

  /**
   * Passer l'histoire (pour débug)
   */
  skipStory(): void {
    this.storyService.stopStory();
    this.router.navigate(['/combat']);
  }

  /**
   * Obtenir la classe CSS pour le portrait
   */
  getPortraitClass(node: DialogNode): string {
    if (!node.portrait) return '';
    return `portrait-${node.position || 'center'}`;
  }

  /**
   * Obtenir la classe CSS pour la boîte de dialogue
   */
  getDialogBoxClass(node: DialogNode): string {
    return `dialog-box-${node.position || 'center'}`;
  }
}
