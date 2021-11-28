import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmailService } from 'src/email/services/email.service';
import { Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/entities/user.entity';
import { Cache } from 'cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignUpAuthRequestDto } from 'src/user/dtos/SignUpAuthRequest.dto';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { SIGN_UP_PREFIX, TTL } from 'src/user/constant';
import { CreateUserRequestDto } from 'src/user/dtos/CreateUserRequest.dto';
import { UserService } from 'src/user/service/user.service';
import { CreateUserServiceDto } from 'src/user/dtos/CreateUserService.dto';
import { UpdateUserDto } from 'src/user/dtos/UpdateUser.dto';
import { DeleteUserDto } from 'src/user/dtos/DeleteUser.dto';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let mockEmailService: Partial<EmailService>;
  let redisStore: Cache;
  let userRepository: Repository<User>;
  let userService: UserService;
  let module: TestingModule;

  beforeEach(async () => {
    mockEmailService = {
      sendSignUpAuthCode: (sendSignUpAuthCodeDto) => Promise.resolve(),
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

  describe('/users/email-authentication (POST)', () => {
    it('이메일 형식이 올바르지 않으면 400 에러를 반환한다.', async () => {
      // given
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: 'tester1234@',
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(400);

      // then
      expect(response.body.message).toStrictEqual([
        '이메일은 이메일 형식이어야 합니다.',
      ]);
    });

    it('이미 가입된 이메일이면 400 에러를 반환한다.', async () => {
      // given
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

      // when
      const response = await request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(400);

      // then
      expect(response.body.message).toStrictEqual(
        '이미 존재하는 이메일입니다.',
      );
    });

    it('회원가입 인증번호 이메일 전송에 실패하면 503 에러를 반환한다.', async () => {
      // given
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: 'tester1234@gmail.com',
      };
      mockEmailService.sendSignUpAuthCode = (SendSignUpAuthCodeDto) => {
        throw new SendEmailFailedException();
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(503);

      // then
      expect(response.body.message).toBe(
        '이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.',
      );
    });

    it('회원가입 인증번호 이메일 전송에 성공하면 email과 ttl을 응답으로 반환한다.', async () => {
      // given
      const signUpAuthRequestDto: SignUpAuthRequestDto = {
        email: 'tester1234@gmail.com',
      };

      // when, then
      return request(app.getHttpServer())
        .post('/users/email-authentication')
        .send(signUpAuthRequestDto)
        .expect(201)
        .expect({
          email: signUpAuthRequestDto.email,
          ttl: TTL,
        });
    });
  });

  describe('/users (POST)', () => {
    it('회원가입 시 이메일 형식이 올바르지 않으면 400 에러를 반환한다.', async () => {
      // given
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode: 123456,
      };

      // when, then
      return request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(400);
    });

    it('회원가입 시 회원가입용 인증 코드가 일치하지 않으면 검증 에러 메시지를 반환한다.', async () => {
      // given
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode: 123456,
      };
      redisStore.set(`${SIGN_UP_PREFIX}${createUserRequestDto.email}`, 132456);

      // when
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(400);

      // then
      expect(response.body.message).toBe('인증 번호가 올바르지 않습니다.');
    });

    it('회원가입 시 비밀번호가 8자 미만이면 검증 에러 메시지를 반환한다.', async () => {
      // given
      const signUpAuthCode = 123456;
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@gmail.com',
        password: 'test123',
        nickname: 'tester',
        signUpAuthCode,
      };
      redisStore.set(
        `${SIGN_UP_PREFIX}${createUserRequestDto.email}`,
        signUpAuthCode,
      );

      // when
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(400);

      // then
      expect(response.body.message[0]).toBe(
        '비밀번호는 최소 8자 이상이어야 합니다.',
      );
    });

    it('회원가입 시 비밀번호가 13자 이상이면 검증 에러 메시지를 반환한다.', async () => {
      // given
      const signUpAuthCode = 123456;
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@gmail.com',
        password: 'test123456789',
        nickname: 'tester',
        signUpAuthCode,
      };
      redisStore.set(
        `${SIGN_UP_PREFIX}${createUserRequestDto.email}`,
        signUpAuthCode,
      );

      // when
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(400);

      // then
      expect(response.body.message[0]).toBe(
        '비밀번호는 최대 12자 이하여야 합니다.',
      );
    });

    it('회원가입 시 닉네임이 공백으로만 구성된 문자열일 경우 검증 에러 메시지를 반환한다.', async () => {
      // given
      const signUpAuthCode = 123456;
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@gmail.com',
        password: 'test1234',
        nickname: '   ',
        signUpAuthCode,
      };
      redisStore.set(
        `${SIGN_UP_PREFIX}${createUserRequestDto.email}`,
        signUpAuthCode,
      );

      // when
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(400);

      // then
      expect(response.body.message[0]).toBe(
        '공백으로만 구성된 닉네임은 사용할 수 없습니다.',
      );
    });

    it('회원가입 시 닉네임이 한 글자로만 구성된 문자일 경우 검증 에러 메시지를 반환한다.', async () => {
      // given
      const signUpAuthCode = 123456;
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@gmail.com',
        password: 'test1234',
        nickname: 'a',
        signUpAuthCode,
      };
      redisStore.set(
        `${SIGN_UP_PREFIX}${createUserRequestDto.email}`,
        signUpAuthCode,
      );

      // when
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(400);

      // then
      expect(response.body.message[0]).toBe('닉네임은 2자 이상이어야 합니다.');
    });

    it('회원가입에 성공하면 사용자 정보와 access token을 반환한다.', async () => {
      // given
      const signUpAuthCode = 123456;
      const createUserRequestDto: CreateUserRequestDto = {
        email: 'tester123@gmail.com',
        password: 'test1234',
        nickname: 'tester',
        signUpAuthCode,
      };
      redisStore.set(
        `${SIGN_UP_PREFIX}${createUserRequestDto.email}`,
        signUpAuthCode,
      );

      // when
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserRequestDto)
        .expect(201);

      // then
      const { accessToken, id, ...result } = response.body;
      expect(result).toStrictEqual({
        email: createUserRequestDto.email,
        nickname: createUserRequestDto.nickname,
      });
      expect(typeof accessToken).toBe('string');
      expect(typeof id).toBe('number');
    });
  });

  describe('/users/:userId (PATCH)', () => {
    it('닉네임을 변경하면 변경된 사용자 정보를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);
      const updateUserDto: UpdateUserDto = {
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
        newNickname: 'newTester',
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      const response = await agent
        .patch(`/users/${user.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toStrictEqual({
        id: user.id,
        email: user.email,
        nickname: updateUserDto.newNickname,
      });
    });

    it('비밀번호를 변경하면 새로운 비밀번호로 로그인할 수 있다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);
      const updateUserDto: UpdateUserDto = {
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
        newPassword: 'newtest1234',
        newNickname: 'newTester',
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      const response = await agent
        .patch(`/users/${user.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(200);

      const newAccessToken = await agent.post('/auth/login').send({
        email: updateUserDto.email,
        password: updateUserDto.newPassword,
      });

      expect(newAccessToken.body.accessToken).toStrictEqual(expect.any(String));
    });

    it('비밀번호가 틀리면 401 에러를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);
      const updateUserDto: UpdateUserDto = {
        email: createUserServiceDto.email,
        password: 'wrongpwd',
        newPassword: 'newtest1234',
        newNickname: 'newTester',
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      return agent
        .patch(`/users/${user.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(401);
    });

    it('다른 회원의 정보를 수정하려고 하면 401 에러를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);
      const anotherCreateUserServiceDto: CreateUserServiceDto = {
        email: 'another@gmail.com',
        password: 'another123',
        nickname: 'another',
      };
      const anotherUser = await userService.save(anotherCreateUserServiceDto);

      const updateUserDto: UpdateUserDto = {
        email: anotherCreateUserServiceDto.email,
        password: anotherCreateUserServiceDto.password,
        newPassword: 'newtest1234',
        newNickname: 'newTester',
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      return agent
        .patch(`/users/${anotherUser.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(updateUserDto)
        .expect(401);
    });

    it('로그인하지 않은 상태에서 회원정보를 수정하려고 하면 401 에러를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);

      const updateUserDto: UpdateUserDto = {
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
        newPassword: 'newtest1234',
        newNickname: 'newTester',
      };

      return agent.patch(`/users/${user.id}`).send(updateUserDto).expect(401);
    });
  });

  describe('/users/:userId (DELETE)', () => {
    it('회원탈퇴에 성공하면 204 상태 코드를 응답으로 보낸다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);

      const deleteUserDto: DeleteUserDto = {
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      return agent
        .delete(`/users/${user.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(deleteUserDto)
        .expect(204);
    });

    it('비밀번호가 올바르지 않으면 회원탈퇴에 실패하고 401 에러를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);

      const deleteUserDto: DeleteUserDto = {
        email: createUserServiceDto.email,
        password: 'wrongpwd',
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      return agent
        .delete(`/users/${user.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(deleteUserDto)
        .expect(401);
    });

    it('다른 사용자에 대해 회원탈퇴를 요청하면 401 에러를 반환한다.', async () => {
      const agent = request.agent(app.getHttpServer());
      const createUserServiceDto: CreateUserServiceDto = {
        email: 'test1234@gmail.com',
        password: 'test1234',
        nickname: 'tester1234',
      };
      const user = await userService.save(createUserServiceDto);
      const anotherCreateUserServiceDto: CreateUserServiceDto = {
        email: 'another@gmail.com',
        password: 'another123',
        nickname: 'another',
      };
      const anotherUser = await userService.save(anotherCreateUserServiceDto);

      const deleteUserDto: DeleteUserDto = {
        email: anotherCreateUserServiceDto.email,
        password: anotherCreateUserServiceDto.password,
      };

      const accessToken = await agent.post('/auth/login').send({
        email: createUserServiceDto.email,
        password: createUserServiceDto.password,
      });

      return agent
        .patch(`/users/${anotherUser.id}`)
        .auth(accessToken.body.accessToken, { type: 'bearer' })
        .send(deleteUserDto)
        .expect(401);
    });
  });
});
