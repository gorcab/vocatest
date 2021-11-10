import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user.service';
import { JwtPayloadDto } from '../dtos/jwt-payload.dto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<UserService>;
  let jwtService: Partial<JwtService>;
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

    jwtService = {
      sign: (payload: JwtPayloadDto) => 'accesstoken',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
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

  it('로그인을 하면 해당 회원 정보를 토대로 access token을 만들어 반환한다.', async () => {
    const accessToken = 'accesstoken';
    const signSpy = jest
      .spyOn(jwtService, 'sign')
      .mockImplementation(() => accessToken);

    const result = await service.login(user);

    expect(signSpy).toHaveBeenCalled();
    expect(result).toBe(accessToken);
  });
});
