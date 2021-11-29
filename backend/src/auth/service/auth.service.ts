import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { AUTH_CODE_PURPOSE, RESET_PWD_TTL, SIGN_UP_TTL } from '../constants';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';
import { SaveAuthCodeDto } from '../dtos/SaveAuthCode.dto';
import { Purpose } from '../dtos/SendAuthCodeRequest.dto';

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

  public async saveAuthCode(
    email: string,
    purpose: Purpose,
  ): Promise<SaveAuthCodeDto> {
    let prefix: typeof AUTH_CODE_PURPOSE[keyof typeof AUTH_CODE_PURPOSE];
    let ttl: number;
    switch (purpose) {
      case 'RESET_PASSWORD':
        prefix = AUTH_CODE_PURPOSE.RESET_PWD;
        ttl = RESET_PWD_TTL;
        break;
      case 'SIGN_UP':
        prefix = AUTH_CODE_PURPOSE.SIGN_UP;
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
