import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from '../service/auth.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let user: User;

  const accessToken = 'accesstoken';

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
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
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
    };

    const userResponseDto = controller.login(request);

    expect(userResponseDto).toStrictEqual({
      id,
      email,
      nickname,
      accessToken,
    });
  });
});
