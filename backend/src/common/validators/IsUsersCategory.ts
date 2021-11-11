import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UpdateCategoryRequestDto } from 'src/category/dtos/UpdateCategoryRequest.dto';
import { CategoryService } from 'src/category/service/category.service';
import { UserService } from 'src/user/service/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUsersCategoryConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
  ) {}

  async validate(name: string, args: ValidationArguments) {
    const userId = (args.object as UpdateCategoryRequestDto).userId;
    const id = (args.object as UpdateCategoryRequestDto).id;

    const user = await this.userService.findById(userId);
    const category = await this.categoryService.findByUserAndId(user, id);
    return !!category;
  }

  defaultMessage(args: ValidationArguments) {
    return '올바르지 않은 카테고리입니다.';
  }
}

export function IsUsersCategory(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsersCategoryConstraint,
    });
  };
}
