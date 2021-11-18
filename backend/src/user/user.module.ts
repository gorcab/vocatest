import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { EmailModule } from 'src/email/email.module';
import { AuthModule } from 'src/auth/auth.module';
import { AvailableEmailGuard } from './guards/AvailableEmail.guard';
import { ValidSignUpAuthCodeGuard } from './guards/ValidSignUpAuthCode.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, AvailableEmailGuard, ValidSignUpAuthCodeGuard],
  exports: [UserService],
})
export class UserModule {}
