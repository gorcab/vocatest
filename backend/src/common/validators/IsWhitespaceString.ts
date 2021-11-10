import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsWhitespaceString(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isWhitespaceString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.trim().length > 0;
        },
      },
    });
  };
}
