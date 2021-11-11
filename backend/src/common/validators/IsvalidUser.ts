import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { UserService } from 'src/user/service/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidUserConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(id: number, args: ValidationArguments) {
    const user = await this.userService.findById(id);
    return !!user;
  }

  defaultMessage(args: ValidationArguments) {
    return '올바르지 않은 사용자입니다.';
  }
}

export function IsValidUser(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUserConstraint,
    });
  };
}
