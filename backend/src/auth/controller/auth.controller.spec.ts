import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from 'src/common/types';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { RefreshTokenDto } from '../dtos/RefreshToken.dto';
import { RefreshTokensDto } from '../dtos/RefreshTokens.dto';
import { SaveAuthCodeDto } from '../dtos/SaveAuthCode.dto';
import {
  Purpose,
  SendAuthCodeRequestDto,
} from '../dtos/SendAuthCodeRequest.dto';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let emailService: Partial<EmailService>;
  let userService: Partial<UserService>;
  let user: User;

  const accessToken = 'accesstoken';
  const refreshToken = 'refreshtoken';
  const authToken = 123456;
  const ttl = 60 * 5;

  beforeEach(async () => {
    user = {
      id: 1,
      email: 'test1234@gmail.com',
      password: 'test1234',
      nickname: 'tester',
      createdAt: new Date(),
      categories: null,
    };

    authService = {
      validateUser: (email: string, password: string) => Promise.resolve(user),
      createAccessAndRefreshToken: (user: User) =>
        Promise.resolve({ accessToken, refreshToken }),
      saveAuthCode: async (email: string, purpose: Purpose) =>
        SaveAuthCodeDto.create(email, authToken, ttl),
      createJwtToken: jest.fn(),
      decodeToken: jest.fn(),
      isExpiredToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
    };

    emailService = {
      sendResetPasswordAuthCode: jest.fn(),
      sendSignUpAuthCode: jest.fn(),
    };

    userService = {
      findByEmail: async () => user,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('정의되어야 한다.', () => {
    expect(controller).toBeDefined();
  });

  it('로그인에 성공하면 UserWithJwtTokenDto를 반환한다.', async () => {
    const { id, email, nickname } = user;
    const request = {
      user: {
        id,
        email,
        nickname,
      },
    } as RequestWithUser;

    const userWithJwtTokenDto = await controller.login(request);

    expect(userWithJwtTokenDto).toStrictEqual({
      id,
      email,
      nickname,
      accessToken,
      refreshToken,
    });
  });

  it('회원가입 인증 번호를 요청하면 인증 번호를 생성해서 이메일로 전송 후 SendAuthCodeResponseDto를 반환한다.', async () => {
    const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
      email: 'test123@gmail.com',
      purpose: 'SIGN_UP',
    };

    const result = await controller.sendAuthCodeToEmail(sendAuthCodeRequestDto);

    expect(emailService.sendSignUpAuthCode).toBeCalled();
    expect(result).toStrictEqual({
      purpose: sendAuthCodeRequestDto.purpose,
      email: sendAuthCodeRequestDto.email,
      ttl,
    });
  });

  it('비밀번호 재설정을 위한 인증 번호를 생성하면 인증 번호를 생성해서 이메일로 전송 후 SendAuthCodeResponseDto를 반환한다.', async () => {
    const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
      email: 'test1234@gmail.com',
      purpose: 'RESET_PASSWORD',
    };

    const result = await controller.sendAuthCodeToEmail(sendAuthCodeRequestDto);

    expect(emailService.sendResetPasswordAuthCode).toBeCalled();
    expect(result).toStrictEqual({
      purpose: sendAuthCodeRequestDto.purpose,
      email: sendAuthCodeRequestDto.email,
      ttl,
    });
  });

  it('인증 번호를 이메일로 전송하는데 실패했으면 ServiceUnavailableException이 발생한다.', async () => {
    emailService.sendSignUpAuthCode = jest
      .fn()
      .mockRejectedValue(new SendEmailFailedException());
    const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
      email: 'test123@gmail.com',
      purpose: 'SIGN_UP',
    };

    await expect(
      controller.sendAuthCodeToEmail(sendAuthCodeRequestDto),
    ).rejects.toThrow(
      new ServiceUnavailableException(
        '이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.',
      ),
    );
  });

  it('access token 없이 토큰 재발급 요청을 보내면 UnauthorizedException이 발생한다.', async () => {
    // given
    const request = {
      headers: {},
    };
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refreshtoken',
      email: user.email,
    };

    // when, then
    await expect(
      controller.refreshAccessToken(request, refreshTokenDto),
    ).rejects.toThrow(new UnauthorizedException());
  });

  it('만료된 access token이면 새로운 access token을 만들어 반환한다.', async () => {
    // given
    const newAccessToken = 'newaccesstoken';
    authService.isExpiredToken = jest.fn().mockReturnValue(true);
    authService.decodeToken = jest.fn().mockReturnValue({
      sub: 1,
      email: user.email,
    });
    authService.createJwtToken = jest.fn().mockReturnValue(newAccessToken);
    const request = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken,
      email: user.email,
    };

    // when
    const refreshTokensDto: RefreshTokensDto =
      await controller.refreshAccessToken(request, refreshTokenDto);

    // then
    expect(refreshTokensDto).toStrictEqual({
      accessToken: newAccessToken,
      refreshToken: refreshTokenDto.refreshToken,
    });
  });

  it('만료되지 않은 access token이면 기존의 access token을 그대로 반환한다.', async () => {
    // given
    const newAccessToken = 'newaccesstoken';
    authService.isExpiredToken = jest.fn().mockReturnValue(false);
    authService.decodeToken = jest.fn().mockReturnValue({
      sub: 1,
      email: user.email,
    });
    authService.createJwtToken = jest.fn().mockReturnValue(newAccessToken);
    const request = {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken,
      email: user.email,
    };

    // when
    const refreshTokensDto: RefreshTokensDto =
      await controller.refreshAccessToken(request, refreshTokenDto);

    // then
    expect(authService.createJwtToken).not.toBeCalled();
    expect(refreshTokensDto).toStrictEqual({
      accessToken,
      refreshToken: refreshTokenDto.refreshToken,
    });
  });

  it('로그아웃을 위해 해당 유저에 대해 저장 중인 refresh token을 삭제한다.', async () => {
    await controller.logout(user);

    expect(authService.deleteRefreshToken).toBeCalledWith(user.email);
  });
});
