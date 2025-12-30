import { Shop } from '../../inventory/models/inventory.models';
import { AnimationSet } from '../../character/models/character.models';

// Models pour le système de monde
export interface WorldMap {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  
  // Zones du monde
  zones: Zone[];
  
  // Connexions entre les zones
  connections: ZoneConnection[];
  
  // Points d'intérêt globaux
  landmarks: Landmark[];
  
  // Système météorologique
  weather: WeatherSystem;
  
  // Cycle jour/nuit
  timeSystem: TimeSystem;
  
  // Métadonnées
  createdAt: Date;
  lastModified: Date;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  type: ZoneType;
  
  // Position sur la carte du monde
  worldX: number;
  worldY: number;
  
  // Dimensions de la zone
  width: number;
  height: number;
  
  // Niveau recommandé
  minLevel: number;
  maxLevel: number;
  
  // Terrain et environnement
  terrain: TerrainData;
  environment: EnvironmentData;
  
  // Points d'entrée/sortie
  entrances: ZoneEntrance[];
  exits: ZoneExit[];
  
  // Points d'intérêt dans la zone
  pointsOfInterest: PointOfInterest[];
  
  // NPCs présents
  npcs: NPC[];
  
  // Objets dans la zone
  worldObjects: WorldObject[];
  
  // Spawns d'ennemis
  enemySpawns: EnemySpawn[];
  
  // Ressources récoltables
  resources: Resource[];
  
  // Restrictions d'accès
  accessRequirements: AccessRequirement[];
  
  // État dynamique
  isDiscovered: boolean;
  completionRate: number;
  
  // Système de spawn
  respawnTime: number;
  lastReset: Date;
}

export enum ZoneType {
  OVERWORLD = 'overworld',
  DUNGEON = 'dungeon',
  TOWN = 'town',
  CASTLE = 'castle',
  CAVE = 'cave',
  FOREST = 'forest',
  DESERT = 'desert',
  MOUNTAIN = 'mountain',
  SWAMP = 'swamp',
  RUINS = 'ruins',
  TEMPLE = 'temple',
  UNDERGROUND = 'underground',
  SKY = 'sky',
  WATER = 'water'
}

export interface TerrainData {
  // Données de base du terrain
  baseTexture: string;
  overlayTextures: string[];
  
  // Hauteurs pour l'isométrie
  heightMap: number[][];
  
  // Passabilité
  walkableMap: boolean[][];
  
  // Types de terrain pour les effets de jeu
  terrainTypes: TerrainType[][];
  
  // Effets visuels
  particles?: ParticleEffect[];
  ambientSounds?: AmbientSound[];
}

export enum TerrainType {
  GRASS = 'grass',
  DIRT = 'dirt',
  STONE = 'stone',
  SAND = 'sand',
  WATER = 'water',
  LAVA = 'lava',
  ICE = 'ice',
  MUD = 'mud',
  SNOW = 'snow',
  WOOD = 'wood',
  METAL = 'metal',
  VOID = 'void'
}

export interface EnvironmentData {
  // Éclairage
  ambientLight: LightData;
  
  // Météo locale
  localWeather?: WeatherType;
  
  // Effets environnementaux
  environmentEffects: EnvironmentEffect[];
  
  // Musique et sons
  backgroundMusic?: string;
  ambientSounds: AmbientSound[];
  
  // Fog et visibilité
  fogSettings?: FogSettings;
  
  // Température et conditions
  temperature: number;
  humidity: number;
  windSpeed: number;
}

export interface LightData {
  color: string;
  intensity: number;
  shadows: boolean;
  dynamicLighting: boolean;
}

export interface EnvironmentEffect {
  type: EnvironmentEffectType;
  intensity: number;
  duration?: number; // -1 pour permanent
  affectedArea?: Area;
}

export enum EnvironmentEffectType {
  POISON_AIR = 'poison_air',
  HEALING_AURA = 'healing_aura',
  MAGIC_BOOST = 'magic_boost',
  SILENCE_ZONE = 'silence_zone',
  SLOW_MOVEMENT = 'slow_movement',
  FAST_MOVEMENT = 'fast_movement',
  REGENERATION = 'regeneration',
  DAMAGE_OVER_TIME = 'damage_over_time',
  MANA_DRAIN = 'mana_drain',
  EXPERIENCE_BONUS = 'experience_bonus'
}

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'circle' | 'polygon';
  points?: Point[]; // Pour les polygones
}

