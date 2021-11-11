import { Module } from '@nestjs/common';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { IsCategoryNameAlreadyExistConstraint } from './validators/IsCategoryNameAlreadyExist';
import { IsEmailAlreadyExistConstraint } from './validators/IsEmailAlreadyExist';
import { IsInvalidUserConstraint } from './validators/IsInvalidUser';
import { IsSignUpAuthCodeConstraint } from './validators/IsSignUpAuthCode';

@Module({
  imports: [UserModule, CategoryModule],
  providers: [
    IsEmailAlreadyExistConstraint,
    IsSignUpAuthCodeConstraint,
    IsInvalidUserConstraint,
    IsCategoryNameAlreadyExistConstraint,
  ],
  exports: [
    IsEmailAlreadyExistConstraint,
    IsSignUpAuthCodeConstraint,
    IsInvalidUserConstraint,
    IsCategoryNameAlreadyExistConstraint,
  ],
})
export class CommonModule {}
