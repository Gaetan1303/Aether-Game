import { Unit } from './unit.model';
import { Position3D } from './position-3d.model';

export interface BattleState {
  id: string;
  participants: Unit[];
  currentTurn: number;
  activeUnitId: string | null;
  gridSize: { width: number; height: number };
  phase: BattlePhase;
  turnQueue: string[]; // IDs des unités dans l'ordre des tours
  currentTurnIndex: number;
  winner: string | null;
  rewards?: BattleRewards;
  startTime: number;
  isPlayerTurn: boolean;
  selectedAction?: SelectedAction;
  availableActions: AvailableAction[];
}

export interface SelectedAction {
  type: ActionType;
  skillId?: string;
  targetPositions: Position3D[];
  sourcePosition: Position3D;
  unitId: string;
}

export interface AvailableAction {
  type: ActionType;
  skillId?: string;
  name: string;
  description: string;
  cost: number;
  range: number;
  validTargets: Position3D[];
  requiredTargetCount: number;
}

export interface BattleRewards {
  experience: number;
  gold: number;
  items: string[]; // IDs des items
}

export enum BattlePhase {
  IDLE = 'idle',
  WAITING_ACTION = 'waiting_action',
  RESOLVING = 'resolving',
  FINISHED = 'finished'
}

export enum ActionType {
  MOVE = 'move',
  ATTACK = 'attack',
  SKILL = 'skill',
  ITEM = 'item',
  WAIT = 'wait',
  DEFEND = 'defend'
}

// Battle configuration
export interface BattleConfig {
  gridWidth: number;
  gridHeight: number;
  timeLimit?: number; // en secondes
  turnLimit?: number;
  victoryConditions: VictoryCondition[];
  terrain: TerrainTile[][];
}

export interface TerrainTile {
  type: TerrainType;
  height: number;
  passable: boolean;
  effects?: TerrainEffect[];
  spriteId: string;
}

export interface TerrainEffect {
  type: 'damage' | 'heal' | 'status' | 'movement_cost';
  value: number;
  statusType?: string;
}

export enum TerrainType {
  GRASS = 'grass',
  STONE = 'stone',
  WATER = 'water',
  LAVA = 'lava',
  ICE = 'ice',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  VOID = 'void'
}

export enum VictoryCondition {
  DEFEAT_ALL_ENEMIES = 'defeat_all_enemies',
  SURVIVE_TURNS = 'survive_turns',
  REACH_POSITION = 'reach_position',
  PROTECT_UNIT = 'protect_unit',
  COLLECT_ITEMS = 'collect_items'
}

// Factory functions
export function createBattleState(config: Partial<BattleState>): BattleState {
  return {
    id: config.id || generateBattleId(),
    participants: config.participants || [],
    currentTurn: config.currentTurn || 1,
    activeUnitId: config.activeUnitId || null,
    gridSize: config.gridSize || { width: 20, height: 20 },
    phase: config.phase || BattlePhase.IDLE,
    turnQueue: config.turnQueue || [],
    currentTurnIndex: config.currentTurnIndex || 0,
    winner: config.winner || null,
    rewards: config.rewards,
    startTime: config.startTime || Date.now(),
    isPlayerTurn: config.isPlayerTurn || false,
    selectedAction: config.selectedAction,
    availableActions: config.availableActions || []
  };
}

export function createDefaultBattleConfig(): BattleConfig {
  const gridWidth = 20;
  const gridHeight = 20;
  
  // Créer un terrain basique
  const terrain: TerrainTile[][] = [];
  for (let x = 0; x < gridWidth; x++) {
    terrain[x] = [];
    for (let y = 0; y < gridHeight; y++) {
      terrain[x][y] = {
        type: TerrainType.GRASS,
        height: 0,
        passable: true,
        spriteId: 'grass_tile'
      };
    }
  }

  return {
    gridWidth,
    gridHeight,
    timeLimit: 300, // 5 minutes
    turnLimit: 50,
    victoryConditions: [VictoryCondition.DEFEAT_ALL_ENEMIES],
    terrain
  };
}

export function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility functions
export function getActiveUnit(state: BattleState): Unit | null {
  if (!state.activeUnitId) return null;
  return state.participants.find(unit => unit.id === state.activeUnitId) || null;
}

export function getNextUnitInQueue(state: BattleState): Unit | null {
  if (state.turnQueue.length === 0) return null;
  
  const nextIndex = (state.currentTurnIndex + 1) % state.turnQueue.length;
  const nextUnitId = state.turnQueue[nextIndex];
  
  return state.participants.find(unit => unit.id === nextUnitId) || null;
}

export function isPlayerUnit(unit: Unit): boolean {
  return unit.teamId === 'player';
}

export function getAllTeams(state: BattleState): string[] {
  const teams = new Set(state.participants.map(unit => unit.teamId));
  return Array.from(teams);
}

export function getTeamUnits(state: BattleState, teamId: string): Unit[] {
  return state.participants.filter(unit => unit.teamId === teamId);
}

export function isTeamDefeated(state: BattleState, teamId: string): boolean {
  const teamUnits = getTeamUnits(state, teamId);
  return teamUnits.every(unit => !unit.isAlive || unit.stats.hp <= 0);
}

export function getRemainingTeams(state: BattleState): string[] {
  return getAllTeams(state).filter(teamId => !isTeamDefeated(state, teamId));
}

export function isBattleFinished(state: BattleState): boolean {
  return state.phase === BattlePhase.FINISHED || getRemainingTeams(state).length <= 1;
}