export interface Point {
  x: number;
  y: number;
}

export interface AmbientSound {
  soundId: string;
  volume: number;
  loop: boolean;
  position?: Point;
  range?: number;
}

export interface FogSettings {
  color: string;
  density: number;
  near: number;
  far: number;
}

export interface ZoneConnection {
  fromZoneId: string;
  toZoneId: string;
  connectionType: ConnectionType;
  
  // Conditions d'accès
  requirements: AccessRequirement[];
  
  // Position de la connexion
  fromPosition: Point;
  toPosition: Point;
  
  // Temps de voyage
  travelTime: number;
  
  // Coût de voyage
  cost?: number;
  
  // État
  isActive: boolean;
  isDiscovered: boolean;
}

export enum ConnectionType {
  WALK = 'walk',
  TELEPORT = 'teleport',
  PORTAL = 'portal',
  BRIDGE = 'bridge',
  BOAT = 'boat',
  AIRSHIP = 'airship',
  UNDERGROUND = 'underground',
  CLIMB = 'climb',
  JUMP = 'jump'
}

export interface ZoneEntrance {
  id: string;
  name: string;
  position: Point;
  direction: Direction;
  connectionId?: string; // Lien vers ZoneConnection
  isDefault: boolean; // Entrée par défaut de la zone
}

export interface ZoneExit {
  id: string;
  name: string;
  position: Point;
  direction: Direction;
  targetZoneId: string;
  targetEntranceId?: string;
  requirements: AccessRequirement[];
}

export enum Direction {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
  NORTHEAST = 'northeast',
  NORTHWEST = 'northwest',
  SOUTHEAST = 'southeast',
  SOUTHWEST = 'southwest',
  UP = 'up',
  DOWN = 'down'
}

export interface AccessRequirement {
  type: RequirementType;
  value: any;
  description: string;
}

export enum RequirementType {
  LEVEL = 'level',
  QUEST_COMPLETED = 'quest_completed',
  ITEM_REQUIRED = 'item_required',
  KEY_REQUIRED = 'key_required',
  PAYMENT = 'payment',
  PARTY_SIZE = 'party_size',
  CLASS_REQUIRED = 'class_required',
  REPUTATION = 'reputation',
  TIME_OF_DAY = 'time_of_day',
  WEATHER = 'weather'
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  type: POIType;
  position: Point;
  
  // Interaction
  interactable: boolean;
  interactionType?: InteractionType;
  
  // Récompenses et objets
  loot?: LootTable;
  
  // États
  isDiscovered: boolean;
  isCompleted: boolean;
  canReset: boolean;
  resetTime?: number;
  
  // Conditions
  spawnConditions?: SpawnCondition[];
  
  // Visuel
  spriteId: string;
  animation?: string;
  glowEffect?: boolean;
}

export enum POIType {
  TREASURE_CHEST = 'treasure_chest',
  SHRINE = 'shrine',
  STATUE = 'statue',
  FOUNTAIN = 'fountain',
  SIGN = 'sign',
  CRYSTAL = 'crystal',
  ALTAR = 'altar',
  PORTAL = 'portal',
  SWITCH = 'switch',
  DOOR = 'door',
  BARRIER = 'barrier',
  TELEPORTER = 'teleporter',
  SAVE_POINT = 'save_point',
  SHOP = 'shop',
  INN = 'inn'
}

export enum InteractionType {
  TOUCH = 'touch',
  EXAMINE = 'examine',
  USE_ITEM = 'use_item',
  ACTIVATE = 'activate',
  TALK = 'talk',
  FIGHT = 'fight',
  TRADE = 'trade',
  REST = 'rest',
  SAVE = 'save'
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  type: NPCType;
  position: Point;
  
  // Dialogue et quêtes
  dialogues: Dialogue[];
  quests: string[]; // IDs des quêtes
  
  // Comportement
  behavior: NPCBehavior;
  movementPattern?: MovementPattern;
  
  // Stats pour les combats
  combatStats?: CombatStats;
  
