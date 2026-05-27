import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  @Get('health/live')
  getLiveStatus() {
    return this.appService.getLiveStatus();
  }

  @Get('health/ready')
  getReadyStatus() {
    return this.appService.getReadyStatus();
  }
}
