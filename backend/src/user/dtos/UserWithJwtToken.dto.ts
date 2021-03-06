import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { UserDto } from './User.dto';

export class UserWithJwtTokenDto extends PickType(UserDto, [
  'id',
  'email',
  'nickname',
]) {
  accessToken: string;
  refreshToken: string;

  static create(user: User, accessToken: string, refreshToken: string) {
    const userWithJwtTokenDto: UserWithJwtTokenDto = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      accessToken,
      refreshToken,
    };

    return userWithJwtTokenDto;
  }
}