  // Commerce
  shop?: Shop;
  
  // Apparence
  spriteId: string;
  animations: AnimationSet;
  
  // États
  isHostile: boolean;
  canTalk: boolean;
  canTrade: boolean;
  
  // Conditions d'apparition
  spawnConditions?: SpawnCondition[];
  
  // Faction et relations
  faction?: string;
  reputation: number;
}

export enum NPCType {
  VILLAGER = 'villager',
  GUARD = 'guard',
  MERCHANT = 'merchant',
  QUEST_GIVER = 'quest_giver',
  ENEMY = 'enemy',
  BOSS = 'boss',
  COMPANION = 'companion',
  TRAINER = 'trainer',
  HEALER = 'healer',
  BLACKSMITH = 'blacksmith',
  MAGE = 'mage',
  PRIEST = 'priest'
}

export interface Dialogue {
  id: string;
  text: string;
  conditions?: DialogueCondition[];
  choices?: DialogueChoice[];
  effects?: DialogueEffect[];
}

export interface DialogueChoice {
  text: string;
  nextDialogueId?: string;
  action?: string;
  requirements?: AccessRequirement[];
}

export interface DialogueCondition {
  type: string;
  value: any;
}

export interface DialogueEffect {
  type: string;
  value: any;
}

export interface NPCBehavior {
  aggressionLevel: number;
  detectionRange: number;
  pursuitRange: number;
  returnToPosition: boolean;
  wanderRadius: number;
  idleActions: string[];
}

export interface MovementPattern {
  type: MovementType;
  waypoints?: Point[];
  speed: number;
  pauseTime?: number;
}

export enum MovementType {
  STATIC = 'static',
  PATROL = 'patrol',
  RANDOM = 'random',
  FOLLOW_PLAYER = 'follow_player',
  FLEE = 'flee',
  CIRCLE = 'circle',
  GUARD = 'guard'
}

export interface CombatStats {
  level: number;
  hp: number;
  mp: number;
  strength: number;
  magic: number;
  defense: number;
  magicDefense: number;
  speed: number;
  
  abilities: string[];
  dropTable: LootTable;
  experienceValue: number;
  gilValue: number;
}

export interface LootTable {
  guaranteed: LootItem[];
  random: RandomLootItem[];
}

export interface LootItem {
  itemId: string;
  quantity: number;
}

export interface RandomLootItem extends LootItem {
  dropRate: number; // 0-1
}

export interface WorldObject {
  id: string;
  name: string;
  type: WorldObjectType;
  position: Point;
  
  // Propriétés physiques
  width: number;
  height: number;
  solid: boolean;
  
  // Interaction
  interactable: boolean;
  interactionType?: InteractionType;
  
  // État
  destructible: boolean;
  currentHP?: number;
  maxHP?: number;
  
  // Visuel
  spriteId: string;
  animation?: string;
  layer: number;
  
  // Effets
  effects?: WorldObjectEffect[];
  
  // Conditions d'apparition
  spawnConditions?: SpawnCondition[];
}

export enum WorldObjectType {
  DECORATION = 'decoration',
  OBSTACLE = 'obstacle',
  INTERACTIVE = 'interactive',
  DESTRUCTIBLE = 'destructible',
  TRAP = 'trap',
  PLATFORM = 'platform',
  BRIDGE = 'bridge',
  DOOR = 'door',
  CHEST = 'chest',
  PLANT = 'plant',
  ROCK = 'rock',
  TREE = 'tree',
  BUILDING = 'building'
}

export interface WorldObjectEffect {
  type: EnvironmentEffectType;
  range: number;
  intensity: number;
  duration?: number;
}

export interface EnemySpawn {
  id: string;
  position: Point;
  enemyId: string;
  
  // Paramètres de spawn
  spawnRate: number; // Probabilité de spawn par check
  maxCount: number;  // Nombre max d'ennemis de ce type
  respawnTime: number; // Temps avant respawn
  
  // Zone de spawn
  spawnArea?: Area;
  
  // Conditions de spawn
  conditions: SpawnCondition[];
  
  // État
  isActive: boolean;
  lastSpawnTime: Date;
  currentCount: number;
}

