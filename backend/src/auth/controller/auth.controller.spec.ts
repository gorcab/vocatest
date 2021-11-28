import { Test, TestingModule } from '@nestjs/testing';
import { RequestWithUser } from 'src/common/types';
import { EmailService } from 'src/email/services/email.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { SaveResetPasswordAuthCodeDto } from '../dtos/SaveResetPasswordAuthCode.dto';
import { SendResetPasswordAuthCodeDto } from '../dtos/SendResetPasswordAuthCode.dto';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let emailService: Partial<EmailService>;
  let userService: Partial<UserService>;
  let user: User;

  const accessToken = 'accesstoken';
  const resetPasswordAuthToken = 123456;

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
      login: (user: User) => accessToken,
      saveResetPasswordAuthCode: async (email: string) =>
        SaveResetPasswordAuthCodeDto.create(email, resetPasswordAuthToken),
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

  it('로그인에 성공하면 UserResponseDto를 반환한다.', async () => {
    const { id, email, nickname } = user;
    const request = {
      user: {
        id,
        email,
        nickname,
      },
    } as RequestWithUser;

    const userResponseDto = controller.login(request);

    expect(userResponseDto).toStrictEqual({
      id,
      email,
      nickname,
      accessToken,
    });
  });

  it('비밀번호 재설정 인증 요청을 보내면 이메일로 인증 번호를 발송한다.', async () => {
    const sendResetPasswordAuthCodeDto: SendResetPasswordAuthCodeDto = {
      email: user.email,
    };

    await controller.sendResetPasswordAuthCodeEmail(
      sendResetPasswordAuthCodeDto,
    );

    expect(emailService.sendResetPasswordAuthCode).toBeCalled();
  });
});
