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
import { JwtPayloadDto } from '../dtos/JwtPayload.dto';
import { JwtTokenDto } from '../dtos/JwtToken.dto';
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

  public async createAccessAndRefreshToken(
    user: User,
  ): Promise<AccessAndRefreshTokenDto> {
    const accessToken = this.createJwtToken(
      {
        sub: user.id,
        email: user.email,
      },
      ACCESS_TOKEN_TTL,
    );
    const refreshToken = this.createJwtToken(
      {
        sub: user.id,
      },
      REFRESH_TOKEN_TTL,
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

  public async getRefreshToken(email: string): Promise<string> {
    return this.redisService.get(`${REDIS_KEY_PREFIX.REFRESH_TOKEN}${email}`);
  }

  public createJwtToken(payload: Partial<JwtPayloadDto>, expiresIn: number) {
    return this.jwtService.sign(payload, { expiresIn });
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

  public isExpiredToken(token: string): boolean {
    const { exp } = this.decodeToken(token);
    const currentTime = new Date().getTime() / 1000;
    if (exp - currentTime < 0) {
      return true;
    }
    return false;
  }

  public decodeToken(token: string): JwtTokenDto {
    return this.jwtService.decode(token) as JwtTokenDto;
  }

  private createAuthCode() {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
