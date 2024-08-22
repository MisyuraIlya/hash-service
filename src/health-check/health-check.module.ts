import { Module } from '@nestjs/common';
import { HealthCheckService } from './health-check.service';
import { HealthCheckController } from './health-check.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hash } from 'src/hash/entities/hash.entity';
import { RedisModule } from 'src/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hash]),RedisModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthCheckModule {}
