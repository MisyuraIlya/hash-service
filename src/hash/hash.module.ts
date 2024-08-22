import { Module } from '@nestjs/common';
import { HashService } from './hash.service';
import { HashController } from './hash.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hash } from './entities/hash.entity';
import { RedisModule } from '../redis.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Hash]),RedisModule],
  controllers: [HashController],
  providers: [HashService],
})
export class HashModule {}
