import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmailService } from 'src/email/services/email.service';
import { Connection, getConnection, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/entities/user.entity';
import { Cache, Store } from 'cache-manager';
import { CreateUserRequestDto } from 'src/user/dtos/CreateUserRequest.dto';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { SendSignUpAuthCodeDto } from 'src/email/dtos/SendSignUpAuthCode.dto';
import { SignUpAuthRequestDto } from 'src/user/dtos/SignUpAuthRequest.dto';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';

declare module Store {
  export function getClient(): Promise<void>;
}

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let mockEmailService: Partial<EmailService>;
  let redisStore: Cache;
  let userRepository: Repository<User>;
  let connection: Connection;
  let module: TestingModule;

  beforeEach(async () => {
    mockEmailService = {
      sndSignUpAuthCode: (sendSignUpAuthCodeDto) => {
        console.log('mcok emailservice');
        return Promise.resolve();
      },
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
    // connection = module.get<Connection>(Connection);
    await app.init();
  });

  afterEach(async () => {
    await redisStore.reset();
    await userRepository.delete({});
    await app.close(); // automatically close connection.
  });

  describe('/email-authentication (POST)', () => {
    it('이메일 형식이 올바르지 않으면 400 에러를 반환한다.', async () => {
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: 'tester1234@',
      };
      const response = await request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(400);

      expect(response.body.message).toStrictEqual([
        '이메일 형식이어야 합니다.',
      ]);
    });

    it('이미 가입된 이메일이면 400 에러를 반환한다.', async () => {
      const user = await userRepository.create({
        email: 'tester1234@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        createdAt: new Date(),
      });
      await userRepository.save(user);
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: user.email,
      };

      const response = await request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(400);

      expect(response.body.message).toBe('이미 존재하는 이메일입니다.');
    });

    it('회원가입 인증번호 이메일 전송에 실패하면 503 에러를 반환한다.', async () => {
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: 'tester1234@gmail.com',
      };
      mockEmailService.sndSignUpAuthCode = (SendSignUpAuthCodeDto) => {
        throw new SendEmailFailedException();
      };

      const response = await request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(503);

      expect(response.body.message).toBe(
        '이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.',
      );
    });

    it('회원가입 인증번호 이메일 전송에 성공하면 email과 ttl을 응답으로 반환한다.', async () => {
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: 'tester1234@gmail.com',
      };

      return request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(201)
        .expect({
          email: signUpAuthRequestDto.email,
          ttl: 300,
        });
    });
  });
});
