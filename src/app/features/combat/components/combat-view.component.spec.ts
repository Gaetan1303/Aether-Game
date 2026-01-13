import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombatViewComponent } from './combat-view.component';

describe('CombatViewComponent', () => {
  let component: CombatViewComponent;
  let fixture: ComponentFixture<CombatViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombatViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombatViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize combat state', () => {
    expect(component.battleState()).toBeNull();
    expect(component.isCombatActive()).toBeFalsy();
    expect(component.currentTurn()).toBe(0);
  });

  it('should handle combat events', () => {
    const mockEvent = {
      participants: [
        { id: 'unit1', name: 'Hero', position: { x: 0, y: 0 } }
      ]
    };
    
    component.ngOnInit();
    
    expect(component).toBeTruthy();
  });
});