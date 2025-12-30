import { Injectable, signal, computed, inject } from '@angular/core';
import { 
  Inventory, 
  InventoryItem, 
  Item, 
  Shop, 
  TradeOffer, 
  Recipe,
  CraftingResult,
  createInventoryItem,
  createInventory,
  canAddItemToInventory,
  findEmptySlot,
  canStackItems,
  calculateItemValue,
  sortItemsByCategory,
  getItemsByType
} from '../models/inventory.models';
import { WebSocketService } from '../../../core/services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private webSocketService = inject(WebSocketService);
  
  // État réactif de l'inventaire
  private inventorySignal = signal<Inventory | null>(null);
  private itemsDataSignal = signal<Map<string, Item>>(new Map());
  private shopsSignal = signal<Shop[]>([]);
  private activeShopSignal = signal<Shop | null>(null);
  private recipesSignal = signal<Recipe[]>([]);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Signaux calculés
  public readonly inventory = this.inventorySignal.asReadonly();
  public readonly itemsData = this.itemsDataSignal.asReadonly();
  public readonly shops = this.shopsSignal.asReadonly();
  public readonly activeShop = this.activeShopSignal.asReadonly();
  public readonly recipes = this.recipesSignal.asReadonly();
  public readonly isLoading = this.isLoadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  
  public readonly sortedInventoryItems = computed(() => {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    return inventory ? sortItemsByCategory(inventory.items, itemsData) : [];
  });
  
  public readonly inventoryWeight = computed(() => {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    if (!inventory) return 0;
    
    return inventory.items.reduce((weight, item) => {
      const itemData = itemsData.get(item.itemId);
      return weight + ((itemData as any)?.weight || 1) * item.quantity;
    }, 0);
  });
  
  public readonly inventoryValue = computed(() => {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    if (!inventory) return 0;
    
    let totalValue = inventory.gil;
    inventory.items.forEach(item => {
      const itemData = itemsData.get(item.itemId);
      if (itemData) {
        totalValue += calculateItemValue(item, itemData);
      }
    });
    
    return totalValue;
  });
  
  public readonly consumableItems = computed(() => {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    return inventory ? getItemsByType(inventory, 'consumable' as any, itemsData) : [];
  });
  
  public readonly weaponItems = computed(() => {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    return inventory ? getItemsByType(inventory, 'weapon' as any, itemsData) : [];
  });
  
  public readonly armorItems = computed(() => {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    return inventory ? getItemsByType(inventory, 'armor' as any, itemsData) : [];
  });
  
  constructor() {
    this.initializeWebSocketEvents();
    this.loadItemsData();
  }
  
  private initializeWebSocketEvents(): void {
    this.webSocketService.on('inventory_updated').subscribe(data => {
      this.inventorySignal.set(data.inventory);
    });
    
    this.webSocketService.on('item_acquired').subscribe(data => {
      this.addItemToInventory(data.item);
    });
    
    this.webSocketService.on('shop_updated').subscribe(data => {
      this.updateShopInList(data.shop);
    });
  }
  
  // Chargement des données
  public async loadInventory(playerId: string): Promise<void> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const response = await this.webSocketService.request('get_inventory', {
        playerId
      });
      
      this.inventorySignal.set(response.inventory);
    } catch (error) {
      this.errorSignal.set('Failed to load inventory');
      console.error('Failed to load inventory:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }
  
  public async loadItemsData(): Promise<void> {
    try {
      const response = await this.webSocketService.request('get_items_data', {});
      const itemsMap = new Map<string, Item>();
      
      response.items.forEach((item: Item) => {
        itemsMap.set(item.id, item);
      });
      
      this.itemsDataSignal.set(itemsMap);
    } catch (error) {
      console.error('Failed to load items data:', error);
    }
  }
  
  public async loadShops(): Promise<void> {
    try {
      const response = await this.webSocketService.request('get_shops', {});
      this.shopsSignal.set(response.shops);
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  }
  
  public async loadRecipes(): Promise<void> {
    try {
      const response = await this.webSocketService.request('get_recipes', {});
      this.recipesSignal.set(response.recipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  }
  
  // Gestion des objets
  public async addItem(itemId: string, quantity: number = 1): Promise<boolean> {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    const itemData = itemsData.get(itemId);
    
    if (!inventory || !itemData) {
      this.errorSignal.set('Invalid item or inventory');
      return false;
    }
    
    const newItem = createInventoryItem({
      itemId,
      quantity,
      slot: findEmptySlot(inventory)
    });
    
    if (!canAddItemToInventory(inventory, newItem, itemData)) {
      this.errorSignal.set('Cannot add item: inventory full or invalid');
      return false;
    }
    
    try {
      const response = await this.webSocketService.request('add_item', {
        inventoryId: inventory.id,
        itemId,
        quantity
      });
      
      this.inventorySignal.set(response.inventory);
      return true;
    } catch (error) {
      this.errorSignal.set('Failed to add item');
      console.error('Failed to add item:', error);
      return false;
    }
  }
  
  public async removeItem(itemId: string, quantity: number = 1): Promise<boolean> {
    const inventory = this.inventorySignal();
    if (!inventory) return false;
    
    const item = inventory.items.find(i => i.itemId === itemId);
    if (!item || item.quantity < quantity) {
      this.errorSignal.set('Item not found or insufficient quantity');
      return false;
    }
    
    try {
      const response = await this.webSocketService.request('remove_item', {
        inventoryId: inventory.id,
        itemId,
        quantity
      });
      
      this.inventorySignal.set(response.inventory);
      return true;
    } catch (error) {
      this.errorSignal.set('Failed to remove item');
      console.error('Failed to remove item:', error);
      return false;
    }
  }
  
  public async useItem(itemId: string, targetId?: string): Promise<boolean> {
    const inventory = this.inventorySignal();
    const itemsData = this.itemsDataSignal();
    const itemData = itemsData.get(itemId);
    
    if (!inventory || !itemData || !itemData.consumable) {
      this.errorSignal.set('Item cannot be used');
      return false;
    }
    
    try {
      const response = await this.webSocketService.request('use_item', {
        inventoryId: inventory.id,
        itemId,
        targetId
      });
      
      this.inventorySignal.set(response.inventory);
      return true;
    } catch (error) {
      this.errorSignal.set('Failed to use item');
      console.error('Failed to use item:', error);
      return false;
    }
  }
  
  public async moveItem(itemId: string, newSlot: number): Promise<boolean> {
    const inventory = this.inventorySignal();
    if (!inventory) return false;
    
    const item = inventory.items.find(i => i.itemId === itemId);
    if (!item) {
      this.errorSignal.set('Item not found');
      return false;
    }
    
    // Vérifier que le slot de destination est valide
    if (newSlot < 0 || newSlot >= inventory.size) {
      this.errorSignal.set('Invalid slot');
      return false;
    }
    
    try {
      const response = await this.webSocketService.request('move_item', {
        inventoryId: inventory.id,
        itemId,
        newSlot
      });
      
      this.inventorySignal.set(response.inventory);
      return true;
    } catch (error) {
      this.errorSignal.set('Failed to move item');
      console.error('Failed to move item:', error);
      return false;
    }
  }
  
  public async sortInventory(): Promise<void> {
    const inventory = this.inventorySignal();
    if (!inventory) return;
    
    try {
      const response = await this.webSocketService.request('sort_inventory', {
        inventoryId: inventory.id
      });
      
      this.inventorySignal.set(response.inventory);
    } catch (error) {
      this.errorSignal.set('Failed to sort inventory');
      console.error('Failed to sort inventory:', error);
    }
  }
  
  // Gestion des magasins
  public setActiveShop(shop: Shop | null): void {
    this.activeShopSignal.set(shop);
  }
  
  public async buyFromShop(shopId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    const inventory = this.inventorySignal();
    const shop = this.shopsSignal().find(s => s.id === shopId);
    const itemsData = this.itemsDataSignal();
    const itemData = itemsData.get(itemId);
    
    if (!inventory || !shop || !itemData) {
      this.errorSignal.set('Invalid shop, inventory, or item');
      return false;
    }
    
    const shopItem = shop.inventory.find(i => i.itemId === itemId);
    if (!shopItem || shopItem.quantity < quantity) {
      this.errorSignal.set('Item not available in sufficient quantity');
      return false;
    }
    
    const totalCost = shopItem.price * quantity;
    if (inventory.gil < totalCost) {
      this.errorSignal.set('Insufficient gil');
      return false;
    }
    
    try {
      const response = await this.webSocketService.request('buy_item', {
        shopId,
        inventoryId: inventory.id,
        itemId,
        quantity
      });
      
      this.inventorySignal.set(response.inventory);
      this.updateShopInList(response.shop);
      return true;
    } catch (error) {
      this.errorSignal.set('Failed to buy item');
      console.error('Failed to buy item:', error);
      return false;
    }
  }
  
  public async sellToShop(shopId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    const inventory = this.inventorySignal();
    const shop = this.shopsSignal().find(s => s.id === shopId);
    const itemsData = this.itemsDataSignal();
    const itemData = itemsData.get(itemId);
    
    if (!inventory || !shop || !itemData) {
      this.errorSignal.set('Invalid shop, inventory, or item');
      return false;
    }
    
    const inventoryItem = inventory.items.find(i => i.itemId === itemId);
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      this.errorSignal.set('Item not available in sufficient quantity');
      return false;
    }
    
    try {
      const response = await this.webSocketService.request('sell_item', {
        shopId,
        inventoryId: inventory.id,
        itemId,
        quantity
      });
      
      this.inventorySignal.set(response.inventory);
      this.updateShopInList(response.shop);
      return true;
    } catch (error) {
      this.errorSignal.set('Failed to sell item');
      console.error('Failed to sell item:', error);
      return false;
    }
  }
  
  // Gestion de l'artisanat
  public async craftItem(recipeId: string): Promise<CraftingResult | null> {
    const inventory = this.inventorySignal();
    const recipe = this.recipesSignal().find(r => r.id === recipeId);
    
    if (!inventory || !recipe) {
      this.errorSignal.set('Invalid inventory or recipe');
      return null;
    }
    
    // Vérifier les ingrédients
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = inventory.items.find(i => i.itemId === ingredient.itemId);
      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
        this.errorSignal.set(`Insufficient ${ingredient.itemId}`);
        return null;
      }
    }
    
    // Vérifier les coûts
    if (inventory.gil < recipe.gilCost) {
      this.errorSignal.set('Insufficient gil for crafting');
      return null;
    }
    
    try {
      const response = await this.webSocketService.request('craft_item', {
        inventoryId: inventory.id,
        recipeId
      });
      
      this.inventorySignal.set(response.inventory);
      return response.craftingResult;
    } catch (error) {
      this.errorSignal.set('Failed to craft item');
      console.error('Failed to craft item:', error);
      return null;
    }
  }
  
  public canCraftRecipe(recipe: Recipe): boolean {
    const inventory = this.inventorySignal();
    if (!inventory) return false;
    
    // Vérifier les ingrédients
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = inventory.items.find(i => i.itemId === ingredient.itemId);
      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
        return false;
      }
    }
    
    // Vérifier les coûts
    if (inventory.gil < recipe.gilCost) {
      return false;
    }
    
    return true;
  }
  
  // Utilitaires
  public getItem(itemId: string): Item | undefined {
    return this.itemsDataSignal().get(itemId);
  }
  
  public getInventoryItem(itemId: string): InventoryItem | undefined {
    const inventory = this.inventorySignal();
    return inventory?.items.find(i => i.itemId === itemId);
  }
  
  public hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this.getInventoryItem(itemId);
    return item ? item.quantity >= quantity : false;
  }
  
  public getItemCount(itemId: string): number {
    const item = this.getInventoryItem(itemId);
    return item ? item.quantity : 0;
  }
  
  public getFreeSlots(): number {
    const inventory = this.inventorySignal();
    if (!inventory) return 0;
    
    return inventory.size - inventory.items.length;
  }
  
  // Méthodes privées
  private addItemToInventory(item: InventoryItem): void {
    const inventory = this.inventorySignal();
    if (!inventory) return;
    
    const updatedInventory = { ...inventory };
    updatedInventory.items = [...inventory.items, item];
    updatedInventory.lastModified = new Date();
    
    this.inventorySignal.set(updatedInventory);
  }
  
  private updateShopInList(updatedShop: Shop): void {
    const currentShops = this.shopsSignal();
    const index = currentShops.findIndex(s => s.id === updatedShop.id);
    
    if (index !== -1) {
      const newShops = [...currentShops];
      newShops[index] = updatedShop;
      this.shopsSignal.set(newShops);
      
      // Mettre à jour le magasin actif si c'est le même
      if (this.activeShopSignal()?.id === updatedShop.id) {
        this.activeShopSignal.set(updatedShop);
      }
    }
  }
}