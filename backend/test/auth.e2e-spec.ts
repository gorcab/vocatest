import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmailService } from 'src/email/services/email.service';
import { Connection, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/entities/user.entity';
import { Cache, Store } from 'cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import { CreateUserRequestDto } from 'src/user/dtos/CreateUserRequest.dto';
import { UserService } from 'src/user/service/user.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockEmailService: Partial<EmailService>;
  let redisStore: Cache;
  let userRepository: Repository<User>;
  let userService: UserService;
  let module: TestingModule;

  beforeEach(async () => {
    mockEmailService = {
      sndSignUpAuthCode: (sendSignUpAuthCodeDto) => Promise.resolve(),
    };

    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = module.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
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
      const createUserDto: CreateUserRequestDto = {
        email: 'tester1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode: 123456,
      };

      const user = await userService.save(createUserDto);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: createUserDto.email,
          password: createUserDto.password,
        })
        .expect(201);

      expect(response.body).toStrictEqual({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        accessToken: response.body.accessToken,
      });
    });

    it('로그인에 실패하면 401 에러를 반환한다.', async () => {
      const createUserDto: CreateUserRequestDto = {
        email: 'tester1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode: 123456,
      };

      const user = await userService.save(createUserDto);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: createUserDto.email,
          password: 'test123456',
        })
        .expect(401);

      expect(response.body.message).toBe(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    });
  });
});
