import { TestBed } from '@angular/core/testing';
import { StoryService } from './story.service';
import { createFirstQuestStory, Story, DialogNode } from '../models/story.models';

describe('StoryService', () => {
  let service: StoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Story Navigation', () => {
    it('should start a story', () => {
      const story = createFirstQuestStory('TestPlayer', 'Warrior');
      
      service.startStory(story);
      
      expect(service.story()).toBeTruthy();
      expect(service.node()).toBeTruthy();
      expect(service.playing()).toBe(true);
      expect(service.isComplete()).toBe(false);
    });

    it('should advance through story', () => {
      const story = createFirstQuestStory('TestPlayer', 'Warrior');
      service.startStory(story);
      
      const firstNode = service.node();
      
      if (service.canAdvance()) {
        service.advance();
        const secondNode = service.node();
        expect(secondNode).toBeTruthy();
        expect(secondNode?.id).not.toBe(firstNode?.id);
      }
    });

    it('should complete story when finished', () => {
      const story = createFirstQuestStory('TestPlayer', 'Warrior');
      service.startStory(story);
      
      // Avancer jusqu'à la fin
      let safetyCounter = 0;
      while (service.canAdvance() && !service.isComplete() && safetyCounter < 20) {
        service.advance();
        safetyCounter++;
      }
      
      expect(service.isComplete()).toBe(true);
    });
  });

  describe('Story Signals', () => {
    it('should expose readonly signals', () => {
      expect(service.story).toBeTruthy();
      expect(service.node).toBeTruthy();
      expect(service.playing).toBeTruthy();
      expect(service.storyProgress).toBeTruthy();
    });

    it('should have computed signals', () => {
      expect(service.isComplete).toBeTruthy();
      expect(service.hasChoices).toBeTruthy();
      expect(service.canAdvance).toBeTruthy();
    });
  });

  describe('Story Completion', () => {
    it('should mark story as complete', () => {
      const story = createFirstQuestStory('TestPlayer', 'Warrior');
      
      service.startStory(story);
      
      // Avancer jusqu'à la fin
      let safetyCounter = 0;
      while (service.canAdvance() && safetyCounter < 20) {
        service.advance();
        safetyCounter++;
      }
      
      expect(service.isComplete()).toBe(true);
    });
  });
});
