import { TestBed } from '@angular/core/testing';
import { CharacterCreationService } from './character-creation.service';
import { CharacterCreationState } from '../interfaces/character-creation.interface';

describe('CharacterCreationService', () => {
  let service: CharacterCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default state', () => {
    const state = service.currentState;
    expect(state.currentStep).toBe(1);
    expect(state.isLoading).toBe(false);
  });

  it('should navigate between steps', () => {
    service.goToStep(3);
    expect(service.currentState.currentStep).toBe(3);
    
    service.nextStep();
    expect(service.currentState.currentStep).toBe(4);
    
    service.previousStep();
    expect(service.currentState.currentStep).toBe(3);
  });

  it('should not navigate below step 1 or above step 5', () => {
    service.goToStep(1);
    service.previousStep();
    expect(service.currentState.currentStep).toBe(1);
    
    service.goToStep(5);
    service.nextStep();
    expect(service.currentState.currentStep).toBe(5);
  });

  it('should have character data structure', () => {
    const character = service.currentState.characterData;
    
    // Vérifier la structure des données
    expect(character).toBeDefined();
    expect(character.nom).toBeDefined();
    expect(character.apparence).toBeDefined();
  });
    
    expect(service.currentState.characterData.nom).toBe('TestHero');
  });
});