// Models pour le système de personnages
export interface Character {
  id: string;
  name: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  
  // Classes et jobs
  currentJob: Job;
  unlockedJobs: Job[];
  
  // Statistiques de base
  baseStats: CharacterStats;
  bonusStats: CharacterStats;
  
  // Équipement
  equipment: Equipment;
  
  // Compétences et sorts
  abilities: Ability[];
  learnedSpells: Spell[];
  
  // État du personnage
  currentHP: number;
  maxHP: number;
  currentMP: number;
  maxMP: number;
  
  // Portrait et apparence
  portraitUrl?: string;
  spriteSheet: string;
  animations: AnimationSet;
  
  // Métadonnées
  createdAt: Date;
  lastUsed: Date;
  isNPC: boolean;
  faction?: string;
}

export interface Job {
  id: string;
  name: string;
  description: string;
  level: number;
  experience: number;
  maxLevel: number;
  
  // Statistiques de croissance
  hpGrowth: number;
  mpGrowth: number;
  statGrowth: Partial<CharacterStats>;
  
  // Compétences et équipements autorisés
  allowedWeapons: WeaponType[];
  allowedArmor: ArmorType[];
  jobAbilities: Ability[];
  
  // Prérequis
  prerequisites: JobPrerequisite[];
  
  // Apparence
  spriteModifiers: SpriteModifier[];
}

export interface CharacterStats {
  strength: number;      // Force physique
  magic: number;         // Puissance magique
  dexterity: number;     // Agilité et précision
  vitality: number;      // Points de vie et résistance
  intelligence: number;  // Points de magie et résistance magique
  luck: number;          // Chance critique et évitement
}

export interface Equipment {
  weapon?: Weapon;
  shield?: Shield;
  helmet?: Armor;
  chest?: Armor;
  gloves?: Armor;
  boots?: Armor;
  accessory1?: Accessory;
  accessory2?: Accessory;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  
  // Coûts et restrictions
  mpCost: number;
  cooldown: number;
  range: number;
  areaOfEffect: number;
  
  // Effets
  effects: AbilityEffect[];
  
  // Conditions d'apprentissage
  requiredLevel: number;
  requiredJob?: string;
  
  // Animation et visuels
  animationId: string;
  soundEffect?: string;
  visualEffect?: string;
}

export interface Spell extends Ability {
  element: ElementType;
  castTime: number;
  accuracy: number;
}

export enum AbilityType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical',
  SUPPORT = 'support',
  PASSIVE = 'passive'
}

export enum ElementType {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
  LIGHT = 'light',
  DARK = 'dark',
  NEUTRAL = 'neutral'
}

export interface AbilityEffect {
  type: EffectType;
  value: number;
  duration?: number;
  target: TargetType;
  probability: number;
}

export enum EffectType {
  DAMAGE = 'damage',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  STATUS = 'status'
}

export enum TargetType {
  SELF = 'self',
  ALLY = 'ally',
  ENEMY = 'enemy',
  ALL_ALLIES = 'all_allies',
  ALL_ENEMIES = 'all_enemies',
  ALL = 'all'
}

export interface AnimationSet {
  idle: string;
  walk: string;
  run: string;
  attack: string;
  cast: string;
  hurt: string;
  death: string;
  victory: string;
}

export interface JobPrerequisite {
  jobId: string;
  requiredLevel: number;
}

export interface SpriteModifier {
  layer: string;
  spriteKey: string;
  color?: string;
  opacity?: number;
}

// Types d'équipement
export enum WeaponType {
  SWORD = 'sword',
  AXE = 'axe',
  SPEAR = 'spear',
  BOW = 'bow',
  STAFF = 'staff',
  DAGGER = 'dagger',
  MACE = 'mace'
}

export enum ArmorType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  ROBE = 'robe'
}

// Interfaces d'équipement
export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  attack: number;
  accuracy: number;
  critical: number;
  range: number;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
  rarity: ItemRarity;
  value: number;
}

export interface Shield {
  id: string;
  name: string;
  defense: number;
  magicDefense: number;
  blockChance: number;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
  rarity: ItemRarity;
  value: number;
}

export interface Armor {
  id: string;
  name: string;
  type: ArmorType;
  defense: number;
  magicDefense: number;
  statBonus: Partial<CharacterStats>;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
  rarity: ItemRarity;
  value: number;
}

export interface Accessory {
  id: string;
  name: string;
  statBonus: Partial<CharacterStats>;
  specialEffects: SpecialEffect[];
  enchantments: Enchantment[];
  rarity: ItemRarity;
  value: number;
}

export interface Enchantment {
  id: string;
  name: string;
  description: string;
  effect: EnchantmentEffect;
  level: number;
  maxLevel: number;
}

export interface EnchantmentEffect {
  type: 'stat' | 'ability' | 'resistance' | 'special';
  stat?: keyof CharacterStats;
  value: number;
  abilityId?: string;
  element?: ElementType;
}

export interface SpecialEffect {
  id: string;
  name: string;
  description: string;
  trigger: EffectTrigger;
  effect: AbilityEffect;
}

