import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import {
  ACCESS_TOKEN_TTL,
  REDIS_KEY_PREFIX,
  REFRESH_TOKEN_TTL,
  RESET_PWD_TTL,
  SIGN_UP_TTL,
} from '../constants';
import { AccessAndRefreshTokenDto } from '../dtos/AccessAndRefreshToken.dto';
import { SaveAuthCodeDto } from '../dtos/SaveAuthCode.dto';
import { Purpose } from '../dtos/SendAuthCodeRequest.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly redisService: Cache,
  ) {}

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmailAndPassword(
      email,
      password,
    );

    return user;
  }

  public async login(user: User): Promise<AccessAndRefreshTokenDto> {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: ACCESS_TOKEN_TTL,
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: REFRESH_TOKEN_TTL,
      },
    );

    await this.redisService.set(
      `${REDIS_KEY_PREFIX.REFRESH_TOKEN}${user.email}`,
      refreshToken,
      {
        ttl: REFRESH_TOKEN_TTL,
      },
    );

    return AccessAndRefreshTokenDto.create(accessToken, refreshToken);
  }

  public async saveAuthCode(
    email: string,
    purpose: Purpose,
  ): Promise<SaveAuthCodeDto> {
    let prefix: typeof REDIS_KEY_PREFIX[keyof typeof REDIS_KEY_PREFIX];
    let ttl: number;
    switch (purpose) {
      case 'RESET_PASSWORD':
        prefix = REDIS_KEY_PREFIX.RESET_PWD;
        ttl = RESET_PWD_TTL;
        break;
      case 'SIGN_UP':
        prefix = REDIS_KEY_PREFIX.SIGN_UP;
        ttl = SIGN_UP_TTL;
        break;
    }
    const authCode = this.createAuthCode();

    await this.redisService.set(`${prefix}${email}`, authCode, {
      ttl,
    });

    return SaveAuthCodeDto.create(email, authCode, ttl);
  }

  private createAuthCode() {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
