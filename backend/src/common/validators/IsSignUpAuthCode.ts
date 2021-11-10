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
export class IsSignUpAuthCodeConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly userService: UserService) {}

  async validate(signUpAuthCode: number, args: ValidationArguments) {
    const email = (args.object as any)['email'];
    if (!email) {
      throw new Error("email property doesn't exist.");
    }
    const isValid = await this.userService.validateSignUpAuthCode(
      email,
      signUpAuthCode,
    );
    return isValid;
  }

  defaultMessage(args: ValidationArguments) {
    return '인증 번호가 올바르지 않습니다.';
  }
}

export function IsSignUpAuthCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSignUpAuthCodeConstraint,
    });
  };
}
