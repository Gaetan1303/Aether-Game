import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as GSAP from 'gsap';
import { Animation, AnimationChain, AnimationType, ChainMode } from '../models/animation.model';

export interface QueuedAnimation {
  animation: Animation;
  startTime: number;
  tween?: gsap.core.Tween;
  status: 'pending' | 'playing' | 'completed' | 'cancelled';
}

@Injectable({ providedIn: 'root' })
export class AnimationQueueService {
  private animationQueue: QueuedAnimation[] = [];
  private chainQueue: AnimationChain[] = [];
  private currentlyPlaying = new Map<string, QueuedAnimation>();
  
  // Observables pour l'état des animations
  private queueStatus$ = new BehaviorSubject({ 
    queueLength: 0, 
    playing: 0, 
    completed: 0 
  });
  
  private animationComplete$ = new Subject<{ animation: Animation, success: boolean }>();
  private chainComplete$ = new Subject<{ chain: AnimationChain, success: boolean }>();
  
  // Configuration
  private maxConcurrentAnimations = 10;
  private isProcessing = false;
  
  constructor() {
    this.startProcessingLoop();
  }

  /**
   * Ajoute une animation à la file d'attente
   */
  enqueueAnimation(animation: Animation): string {
    const queued: QueuedAnimation = {
      animation,
      startTime: Date.now() + animation.delay,
      status: 'pending'
    };
    
    this.animationQueue.push(queued);
    this.updateStatus();
    
    console.log(`Animation ${animation.id} enqueued (type: ${animation.type})`);
    return animation.id;
  }

  /**
   * Ajoute plusieurs animations à la file d'attente
   */
  enqueueAnimations(animations: Animation[]): string[] {
    const ids: string[] = [];
    
    animations.forEach(animation => {
      const id = this.enqueueAnimation(animation);
      ids.push(id);
    });
    
    return ids;
  }

  /**
   * Ajoute une chaîne d'animations
   */
  enqueueAnimationChain(chain: AnimationChain): string {
    this.chainQueue.push(chain);
    
    if (chain.mode === ChainMode.SEQUENCE) {
      this.processSequentialChain(chain);
    } else if (chain.mode === ChainMode.PARALLEL) {
      this.processParallelChain(chain);
    } else {
      this.processMixedChain(chain);
    }
    
    console.log(`Animation chain ${chain.id} enqueued (${chain.animations.length} animations, mode: ${chain.mode})`);
    return chain.id;
  }

  /**
   * Annule une animation spécifique
   */
  cancelAnimation(animationId: string): boolean {
    // Chercher dans la queue
    const queueIndex = this.animationQueue.findIndex(q => q.animation.id === animationId);
    if (queueIndex >= 0) {
      this.animationQueue.splice(queueIndex, 1);
      this.updateStatus();
      return true;
    }
    
    // Chercher dans les animations en cours
    const playing = this.currentlyPlaying.get(animationId);
    if (playing) {
      playing.status = 'cancelled';
      if (playing.tween) {
        playing.tween.kill();
      }
      this.currentlyPlaying.delete(animationId);
      this.updateStatus();
      return true;
    }
    
    return false;
  }

  /**
   * Annule toutes les animations
   */
  cancelAllAnimations(): void {
    // Vider la queue
    this.animationQueue.length = 0;
    
    // Arrêter les animations en cours
    this.currentlyPlaying.forEach((playing) => {
      if (playing.tween) {
        playing.tween.kill();
      }
    });
    
    this.currentlyPlaying.clear();
    this.chainQueue.length = 0;
    
    this.updateStatus();
    console.log('All animations cancelled');
  }

  /**
   * Pause toutes les animations
   */
  pauseAllAnimations(): void {
    this.currentlyPlaying.forEach((playing) => {
      if (playing.tween) {
        playing.tween.pause();
      }
    });
    
    console.log('All animations paused');
  }

  /**
   * Reprend toutes les animations
   */
  resumeAllAnimations(): void {
    this.currentlyPlaying.forEach((playing) => {
      if (playing.tween) {
        playing.tween.resume();
      }
    });
    
    console.log('All animations resumed');
  }

