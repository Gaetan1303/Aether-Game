import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  private tokenKey = 'aether_auth_token';

  constructor() {
    this.initializeFromStorage();
  }

  getAuthState() {
    return this.authState.asReadonly();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // TODO: Remplacer par vraie API call
      const response = await fetch(`${environment.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data;
        
        this.setAuthData(token, user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async register(username: string, email: string, password: string): Promise<boolean> {
    try {
      // TODO: Remplacer par vraie API call
      const response = await fetch(`${environment.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data;
        
        this.setAuthData(token, user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authState.set({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  getToken(): string | null {
    return this.authState().token;
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    this.authState.set({
      isAuthenticated: true,
      user,
      token
    });
  }

  private initializeFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // TODO: Vérifier la validité du token
      // TODO: Récupérer les données utilisateur depuis le token ou l'API
      console.log('Token found in storage, validating...');
    }
  }

  // TODO: Ajouter méthode de refresh token
  // TODO: Ajouter validation JWT côté client
  // TODO: Ajouter gestion des rôles/permissions
}