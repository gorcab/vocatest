import { CACHE_MANAGER } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { REDIS_KEY_PREFIX, RESET_PWD_TTL, SIGN_UP_TTL } from '../constants';
import { JwtPayloadDto } from '../dtos/JwtPayload.dto';
import { JwtTokenDto } from '../dtos/JwtToken.dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<UserService>;
  let redisService: Partial<Cache>;
  let user: User;

  beforeEach(async () => {
    user = {
      id: 1,
      email: 'test1234@gmail.com',
      password: 'test1234',
      nickname: 'tester',
      createdAt: new Date(),
      categories: null,
    };

    userService = {
      findOneByEmailAndPassword: () => Promise.resolve(user),
    };

    redisService = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.env.${process.env.NODE_ENV}`,
          ignoreEnvFile: process.env.NODE_ENV === 'production',
        }),
        JwtModule.registerAsync({
          useFactory: () => {
            return {
              secret: process.env.JWT_SECRET,
            };
          },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('정의되어야 한다.', () => {
    expect(service).toBeDefined();
  });

  it('이메일과 비밀번호가 일치하는 회원을 찾지 못하면 null을 반환한다.', async () => {
    userService.findOneByEmailAndPassword = () => Promise.resolve(null);

    const result = await service.validateUser(user.email, user.password);

    expect(result).toBeNull();
  });

  it('이메일과 비밀번호가 일치하는 회원을 찾으면 해당 회원 정보를 반환한다.', async () => {
    const result = await service.validateUser(user.email, user.password);

    expect(result).toStrictEqual(user);
  });

  it('로그인을 하면 해당 회원 정보를 토대로 access token, refresh token을 만들어 반환한다.', async () => {
    const result = await service.login(user);

    expect(result).toStrictEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('email과 생성한 인증 코드를 토대로 redis에 저장한 뒤, 회원가입을 위한 SaveAuthCodeDto를 반환한다.', async () => {
    const authCode = 123456;
    jest
      .spyOn(AuthService.prototype as any, 'createAuthCode')
      .mockImplementation(() => authCode);

    const result = await service.saveAuthCode(user.email, 'SIGN_UP');

    expect(redisService.set).toBeCalledWith(
      `${REDIS_KEY_PREFIX.SIGN_UP}${user.email}`,
      authCode,
      { ttl: SIGN_UP_TTL },
    );
    expect(result).toStrictEqual({
      email: user.email,
      authCode,
      ttl: SIGN_UP_TTL,
    });
  });

  it('email과 생성한 인증 코드를 토대로 redis에 저장한 뒤, 비밀번호 재설정을 위한 SaveAuthCodeDto를 반환한다.', async () => {
    const authCode = 123456;
    jest
      .spyOn(AuthService.prototype as any, 'createAuthCode')
      .mockImplementation(() => authCode);

    const result = await service.saveAuthCode(user.email, 'RESET_PASSWORD');

    expect(redisService.set).toBeCalledWith(
      `${REDIS_KEY_PREFIX.RESET_PWD}${user.email}`,
      authCode,
      { ttl: RESET_PWD_TTL },
    );
    expect(result).toStrictEqual({
      email: user.email,
      authCode,
      ttl: RESET_PWD_TTL,
    });
  });

  it('jwt token을 만들어 반환한다.', () => {
    const jwtPayloadDto: JwtPayloadDto = {
      sub: 1,
      email: user.email,
    };
    const expiresIn = 3600;

    const token = service.createJwtToken(jwtPayloadDto, expiresIn);

    expect(token).toStrictEqual(expect.any(String));
  });

  it('token이 만료되면 true를 반환한다.', () => {
    const jwtPayloadDto: JwtPayloadDto = {
      sub: 1,
      email: user.email,
    };
    const expiresIn = 5; // 만료 시간 5초

    const token = service.createJwtToken(jwtPayloadDto, expiresIn);

    jest.useFakeTimers();
    jest.advanceTimersByTime(10000); // 10초 경과

    const isExpired = service.isExpiredToken(token);

    expect(isExpired).toBeTruthy();

    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('token이 만료되지 않으면 false를 반환한다.', () => {
    // given
    const jwtPayloadDto: JwtPayloadDto = {
      sub: 1,
      email: user.email,
    };
    const expiresIn = 11; // 만료 시간 11초

    const token = service.createJwtToken(jwtPayloadDto, expiresIn);

    jest.useFakeTimers();
    jest.advanceTimersByTime(10000); // 10초 경과

    // when
    const isExpired = service.isExpiredToken(token);

    // then
    expect(isExpired).toBeFalsy();

    jest.useRealTimers();
  });

  it('디코딩한 토큰 정보를 JwtTokenDto로 반환한다.', () => {
    // given
    const jwtPayloadDto: JwtPayloadDto = {
      sub: 1,
      email: user.email,
    };
    const expiresIn = 10;
    const token = service.createJwtToken(jwtPayloadDto, expiresIn);

    // when
    const jwtTokenDto: JwtTokenDto = service.decodeToken(token);

    // then
    expect(jwtTokenDto).toStrictEqual({
      sub: jwtPayloadDto.sub,
      email: jwtPayloadDto.email,
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });
});
