import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { 
  CustomisationOptions, 
  Job, 
  JoueurCreateDTO, 
  JoueurResponseDTO, 
  StartCombatRequest,
  SuccessResponse,
  ErrorResponse 
} from '../interfaces/character-creation.interface';

@Injectable({
  providedIn: 'root'
})
export class AetherApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/aether/v1';
  private readonly systemUrl = 'http://localhost:8080';

  // États réactifs
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  constructor() {
    this.checkServerStatus();
  }

  // ===== SYSTÈME =====
  
  /**
   * Vérifier l'état du serveur
   */
  ping(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.systemUrl}/ping`)
      .pipe(
        tap(() => this.isConnectedSubject.next(true)),
        catchError(error => {
          this.isConnectedSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  private checkServerStatus(): void {
    this.ping().subscribe({
      next: () => console.log('Aether API Server is ready'),
      error: () => console.warn('⚠️ Aether API Server is not available')
    });
  }

  // ===== CUSTOMISATION =====

  /**
   * Récupérer toutes les options de customisation
   */
  getCustomisationOptions(): Observable<CustomisationOptions> {
    return this.http.get<CustomisationOptions>(`${this.baseUrl}/joueurs/customisation/options`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== JOBS/CLASSES =====

  /**
   * Récupérer tous les jobs disponibles
   */
  getAvailableJobs(): Observable<{ jobs: Job[], count: number }> {
    return this.http.get<{ jobs: Job[], count: number }>(`${this.baseUrl}/joueurs/jobs`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les détails d'un job spécifique
   */
  getJobDetails(jobId: string): Observable<{ job: Job }> {
    return this.http.get<{ job: Job }>(`${this.baseUrl}/joueurs/jobs/${jobId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== CRÉATION DE PERSONNAGE =====

  /**
   * Vérifier la disponibilité d'un nom
   */
  checkNameAvailability(nom: string): Observable<{ available: boolean, suggestions?: string[] }> {
    // Note: Cette fonctionnalité n'est pas dans l'OpenAPI mais serait utile
    // En attendant, on simule une validation basique
    return new Observable(observer => {
      setTimeout(() => {
        const available = nom.length >= 3 && nom.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(nom);
        observer.next({ 
          available,
          suggestions: available ? undefined : ['Héros123', 'Aventurier', 'Tactique']
        });
        observer.complete();
      }, 500);
    });
  }

  /**
   * Créer un nouveau personnage (RESTful)
   */
  createCharacter(characterData: JoueurCreateDTO): Observable<JoueurResponseDTO> {
    return this.http.post<JoueurResponseDTO>(`${this.baseUrl}/joueurs`, characterData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Créer un nouveau personnage (Legacy endpoint - fallback)
   */
  createCharacterLegacy(characterData: JoueurCreateDTO): Observable<JoueurResponseDTO> {
    return this.http.post<JoueurResponseDTO>(`${this.baseUrl}/joueurs/create`, characterData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer un personnage par ID
   */
  getCharacter(id: string): Observable<JoueurResponseDTO> {
    return this.http.get<JoueurResponseDTO>(`${this.baseUrl}/joueurs/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Lister tous les personnages
   */
  getAllCharacters(): Observable<JoueurResponseDTO[]> {
    return this.http.get<JoueurResponseDTO[]>(`${this.baseUrl}/joueurs`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== GAMEPLAY =====

  /**
   * Démarrer un nouveau combat
   */
  startCombat(combatRequest: StartCombatRequest): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/game/combat/start`, combatRequest)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Lancer le premier combat d'un personnage (training par défaut)
   */
  startFirstCombat(joueur_id: string): Observable<SuccessResponse> {
    const combatRequest: StartCombatRequest = {
      joueur_id,
      map_id: 'tutorial_01', // Map de tutorial par défaut
      combat_type: 'training',
      max_participants: 2
    };
    
    return this.startCombat(combatRequest);
  }

  // ===== GESTION D'ERREURS =====

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de joindre le serveur Aether. Vérifiez votre connexion.';
      } else if (error.status === 400) {
        errorMessage = error.error?.error || 'Données invalides';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status === 409) {
        errorMessage = 'Ce nom est déjà utilisé';
      } else if (error.status === 501) {
        errorMessage = 'Fonctionnalité non encore disponible';
      } else {
        errorMessage = `Erreur serveur (${error.status}): ${error.error?.error || error.message}`;
      }
    }

    console.error('🔥 Erreur API Aether:', {
      status: error.status,
      message: errorMessage,
      fullError: error
    });

    return throwError(() => new Error(errorMessage));
  };

  // ===== UTILITAIRES =====

  /**
   * Convertir une couleur RVB en hex
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Convertir une couleur hex en RVB
   */
  hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}