import { TestBed } from '@angular/core/testing';
import { AssetLoaderService } from './asset-loader.service';

describe('AssetLoaderService', () => {
  let service: AssetLoaderService;
  
  const mockManifest = {
    version: '1.0.0',
    bundles: {
      ui: {
        name: 'ui',
        priority: 10,
        assets: {
          button: 'textures/ui/button.png',
          panel: 'textures/ui/panel.png'
        }
      }
    },
    aliases: {
      'ui/panel': 'panel'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetLoaderService);
    
    // Mock fetch pour retourner le manifest
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockManifest)
      } as Response)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with manifest', async () => {
    await service.initialize();
    expect(service['isInitialized']).toBe(true);
  });

  it('should track loaded bundles', async () => {
    await service.initialize();
    expect(service.getLoadedBundles().length).toBe(0);
  });
});
