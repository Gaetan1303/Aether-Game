// ===== INTERFACES API OPENAPI =====

export interface CouleurDTO {
  r: number; // 0-255
  g: number; // 0-255  
  b: number; // 0-255
}

export interface ApparencePhysiqueDTO {
  sexe: 'masculin' | 'feminin' | 'autre';
  taille: 'petite' | 'moyenne' | 'grande';
  couleur_peau: CouleurDTO;
  couleur_cheveux: CouleurDTO;
  couleur_yeux: CouleurDTO;
  style_cheveux: string;
  style_barbe?: string;
}

export interface JoueurCreateDTO {
  nom: string; // 3-20 caractères
  apparence: ApparencePhysiqueDTO;
  job_initial: 'guerrier' | 'mage' | 'archer' | 'voleur' | 'clerc';
}

export interface Stats {
  HP: number;
  MP: number;
  Stamina: number;
  ATK: number;
  DEF: number;
  MATK: number;
  MDEF: number;
  SPD: number;
  MOV: number;
  ATH: number;
}

export interface Job {
  id: string;
  nom: string;
  description: string;
  stats_principales: string[];
  competences_base: string[];
  competences_niveau: { [niveau: string]: string[] };
}

export interface JoueurResponseDTO {
  id: string;
  nom: string;
  apparence: ApparencePhysiqueDTO;
  niveau: number;
  experience: number;
  experience_max: number;
  job_actuel: string;
  jobs_debloquees: string[];
  stats_base: Stats;
  date_creation: string;
  dernier_login: string;
  temps_jeu: string;
  zone_actuelle: string;
  sous_zone: string;
}

export interface CouleurOption {
  nom: string;
  r: number;
  g: number;
  b: number;
  type: 'peau' | 'cheveux' | 'yeux';
}

export interface CustomisationOptions {
  sexes: string[];
  tailles: string[];
  styles_cheveux: string[];
  styles_barbe: string[];
  couleurs_predefinies: CouleurOption[];
  tatouages_disponibles: any[]; // À définir si nécessaire
  cicatrices_disponibles: any[]; // À définir si nécessaire
}

export interface StartCombatRequest {
  joueur_id: string;
  map_id: string;
  combat_type?: 'pve' | 'pvp' | 'training';
  max_participants?: number;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
}

export interface SuccessResponse {
  message: string;
  data?: any;
  timestamp: string;
}

// ===== INTERFACES APPLICATION =====

export interface CharacterCreationState {
  currentStep: number;
  characterData: Partial<JoueurCreateDTO>;
  customizationOptions: CustomisationOptions | null;
  availableJobs: Job[];
  selectedJobDetails: Job | null;
  isLoading: boolean;
  error: string | null;
}

export interface CharacterCreationStep {
  id: number;
  name: string;
  title: string;
  component: string;
  isValid: boolean;
  isVisited: boolean;
}

export const CHARACTER_CREATION_STEPS: CharacterCreationStep[] = [
  { id: 1, name: 'name', title: 'Nom du Héros', component: 'NameStepComponent', isValid: false, isVisited: false },
  { id: 2, name: 'gender', title: 'Identité', component: 'GenderStepComponent', isValid: false, isVisited: false },
  { id: 3, name: 'appearance', title: 'Apparence', component: 'AppearanceStepComponent', isValid: false, isVisited: false },
  { id: 4, name: 'class', title: 'Classe', component: 'ClassStepComponent', isValid: false, isVisited: false },
  { id: 5, name: 'summary', title: 'Validation', component: 'SummaryStepComponent', isValid: false, isVisited: false }
];