  /**
   * Vérifie si une animation est en cours
   */
  isAnimationPlaying(animationId: string): boolean {
    return this.currentlyPlaying.has(animationId);
  }

  /**
   * Vérifie si des animations sont en cours
   */
  hasActiveAnimations(): boolean {
    return this.currentlyPlaying.size > 0 || this.animationQueue.length > 0;
  }

  /**
   * Obtient le statut de la queue
   */
  getQueueStatus(): Observable<any> {
    return this.queueStatus$.asObservable();
  }

  /**
   * Observable pour les animations terminées
   */
  onAnimationComplete(): Observable<{ animation: Animation, success: boolean }> {
    return this.animationComplete$.asObservable();
  }

  /**
   * Observable pour les chaînes terminées
   */
  onChainComplete(): Observable<{ chain: AnimationChain, success: boolean }> {
    return this.chainComplete$.asObservable();
  }

  private startProcessingLoop(): void {
    const processLoop = () => {
      if (!this.isProcessing) {
        this.processAnimationQueue();
      }
      requestAnimationFrame(processLoop);
    };
    
    processLoop();
  }

  private processAnimationQueue(): void {
    if (this.animationQueue.length === 0) return;
    
    const now = Date.now();
    const readyAnimations = this.animationQueue.filter(
      queued => queued.startTime <= now && 
                queued.status === 'pending' &&
                this.currentlyPlaying.size < this.maxConcurrentAnimations
    );
    
    readyAnimations.forEach(queued => {
      this.startAnimation(queued);
      
      // Retirer de la queue
      const index = this.animationQueue.indexOf(queued);
      if (index >= 0) {
        this.animationQueue.splice(index, 1);
      }
    });
    
    if (readyAnimations.length > 0) {
      this.updateStatus();
    }
  }

  private startAnimation(queued: QueuedAnimation): void {
    const { animation } = queued;
    
    queued.status = 'playing';
    this.currentlyPlaying.set(animation.id, queued);
    
    // Callback de début
    if (animation.onStart) {
      animation.onStart();
    }
    
    // Créer le tween GSAP
    queued.tween = this.createTween(animation);
    
    console.log(`Started animation ${animation.id} (${animation.type})`);
  }

  private createTween(animation: Animation): gsap.core.Tween {
    const target = this.getAnimationTarget(animation);
    const properties = this.getAnimationProperties(animation);
    
    const tween = GSAP.gsap.to(target, {
      ...properties,
      duration: animation.duration / 1000, // GSAP utilise les secondes
      ease: this.getGSAPEasing(animation.easing),
      repeat: animation.loop ? -1 : 0,
      yoyo: animation.autoReverse,
      onUpdate: () => {
        if (animation.onUpdate) {
          const progress = tween.progress();
          animation.onUpdate(progress);
        }
      },
      onComplete: () => {
        this.completeAnimation(animation.id, true);
      },
      onInterrupt: () => {
        this.completeAnimation(animation.id, false);
      }
    });
    
    return tween;
  }

  private getAnimationTarget(animation: Animation): any {
    // TODO: Implémenter la logique pour obtenir la cible selon le type d'animation
    switch (animation.type) {
      case AnimationType.UNIT_MOVE:
      case AnimationType.UNIT_ATTACK:
      case AnimationType.UNIT_DAMAGE:
        // Retourner le sprite de l'unité
        return { x: 0, y: 0 }; // Placeholder
      
      case AnimationType.CAMERA_PAN:
      case AnimationType.CAMERA_ZOOM:
        // Retourner l'objet caméra
        return { x: 0, y: 0, zoom: 1 }; // Placeholder
      
      default:
        return {};
    }
  }

