import { OmitType } from '@nestjs/mapped-types';
import { CreateUserRequestDto } from './CreateUserRequest.dto';

export class CreateUserServiceDto extends OmitType(CreateUserRequestDto, [
  'signUpAuthCode',
]) {}
