import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmailService } from 'src/email/services/email.service';
import { Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/entities/user.entity';
import { Cache } from 'cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserRequestDto } from 'src/user/dtos/CreateUserRequest.dto';
import { UserService } from 'src/user/service/user.service';
import { SendResetPasswordAuthCodeDto } from 'src/auth/dtos/SendResetPasswordAuthCode.dto';
import { CreateUserServiceDto } from 'src/user/dtos/CreateUserService.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockEmailService: Partial<EmailService>;
  let redisStore: Cache;
  let userRepository: Repository<User>;
  let userService: UserService;
  let module: TestingModule;

  beforeEach(async () => {
    mockEmailService = {
      sendSignUpAuthCode: jest.fn(),
      sendResetPasswordAuthCode: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = module.createNestApplication();
    app.listen(3000);

    redisStore = module.get<Cache>(CACHE_MANAGER);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userService = module.get<UserService>(UserService);
    await app.init();
  });

  afterEach(async () => {
    await redisStore.reset();
    await userRepository.delete({});
    await app.close(); // automatically close connection.
  });

  describe('/auth/login (POST)', () => {
    it('로그인에 성공하면 access token과 사용자 정보를 response로 반환한다.', async () => {
      // given
      const createUserDto: CreateUserRequestDto = {
        email: 'tester1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode: 123456,
      };
      const user = await userService.save(createUserDto);

      // when
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: createUserDto.email,
          password: createUserDto.password,
        })
        .expect(201);

      // then
      expect(response.body).toStrictEqual({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        accessToken: response.body.accessToken,
      });
    });

    it('로그인에 실패하면 401 에러를 반환한다.', async () => {
      // given
      const createUserDto: CreateUserRequestDto = {
        email: 'tester1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode: 123456,
      };
      const user = await userService.save(createUserDto);

      // when
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: createUserDto.email,
          password: 'test123456',
        })
        .expect(401);

      // then
      expect(response.body.message).toBe(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('회원가입된 이메일이라면 해당 이메일로 비밀번호 재설정용 인증번호를 보낸다.', async () => {
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const sendResetPasswordAuthCodeRequestDto: SendResetPasswordAuthCodeDto =
        {
          email: createUserServiceDto.email,
        };

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(sendResetPasswordAuthCodeRequestDto)
        .expect(201);

      expect(mockEmailService.sendResetPasswordAuthCode).toBeCalled();
    });

    it('회원가입된 이메일이 아니라면 400 에러를 반환한다.', async () => {
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      const user = await userService.save(createUserServiceDto);

      const sendResetPasswordAuthCodeRequestDto: SendResetPasswordAuthCodeDto =
        {
          email: 'anothertest@gmail.com',
        };

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(sendResetPasswordAuthCodeRequestDto)
        .expect(400);

      expect(mockEmailService.sendResetPasswordAuthCode).not.toBeCalled();
    });
  });
});
