import { Inject, Injectable } from '@nestjs/common';
import { CreateHealthCheckDto } from './dto/create-health-check.dto';
import { UpdateHealthCheckDto } from './dto/update-health-check.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Hash } from 'src/hash/entities/hash.entity';
import { Repository } from 'typeorm';
import { REDIS_HASH } from 'src/redis.providers';
import { Redis } from 'ioredis';

@Injectable()
export class HealthCheckService {
  constructor(
    @InjectRepository(Hash)
    private readonly hashRepository: Repository<Hash>,
    @Inject(REDIS_HASH) private readonly redisService: Redis,
  ) {}

  async checkDatabase(): Promise<boolean> {
    try {
      await this.hashRepository.query('SELECT 1'); 
      return true;
    } catch (err) {
      return false;
    }
  }

  async checkRedis(): Promise<boolean> {
    try {
      await this.redisService.ping();
      return true;
    } catch (err) {
      return false;
    }
  }

}
