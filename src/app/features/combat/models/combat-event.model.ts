import { Position3D } from './position-3d.model';
import { Unit } from './unit.model';

export type CombatEvent = 
  | CombatStartedEvent
  | TurnStartedEvent
  | ActionResolvedEvent
  | DamageAppliedEvent
  | HealingAppliedEvent
  | UnitMovedEvent
  | StatusAppliedEvent
  | StatusRemovedEvent
  | SkillUsedEvent
  | UnitDefeatedEvent
  | CombatEndedEvent
  | TerrainChangedEvent
  | AnimationEvent;

export interface BaseCombatEvent {
  type: string;
  combatId: string;
  timestamp: number;
  turnNumber: number;
  sequence: number; // Pour ordonner les événements dans le même timestamp
}

export interface CombatStartedEvent extends BaseCombatEvent {
  type: 'CombatCommencé';
  participants: string[]; // IDs des unités
  gridSize: { width: number; height: number };
  initialPositions: Record<string, Position3D>;
}

export interface TurnStartedEvent extends BaseCombatEvent {
  type: 'TourCommencé';
  unitId: string;
  availableActions: string[]; // IDs des actions disponibles
  timeLimit?: number;
}

export interface ActionResolvedEvent extends BaseCombatEvent {
  type: 'ActionRésolue';
  sourceId: string;
  targetIds: string[];
  skillId?: string;
  actionType: 'move' | 'attack' | 'skill' | 'item' | 'wait' | 'defend';
  success: boolean;
  effects: ActionEffect[];
}

export interface DamageAppliedEvent extends BaseCombatEvent {
  type: 'DégâtsAppliqués';
  targetId: string;
  sourceId: string;
  damage: number;
  damageType: 'physical' | 'magical' | 'true' | 'poison' | 'fire' | 'ice';
  hpBefore: number;
  hpAfter: number;
  wasCritical: boolean;
  wasBlocked: boolean;
  element?: string;
}

export interface HealingAppliedEvent extends BaseCombatEvent {
  type: 'SoinsAppliqués';
  targetId: string;
  sourceId: string;
  healing: number;
  hpBefore: number;
  hpAfter: number;
  mpBefore?: number;
  mpAfter?: number;
}

export interface UnitMovedEvent extends BaseCombatEvent {
  type: 'UnitéDéplacée';
  unitId: string;
  from: Position3D;
  to: Position3D;
  path: Position3D[];
  movementCost: number;
}

export interface StatusAppliedEvent extends BaseCombatEvent {
  type: 'StatutAppliqué';
  targetId: string;
  sourceId: string;
  statusType: string;
  duration: number;
  intensity: number;
  stackable: boolean;
}

export interface StatusRemovedEvent extends BaseCombatEvent {
  type: 'StatutRetiré';
  targetId: string;
  statusType: string;
  reason: 'expired' | 'dispelled' | 'replaced' | 'death';
}

export interface SkillUsedEvent extends BaseCombatEvent {
  type: 'CompétenceUtilisée';
  sourceId: string;
  skillId: string;
  targetPositions: Position3D[];
  mpCost: number;
  castTime: number;
  interrupted: boolean;
}

export interface UnitDefeatedEvent extends BaseCombatEvent {
  type: 'UnitéVaincue';
  unitId: string;
  killerId?: string;
  revivable: boolean;
  experienceGained: Record<string, number>; // unitId -> exp
  itemsDropped: string[];
}

export interface CombatEndedEvent extends BaseCombatEvent {
  type: 'CombatTerminé';
  winnerId: string; // teamId gagnant
  reason: 'defeat_all' | 'timeout' | 'surrender' | 'objective_complete';
  rewards: BattleRewards;
  battleStats: BattleStatistics;
}

export interface TerrainChangedEvent extends BaseCombatEvent {
  type: 'TerrainModifié';
  position: Position3D;
  oldType: string;
  newType: string;
  sourceId?: string;
  duration?: number;
}

export interface AnimationEvent extends BaseCombatEvent {
  type: 'Animation';
  animationType: 'attack' | 'skill' | 'movement' | 'damage' | 'heal' | 'death' | 'effect';
  sourceId?: string;
  targetId?: string;
  position?: Position3D;
  duration: number;
  parameters: Record<string, any>;
}

// Supporting interfaces
export interface ActionEffect {
  type: 'damage' | 'heal' | 'status' | 'move' | 'stat_change';
  targetId: string;
  value?: number;
  statusType?: string;
  duration?: number;
  statType?: string;
}

export interface BattleRewards {
  experience: number;
  gold: number;
  items: string[];
  jobPoints: Record<string, number>; // jobId -> points
}

export interface BattleStatistics {
  totalTurns: number;
  duration: number; // en millisecondes
  damageDealt: Record<string, number>; // unitId -> damage
  healingDone: Record<string, number>; // unitId -> healing
  skillsUsed: Record<string, number>; // skillId -> count
  unitsDefeated: Record<string, number>; // teamId -> count
}

// Event creation helpers
export function createCombatStartedEvent(
  combatId: string,
  participants: Unit[],
  gridSize: { width: number; height: number }
): CombatStartedEvent {
  const initialPositions: Record<string, Position3D> = {};
  participants.forEach(unit => {
    initialPositions[unit.id] = unit.position;
  });

  return {
    type: 'CombatCommencé',
    combatId,
    timestamp: Date.now(),
    turnNumber: 0,
    sequence: 0,
    participants: participants.map(u => u.id),
    gridSize,
    initialPositions
  };
}

export function createTurnStartedEvent(
  combatId: string,
  unitId: string,
  turnNumber: number,
  availableActions: string[],
  timeLimit?: number
): TurnStartedEvent {
  return {
    type: 'TourCommencé',
    combatId,
    timestamp: Date.now(),
    turnNumber,
    sequence: 0,
    unitId,
    availableActions,
    timeLimit
  };
}

export function createDamageAppliedEvent(
  combatId: string,
  targetId: string,
  sourceId: string,
  damage: number,
  hpBefore: number,
  hpAfter: number,
  turnNumber: number,
  damageType: DamageAppliedEvent['damageType'] = 'physical'
): DamageAppliedEvent {
  return {
    type: 'DégâtsAppliqués',
    combatId,
    timestamp: Date.now(),
    turnNumber,
    sequence: 0,
    targetId,
    sourceId,
    damage,
    damageType,
    hpBefore,
    hpAfter,
    wasCritical: false,
    wasBlocked: false
  };
}

// Event validation
export function isValidCombatEvent(event: any): event is CombatEvent {
  return event &&
         typeof event.type === 'string' &&
         typeof event.combatId === 'string' &&
         typeof event.timestamp === 'number' &&
         typeof event.turnNumber === 'number' &&
         typeof event.sequence === 'number';
}

// Event serialization
export function serializeCombatEvent(event: CombatEvent): string {
  return JSON.stringify(event);
}

export function deserializeCombatEvent(data: string): CombatEvent | null {
  try {
    const event = JSON.parse(data);
    return isValidCombatEvent(event) ? event : null;
  } catch {
    return null;
  }
}