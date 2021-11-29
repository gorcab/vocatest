import { PickType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './CreateUserRequest.dto';

export class ResetPasswordDto extends PickType(CreateUserRequestDto, [
  'email',
  'password',
] as const) {
  resetPasswordAuthCode: number;
}
