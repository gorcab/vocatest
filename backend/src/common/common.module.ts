import { Module } from '@nestjs/common';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { IsCategoryNameAlreadyExistConstraint } from './validators/IsCategoryNameAlreadyExist';
import { IsEmailAlreadyExistConstraint } from './validators/IsEmailAlreadyExist';
import { IsValidUserConstraint } from './validators/IsvalidUser';
import { IsSignUpAuthCodeConstraint } from './validators/IsSignUpAuthCode';
import { IsUsersCategoryConstraint } from './validators/IsUsersCategory';

@Module({
  imports: [UserModule, CategoryModule],
  providers: [
    IsEmailAlreadyExistConstraint,
    IsSignUpAuthCodeConstraint,
    IsValidUserConstraint,
    IsCategoryNameAlreadyExistConstraint,
    IsUsersCategoryConstraint,
  ],
  exports: [
    IsEmailAlreadyExistConstraint,
    IsSignUpAuthCodeConstraint,
    IsValidUserConstraint,
    IsCategoryNameAlreadyExistConstraint,
    IsUsersCategoryConstraint,
  ],
})
export class CommonModule {}
