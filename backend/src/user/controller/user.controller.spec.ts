import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import {
  CACHE_MANAGER,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SendEmailFailedException } from 'src/email/exceptions/SendEmailFailed.exception';
import { EmailService } from 'src/email/services/email.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { SignUpAuthRequestDto } from '../dtos/SignUpAuthRequest.dto';
import { UserService } from '../service/user.service';
import { TTL } from '../constant';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { AuthService } from 'src/auth/service/auth.service';
import { createUser } from 'src/common/mocks/utils';
import { UpdatedUserResponseDto } from '../dtos/UpdatedUserResponse.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: Partial<UserService>;
  let mockAuthService: Partial<AuthService>;
  let mockUserRepository: Partial<Repository<User>>;
  let mockRedisService: Partial<Cache>;
  let mockEmailService: Partial<EmailService>;
  let mockMailerService: Partial<MailerService>;
  let user: User;

  const signUpAuthCode = 123456;
  const accessToken = 'accesstoken';

  beforeEach(async () => {
    user = createUser();

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
        ttl: TTL,
      }),
      findOneByEmailAndPassword: async () => user,
      save: async () => user,
      update: async (user: User, updateUserDto: UpdateUserDto) => {
        user.nickname = updateUserDto.newNickname;
        user.password = updateUserDto.newPassword;

        return UpdatedUserResponseDto.create(user);
      },
    };

    mockAuthService = {
      login: (user: User) => accessToken,
      validateUser: (email: string, password: string) => Promise.resolve(user),
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
          provide: AuthService,
          useValue: mockAuthService,
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
      ttl: TTL,
    });
  });

  it('회원가입에 성공하면 UserResponseDto를 반환한다.', async () => {
    const createUserRequestDto: CreateUserRequestDto = {
      email: user.email,
      password: user.password,
      nickname: user.nickname,
      signUpAuthCode,
    };

    const userResponseDto = await controller.signUp(createUserRequestDto);

    expect(userResponseDto).toStrictEqual({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      accessToken,
    });
  });

  it('회원정보 수정에 성공하면 UpdatedUserResonseDto를 반환한다.', async () => {
    const updateUserDto: UpdateUserDto = {
      email: user.email,
      password: user.password,
      newNickname: 'newnickname',
      newPassword: 'newpwd',
    };

    const updatedUserDto = await controller.update(user.id, updateUserDto);

    expect(updatedUserDto).toStrictEqual({
      id: user.id,
      email: updateUserDto.email,
      nickname: updateUserDto.newNickname,
    });
  });

  it('회원정보 수정 시, 비밀번호가 올바르지 않으면 UnauthorizedException이 발생한다.', async () => {
    mockUserService.findOneByEmailAndPassword = async () =>
      Promise.resolve(null);

    const updateUserDto: UpdateUserDto = {
      email: user.email,
      password: user.password,
      newNickname: 'newnickname',
      newPassword: 'newpwd',
    };

    await expect(controller.update(user.id, updateUserDto)).rejects.toThrow(
      new UnauthorizedException('비밀번호가 올바르지 않습니다.'),
    );
  });
});
