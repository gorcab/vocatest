import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          store: redisStore,
          host:
            process.env.NODE_ENV !== 'production'
              ? 'localhost'
              : process.env.REDIS_HOST,
          port: 6379,
        };
      },
    }),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
