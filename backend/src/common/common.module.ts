import { Module } from '@nestjs/common';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { IsEmailAlreadyExistConstraint } from './validators/IsEmailAlreadyExist';
import { IsValidUserConstraint } from './validators/IsvalidUser';
import { IsSignUpAuthCodeConstraint } from './validators/IsSignUpAuthCode';

@Module({
  imports: [UserModule, CategoryModule],
  providers: [
    IsEmailAlreadyExistConstraint,
    IsSignUpAuthCodeConstraint,
    IsValidUserConstraint,
  ],
  exports: [
    IsEmailAlreadyExistConstraint,
    IsSignUpAuthCodeConstraint,
    IsValidUserConstraint,
  ],
})
export class CommonModule {}
