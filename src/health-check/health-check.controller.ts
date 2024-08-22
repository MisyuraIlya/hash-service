import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthCheckService } from './health-check.service';
import { CreateHealthCheckDto } from './dto/create-health-check.dto';
import { UpdateHealthCheckDto } from './dto/update-health-check.dto';

@Controller('health-check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  async healthCheck() {
    const databaseHealthy = await this.healthCheckService.checkDatabase();
    const redisHealthy = await this.healthCheckService.checkRedis();

    if (databaseHealthy && redisHealthy) {
      return { status: 'ok' };
    } else {
      return {
        status: 'error',
        database: databaseHealthy ? 'ok' : 'error',
        redis: redisHealthy ? 'ok' : 'error',
      };
    }
  }
}
