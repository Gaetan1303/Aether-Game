import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  constructor() {
    this.initializeAuth();
  }

  getAuthState() {
    return this.authState.asReadonly();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Implémentation temporaire avec fallback pour tests
      try {
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
      } catch (apiError) {
        // Fallback pour tests en mode hors ligne
        console.warn('API Auth non disponible, utilisation du mode test');
        if (username === 'test' || username === 'admin') {
          const mockToken = 'mock_token_' + Date.now();
          const mockUser = {
            id: '1',
            username: username,
            email: `${username}@test.com`,
            roles: ['player']
          };
          
          this.setAuthData(mockToken, mockUser);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async register(username: string, email: string, password: string): Promise<boolean> {
    try {
      // Implémentation temporaire avec fallback pour tests
      try {
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
      } catch (apiError) {
        // Fallback pour tests
        const mockToken = 'mock_token_' + Date.now();
        const mockUser = {
          id: '2',
          username: username,
          email: email,
          roles: ['player']
        };
        
        this.setAuthData(mockToken, mockUser);
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

  private initializeAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Vérifier la validité du token et récupérer les données utilisateur
      const mockUser = {
        id: '1',
        username: 'user',
        email: 'user@test.com',
        roles: ['player']
      };
      this.setAuthData(token, mockUser);
    }
  }
}