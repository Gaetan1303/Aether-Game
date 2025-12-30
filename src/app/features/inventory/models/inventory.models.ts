// Models pour le système d'inventaire
export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  slot: number;
  equipped: boolean;
  durability?: number;
  enchantments?: ItemEnchantment[];
  
  // Métadonnées
  acquiredAt: Date;
  value: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  category: ItemCategory;
  rarity: ItemRarity;
  stackSize: number;
  
  // Propriétés économiques
  baseValue: number;
  buyPrice: number;
  sellPrice: number;
  
  // Propriétés d'usage
  consumable: boolean;
  usableInCombat: boolean;
  usableOutsideCombat: boolean;
  
  // Effets
  effects?: ItemEffect[];
  
  // Apparence
  spriteId?: string;
  
  // Restrictions
  requiredLevel?: number;
  requiredJob?: string;
  allowedJobs?: string[];
  
  // Propriétés spéciales
  quest: boolean;
  unique: boolean;
  tradeable: boolean;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
  MISC = 'misc'
}

export enum ItemCategory {
  // Armes
  SWORD = 'sword',
  AXE = 'axe',
  SPEAR = 'spear',
  BOW = 'bow',
  STAFF = 'staff',
  DAGGER = 'dagger',
  MACE = 'mace',
  
  // Armures
  HELMET = 'helmet',
  CHEST = 'chest',
  GLOVES = 'gloves',
  BOOTS = 'boots',
  SHIELD = 'shield',
  
  // Accessoires
  RING = 'ring',
  AMULET = 'amulet',
  BRACELET = 'bracelet',
  
  // Consommables
  POTION = 'potion',
  FOOD = 'food',
  SCROLL = 'scroll',
  BOMB = 'bomb',
  
  // Matériaux
  ORE = 'ore',
  HERB = 'herb',
  FABRIC = 'fabric',
  CRYSTAL = 'crystal',
  COMPONENT = 'component',
  
  // Autres
  KEY = 'key',
  DOCUMENT = 'document',
  TREASURE = 'treasure'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface ItemEffect {
  type: ItemEffectType;
  value: number;
  stat?: string;
  duration?: number;
  target: EffectTarget;
  trigger?: EffectTrigger;
}

export enum ItemEffectType {
  HEAL = 'heal',
  MANA_RESTORE = 'mana_restore',
  STAT_BOOST = 'stat_boost',
  STAT_DEBUFF = 'stat_debuff',
  STATUS_EFFECT = 'status_effect',
  DAMAGE = 'damage',
  TELEPORT = 'teleport',
  EXPERIENCE_BOOST = 'experience_boost'
}

export enum EffectTarget {
  SELF = 'self',
  ALLY = 'ally',
  ENEMY = 'enemy',
  ALL_ALLIES = 'all_allies',
  ALL_ENEMIES = 'all_enemies',
  AREA = 'area'
}

export enum EffectTrigger {
  ON_USE = 'on_use',
  ON_EQUIP = 'on_equip',
  ON_ATTACK = 'on_attack',
  ON_DEFEND = 'on_defend',
  START_TURN = 'start_turn',
  END_TURN = 'end_turn'
}

export interface ItemEnchantment {
  id: string;
  name: string;
  description: string;
  level: number;
  effects: ItemEffect[];
  valueMultiplier: number;
}

export interface Inventory {
  id: string;
  ownerId: string;
  size: number;
  items: InventoryItem[];
  gil: number; // Monnaie du jeu
  
  // Métadonnées
  lastModified: Date;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  shopkeeper: string;
  location: string;
  
  // Inventaire du magasin
  inventory: ShopItem[];
  
  // Paramètres commerciaux
  buyMultiplier: number;   // Multiplicateur pour les prix d'achat
  sellMultiplier: number;  // Multiplicateur pour les prix de vente
  restockTime: number;     // Temps de rechargement en heures
  
  // Restrictions
  requiredReputation?: number;
  allowedItemTypes?: ItemType[];
  
  // État
  isOpen: boolean;
  lastRestock: Date;
}

export interface ShopItem {
  itemId: string;
  quantity: number;
  price: number;
  restockQuantity: number;
  unlimitedStock: boolean;
}

export interface TradeOffer {
  id: string;
  sellerId: string;
  buyerId?: string;
  
  // Objets proposés
  offeredItems: InventoryItem[];
  requestedItems: ItemRequest[];
  requestedGil: number;
  
  // État de l'échange
  status: TradeStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface ItemRequest {
  itemId: string;
  quantity: number;
  maxPrice?: number;
}

export enum TradeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  
  // Ingrédients requis
  ingredients: RecipeIngredient[];
  
  // Résultat
  resultItemId: string;
  resultQuantity: number;
  
  // Exigences
  requiredSkill?: string;
  requiredSkillLevel?: number;
  requiredTool?: string;
  
  // Chances de succès et bonus
  baseSuccessRate: number;
  criticalSuccessRate: number;
  