export enum EffectTrigger {
  ON_ATTACK = 'on_attack',
  ON_DEFEND = 'on_defend',
  ON_CRITICAL = 'on_critical',
  ON_KILL = 'on_kill',
  START_TURN = 'start_turn',
  END_TURN = 'end_turn'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

// Factory functions
export function createCharacter(params: Partial<Character>): Character {
  return {
    id: params.id || crypto.randomUUID(),
    name: params.name || 'Unnamed Character',
    level: params.level || 1,
    experience: params.experience || 0,
    nextLevelExp: calculateNextLevelExp(params.level || 1),
    
    currentJob: params.currentJob || createDefaultJob(),
    unlockedJobs: params.unlockedJobs || [createDefaultJob()],
    
    baseStats: params.baseStats || createDefaultStats(),
    bonusStats: params.bonusStats || createEmptyStats(),
    
    equipment: params.equipment || createEmptyEquipment(),
    
    abilities: params.abilities || [],
    learnedSpells: params.learnedSpells || [],
    
    currentHP: params.currentHP || 100,
    maxHP: params.maxHP || 100,
    currentMP: params.currentMP || 50,
    maxMP: params.maxMP || 50,
    
    spriteSheet: params.spriteSheet || 'default-character',
    animations: params.animations || createDefaultAnimations(),
    
    createdAt: params.createdAt || new Date(),
    lastUsed: params.lastUsed || new Date(),
    isNPC: params.isNPC || false,
    faction: params.faction
  };
}

export function createDefaultJob(): Job {
  return {
    id: 'squire',
    name: 'Squire',
    description: 'A basic warrior class',
    level: 1,
    experience: 0,
    maxLevel: 99,
    
    hpGrowth: 1.2,
    mpGrowth: 0.8,
    statGrowth: {
      strength: 1.1,
      dexterity: 1.0,
      vitality: 1.2,
      intelligence: 0.8,
      magic: 0.7,
      luck: 1.0
    },
    
    allowedWeapons: [WeaponType.SWORD, WeaponType.SPEAR],
    allowedArmor: [ArmorType.LIGHT, ArmorType.MEDIUM, ArmorType.HEAVY],
    jobAbilities: [],
    
    prerequisites: [],
    spriteModifiers: []
  };
}

export function createDefaultStats(): CharacterStats {
  return {
    strength: 10,
    magic: 8,
    dexterity: 10,
    vitality: 12,
    intelligence: 8,
    luck: 10
  };
}

export function createEmptyStats(): CharacterStats {
  return {
    strength: 0,
    magic: 0,
    dexterity: 0,
    vitality: 0,
    intelligence: 0,
    luck: 0
  };
}

export function createEmptyEquipment(): Equipment {
  return {};
}

export function createDefaultAnimations(): AnimationSet {
  return {
    idle: 'idle',
    walk: 'walk',
    run: 'run',
    attack: 'attack',
    cast: 'cast',
    hurt: 'hurt',
    death: 'death',
    victory: 'victory'
  };
}

// Utility functions
export function calculateNextLevelExp(level: number): number {
  return Math.floor(100 * Math.pow(1.1, level - 1));
}

export function calculateTotalStats(character: Character): CharacterStats {
  const total = { ...character.baseStats };
  
  // Ajouter les bonus des stats
  Object.keys(total).forEach(stat => {
    const key = stat as keyof CharacterStats;
    total[key] += character.bonusStats[key];
  });
  
  // Ajouter les bonus d'équipement
  if (character.equipment.weapon) {
    // Les armes n'ajoutent généralement que de l'attaque, pas de stats
  }
  
  // Ajouter les bonus d'armure et d'accessoires
  [character.equipment.helmet, character.equipment.chest, 
   character.equipment.gloves, character.equipment.boots].forEach(armor => {
    if (armor && armor.statBonus) {
      Object.keys(armor.statBonus).forEach(stat => {
        const key = stat as keyof CharacterStats;
        if (armor.statBonus[key]) {
          total[key] += armor.statBonus[key]!;
        }
      });
    }
  });
  
  [character.equipment.accessory1, character.equipment.accessory2].forEach(acc => {
    if (acc && acc.statBonus) {
      Object.keys(acc.statBonus).forEach(stat => {
        const key = stat as keyof CharacterStats;
        if (acc.statBonus[key]) {
          total[key] += acc.statBonus[key]!;
        }
      });
    }
  });
  
  return total;
}

export function canLearnAbility(character: Character, ability: Ability): boolean {
  if (character.level < ability.requiredLevel) {
    return false;
  }
  
  if (ability.requiredJob && character.currentJob.id !== ability.requiredJob) {
    return false;
  }
  
  return !character.abilities.find(a => a.id === ability.id);
}

export function getEquipmentPower(equipment: Equipment): number {
  let power = 0;
  
  if (equipment.weapon) {
    power += equipment.weapon.attack;
  }
  
  if (equipment.shield) {
    power += equipment.shield.defense + equipment.shield.magicDefense;
  }
  
  [equipment.helmet, equipment.chest, equipment.gloves, equipment.boots].forEach(armor => {
    if (armor) {
      power += armor.defense + armor.magicDefense;
    }
  });
  
  return power;
}