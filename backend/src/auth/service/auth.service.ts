import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { AUTH_CODE_PURPOSE, RESET_PWD_TTL } from '../constants';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';
import { SaveResetPasswordAuthCodeDto } from '../dtos/SaveResetPasswordAuthCode.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly redisService: Cache,
  ) {}

  public async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.findOneByEmailAndPassword(
      email,
      password,
    );

    return user;
  }

  public login(user: User): string {
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  public async saveResetPasswordAuthCode(
    email: string,
  ): Promise<SaveResetPasswordAuthCodeDto> {
    const resetPasswordAuthCode = this.createAuthCode();
    const ttl = RESET_PWD_TTL;

    await this.redisService.set(
      `${AUTH_CODE_PURPOSE.RESET_PWD}${email}`,
      resetPasswordAuthCode,
      {
        ttl,
      },
    );

    return SaveResetPasswordAuthCodeDto.create(email, resetPasswordAuthCode);
  }

  private createAuthCode() {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
