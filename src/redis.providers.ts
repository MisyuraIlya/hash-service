// redis.providers.ts
import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_HASH = 'REDIS_HASH';

export const redisProviders: Provider[] = [
  {
    provide: REDIS_HASH,
    useFactory: () => {
      return new Redis({
        host:'redis-test-01.tulhxo.ng.0001.euc1.cache.amazonaws.com',
        port:6379
      });
    },
  },
];
