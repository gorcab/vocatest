import { OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { UserResponseDto } from './UserResponse.dto';

export class UpdatedUserResponseDto extends OmitType(UserResponseDto, [
  'accessToken',
] as const) {
  static create(user: User) {
    const updatedUserResponseDto: UpdatedUserResponseDto = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    return updatedUserResponseDto;
  }
}
