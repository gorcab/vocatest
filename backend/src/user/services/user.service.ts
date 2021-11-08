import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Connection, Repository } from 'typeorm';
import { SaveSignUpAuthCodeResultDto } from '../dtos/SaveSignUpAuthCodeResult.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly redisService: Cache,
    private readonly connection: Connection,
  ) {}

  public async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  public async saveSignUpAuthCode(
    email: string,
  ): Promise<SaveSignUpAuthCodeResultDto> {
    const signUpAuthCode = this.createAuthCode();
    const ttl = 60 * 5; // 5 minutes

    await this.redisService.set(`user:${email}`, signUpAuthCode, {
      ttl,
    });

    const saveSignUpAuthCodeResultDto: SaveSignUpAuthCodeResultDto = {
      email,
      signUpAuthCode,
      ttl,
    };

    return saveSignUpAuthCodeResultDto;
  }

  private createAuthCode(): number {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
