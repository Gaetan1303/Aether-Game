import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login with test credentials', async () => {
    const result = await service.login('test', 'password');
    expect(result).toBeTruthy();
    expect(service.getAuthState()().isAuthenticated).toBeTruthy();
  });

  it('should reject invalid credentials', async () => {
    const result = await service.login('invalid', 'credentials');
    expect(result).toBeFalsy();
    expect(service.getAuthState()().isAuthenticated).toBeFalsy();
  });

  it('should logout correctly', () => {
    // First login
    service.login('test', 'password');
    
    // Then logout
    service.logout();
    expect(service.getAuthState()().isAuthenticated).toBeFalsy();
    expect(service.getAuthState()().user).toBeNull();
  });
});