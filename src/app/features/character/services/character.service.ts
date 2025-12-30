import { Injectable, signal, computed, inject } from '@angular/core';
import { Character, Job, Ability, createCharacter, calculateTotalStats } from '../models/character.models';
import { WebSocketService } from '../../../core/services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private webSocketService = inject(WebSocketService);
  
  // État réactif des personnages
  private charactersSignal = signal<Character[]>([]);
  private activeCharacterSignal = signal<Character | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Signaux calculés
  public readonly characters = this.charactersSignal.asReadonly();
  public readonly activeCharacter = this.activeCharacterSignal.asReadonly();
  public readonly isLoading = this.isLoadingSignal.asReadonly();
  public readonly error = this.errorSignal.asReadonly();
  
  public readonly activeCharacterStats = computed(() => {
    const character = this.activeCharacterSignal();
    return character ? calculateTotalStats(character) : null;
  });
  
  public readonly partyMembers = computed(() => {
    return this.charactersSignal().filter(c => !c.isNPC);
  });
  
  constructor() {
    this.initializeWebSocketEvents();
    this.loadCharacters();
  }
  
  private initializeWebSocketEvents(): void {
    this.webSocketService.on('character_updated').subscribe(data => {
      this.updateCharacterInList(data.character);
    });
    
    this.webSocketService.on('character_level_up').subscribe(data => {
      this.handleLevelUp(data.character, data.newLevel);
    });
    
    this.webSocketService.on('character_job_changed').subscribe(data => {
      this.updateCharacterJob(data.characterId, data.newJob);
    });
  }
  
  // Gestion des personnages
  public async loadCharacters(): Promise<void> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const response = await this.webSocketService.request('get_characters', {});
      this.charactersSignal.set(response.characters);
    } catch (error) {
      this.errorSignal.set('Failed to load characters');
      console.error('Failed to load characters:', error);
    } finally {
      this.isLoadingSignal.set(false);
    }
  }
  
  public async createCharacter(characterData: Partial<Character>): Promise<Character> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const newCharacter = createCharacter(characterData);
      
      const response = await this.webSocketService.request('create_character', {
        character: newCharacter
      });
      
      this.addCharacterToList(response.character);
      return response.character;
    } catch (error) {
      this.errorSignal.set('Failed to create character');
      console.error('Failed to create character:', error);
      throw error;
    } finally {
      this.isLoadingSignal.set(false);
    }
  }
  
  public async updateCharacter(character: Character): Promise<void> {
    this.errorSignal.set(null);
    
    try {
      const response = await this.webSocketService.request('update_character', {
        character
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to update character');
      console.error('Failed to update character:', error);
      throw error;
    }
  }
  
  public async deleteCharacter(characterId: string): Promise<void> {
    this.errorSignal.set(null);
    
    try {
      await this.webSocketService.request('delete_character', {
        characterId
      });
      
      this.removeCharacterFromList(characterId);
      
      if (this.activeCharacterSignal()?.id === characterId) {
        this.activeCharacterSignal.set(null);
      }
    } catch (error) {
      this.errorSignal.set('Failed to delete character');
      console.error('Failed to delete character:', error);
      throw error;
    }
  }
  
  // Gestion du personnage actif
  public setActiveCharacter(character: Character | null): void {
    this.activeCharacterSignal.set(character);
  }
  
  public getCharacterById(id: string): Character | undefined {
    return this.charactersSignal().find(c => c.id === id);
  }
  
  // Gestion des jobs
  public async changeJob(characterId: string, newJob: Job): Promise<void> {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }
    
    try {
      const response = await this.webSocketService.request('change_character_job', {
        characterId,
        jobId: newJob.id
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to change job');
      console.error('Failed to change job:', error);
      throw error;
    }
  }
  
  public async unlockJob(characterId: string, jobId: string): Promise<void> {
    try {
      const response = await this.webSocketService.request('unlock_job', {
        characterId,
        jobId
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to unlock job');
      console.error('Failed to unlock job:', error);
      throw error;
    }
  }
  
  // Gestion de l'expérience
  public async gainExperience(characterId: string, amount: number): Promise<void> {
    try {
      const response = await this.webSocketService.request('gain_experience', {
        characterId,
        amount
      });
      
      this.updateCharacterInList(response.character);
      
      if (response.leveledUp) {
        this.handleLevelUp(response.character, response.character.level);
      }
    } catch (error) {
      this.errorSignal.set('Failed to gain experience');
      console.error('Failed to gain experience:', error);
      throw error;
    }
  }
  
  // Gestion des compétences
  public async learnAbility(characterId: string, ability: Ability): Promise<void> {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }
    
    try {
      const response = await this.webSocketService.request('learn_ability', {
        characterId,
        abilityId: ability.id
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to learn ability');
      console.error('Failed to learn ability:', error);
      throw error;
    }
  }
  
  public async forgetAbility(characterId: string, abilityId: string): Promise<void> {
    try {
      const response = await this.webSocketService.request('forget_ability', {
        characterId,
        abilityId
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to forget ability');
      console.error('Failed to forget ability:', error);
      throw error;
    }
  }
  
  // Gestion de l'équipement
  public async equipItem(characterId: string, itemId: string, slot: string): Promise<void> {
    try {
      const response = await this.webSocketService.request('equip_item', {
        characterId,
        itemId,
        slot
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to equip item');
      console.error('Failed to equip item:', error);
      throw error;
    }
  }
  
  public async unequipItem(characterId: string, slot: string): Promise<void> {
    try {
      const response = await this.webSocketService.request('unequip_item', {
        characterId,
        slot
      });
      
      this.updateCharacterInList(response.character);
    } catch (error) {
      this.errorSignal.set('Failed to unequip item');
      console.error('Failed to unequip item:', error);
      throw error;
    }
  }
  
  // Gestion de la santé
  public async healCharacter(characterId: string, amount: number): Promise<void> {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }
    
    const newHP = Math.min(character.currentHP + amount, character.maxHP);
    const updatedCharacter = { ...character, currentHP: newHP };
    
    this.updateCharacterInList(updatedCharacter);
    
    try {
      await this.webSocketService.request('update_character_hp', {
        characterId,
        newHP
      });
    } catch (error) {
      // Rollback en cas d'erreur
      this.updateCharacterInList(character);
      this.errorSignal.set('Failed to heal character');
      console.error('Failed to heal character:', error);
      throw error;
    }
  }
  
  public async damageCharacter(characterId: string, amount: number): Promise<void> {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }
    
    const newHP = Math.max(character.currentHP - amount, 0);
    const updatedCharacter = { ...character, currentHP: newHP };
    
    this.updateCharacterInList(updatedCharacter);
    
    try {
      await this.webSocketService.request('update_character_hp', {
        characterId,
        newHP
      });
    } catch (error) {
      // Rollback en cas d'erreur
      this.updateCharacterInList(character);
      this.errorSignal.set('Failed to damage character');
      console.error('Failed to damage character:', error);
      throw error;
    }
  }
  
  // Méthodes utilitaires privées
  private addCharacterToList(character: Character): void {
    const currentCharacters = this.charactersSignal();
    this.charactersSignal.set([...currentCharacters, character]);
  }
  
  private updateCharacterInList(updatedCharacter: Character): void {
    const currentCharacters = this.charactersSignal();
    const index = currentCharacters.findIndex(c => c.id === updatedCharacter.id);
    
    if (index !== -1) {
      const newCharacters = [...currentCharacters];
      newCharacters[index] = updatedCharacter;
      this.charactersSignal.set(newCharacters);
      
      // Mettre à jour le personnage actif si c'est le même
      if (this.activeCharacterSignal()?.id === updatedCharacter.id) {
        this.activeCharacterSignal.set(updatedCharacter);
      }
    }
  }
  
  private updateCharacterJob(characterId: string, newJob: Job): void {
    const character = this.getCharacterById(characterId);
    if (character) {
      const updatedCharacter = { ...character, currentJob: newJob };
      this.updateCharacterInList(updatedCharacter);
    }
  }
  
  private removeCharacterFromList(characterId: string): void {
    const currentCharacters = this.charactersSignal();
    this.charactersSignal.set(currentCharacters.filter(c => c.id !== characterId));
  }
  
  private handleLevelUp(character: Character, newLevel: number): void {
    console.log(`Character ${character.name} leveled up to ${newLevel}!`);
    // Ici on pourrait ajouter des effets visuels, des notifications, etc.
  }
  
  // Méthodes de calcul et validation
  public calculateDamage(attacker: Character, defender: Character, ability?: Ability): number {
    const attackerStats = calculateTotalStats(attacker);
    const defenderStats = calculateTotalStats(defender);
    
    let baseDamage = 0;
    
    if (ability) {
      if (ability.type === 'physical') {
        baseDamage = attackerStats.strength * 2;
      } else if (ability.type === 'magical') {
        baseDamage = attackerStats.magic * 2;
      }
    } else {
      // Attaque de base
      baseDamage = attackerStats.strength;
    }
    
    // Appliquer la défense
    const defense = ability?.type === 'magical' ? 
      defenderStats.intelligence : defenderStats.vitality;
    
    const finalDamage = Math.max(1, baseDamage - defense / 2);
    
    // Variation aléatoire
    return Math.floor(finalDamage * (0.8 + Math.random() * 0.4));
  }
  
  public canEquipItem(character: Character, item: any): boolean {
    if (!item) return false;
    
    // Vérifier les restrictions de job
    if (item.allowedJobs && !item.allowedJobs.includes(character.currentJob.id)) {
      return false;
    }
    
    // Vérifier le niveau requis
    if (item.requiredLevel && character.level < item.requiredLevel) {
      return false;
    }
    
    return true;
  }
  
  public getAvailableJobs(character: Character): Job[] {
    // Cette méthode devrait récupérer tous les jobs disponibles
    // et filtrer selon les prérequis du personnage
    return character.unlockedJobs;
  }
}