  private getAnimationProperties(animation: Animation): any {
    const props: any = {};
    
    // Propriétés communes
    if (animation.parameters.alpha !== undefined) {
      props.alpha = animation.parameters.alpha;
    }
    
    if (animation.parameters.scale !== undefined) {
      props.scaleX = animation.parameters.scale;
      props.scaleY = animation.parameters.scale;
    }
    
    if (animation.parameters.rotation !== undefined) {
      props.rotation = animation.parameters.rotation;
    }
    
    // Propriétés spécifiques selon le type
    switch (animation.type) {
      case AnimationType.UNIT_MOVE:
        if (animation.targetPosition) {
          // TODO: Convertir en coordonnées isométriques
          props.x = animation.targetPosition.x;
          props.y = animation.targetPosition.y;
        }
        break;
        
      case AnimationType.SCREEN_FADE:
        props.alpha = animation.parameters.alpha || 0;
        break;
        
      case AnimationType.SCREEN_FLASH:
        props.tint = animation.parameters.flashColor || 0xFFFFFF;
        break;
    }
    
    return props;
  }

  private getGSAPEasing(easing: string): string {
    // Conversion des easings personnalisés vers GSAP
    const easingMap: Record<string, string> = {
      'linear': 'none',
      'easeIn': 'power2.in',
      'easeOut': 'power2.out',
      'easeInOut': 'power2.inOut',
      'easeInBack': 'back.in(1.7)',
      'easeOutBack': 'back.out(1.7)',
      'easeInOutBack': 'back.inOut(1.7)',
      'easeOutBounce': 'bounce.out',
      'easeOutElastic': 'elastic.out(1, 0.3)'
    };
    
    return easingMap[easing] || 'none';
  }

  private completeAnimation(animationId: string, success: boolean): void {
    const playing = this.currentlyPlaying.get(animationId);
    if (!playing) return;
    
    playing.status = success ? 'completed' : 'cancelled';
    this.currentlyPlaying.delete(animationId);
    
    // Callback de fin
    if (playing.animation.onComplete && success) {
      playing.animation.onComplete();
    }
    
    // Émettre l'événement
    this.animationComplete$.next({
      animation: playing.animation,
      success
    });
    
    this.updateStatus();
    console.log(`Animation ${animationId} ${success ? 'completed' : 'cancelled'}`);
  }

  private processSequentialChain(chain: AnimationChain): void {
    // TODO: Implémenter les chaînes séquentielles
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= chain.animations.length) {
        this.chainComplete$.next({ chain, success: true });
        return;
      }
      
      const animation = chain.animations[currentIndex];
      this.enqueueAnimation(animation);
      
      // Observer la completion de cette animation
      const sub = this.onAnimationComplete().subscribe(({ animation: completedAnimation, success }) => {
        if (completedAnimation.id === animation.id) {
          sub.unsubscribe();
          if (success) {
            currentIndex++;
            playNext();
          } else {
            this.chainComplete$.next({ chain, success: false });
          }
        }
      });
    };
    
    playNext();
  }

  private processParallelChain(chain: AnimationChain): void {
    // TODO: Implémenter les chaînes parallèles
    const animationIds = chain.animations.map(anim => this.enqueueAnimation(anim));
    let completedCount = 0;
    let hasFailure = false;
    
    const sub = this.onAnimationComplete().subscribe(({ animation, success }) => {
      if (animationIds.includes(animation.id)) {
        completedCount++;
        if (!success) hasFailure = true;
        
        if (completedCount === chain.animations.length) {
          sub.unsubscribe();
          this.chainComplete$.next({ chain, success: !hasFailure });
        }
      }
    });
  }

  private processMixedChain(chain: AnimationChain): void {
    // TODO: Implémenter les chaînes mixtes avec configuration personnalisée
    console.log('Mixed chain processing not implemented yet');
    this.chainComplete$.next({ chain, success: false });
  }

  private updateStatus(): void {
    this.queueStatus$.next({
      queueLength: this.animationQueue.length,
      playing: this.currentlyPlaying.size,
      completed: 0 // TODO: Tracker les animations terminées
    });
  }

  /**
   * Nettoyage des ressources
   */
  destroy(): void {
    this.cancelAllAnimations();
    this.queueStatus$.complete();
    this.animationComplete$.complete();
    this.chainComplete$.complete();
    
    console.log('AnimationQueueService destroyed');
  }

  // TODO: Ajouter priorités d'animations
  // TODO: Ajouter groupes d'animations
  // TODO: Ajouter présets d'animations complexes
  // TODO: Ajouter debug et monitoring avancé
}