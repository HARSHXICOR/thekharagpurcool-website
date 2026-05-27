import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const mockAppService = {
    getApiInfo: jest.fn().mockReturnValue({
      name: 'The Kharagpur Wala API',
      version: '1.0',
      status: 'ok',
      docs: '/api/docs',
      basePath: '/api/v1',
    }),
    getLiveStatus: jest.fn().mockReturnValue({
      status: 'ok',
      service: 'tgw-backend',
      timestamp: '2026-05-25T00:00:00.000Z',
    }),
    getReadyStatus: jest.fn().mockResolvedValue({
      status: 'ok',
      checks: { database: 'up' },
      timestamp: '2026-05-25T00:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API metadata', () => {
      expect(appController.getApiInfo()).toEqual({
        name: 'The Kharagpur Wala API',
        version: '1.0',
        status: 'ok',
        docs: '/api/docs',
        basePath: '/api/v1',
      });
    });

    it('should return live health status', () => {
      expect(appController.getLiveStatus()).toEqual({
        status: 'ok',
        service: 'tgw-backend',
        timestamp: '2026-05-25T00:00:00.000Z',
      });
    });

    it('should return ready health status', async () => {
      await expect(appController.getReadyStatus()).resolves.toEqual({
        status: 'ok',
        checks: { database: 'up' },
        timestamp: '2026-05-25T00:00:00.000Z',
      });
    });
  });
});
