import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS } from './constant/redis.constant';

@Module({
  providers: [
    {
      provide: REDIS,
      useValue:
        process.env.NODE_ENV === 'production'
          ? async () => {
              return createClient({
                url: process.env.REDIS_URL,
              });
            }
          : createClient(),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
