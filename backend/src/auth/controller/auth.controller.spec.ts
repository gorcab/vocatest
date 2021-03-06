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

  it('??????????????? ??????.', () => {
    expect(controller).toBeDefined();
  });

  it('???????????? ???????????? UserWithJwtTokenDto??? ????????????.', async () => {
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

  it('???????????? ?????? ????????? ???????????? ?????? ????????? ???????????? ???????????? ?????? ??? SendAuthCodeResponseDto??? ????????????.', async () => {
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

  it('???????????? ???????????? ?????? ?????? ????????? ???????????? ?????? ????????? ???????????? ???????????? ?????? ??? SendAuthCodeResponseDto??? ????????????.', async () => {
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

  it('?????? ????????? ???????????? ??????????????? ??????????????? ServiceUnavailableException??? ????????????.', async () => {
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
        '????????? ????????? ??????????????????. ?????? ?????? ?????? ??????????????????.',
      ),
    );
  });

  it('access token ?????? ?????? ????????? ????????? ????????? UnauthorizedException??? ????????????.', async () => {
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

  it('????????? access token?????? ????????? access token??? ????????? ????????????.', async () => {
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

  it('???????????? ?????? access token?????? ????????? access token??? ????????? ????????????.', async () => {
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

  it('??????????????? ?????? ?????? ????????? ?????? ?????? ?????? refresh token??? ????????????.', async () => {
    await controller.logout(user);

    expect(authService.deleteRefreshToken).toBeCalledWith(user.email);
  });
});
