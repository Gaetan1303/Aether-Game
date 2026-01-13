import { Injectable, signal, computed } from '@angular/core';
import { Story, DialogNode, StoryProgress, getNextNode, isStoryComplete } from '../models/story.models';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  // État courant de l'histoire
  private currentStory = signal<Story | null>(null);
  private currentNode = signal<DialogNode | null>(null);
  private progress = signal<StoryProgress | null>(null);
  private isPlaying = signal<boolean>(false);

  // Signaux en lecture seule
  readonly story = this.currentStory.asReadonly();
  readonly node = this.currentNode.asReadonly();
  readonly playing = this.isPlaying.asReadonly();
  readonly storyProgress = this.progress.asReadonly();

  // Computed signals
  readonly isComplete = computed(() => {
    const story = this.currentStory();
    const node = this.currentNode();
    return story && node ? isStoryComplete(story, node.id) : false;
  });

  readonly hasChoices = computed(() => {
    const node = this.currentNode();
    return node ? (node.choices?.length || 0) > 0 : false;
  });

  readonly canAdvance = computed(() => {
    const node = this.currentNode();
    return node ? !!node.nextNodeId : false;
  });

  /**
   * Démarrer une nouvelle histoire
   */
  startStory(story: Story): void {
    this.currentStory.set(story);
    
    // Trouver le nœud initial
    const initialNode = story.nodes.find(n => n.id === story.initialNodeId);
    if (!initialNode) {
      console.error('Initial node not found:', story.initialNodeId);
      return;
    }

    this.currentNode.set(initialNode);
    this.isPlaying.set(true);
    
    // Initialiser la progression
    this.progress.set({
      storyId: story.id,
      currentNodeId: initialNode.id,
      completedNodeIds: [],
      choices: {},
      timestamp: Date.now()
    });

    console.log('Story started:', story.title);
  }

  /**
   * Avancer au prochain dialogue
   */
  advance(choiceId?: string): void {
    const story = this.currentStory();
    const node = this.currentNode();
    const prog = this.progress();

    if (!story || !node || !prog) {
      console.warn('Cannot advance: no active story');
      return;
    }

    // Marquer le nœud actuel comme complété
    const completedIds = [...prog.completedNodeIds, node.id];
    
    // Enregistrer le choix si présent
    const choices = { ...prog.choices };
    if (choiceId) {
      choices[node.id] = choiceId;
    }

    // Trouver le prochain nœud
    const nextNode = getNextNode(story, node.id, choiceId);
    
    if (nextNode) {
      this.currentNode.set(nextNode);
      
      // Mettre à jour la progression
      this.progress.set({
        ...prog,
        currentNodeId: nextNode.id,
        completedNodeIds: completedIds,
        choices
      });

      // Appeler le callback si présent
      if (node.onComplete) {
        node.onComplete();
      }
    } else {
      // Histoire terminée
      this.finishStory();
    }
  }

  /**
   * Terminer l'histoire
   */
  private finishStory(): void {
    const story = this.currentStory();
    const node = this.currentNode();
    
    console.log('Story completed:', story?.title);
    
    // Appeler le callback de fin d'histoire
    if (story?.onComplete) {
      story.onComplete();
    }
    
    // Appeler le callback du dernier nœud
    if (node?.onComplete) {
      node.onComplete();
    }
    
    this.isPlaying.set(false);
  }

  /**
   * Arrêter l'histoire en cours
   */
  stopStory(): void {
    this.currentStory.set(null);
    this.currentNode.set(null);
    this.progress.set(null);
    this.isPlaying.set(false);
  }

  /**
   * Sauvegarder la progression
   */
  saveProgress(): void {
    const prog = this.progress();
    if (prog) {
      localStorage.setItem(`story_progress_${prog.storyId}`, JSON.stringify(prog));
      console.log('Story progress saved');
    }
  }

  /**
   * Charger une progression sauvegardée
   */
  loadProgress(storyId: string): StoryProgress | null {
    const saved = localStorage.getItem(`story_progress_${storyId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load story progress:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Reprendre une histoire depuis la progression sauvegardée
   */
  resumeStory(story: Story, progress: StoryProgress): void {
    this.currentStory.set(story);
    this.progress.set(progress);
    
    const currentNode = story.nodes.find(n => n.id === progress.currentNodeId);
    if (currentNode) {
      this.currentNode.set(currentNode);
      this.isPlaying.set(true);
      console.log('Story resumed:', story.title);
    } else {
      console.error('Cannot resume: current node not found');
    }
  }

  /**
   * Réinitialiser le service
   */
  reset(): void {
    this.stopStory();
  }
}
