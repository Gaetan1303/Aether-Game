import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  CharacterCreationState, 
  CharacterCreationStep,
  CHARACTER_CREATION_STEPS,
  JoueurCreateDTO,
  CustomisationOptions,
  Job 
} from '../interfaces/character-creation.interface';



@Injectable({
  providedIn: 'root'
})
export class CharacterCreationService {
  private initialState: CharacterCreationState = {
    currentStep: 1,
    characterData: {
      nom: '',
      apparence: {
        sexe: 'masculin',
        taille: 'moyenne',
        couleur_peau: { r: 200, g: 170, b: 140 },
        couleur_cheveux: { r: 100, g: 60, b: 20 },
        couleur_yeux: { r: 50, g: 25, b: 10 },
        style_cheveux: 'court'
      },
      job_initial: 'guerrier'
    },
    isLoading: false,
    error: null,
    customizationOptions: null,
    availableJobs: [],
    selectedJobDetails: null
  };

  private stateSubject = new BehaviorSubject<CharacterCreationState>(this.initialState);
  private stepsSubject = new BehaviorSubject<CharacterCreationStep[]>([...CHARACTER_CREATION_STEPS]);

  public state$ = this.stateSubject.asObservable();
  public steps$ = this.stepsSubject.asObservable();

  get currentState(): CharacterCreationState {
    return this.stateSubject.getValue();
  }

  get currentSteps(): CharacterCreationStep[] {
    return this.stepsSubject.getValue();
  }

  getCurrentStepData(): Observable<{ state: CharacterCreationState, steps: CharacterCreationStep[] }> {
    return new Observable(observer => {
      const state = this.currentState;
      const steps = this.currentSteps;
      observer.next({ state, steps });
      observer.complete();
    });
  }

  getCurrentStep(): number {
    return this.currentState.currentStep;
  }

  goToStep(stepId: number): void {
    const maxStep = this.currentSteps.length;
    if (stepId >= 1 && stepId <= maxStep) {
      this.updateState({ currentStep: stepId });
    }
  }

  nextStep(): void {
    const current = this.currentState.currentStep;
    const maxStep = this.currentSteps.length;
    if (current < maxStep) {
      this.updateState({ currentStep: current + 1 });
    }
  }

  previousStep(): void {
    const current = this.currentState.currentStep;
    if (current > 1) {
      this.updateState({ currentStep: current - 1 });
    }
  }

  canGoNext(): boolean {
    const current = this.currentState.currentStep;
    const steps = this.currentSteps;
    const currentStepData = steps.find(s => s.id === current);
    return currentStepData ? currentStepData.isValid : false;
  }

  canGoPrevious(): boolean {
    return this.currentState.currentStep > 1;
  }

  private validateStep(stepId: number, isValid: boolean): void {
    const steps = [...this.currentSteps];
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      steps[stepIndex].isValid = isValid;
      this.stepsSubject.next(steps);
    }
  }

  updateName(nom: string): void {
    this.updateCharacterData({ nom });
    this.validateStep(1, nom.trim().length >= 2);
  }

  updateGender(sexe: 'masculin' | 'feminin' | 'autre'): void {
    this.updateCharacterData({ 
      apparence: { 
        ...this.currentState.characterData.apparence!, 
        sexe 
      } 
    });
    this.validateStep(2, !!sexe);
  }

  getNameSuggestions(): string[] {
    return [
      'Alara', 'Korren', 'Vyra', 'Thane', 'Lysia',
      'Daven', 'Nira', 'Caius', 'Mira', 'Zeth'
    ];
  }

  getAvailableGenders(): Array<{ value: string; label: string }> {
    return [
      { value: 'masculin', label: 'Masculin' },
      { value: 'feminin', label: 'Féminin' },
      { value: 'non_binaire', label: 'Non-binaire' }
    ];
  }

  getCurrentCharacterData(): JoueurCreateDTO {
    const current = this.currentState.characterData;
    return {
      nom: current.nom || '',
      apparence: current.apparence!,
      job_initial: current.job_initial!
    };
  }

  getAvailableJobs(): Job[] {
    return this.currentState.availableJobs;
  }

  getIsLoading(): boolean {
    return this.currentState.isLoading;
  }

  getError(): string | null {
    return this.currentState.error;
  }

  clearErrors(): void {
    this.updateState({ error: null });
  }

  getSelectedJobDetails(): Job | null {
    return this.currentState.selectedJobDetails;
  }

  isStepValid(stepId: number): boolean {
    const step = this.currentSteps.find(s => s.id === stepId);
    return step ? step.isValid : false;
  }

  updateAppearance(apparenceUpdate: Partial<CharacterCreationState['characterData']['apparence']>): void {
    const current = this.currentState.characterData.apparence;
    this.updateCharacterData({
      apparence: { ...current!, ...apparenceUpdate }
    });
    this.validateStep(3, true);
  }

  updateJobInitial(job_initial: 'guerrier' | 'mage' | 'archer' | 'voleur' | 'clerc'): void {
    this.updateCharacterData({ job_initial });
    this.validateStep(4, !!job_initial);
  }

  private updateCharacterData(update: Partial<JoueurCreateDTO>): void {
    const current = this.currentState;
    this.updateState({
      characterData: { ...current.characterData, ...update }
    });
  }

  setCustomizationOptions(options: CustomisationOptions): void {
    this.updateState({ customizationOptions: options });
  }

  setAvailableJobs(jobs: Job[]): void {
    this.updateState({ availableJobs: jobs });
  }

  setSelectedJobDetails(job: Job | null): void {
    this.updateState({ selectedJobDetails: job });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  reset(): void {
    this.stateSubject.next({ ...this.initialState });
    this.stepsSubject.next([...CHARACTER_CREATION_STEPS]);
  }

  getCompleteCharacterData(): JoueurCreateDTO | null {
    const { characterData } = this.currentState;
    
    if (!characterData.nom || !characterData.apparence || !characterData.job_initial) {
      return null;
    }
    
    return {
      nom: characterData.nom,
      apparence: characterData.apparence,
      job_initial: characterData.job_initial
    };
  }

  isAllStepsValid(): boolean {
    return this.currentSteps.every(step => step.isValid);
  }

  randomizeAppearance(): void {
    const randomColor = (): { r: number, g: number, b: number } => ({
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    });

    const tailles = ['petite', 'moyenne', 'grande'] as const;
    const styles = ['court', 'long', 'bouclé', 'rasé'];

    this.updateAppearance({
      taille: tailles[Math.floor(Math.random() * tailles.length)],
      couleur_peau: randomColor(),
      couleur_cheveux: randomColor(),
      couleur_yeux: randomColor(),
      style_cheveux: styles[Math.floor(Math.random() * styles.length)]
    });
  }

  private updateState(update: Partial<CharacterCreationState>): void {
    const current = this.currentState;
    this.stateSubject.next({ ...current, ...update });
  }
}