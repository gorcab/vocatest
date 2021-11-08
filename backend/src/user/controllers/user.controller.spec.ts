import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import {
  BadRequestException,
  CACHE_MANAGER,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { Connection, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UserController } from './user.controller';
import { SignUpAuthRequestDto } from '../dtos/SignUpAuthRequest.dto';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: Partial<UserService>;
  let mockUserRepository: Partial<Repository<User>>;
  let mockRedisService: Partial<Cache>;
  let mockConnection = {};
  let mockEmailService: Partial<EmailService>;
  let mockMailerService: Partial<MailerService>;
  let user: User;

  const signUpAuthCode = 123456;
  const ttl = 60 * 5;

  beforeEach(async () => {
    user = {
      id: 1,
      email: 'tester@gmail.com',
      password: 'test1234',
      nickname: 'tester',
      createdAt: new Date(),
      categories: null,
    };

    mockUserRepository = {
      findOne: () => null,
    };

    mockRedisService = {
      get: async (key: string) => null,
      set: async (key: string, value: string | number) => 'OK',
    };

    mockUserService = {
      findByEmail: () => null,
      saveSignUpAuthCode: async (email) => ({
        email: user.email,
        signUpAuthCode,
        ttl,
      }),
    };

    mockEmailService = {
      sndSignUpAuthCode: (sendSignUpAuthCodeDto) => Promise.resolve(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockRedisService,
        },
        {
          provide: Connection,
          useValue: mockConnection,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('정의되어야 한다.', () => {
    expect(controller).toBeDefined();
  });

  it('이미 가입되어 있는 이메일이면 BadRequestException이 발생한다.', async () => {
    mockUserService.findByEmail = async () => user;
    const signUpAuthRequestDto: SignUpAuthRequestDto = {
      email: user.email,
    };

    await expect(
      controller.sendSignUpAuthenticationEmail(signUpAuthRequestDto),
    ).rejects.toThrow(new BadRequestException('이미 존재하는 이메일입니다.'));
  });

  it('회원가입 인증 이메일 전송에 실패하면 ServiceUnavailableException이 발생한다.', async () => {
    mockEmailService.sndSignUpAuthCode = (sendSignUpAuthCodeDto) => {
      throw new SendEmailFailedException();
    };
    const signUpAuthRequestDto: SignUpAuthRequestDto = {
      email: user.email,
    };

    await expect(
      controller.sendSignUpAuthenticationEmail(signUpAuthRequestDto),
    ).rejects.toThrow(
      new ServiceUnavailableException(
        '이메일 전송에 실패했습니다. 잠시 후에 다시 시도해주세요.',
      ),
    );
  });

  it('회원가입 인증 이메일 전송에 성공하면 SignUpAuthResponseDto를 반환한다.', async () => {
    const signUpAuthRequestDto: SignUpAuthRequestDto = {
      email: user.email,
    };

    const result = await controller.sendSignUpAuthenticationEmail(
      signUpAuthRequestDto,
    );

    expect(result).toStrictEqual({
      email: user.email,
      ttl,
    });
  });
});
