import { PickType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './CreateUserRequest.dto';

export class DeleteUserDto extends PickType(CreateUserRequestDto, [
  'email',
  'password',
] as const) {}
