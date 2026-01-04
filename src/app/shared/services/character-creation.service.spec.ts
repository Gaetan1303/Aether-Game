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
    const state = service.getCreationState();
    expect(state.currentStep).toBe(1);
    expect(state.isValid).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should navigate between steps', () => {
    service.goToStep(3);
    expect(service.getCreationState().currentStep).toBe(3);
    
    service.goToNextStep();
    expect(service.getCreationState().currentStep).toBe(4);
    
    service.goToPreviousStep();
    expect(service.getCreationState().currentStep).toBe(3);
  });

  it('should not navigate below step 1 or above step 5', () => {
    service.goToStep(1);
    service.goToPreviousStep();
    expect(service.getCreationState().currentStep).toBe(1);
    
    service.goToStep(5);
    service.goToNextStep();
    expect(service.getCreationState().currentStep).toBe(5);
  });

  it('should validate character data', () => {
    const character = service.getCharacterData();
    
    // Test initial state
    expect(service.isCharacterValid()).toBeFalsy();
    
    // Add required data
    service.updateCharacterData({
      nom: 'TestHero',
      apparence: {
        sexe: 'masculin',
        taille: 'moyenne',
        couleur_peau: { r: 200, g: 180, b: 160 },
        couleur_cheveux: { r: 100, g: 80, b: 60 },
        couleur_yeux: { r: 50, g: 120, b: 200 },
        style_cheveux: 'court'
      },
      job_initial: 'guerrier'
    });
    
    expect(service.isCharacterValid()).toBeTruthy();
  });
});