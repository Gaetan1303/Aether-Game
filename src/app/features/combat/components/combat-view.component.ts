import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PixiEngineService } from '../services/pixi-engine.service';
import { IsoRendererService } from '../services/iso-renderer.service';
import { SpriteManagerService } from '../services/sprite-manager.service';
import { CameraService } from '../services/camera.service';
import { AnimationQueueService } from '../services/animation-queue.service';
import { WebSocketService } from '@core/services/websocket.service';
import { GameStateService } from '@core/services/game-state.service';
import { BattleState, createBattleState, createDefaultBattleConfig } from '../models/battle-state.model';
import { Unit, createUnit, Direction } from '../models/unit.model';
import { CombatEvent } from '../models/combat-event.model';
import { Position3D } from '../models/position-3d.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-combat-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combat-view.component.html',
  styleUrls: ['./combat-view.component.scss']
})
export class CombatViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pixiCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // États locaux avec Signals
  battleState = signal<BattleState | null>(null);
  isInitialized = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Statistiques du moteur
  engineStats = signal<any>(null);
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  // Services injectés
  private pixiEngine = inject(PixiEngineService);
  private isoRenderer = inject(IsoRendererService);
  private spriteManager = inject(SpriteManagerService);
  public camera = inject(CameraService);
  private animationQueue = inject(AnimationQueueService);
  private websocket = inject(WebSocketService);
  private gameState = inject(GameStateService);
  
  ngOnInit(): void {
    console.log('CombatViewComponent initializing...');
    // Initialisation minimale : pas de connexion WebSocket ni de combat de test par défaut
    // Pour tester, décommente la ligne suivante :
    // this.createTestBattle();
  }
  
  async ngAfterViewInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Initialiser Pixi.js
      await this.initializePixiEngine();
      
      // Initialiser les autres services
      await this.initializeServices();
      
      // Rendre le terrain de test
      this.renderTestScene();
      
      this.isInitialized.set(true);
      this.isLoading.set(false);
      
      console.log('Combat view fully initialized');
      
    } catch (error) {
      console.error('Failed to initialize combat view:', error);
      this.error.set('Erreur d\'initialisation du combat');
      this.isLoading.set(false);
    }
  }
  
  ngOnDestroy(): void {
    // Nettoyer les subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Détruire les services
    this.animationQueue.destroy();
    this.camera.destroy();
    this.pixiEngine.destroy();
    this.spriteManager.destroy();
    
    console.log('CombatViewComponent destroyed');
  }
  
  private async initializePixiEngine(): Promise<void> {
    if (!this.canvasRef?.nativeElement) {
      throw new Error('Canvas element not found');
    }
    
    const config = {
      width: 1280,
      height: 720,
      backgroundColor: 0x2c3e50, // Bleu sombre
      antialias: true
    };
    
    await this.pixiEngine.initialize(this.canvasRef.nativeElement, config);
  }
  
  private async initializeServices(): Promise<void> {
    // Initialiser le gestionnaire de sprites avec des textures de test
    const testTextures = {
      grass_tile: '',
      unit_sprite: ''
    };
    
    await this.spriteManager.initialize(testTextures);
    
    // Créer des pools de sprites
    this.spriteManager.createPool({
      textureKey: 'grass_tile',
      poolSize: 400, // Pour une grille 20x20
      autoExpand: true,
      maxSize: 500
    });
    
    this.spriteManager.createPool({
      textureKey: 'unit_sprite',
      poolSize: 20,
      autoExpand: true,
      maxSize: 50
    });
    
    // Initialiser la caméra
    this.camera.initialize(this.pixiEngine.getStage(), {
      position: { x: 0, y: 0 },
      zoom: 1.0,
      rotation: 0,
      bounds: {
        minX: -500,
        maxX: 500,
        minY: -300,
        maxY: 300,
        minZoom: 0.5,
        maxZoom: 2.0
      }
    });
    
    // Démarrer les statistiques
    this.startStatsTracking();
  }
  
  private setupWebSocketConnection(): void {
    // Se connecter au serveur WebSocket
    this.websocket.connect();
    
    // Écouter les événements de combat
    const messagesSub = this.websocket.onMessage().subscribe((event: CombatEvent) => {
      this.handleCombatEvent(event);
    });
    
    this.subscriptions.push(messagesSub);
  }
  
  private handleCombatEvent(event: CombatEvent): void {
    console.log('Combat event received:', event);
    
    switch (event.type) {
      case 'CombatCommencé':
        this.handleCombatStarted(event);
        break;
        
      case 'TourCommencé':
        this.handleTurnStarted(event);
        break;
        
      case 'DégâtsAppliqués':
        this.handleDamageApplied(event);
        break;
        
      case 'UnitéDéplacée':
        this.handleUnitMoved(event);
        break;
        
      case 'CombatTerminé':
        this.handleCombatEnded(event);
        break;
        
      default:
        console.warn('Unhandled combat event type:', event.type);
    }
  }
  
  private handleCombatStarted(event: any): void {
    console.log('Combat started:', event);
    // TODO: Initialiser l'état du combat
  }
  
  private handleTurnStarted(event: any): void {
    console.log('Turn started:', event);
    // TODO: Mettre à jour l'unité active
  }
  
  private handleDamageApplied(event: any): void {
    console.log('Damage applied:', event);
    // TODO: Jouer l'animation de dégâts
  }
  
  private handleUnitMoved(event: any): void {
    console.log('Unit moved:', event);
    // TODO: Animer le déplacement de l'unité
  }
  
  private handleCombatEnded(event: any): void {
    console.log('Combat ended:', event);
    // TODO: Afficher l'écran de fin de combat
  }
  
  private createTestBattle(): void {
    // Créer quelques unités de test
    const testUnits: Unit[] = [
      createUnit({
        id: 'player1',
        name: 'Chevalier',
        teamId: 'player',
        position: { x: 2, y: 3, z: 0 },
        spriteId: 'unit_sprite',
        stats: {
          hp: 120, hpMax: 120, mp: 30, mpMax: 30, attack: 25, defense: 18, speed: 12, range: 1, movement: 4, agility: 14, intelligence: 8, faith: 60, brave: 70
        },
        job: { id: 'knight', name: 'Chevalier', level: 1, experience: 0, requiredExp: 100, skills: [], statBonuses: {} },
        equipment: {},
        facing: Direction.SOUTH,
        isAlive: true
      }),
      createUnit({
        id: 'player2',
        name: 'Mage',
        teamId: 'player',
        position: { x: 3, y: 2, z: 0 },
        spriteId: 'unit_sprite',
        stats: {
          hp: 80, hpMax: 80, mp: 80, mpMax: 80, attack: 10, defense: 10, speed: 10, range: 3, movement: 3, agility: 12, intelligence: 20, faith: 80, brave: 40
        },
        job: { id: 'mage', name: 'Mage', level: 1, experience: 0, requiredExp: 100, skills: [], statBonuses: {} },
        equipment: {},
        facing: Direction.SOUTH,
        isAlive: true
      }),
      createUnit({
        id: 'enemy1',
        name: 'Gobelin',
        teamId: 'enemy',
        position: { x: 15, y: 16, z: 0 },
        spriteId: 'unit_sprite',
        stats: {
          hp: 60, hpMax: 60, mp: 10, mpMax: 10, attack: 15, defense: 8, speed: 14, range: 1, movement: 5, agility: 16, intelligence: 4, faith: 20, brave: 30
        },
        job: { id: 'goblin', name: 'Gobelin', level: 1, experience: 0, requiredExp: 100, skills: [], statBonuses: {} },
        equipment: {},
        facing: Direction.SOUTH,
        isAlive: true
      }),
      createUnit({
        id: 'enemy2',
        name: 'Orc',
        teamId: 'enemy',
        position: { x: 16, y: 15, z: 0 },
        spriteId: 'unit_sprite',
        stats: {
          hp: 100, hpMax: 100, mp: 20, mpMax: 20, attack: 30, defense: 15, speed: 8, range: 1, movement: 3, agility: 10, intelligence: 6, faith: 25, brave: 50
        },
        job: { id: 'orc', name: 'Orc', level: 1, experience: 0, requiredExp: 100, skills: [], statBonuses: {} },
        equipment: {},
        facing: Direction.SOUTH,
        isAlive: true
      })
    ];
    
    // Créer l'état du combat
    const battleState = createBattleState({
      participants: testUnits,
      gridSize: { width: 20, height: 20 }
    });
    
    this.battleState.set(battleState);
    console.log('Test battle created:', battleState);
  }
  
  private renderTestScene(): void {
    console.log('Rendering test scene...');
    
    // Générer la grille de terrain
    this.generateTerrain(20, 20);
    
    // Placer les unités de test
    const battle = this.battleState();
    if (battle) {
      this.renderUnits(battle.participants);
    }
    
    // Centrer la caméra sur le champ de bataille
    this.camera.frameArea([
      { x: 0, y: 0, z: 0 },
      { x: 19, y: 19, z: 0 }
    ], 100);
  }
  
  private generateTerrain(width: number, height: number): void {
    console.log(`Generating ${width}x${height} terrain grid...`);
    
    const terrainContainer = this.pixiEngine.terrainLayer;
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tileSprite = this.spriteManager.getSprite('grass_tile', { gridX: x, gridY: y });
        
        if (tileSprite) {
          const isoCoords = this.isoRenderer.toIsoCoords({ x, y, z: 0 });
          const zIndex = this.isoRenderer.calculateZIndex({ x, y, z: 0 });
          
          tileSprite.sprite.position.set(isoCoords.x, isoCoords.y);
          tileSprite.sprite.zIndex = zIndex;
          
          terrainContainer.addChild(tileSprite.sprite);
        }
      }
    }
    
    console.log(`Terrain generated with ${terrainContainer.children.length} tiles`);
  }
  
  private renderUnits(units: Unit[]): void {
    console.log('Rendering units...', units);
    
    const unitsContainer = this.pixiEngine.unitsLayer;
    
    units.forEach(unit => {
      const unitSprite = this.spriteManager.getSprite('unit_sprite', { unitId: unit.id });
      
      if (unitSprite) {
        const isoCoords = this.isoRenderer.toIsoCoords(unit.position);
        const zIndex = this.isoRenderer.calculateZIndex(unit.position);
        
        // Position et profondeur
        unitSprite.sprite.position.set(isoCoords.x, isoCoords.y);
        unitSprite.sprite.zIndex = zIndex + 1000; // Au-dessus du terrain
        
        // Couleur selon l'équipe
        if (unit.teamId === 'player') {
          unitSprite.sprite.tint = 0x3498db; // Bleu
        } else {
          unitSprite.sprite.tint = 0xe74c3c; // Rouge
        }
        
        unitsContainer.addChild(unitSprite.sprite);
      }
    });
    
    console.log(`Units rendered: ${unitsContainer.children.length}`);
  }
  
  private startStatsTracking(): void {
    // Mettre à jour les statistiques toutes les secondes
    setInterval(() => {
      const stats = {
        pixi: this.pixiEngine.getStats(),
        sprites: this.spriteManager.getCurrentStats(),
        camera: this.camera.getState()(),
        animations: this.animationQueue.getQueueStatus()
      };
      
      this.engineStats.set(stats);
    }, 1000);
  }
  
  // Méthodes d'interface utilisateur
  onCanvasClick(event: MouseEvent): void {
    if (!this.isInitialized()) return;
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    
    // Convertir en coordonnées monde
    const worldCoords = this.camera.screenToWorld({ x: screenX, y: screenY });
    const gridCoords = this.isoRenderer.toGridCoords(worldCoords.x, worldCoords.y);
    
    console.log('Canvas clicked:', {
      screen: { x: screenX, y: screenY },
      world: worldCoords,
      grid: gridCoords
    });
    
    // TODO: Gérer les interactions avec la grille
  }
  
  // Getters pour le template
  get hasError(): boolean {
    return this.error() !== null;
  }
  
  get canInteract(): boolean {
    return this.isInitialized() && !this.isLoading() && !this.hasError;
  }
}