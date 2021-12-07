import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from 'src/common/types';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
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
      login: (user: User) => Promise.resolve({ accessToken, refreshToken }),
      saveAuthCode: async (email: string, purpose: Purpose) =>
        SaveAuthCodeDto.create(email, authToken, ttl),
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
});
