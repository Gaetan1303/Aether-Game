import { TestBed } from '@angular/core/testing';
import { QuestRewardService } from './quest-reward.service';
import { PlayerStatsService } from '../../../core/services/player-stats.service';
import { createFirstQuestReward, CombatStatistics } from '../models/reward.models';

describe('QuestRewardService', () => {
  let service: QuestRewardService;
  let playerStatsService: PlayerStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestRewardService);
    playerStatsService = TestBed.inject(PlayerStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Reward Preparation', () => {
    it('should prepare rewards', () => {
      const reward = createFirstQuestReward();
      const stats: CombatStatistics = {
        turnsCount: 5,
        damageDealt: 150,
        damageTaken: 30,
        unitsLost: 0,
        healingDone: 0,
        accuracy: 80,
        criticalHits: 1,
        perfectTurns: 0,
        enemiesDefeated: 3,
        timeElapsed: 150
      };

      service.prepareRewards(reward, stats);

      expect(service.reward()).toBeTruthy();
      expect(service.statistics()).toBeTruthy();
      expect(service.displaying()).toBe(true);
    });

    it('should calculate total XP with bonus', () => {
      const reward = createFirstQuestReward();
      const stats: CombatStatistics = {
        turnsCount: 3,
        damageDealt: 200,
        damageTaken: 10,
        unitsLost: 0,
        healingDone: 0,
        accuracy: 95,
        criticalHits: 5,
        perfectTurns: 3,
        enemiesDefeated: 3,
        timeElapsed: 90
      };

      service.prepareRewards(reward, stats);
      
      const totalXP = service.totalExperience();
      expect(totalXP).toBeGreaterThan(reward.experience);
    });
  });

  describe('Reward Application', () => {
    it('should apply rewards to player', () => {
      const reward = createFirstQuestReward();
      const stats: CombatStatistics = {
        turnsCount: 5,
        damageDealt: 150,
        damageTaken: 30,
        unitsLost: 0,
        healingDone: 0,
        accuracy: 80,
        criticalHits: 1,
        perfectTurns: 0,
        enemiesDefeated: 3,
        timeElapsed: 150
      };

      const initialGold = playerStatsService.stats().gold;
      
      service.prepareRewards(reward, stats);
      const result = service.applyRewards();

      expect(result).toBeTruthy();
      expect(playerStatsService.stats().gold).toBeGreaterThan(initialGold);
    });
  });
});