export interface SpawnCondition {
  type: ConditionType;
  value: any;
  operator: ComparisonOperator;
}

export enum ConditionType {
  TIME_OF_DAY = 'time_of_day',
  WEATHER = 'weather',
  PLAYER_LEVEL = 'player_level',
  QUEST_STATE = 'quest_state',
  ITEM_IN_INVENTORY = 'item_in_inventory',
  ZONE_COMPLETION = 'zone_completion',
  RANDOM_CHANCE = 'random_chance',
  PARTY_SIZE = 'party_size',
  DAYS_ELAPSED = 'days_elapsed'
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains'
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  position: Point;
  
  // Propriétés de récolte
  harvestable: boolean;
  toolRequired?: string;
  skillRequired?: string;
  minSkillLevel?: number;
  
  // Récompenses
  lootTable: LootTable;
  experienceGained: number;
  
  // Respawn
  respawnTime: number;
  lastHarvested?: Date;
  
  // État
  isHarvested: boolean;
  quantity: number;
  
  // Visuel
  spriteId: string;
  harvestedSpriteId?: string;
}

export enum ResourceType {
  HERB = 'herb',
  ORE = 'ore',
  WOOD = 'wood',
  WATER = 'water',
  CRYSTAL = 'crystal',
  MUSHROOM = 'mushroom',
  FISH = 'fish',
  STONE = 'stone',
  FLOWER = 'flower',
  FRUIT = 'fruit'
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  position: Point;
  zoneId?: string;
  type: LandmarkType;
  
  // Propriétés de voyage rapide
  isFastTravelPoint: boolean;
  unlocked: boolean;
  cost?: number;
  
  // Visuel sur la carte du monde
  iconId: string;
  scale: number;
  
  // Lore et histoire
  lore?: string;
  discoveryReward?: LootTable;
}

export enum LandmarkType {
  CITY = 'city',
  CASTLE = 'castle',
  DUNGEON = 'dungeon',
  TEMPLE = 'temple',
  RUINS = 'ruins',
  MOUNTAIN = 'mountain',
  LAKE = 'lake',
  FOREST = 'forest',
  DESERT = 'desert',
  CAVE = 'cave',
  TOWER = 'tower',
  BRIDGE = 'bridge',
  MONUMENT = 'monument'
}

export interface WeatherSystem {
  currentWeather: WeatherType;
  weatherDuration: number;
  nextWeatherChange: Date;
  
  // Probabilités des types de météo
  weatherProbabilities: Map<WeatherType, number>;
  
  // Effets globaux de la météo
  globalEffects: WeatherEffect[];
}

export enum WeatherType {
  CLEAR = 'clear',
  CLOUDY = 'cloudy',
  RAIN = 'rain',
  STORM = 'storm',
  SNOW = 'snow',
  BLIZZARD = 'blizzard',
  FOG = 'fog',
  SANDSTORM = 'sandstorm',
  VOLCANIC_ASH = 'volcanic_ash',
  AURORA = 'aurora'
}

export interface WeatherEffect {
  type: EnvironmentEffectType;
  intensity: number;
  affectsMovement: boolean;
  affectsCombat: boolean;
  affectsVisibility: boolean;
}

export interface TimeSystem {
  currentTime: GameTime;
  timeScale: number; // Multiplicateur du temps réel
  
  // Durées en minutes de jeu
  dayDuration: number;
  nightDuration: number;
  
  // Effets du cycle jour/nuit
  dayEffects: TimeEffect[];
  nightEffects: TimeEffect[];
  
  // Saisons (optionnel)
  currentSeason?: Season;
  seasonDuration?: number;
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
  isDay: boolean;
}

