import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SIGN_UP_PREFIX, TTL } from '../constant';
import { SaveSignUpAuthCodeResultDto } from '../dtos/SaveSignUpAuthCodeResult.dto';
import { User } from '../entities/user.entity';
import { CreateUserServiceDto } from '../dtos/CreateUserService.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UpdatedUserResponseDto } from '../dtos/UpdatedUserResponse.dto';

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
      `${SIGN_UP_PREFIX}${email}`,
    );
    return Number(savedSignUpAuthCode) === signUpAuthCode;
  }

  public async saveSignUpAuthCode(
    email: string,
  ): Promise<SaveSignUpAuthCodeResultDto> {
    const signUpAuthCode = this.createAuthCode();
    const ttl = TTL; // 5 minutes

    await this.redisService.set(`${SIGN_UP_PREFIX}${email}`, signUpAuthCode, {
      ttl,
    });

    const saveSignUpAuthCodeResultDto: SaveSignUpAuthCodeResultDto = {
      email,
      signUpAuthCode,
      ttl,
    };

    return saveSignUpAuthCodeResultDto;
  }

  private async deleteSignUpAuthCode(email: string): Promise<void> {
    await this.redisService.del(`${SIGN_UP_PREFIX}${email}`);
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

  private async encryptPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  private createAuthCode(): number {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
