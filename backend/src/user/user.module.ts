import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { EmailModule } from 'src/email/email.module';
import { AuthModule } from 'src/auth/auth.module';
import { AvailableEmailGuard } from './guards/AvailableEmail.guard';
import { ValidSignUpAuthCodeGuard } from './guards/ValidSignUpAuthCode.guard';
import { ValidResetPasswordAuthCodeGuard } from './guards/ValidResetPasswordAuthCode.guard';
import { RegisteredEmailGuard } from './guards/RegisteredEmail.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AvailableEmailGuard,
    ValidSignUpAuthCodeGuard,
    RegisteredEmailGuard,
    ValidResetPasswordAuthCodeGuard,
  ],
  exports: [UserService, RegisteredEmailGuard],
})
export class UserModule {}
