/**
 * Service de validation et sanitization des données utilisateur
 * Sécurise les inputs pour éviter les injections et données malformées
 */
export class ValidationService {
  
  /**
   * Nettoie une chaîne de caractères des caractères dangereux
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/[<>\"']/g, '') // Supprime caractères HTML dangereux
      .replace(/javascript:/gi, '') // Supprime protocol javascript
      .trim()
      .substring(0, 100); // Limite à 100 caractères
  }

  /**
   * Valide un nom de personnage
   */
  static validateCharacterName(name: string): { valid: boolean; error?: string } {
    const sanitized = this.sanitizeString(name);
    
    if (!sanitized) {
      return { valid: false, error: 'Le nom ne peut pas être vide' };
    }
    
    if (sanitized.length < 3) {
      return { valid: false, error: 'Le nom doit contenir au moins 3 caractères' };
    }
    
    if (sanitized.length > 20) {
      return { valid: false, error: 'Le nom ne peut pas dépasser 20 caractères' };
    }
    
    if (!/^[a-zA-ZÀ-ÿ0-9_-]+$/.test(sanitized)) {
      return { valid: false, error: 'Le nom contient des caractères interdits' };
    }
    
    return { valid: true };
  }

  /**
   * Valide un email
   */
  static validateEmail(email: string): { valid: boolean; error?: string } {
    const sanitized = this.sanitizeString(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      return { valid: false, error: 'Format d\\'email invalide' };
    }
    
    return { valid: true };
  }

  /**
   * Valide les valeurs RGB
   */
  static validateRGBColor(color: { r: number; g: number; b: number }): { valid: boolean; error?: string } {
    if (!color || typeof color !== 'object') {
      return { valid: false, error: 'Couleur invalide' };
    }
    
    const { r, g, b } = color;
    
    if ([r, g, b].some(val => typeof val !== 'number' || val < 0 || val > 255)) {
      return { valid: false, error: 'Les valeurs RGB doivent être entre 0 et 255' };
    }
    
    return { valid: true };
  }

  /**
   * Valide un mot de passe
   */
  static validatePassword(password: string): { valid: boolean; error?: string; strength?: number } {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Mot de passe requis', strength: 0 };
    }
    
    if (password.length < 6) {
      return { valid: false, error: 'Le mot de passe doit contenir au moins 6 caractères', strength: 1 };
    }
    
    let strength = 2;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return { valid: true, strength };
  }

  /**
   * Valide les coordonnées de grille
   */
  static validateGridPosition(position: { x: number; y: number }): { valid: boolean; error?: string } {
    if (!position || typeof position !== 'object') {
      return { valid: false, error: 'Position invalide' };
    }
    
    const { x, y } = position;
    
    if (typeof x !== 'number' || typeof y !== 'number' || x < 0 || y < 0 || x > 20 || y > 20) {
      return { valid: false, error: 'Position hors limites de grille' };
    }
    
    return { valid: true };
  }
}