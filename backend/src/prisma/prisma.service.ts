import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    await this.connectWithFallback();
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
    }
  }

  async connectWithFallback() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Connected to PostgreSQL.');
    } catch (error) {
      this.connected = false;
      const message =
        error instanceof Error ? error.message : 'Unknown database connection error';

      this.logger.warn(
        `Database connection unavailable during startup. The API will start in degraded mode until PostgreSQL is reachable. ${message}`,
      );
    }
  }

  async isDatabaseReachable() {
    try {
      await this.$queryRaw`SELECT 1`;
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isConnected() {
    return this.connected;
  }
}
