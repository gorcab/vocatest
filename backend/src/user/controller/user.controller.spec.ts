import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from 'src/email/services/email.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { CreateUserRequestDto } from '../dtos/CreateUserRequest.dto';
import { AuthService } from 'src/auth/service/auth.service';
import { createUser } from 'src/common/mocks/utils';
import { UpdatedUserResponseDto } from '../dtos/UpdatedUserResponse.dto';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { DeleteUserDto } from '../dtos/DeleteUser.dto';
import { ResetPasswordDto } from '../dtos/ResetPassword.dto';

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
      findOneByEmailAndPassword: async () => user,
      save: async () => user,
      update: async (user: User, updateUserDto: UpdateUserDto) => {
        user.nickname = updateUserDto.newNickname;
        user.password = updateUserDto.newPassword;

        return UpdatedUserResponseDto.create(user);
      },
      delete: (user: User) => Promise.resolve(),
      updatePassword: jest.fn(),
    };

    mockAuthService = {
      login: (user: User) => accessToken,
      validateUser: (email: string, password: string) => Promise.resolve(user),
    };

    mockEmailService = {
      sendSignUpAuthCode: jest.fn(),
      sendResetPasswordAuthCode: jest.fn(),
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

  it('회원탈퇴에 성공하면 에러가 발생하지 않는다.', async () => {
    const deleteUserDto: DeleteUserDto = {
      email: user.email,
      password: user.password,
    };
    const result = await controller.delete(user.id, deleteUserDto);

    expect(result).toBeUndefined();
  });

  it('회원탈퇴에 할 때 비밀번호가 올바르지 않으면 UnauthorizedException이 발생한다.', async () => {
    mockUserService.findOneByEmailAndPassword = async () => null;
    const deleteUserDto: DeleteUserDto = {
      email: user.email,
      password: user.password,
    };

    await expect(controller.delete(user.id, deleteUserDto)).rejects.toThrow(
      new UnauthorizedException('비밀번호가 올바르지 않습니다.'),
    );
  });

  it('비밀번호를 수정하면 userService의 updatePassword 메소드를 호출한다.', async () => {
    const resetPasswordDto: ResetPasswordDto = {
      email: 'test1234@gmail.com',
      password: 'test1234',
      resetPasswordAuthCode: 123456,
    };

    await controller.resetPassword(resetPasswordDto);

    expect(mockUserService.updatePassword).toBeCalledWith(
      resetPasswordDto.email,
      resetPasswordDto.password,
    );
  });
});
