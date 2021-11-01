import { Module } from '@nestjs/common';
import * as Redis from 'redis';

import { REDIS } from './redis.constant';

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: Redis.createClient({
        port: 6739,
        host: 'localhost',
      }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
