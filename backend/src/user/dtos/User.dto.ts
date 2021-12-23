import { User } from '../entities/user.entity';

export class UserDto {
  id: number;
  email: string;
  nickname: string;

  static create({ id, email, nickname }: User) {
    const user: UserDto = {
      id,
      email,
      nickname,
    };

    return user;
  }
}