export interface TimeEffect {
  type: EnvironmentEffectType;
  intensity: number;
  zoneTypes?: ZoneType[]; // Si spécifié, appliqué seulement à ces types de zones
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

export interface ParticleEffect {
  id: string;
  type: ParticleType;
  position: Point;
  count: number;
  lifetime: number;
  speed: number;
  direction: number;
  spread: number;
  color: string;
  size: number;
  gravity: number;
}

export enum ParticleType {
  DUST = 'dust',
  SPARKLE = 'sparkle',
  SMOKE = 'smoke',
  FIRE = 'fire',
  WATER = 'water',
  LEAVES = 'leaves',
  SNOW = 'snow',
  RAIN = 'rain',
  MAGIC = 'magic',
  POISON = 'poison'
}

// Factory functions
export function createZone(params: Partial<Zone>): Zone {
  return {
    id: params.id || crypto.randomUUID(),
    name: params.name || 'Unnamed Zone',
    description: params.description || '',
    type: params.type || ZoneType.OVERWORLD,
    
    worldX: params.worldX || 0,
    worldY: params.worldY || 0,
    width: params.width || 100,
    height: params.height || 100,
    
    minLevel: params.minLevel || 1,
    maxLevel: params.maxLevel || 10,
    
    terrain: params.terrain || createDefaultTerrain(),
    environment: params.environment || createDefaultEnvironment(),
    
    entrances: params.entrances || [],
    exits: params.exits || [],
    pointsOfInterest: params.pointsOfInterest || [],
    npcs: params.npcs || [],
    worldObjects: params.worldObjects || [],
    enemySpawns: params.enemySpawns || [],
    resources: params.resources || [],
    
    accessRequirements: params.accessRequirements || [],
    
    isDiscovered: params.isDiscovered || false,
    completionRate: params.completionRate || 0,
    
    respawnTime: params.respawnTime || 300, // 5 minutes
    lastReset: params.lastReset || new Date()
  };
}

export function createDefaultTerrain(): TerrainData {
  return {
    baseTexture: 'grass',
    overlayTextures: [],
    heightMap: Array(10).fill(null).map(() => Array(10).fill(0)),
    walkableMap: Array(10).fill(null).map(() => Array(10).fill(true)),
    terrainTypes: Array(10).fill(null).map(() => Array(10).fill(TerrainType.GRASS)),
    particles: [],
    ambientSounds: []
  };
}

export function createDefaultEnvironment(): EnvironmentData {
  return {
    ambientLight: {
      color: '#ffffff',
      intensity: 1.0,
      shadows: false,
      dynamicLighting: false
    },
    environmentEffects: [],
    ambientSounds: [],
    temperature: 20,
    humidity: 50,
    windSpeed: 0
  };
}

// Utility functions
export function isPointWalkable(terrain: TerrainData, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= terrain.walkableMap[0].length || y >= terrain.walkableMap.length) {
    return false;
  }
  return terrain.walkableMap[y][x];
}

export function getTerrainHeight(terrain: TerrainData, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= terrain.heightMap[0].length || y >= terrain.heightMap.length) {
    return 0;
  }
  return terrain.heightMap[y][x];
}

export function isPointInArea(point: Point, area: Area): boolean {
  switch (area.shape) {
    case 'rectangle':
      return point.x >= area.x && point.x <= area.x + area.width &&
             point.y >= area.y && point.y <= area.y + area.height;
    
    case 'circle':
      const centerX = area.x + area.width / 2;
      const centerY = area.y + area.height / 2;
      const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
      return distance <= area.width / 2;
    
    case 'polygon':
      if (!area.points) return false;
      // Algorithme point-in-polygon
      let inside = false;
      for (let i = 0, j = area.points.length - 1; i < area.points.length; j = i++) {
        if (((area.points[i].y > point.y) !== (area.points[j].y > point.y)) &&
            (point.x < (area.points[j].x - area.points[i].x) * (point.y - area.points[i].y) / (area.points[j].y - area.points[i].y) + area.points[i].x)) {
          inside = !inside;
        }
      }
      return inside;
    
    default:
      return false;
  }
}

export function calculateDistance(point1: Point, point2: Point): number {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

export function checkAccessRequirements(requirements: AccessRequirement[], playerData: any): boolean {
  return requirements.every(req => {
    switch (req.type) {
      case RequirementType.LEVEL:
        return playerData.level >= req.value;
      case RequirementType.QUEST_COMPLETED:
        return playerData.completedQuests?.includes(req.value);
      case RequirementType.ITEM_REQUIRED:
        return playerData.inventory?.hasItem(req.value);
      case RequirementType.PAYMENT:
        return playerData.gil >= req.value;
      // Ajouter d'autres vérifications selon les besoins
      default:
        return true;
    }
  });
}