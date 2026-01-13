import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameFlowService } from './game-flow.service';

describe('GameFlowService', () => {
  let service: GameFlowService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(GameFlowService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Game Session', () => {
    it('should start new session', () => {
      service.startNewSession('Arthas', 'Paladin');
      
      expect(router.navigate).toHaveBeenCalledWith(['/story']);
    });

    it('should complete combat', () => {
      service.startNewSession('TestHero', 'Warrior');
      
      service.completeCombat(3, 150, 50, 5);
      
      expect(router.navigate).toHaveBeenCalledWith(['/story']);
    });
  });
});
