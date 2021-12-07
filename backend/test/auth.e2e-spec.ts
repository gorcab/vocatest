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
import { SIGN_UP_TTL } from 'src/auth/constants';
import { SendAuthCodeRequestDto } from 'src/auth/dtos/SendAuthCodeRequest.dto';
import { CreateUserServiceDto } from 'src/user/dtos/CreateUserService.dto';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';

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
    it('로그인에 성공하면 access token, refresh token과 사용자 정보를 response로 반환한다.', async () => {
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
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
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

  describe('/auth/code (POST)', () => {
    it('회원가입 시, 가입된 이메일이 아니라면 해당 이메일로 인증 번호를 보내고 SendAuthCodeResponseDto를 반환한다.', async () => {
      // given
      const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
        purpose: 'SIGN_UP',
        email: 'test1234@gmail.com',
      };

      // when, then
      const response = await request(app.getHttpServer())
        .post('/auth/code')
        .send(sendAuthCodeRequestDto)
        .expect(201)
        .expect({
          purpose: sendAuthCodeRequestDto.purpose,
          email: sendAuthCodeRequestDto.email,
          ttl: SIGN_UP_TTL,
        });
      expect(mockEmailService.sendSignUpAuthCode).toBeCalled();
    });

    it('비밀번호 재설정 시, 가입된 이메일이라면 해당 이메일로 인증 번호를 보내고 SendAuthCodeResponseDto를 반환한다.', async () => {
      // given
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      await userService.save(createUserServiceDto);
      const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
        purpose: 'RESET_PASSWORD',
        email: createUserServiceDto.email,
      };

      // when, then
      const response = await request(app.getHttpServer())
        .post('/auth/code')
        .send(sendAuthCodeRequestDto)
        .expect(201)
        .expect({
          purpose: sendAuthCodeRequestDto.purpose,
          email: sendAuthCodeRequestDto.email,
          ttl: SIGN_UP_TTL,
        });
      expect(mockEmailService.sendResetPasswordAuthCode).toBeCalled();
    });

    it('이메일 전송에 실패하면 503 에러를 반환한다.', async () => {
      // given
      mockEmailService.sendSignUpAuthCode = jest
        .fn()
        .mockRejectedValue(new SendEmailFailedException());
      const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
        purpose: 'SIGN_UP',
        email: 'test1234@gmail.com',
      };

      // when, then
      const response = await request(app.getHttpServer())
        .post('/auth/code')
        .send(sendAuthCodeRequestDto)
        .expect(503);
      expect(mockEmailService.sendSignUpAuthCode).toBeCalled();
    });

    it('purpose가 올바르지 않으면 400 에러를 반환한다.', async () => {
      return request(app.getHttpServer())
        .post('/auth/code')
        .send({
          purpose: 'UPDATE_PASSWORD',
          email: 'test1234@gmail.com',
        })
        .expect(400);
    });

    it('회원가입 시, 이미 가입된 이메일이라면 400 에러를 반환한다.', async () => {
      // given
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
      };
      await userService.save(createUserServiceDto);
      const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
        purpose: 'SIGN_UP',
        email: createUserServiceDto.email,
      };

      // when, then
      return request(app.getHttpServer())
        .post('/auth/code')
        .send(sendAuthCodeRequestDto)
        .expect(400);
    });

    it('비밀번호 재설정 시, 가입된 이메일이 아니라면 400 에러를 반환한다.', async () => {
      // given
      const sendAuthCodeRequestDto: SendAuthCodeRequestDto = {
        purpose: 'RESET_PASSWORD',
        email: 'test1234@gmail.com',
      };

      // when, then
      return request(app.getHttpServer())
        .post('/auth/code')
        .send(sendAuthCodeRequestDto)
        .expect(400);
    });
  });
});
