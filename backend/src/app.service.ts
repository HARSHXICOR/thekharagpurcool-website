import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getApiInfo() {
    return {
      name: 'The Kharagpur Wala API',
      version: '1.0',
      status: 'ok',
      docs: '/api/docs',
      basePath: '/api/v1',
    };
  }

  getLiveStatus() {
    return {
      status: 'ok',
      service: 'tgw-backend',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadyStatus() {
    const databaseReachable = await this.prisma.isDatabaseReachable();

    if (!databaseReachable) {
      throw new ServiceUnavailableException({
        status: 'error',
        checks: {
          database: 'down',
        },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ok',
      checks: {
        database: 'up',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
