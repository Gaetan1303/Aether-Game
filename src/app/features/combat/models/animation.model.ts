import { Position3D } from './position-3d.model';
import { IsoCoords } from './iso-coordinates.model';

export interface Animation {
  id: string;
  type: AnimationType;
  sourcePosition?: Position3D;
  targetPosition?: Position3D;
  unitId?: string;
  duration: number;
  delay: number;
  easing: EasingFunction;
  loop: boolean;
  autoReverse: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  parameters: AnimationParameters;
}

export interface AnimationParameters {
  // Movement animations
  path?: Position3D[];
  speed?: number;
  
  // Visual effects
  color?: number;
  alpha?: number;
  scale?: number;
  rotation?: number;
  
  // Particle effects
  particleCount?: number;
  particleLifetime?: number;
  particleSpeed?: number;
  particleSize?: number;
  
  // Screen effects
  shakeIntensity?: number;
  flashColor?: number;
  flashDuration?: number;
  
  // Damage numbers
  damageValue?: number;
  fontSize?: number;
  fontColor?: number;
  
  // Special effects
  effectSprite?: string;
  soundEffect?: string;
  
  // Custom properties
  [key: string]: any;
}

export enum AnimationType {
  // Unit animations
  UNIT_MOVE = 'unit_move',
  UNIT_ATTACK = 'unit_attack',
  UNIT_CAST = 'unit_cast',
  UNIT_DEFEND = 'unit_defend',
  UNIT_DAMAGE = 'unit_damage',
  UNIT_HEAL = 'unit_heal',
  UNIT_DEATH = 'unit_death',
  UNIT_REVIVE = 'unit_revive',
  UNIT_IDLE = 'unit_idle',
  
  // Effect animations
  PROJECTILE = 'projectile',
  EXPLOSION = 'explosion',
  AREA_EFFECT = 'area_effect',
  BEAM = 'beam',
  AURA = 'aura',
  SHIELD = 'shield',
  
  // UI animations
  DAMAGE_NUMBER = 'damage_number',
  HEALING_NUMBER = 'healing_number',
  EXPERIENCE_GAIN = 'experience_gain',
  GOLD_GAIN = 'gold_gain',
  
  // Environment animations
  TERRAIN_CHANGE = 'terrain_change',
  WEATHER_EFFECT = 'weather_effect',
  LIGHTING_CHANGE = 'lighting_change',
  
  // Camera animations
  CAMERA_PAN = 'camera_pan',
  CAMERA_ZOOM = 'camera_zoom',
  CAMERA_SHAKE = 'camera_shake',
  
  // Screen effects
  SCREEN_FLASH = 'screen_flash',
  SCREEN_FADE = 'screen_fade',
  SCREEN_BLUR = 'screen_blur'
}

export enum EasingFunction {
  LINEAR = 'linear',
  EASE_IN = 'easeIn',
  EASE_OUT = 'easeOut',
  EASE_IN_OUT = 'easeInOut',
  EASE_IN_BACK = 'easeInBack',
  EASE_OUT_BACK = 'easeOutBack',
  EASE_IN_OUT_BACK = 'easeInOutBack',
  EASE_IN_BOUNCE = 'easeInBounce',
  EASE_OUT_BOUNCE = 'easeOutBounce',
  EASE_IN_OUT_BOUNCE = 'easeInOutBounce',
  EASE_IN_ELASTIC = 'easeInElastic',
  EASE_OUT_ELASTIC = 'easeOutElastic',
  EASE_IN_OUT_ELASTIC = 'easeInOutElastic'
}

export interface AnimationChain {
  id: string;
  animations: Animation[];
  mode: ChainMode;
  currentIndex: number;
  onChainComplete?: () => void;
  onAnimationComplete?: (animation: Animation, index: number) => void;
}

export enum ChainMode {
  SEQUENCE = 'sequence',     // Animations jouées une après l'autre
  PARALLEL = 'parallel',     // Animations jouées en parallèle
  MIXED = 'mixed'            // Certaines en parallèle, d'autres en séquence
}