  // Coût et temps
  craftingTime: number;
  gilCost: number;
  experienceGained: number;
}

export interface RecipeIngredient {
  itemId: string;
  quantity: number;
  consumedOnFailure: boolean;
}

export interface CraftingResult {
  success: boolean;
  criticalSuccess: boolean;
  resultItems: InventoryItem[];
  experienceGained: number;
  consumedIngredients: RecipeIngredient[];
}

// Factory functions
export function createInventoryItem(params: Partial<InventoryItem>): InventoryItem {
  return {
    id: params.id || crypto.randomUUID(),
    itemId: params.itemId || '',
    quantity: params.quantity || 1,
    slot: params.slot || -1,
    equipped: params.equipped || false,
    durability: params.durability,
    enchantments: params.enchantments || [],
    acquiredAt: params.acquiredAt || new Date(),
    value: params.value || 0
  };
}

export function createInventory(ownerId: string, size: number = 40): Inventory {
  return {
    id: crypto.randomUUID(),
    ownerId,
    size,
    items: [],
    gil: 0,
    lastModified: new Date()
  };
}

export function createShop(params: Partial<Shop>): Shop {
  return {
    id: params.id || crypto.randomUUID(),
    name: params.name || 'General Store',
    description: params.description || 'A general store selling various goods',
    shopkeeper: params.shopkeeper || 'Shopkeeper',
    location: params.location || 'Town',
    
    inventory: params.inventory || [],
    
    buyMultiplier: params.buyMultiplier || 1.2,
    sellMultiplier: params.sellMultiplier || 0.5,
    restockTime: params.restockTime || 24,
    
    requiredReputation: params.requiredReputation,
    allowedItemTypes: params.allowedItemTypes,
    
    isOpen: params.isOpen !== undefined ? params.isOpen : true,
    lastRestock: params.lastRestock || new Date()
  };
}

// Utility functions
export function canStackItems(item1: InventoryItem, item2: InventoryItem, itemData: Item): boolean {
  if (item1.itemId !== item2.itemId) return false;
  if (itemData.stackSize <= 1) return false;
  if (item1.equipped || item2.equipped) return false;
  
  // Vérifier que les enchantements sont identiques
  if (item1.enchantments?.length !== item2.enchantments?.length) return false;
  
  return true;
}

export function calculateItemValue(item: InventoryItem, baseItem: Item): number {
  let value = baseItem.baseValue * item.quantity;
  
  // Ajuster selon la durabilité
  if (item.durability !== undefined && baseItem.type !== ItemType.CONSUMABLE) {
    const maxDurability = 100; // ou récupérer depuis les données de l'objet
    const durabilityRatio = item.durability / maxDurability;
    value *= Math.max(0.1, durabilityRatio); // Minimum 10% de la valeur
  }
  
  // Ajouter la valeur des enchantements
  if (item.enchantments) {
    const enchantmentMultiplier = item.enchantments.reduce((mult, ench) => 
      mult * ench.valueMultiplier, 1);
    value *= enchantmentMultiplier;
  }
  
  return Math.floor(value);
}

export function getItemRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case ItemRarity.COMMON: return '#9d9d9d';
    case ItemRarity.UNCOMMON: return '#1eff00';
    case ItemRarity.RARE: return '#0070dd';
    case ItemRarity.EPIC: return '#a335ee';
    case ItemRarity.LEGENDARY: return '#ff8000';
    case ItemRarity.MYTHIC: return '#e6cc80';
    default: return '#ffffff';
  }
}

export function getItemRarityName(rarity: ItemRarity): string {
  switch (rarity) {
    case ItemRarity.COMMON: return 'Common';
    case ItemRarity.UNCOMMON: return 'Uncommon';
    case ItemRarity.RARE: return 'Rare';
    case ItemRarity.EPIC: return 'Epic';
    case ItemRarity.LEGENDARY: return 'Legendary';
    case ItemRarity.MYTHIC: return 'Mythic';
    default: return 'Unknown';
  }
}

export function sortItemsByCategory(items: InventoryItem[], itemsData: Map<string, Item>): InventoryItem[] {
  return items.sort((a, b) => {
    const itemA = itemsData.get(a.itemId);
    const itemB = itemsData.get(b.itemId);
    
    if (!itemA || !itemB) return 0;
    
    // Trier par type, puis par catégorie, puis par rareté, puis par nom
    if (itemA.type !== itemB.type) {
      return itemA.type.localeCompare(itemB.type);
    }
    
    if (itemA.category !== itemB.category) {
      return itemA.category.localeCompare(itemB.category);
    }
    
    if (itemA.rarity !== itemB.rarity) {
      const rarityOrder = Object.values(ItemRarity);
      return rarityOrder.indexOf(itemB.rarity) - rarityOrder.indexOf(itemA.rarity);
    }
    
    return itemA.name.localeCompare(itemB.name);
  });
}

export function findEmptySlot(inventory: Inventory): number {
  for (let i = 0; i < inventory.size; i++) {
    if (!inventory.items.find(item => item.slot === i)) {
      return i;
    }
  }
  return -1; // Inventaire plein
}

export function canAddItemToInventory(inventory: Inventory, item: InventoryItem, itemData: Item): boolean {
  // Vérifier si l'objet peut être stacké avec un objet existant
  const existingItem = inventory.items.find(invItem => 
    invItem.itemId === item.itemId && 
    canStackItems(invItem, item, itemData) &&
    invItem.quantity < itemData.stackSize
  );
  
  if (existingItem) {
    return existingItem.quantity + item.quantity <= itemData.stackSize;
  }
  
  // Sinon, vérifier qu'il y a un slot libre
  return findEmptySlot(inventory) !== -1;
}

export function getItemsByType(inventory: Inventory, itemType: ItemType, itemsData: Map<string, Item>): InventoryItem[] {
  return inventory.items.filter(item => {
    const itemData = itemsData.get(item.itemId);
    return itemData?.type === itemType;
  });
}

export function getEquippedItems(inventory: Inventory): InventoryItem[] {
  return inventory.items.filter(item => item.equipped);
}

export function calculateInventoryWeight(inventory: Inventory, itemsData: Map<string, Item>): number {
  return inventory.items.reduce((weight, item) => {
    const itemData = itemsData.get(item.itemId);
    // Supposons qu'il y a une propriété weight sur les objets
    return weight + ((itemData as any)?.weight || 1) * item.quantity;
  }, 0);
}