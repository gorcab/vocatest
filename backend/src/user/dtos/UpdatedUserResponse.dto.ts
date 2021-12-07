import { User } from '../entities/user.entity';
import { UserDto } from './User.dto';

export class UpdatedUserResponseDto extends UserDto {
  static create(user: User) {
    const updatedUserResponseDto: UpdatedUserResponseDto = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    return updatedUserResponseDto;
  }
}
