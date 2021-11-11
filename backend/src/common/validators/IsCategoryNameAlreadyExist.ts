import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CreateCategoryDto } from 'src/category/dtos/CreateCategory.dto';
import { CategoryService } from 'src/category/service/category.service';
import { UserService } from 'src/user/service/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCategoryNameAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
  ) {}

  async validate(name: string, args: ValidationArguments) {
    const userId = (args.object as CreateCategoryDto).userId;

    const user = await this.userService.findById(userId);
    const category = await this.categoryService.findByUserAndName(user, name);
    return !category;
  }

  defaultMessage(args: ValidationArguments) {
    return '이미 존재하는 카테고리명입니다.';
  }
}

export function IsCategoryNameAlreadyExist(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCategoryNameAlreadyExistConstraint,
    });
  };
}
