import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserServiceDto } from '../dtos/CreateUserService.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UpdatedUserResponseDto } from '../dtos/UpdatedUserResponse.dto';
import { AUTH_CODE_PURPOSE, SIGN_UP_TTL } from 'src/auth/constants';
import { ResetPasswordDto } from '../dtos/ResetPassword.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly redisService: Cache,
  ) {}

  public async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  public async findById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  public async validateSignUpAuthCode(
    email: string,
    signUpAuthCode: number,
  ): Promise<boolean> {
    const savedSignUpAuthCode = await this.redisService.get<number>(
      `${AUTH_CODE_PURPOSE.SIGN_UP}${email}`,
    );
    return Number(savedSignUpAuthCode) === signUpAuthCode;
  }

  public async validateResetPasswordAuthCode(
    email: string,
    resetPasswordAuthCode: number,
  ): Promise<boolean> {
    const savedResetPasswordAuthCode = await this.redisService.get<number>(
      `${AUTH_CODE_PURPOSE.RESET_PWD}${email}`,
    );
    return Number(savedResetPasswordAuthCode) === resetPasswordAuthCode;
  }

  public async save({
    email,
    password,
    nickname,
  }: CreateUserServiceDto): Promise<User> {
    await this.deleteSignUpAuthCode(email);
    const encryptedPassword = await this.encryptPassword(password);
    const user = this.userRepository.create({
      email,
      password: encryptedPassword,
      nickname,
    });
    await this.userRepository.save(user);
    return user;
  }

  public async findOneByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<null | User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
      return null;
    }

    return user;
  }

  public async update(
    user: User,
    { newNickname, newPassword }: UpdateUserDto,
  ): Promise<UpdatedUserResponseDto> {
    const partialUser: Partial<User> = {
      ...(newNickname && { nickname: newNickname }),
      ...(newPassword && { password: await this.encryptPassword(newPassword) }),
    };

    await this.userRepository.update(user.id, partialUser);
    const updatedUser = await this.userRepository.findOne(user.id);
    return UpdatedUserResponseDto.create(updatedUser);
  }

  public async delete(user: User): Promise<void> {
    await this.userRepository.delete(user.id);
  }

  public async updatePassword(email: string, password: string): Promise<void> {
    await this.deleteResetPasswordAuthCode(email);
    const encryptedPassword = await this.encryptPassword(password);
    await this.userRepository.update(
      { email },
      { password: encryptedPassword },
    );
  }

  private async deleteSignUpAuthCode(email: string): Promise<void> {
    await this.redisService.del(`${AUTH_CODE_PURPOSE.SIGN_UP}${email}`);
  }

  private async deleteResetPasswordAuthCode(email: string): Promise<void> {
    await this.redisService.del(`${AUTH_CODE_PURPOSE.RESET_PWD}${email}`);
  }

  private async encryptPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }
}
