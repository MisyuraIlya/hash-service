import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hash } from './entities/hash.entity';
import { REDIS_HASH } from 'src/redis.providers';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class HashService {
  constructor(
    @InjectRepository(Hash)
    private readonly hashRepository: Repository<Hash>,
    @Inject(REDIS_HASH) private readonly redisService: Redis,
  ) {}

  async generateHash(): Promise<string> {
    const cachedHash = await this.redisService.get('current_hash');
    if (cachedHash) {
      console.log('get hash from cache')
      this.updateCacheWithNewHash();
      await this.updateUsed(cachedHash)
      return cachedHash;
    }

    const newHash = await this.createAndCacheNewHash();
    this.updateCacheWithNewHash();
    return newHash;
  }

  private async createAndCacheNewHash(): Promise<string> {
    
    const unused = await this.useUnusedHash()
    if(unused){
      return unused;
    } else {
      console.log('create hash')
      const create = new Hash()
      await this.hashRepository.save(create);
      const hash = this.generateShortHash(create.id.toString());
      create.hash = hash; 
      create.isUsed = true
      this.hashRepository.save(create);
      return hash;
    }

  }

  private async updateCacheWithNewHash(): Promise<void> {
    const unused = await this.useUnusedHash();
    const cachedHash = await this.redisService.get('current_hash');
    if (unused && !cachedHash) {
      await this.redisService.set('current_hash', unused);
    } else {
      let hashRecord = new Hash();
      hashRecord.isUsed = false;
      hashRecord = await this.hashRepository.save(hashRecord);
      const newHash = this.generateShortHash(hashRecord.id.toString());
      hashRecord.hash = newHash;
      await this.hashRepository.save(hashRecord);
      await this.redisService.set('current_hash', newHash);
    }
  }

  private async updateUsed(hash: string): Promise<void> {
    const res = await this.hashRepository.findOne({
      where:{hash}
    })
    if(res){
      res.isUsed = true
      this.hashRepository.save(res)
    }
  }

  private async useUnusedHash(): Promise<string> {
    const find = await this.hashRepository.findOne({
      where:{isUsed:false}
    })
    if(find){
      find.isUsed = true
      this.hashRepository.save(find)
      return find.hash
    } else {
      return null
    }
  }

  private generateShortHash(input: string): string {
    const hash = crypto.createHash('sha256').update(input).digest('base64url');
    return hash.substring(0, 8);
  }
}
