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
export class IsEmailAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UserService) {}

  async validate(email: string, args: ValidationArguments) {
    const user = await this.userService.findByEmail(email);
    return !user;
  }

  defaultMessage(args: ValidationArguments) {
    return '이미 존재하는 이메일입니다.';
  }
}

export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailAlreadyExistConstraint,
    });
  };
}