// Animation preset configurations
export const AnimationPresets = {
  // Unit movement
  UNIT_WALK: {
    type: AnimationType.UNIT_MOVE,
    duration: 800,
    easing: EasingFunction.EASE_IN_OUT,
    parameters: { speed: 2 }
  },
  
  UNIT_RUN: {
    type: AnimationType.UNIT_MOVE,
    duration: 500,
    easing: EasingFunction.EASE_IN_OUT,
    parameters: { speed: 3 }
  },
  
  // Combat animations
  MELEE_ATTACK: {
    type: AnimationType.UNIT_ATTACK,
    duration: 600,
    easing: EasingFunction.EASE_OUT,
    parameters: { 
      scale: 1.2,
      shakeIntensity: 5,
      soundEffect: 'sword_hit'
    }
  },
  
  MAGIC_CAST: {
    type: AnimationType.UNIT_CAST,
    duration: 1200,
    easing: EasingFunction.EASE_IN_OUT,
    parameters: {
      color: 0x4488ff,
      particleCount: 20,
      effectSprite: 'magic_circle'
    }
  },
  
  // Damage effects
  PHYSICAL_DAMAGE: {
    type: AnimationType.DAMAGE_NUMBER,
    duration: 1000,
    easing: EasingFunction.EASE_OUT_BOUNCE,
    parameters: {
      fontSize: 24,
      fontColor: 0xff4444,
      shakeIntensity: 3
    }
  },
  
  MAGICAL_DAMAGE: {
    type: AnimationType.DAMAGE_NUMBER,
    duration: 1200,
    easing: EasingFunction.EASE_OUT_ELASTIC,
    parameters: {
      fontSize: 26,
      fontColor: 0x4488ff,
      particleCount: 10
    }
  },
  
  HEALING: {
    type: AnimationType.HEALING_NUMBER,
    duration: 1500,
    easing: EasingFunction.EASE_OUT,
    parameters: {
      fontSize: 22,
      fontColor: 0x44ff44,
      particleCount: 15,
      effectSprite: 'heal_sparkle'
    }
  }
} as const;

// Factory functions
export function createAnimation(config: Partial<Animation>): Animation {
  return {
    id: config.id || generateAnimationId(),
    type: config.type || AnimationType.UNIT_IDLE,
    sourcePosition: config.sourcePosition,
    targetPosition: config.targetPosition,
    unitId: config.unitId,
    duration: config.duration || 1000,
    delay: config.delay || 0,
    easing: config.easing || EasingFunction.LINEAR,
    loop: config.loop || false,
    autoReverse: config.autoReverse || false,
    onComplete: config.onComplete,
    onStart: config.onStart,
    onUpdate: config.onUpdate,
    parameters: config.parameters || {}
  };
}

export function createAnimationChain(animations: Animation[], mode: ChainMode = ChainMode.SEQUENCE): AnimationChain {
  return {
    id: generateAnimationChainId(),
    animations,
    mode,
    currentIndex: 0
  };
}

export function generateAnimationId(): string {
  return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export function generateAnimationChainId(): string {
  return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Utility functions
export function calculateAnimationEndTime(animation: Animation): number {
  return animation.delay + animation.duration;
}

export function isAnimationFinished(animation: Animation, currentTime: number, startTime: number): boolean {
  const elapsed = currentTime - startTime;
  return elapsed >= calculateAnimationEndTime(animation);
}

export function getAnimationProgress(animation: Animation, currentTime: number, startTime: number): number {
  const elapsed = currentTime - startTime - animation.delay;
  if (elapsed <= 0) return 0;
  if (elapsed >= animation.duration) return 1;
  return elapsed / animation.duration;
}

export function applyEasing(progress: number, easing: EasingFunction): number {
  switch (easing) {
    case EasingFunction.LINEAR:
      return progress;
    case EasingFunction.EASE_IN:
      return progress * progress;
    case EasingFunction.EASE_OUT:
      return 1 - Math.pow(1 - progress, 2);
    case EasingFunction.EASE_IN_OUT:
      return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case EasingFunction.EASE_OUT_BOUNCE:
      const n1 = 7.5625;
      const d1 = 2.75;
      if (progress < 1 / d1) {
        return n1 * progress * progress;
      } else if (progress < 2 / d1) {
        return n1 * (progress -= 1.5 / d1) * progress + 0.75;
      } else if (progress < 2.5 / d1) {
        return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
      } else {
        return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
      }
    default:
      return progress;
  }
}