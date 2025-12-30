import { Position3D } from './position-3d.model';

export interface Unit {
  id: string;
  name: string;
  teamId: string;
  position: Position3D;
  stats: UnitStats;
  skills: Skill[];
  statuses: Status[];
  job: Job;
  equipment: Equipment;
  spriteId: string;
  facing: Direction;
  isAlive: boolean;
}

export interface UnitStats {
  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  movement: number;
  agility: number;
  intelligence: number;
  faith: number;
  brave: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cost: number;
  range: number;
  aoeSize: number;
  power: number;
  accuracy: number;
  element: Element;
  effects: SkillEffect[];
  castTime: number;
  cooldown: number;
}

export interface Status {
  id: string;
  type: StatusType;
  duration: number;
  intensity: number;
  source: string; // ID de l'unité ou skill qui a appliqué le status
  tickDamage?: number;
  statModifiers?: Partial<UnitStats>;
}

export interface Job {
  id: string;
  name: string;
  level: number;
  experience: number;
  requiredExp: number;
  skills: string[]; // IDs des skills disponibles
  statBonuses: Partial<UnitStats>;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  statBonuses?: Partial<UnitStats>;
  skillIds?: string[];
  value: number;
}

export enum Direction {
  NORTH = 'north',
  NORTHEAST = 'northeast', 
  EAST = 'east',
  SOUTHEAST = 'southeast',
  SOUTH = 'south',
  SOUTHWEST = 'southwest',
  WEST = 'west',
  NORTHWEST = 'northwest'
}

export enum SkillType {
  ATTACK = 'attack',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  MOVEMENT = 'movement',
  SPECIAL = 'special'
}

export enum Element {
  NONE = 'none',
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
  LIGHTNING = 'lightning',
  ICE = 'ice',
  LIGHT = 'light',
  DARK = 'dark'
}

export enum StatusType {
  POISON = 'poison',
  REGEN = 'regen',
  HASTE = 'haste',
  SLOW = 'slow',
  PROTECT = 'protect',
  SHELL = 'shell',
  BERSERK = 'berserk',
  CHARM = 'charm',
  SLEEP = 'sleep',
  STUN = 'stun',
  SILENCE = 'silence',
  BLIND = 'blind'
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable'
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'status' | 'move' | 'teleport';
  value?: number;
  statusType?: StatusType;
  duration?: number;
  target?: 'self' | 'ally' | 'enemy' | 'all';
}

// Factory functions
export function createUnit(data: Partial<Unit>): Unit {
  return {
    id: data.id || '',
    name: data.name || 'Unknown',
    teamId: data.teamId || 'neutral',
    position: data.position || { x: 0, y: 0, z: 0 },
    stats: data.stats || createDefaultStats(),
    skills: data.skills || [],
    statuses: data.statuses || [],
    job: data.job || createDefaultJob(),
    equipment: data.equipment || {},
    spriteId: data.spriteId || 'default',
    facing: data.facing || Direction.SOUTH,
    isAlive: data.isAlive !== undefined ? data.isAlive : true
  };
}

export function createDefaultStats(): UnitStats {
  return {
    hp: 100,
    hpMax: 100,
    mp: 50,
    mpMax: 50,
    attack: 20,
    defense: 15,
    speed: 10,
    range: 1,
    movement: 3,
    agility: 12,
    intelligence: 10,
    faith: 50,
    brave: 50
  };
}

export function createDefaultJob(): Job {
  return {
    id: 'squire',
    name: 'Squire',
    level: 1,
    experience: 0,
    requiredExp: 100,
    skills: [],
    statBonuses: {}
  };
}

// Utility functions
export function isUnitAlive(unit: Unit): boolean {
  return unit.isAlive && unit.stats.hp > 0;
}

export function canUnitAct(unit: Unit): boolean {
  return isUnitAlive(unit) && 
         !unit.statuses.some(s => s.type === StatusType.SLEEP || s.type === StatusType.STUN);
}

export function getUnitTeam(unit: Unit): string {
  return unit.teamId;
}

export function isEnemyUnit(unit1: Unit, unit2: Unit): boolean {
  return unit1.teamId !== unit2.teamId;
}