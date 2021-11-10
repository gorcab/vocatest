import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { IsEmailAlreadyExistConstraint } from './validators/IsEmailAlreadyExist';
import { IsSignUpAuthCodeConstraint } from './validators/IsSignUpAuthCode';

@Module({
  imports: [UserModule],
  providers: [IsEmailAlreadyExistConstraint, IsSignUpAuthCodeConstraint],
  exports: [IsEmailAlreadyExistConstraint, IsSignUpAuthCodeConstraint],
})
export class CommonModule {}
