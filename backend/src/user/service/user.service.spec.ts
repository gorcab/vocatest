import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { createUser } from 'src/common/mocks/utils';
import { UpdateUserDto } from '../dtos/UpdateUser.dto';
import { UpdatedUserResponseDto } from '../dtos/UpdatedUserResponse.dto';

describe('UserService', () => {
  let service: UserService;
  let user: User;
  let mockUserRepository: DeepPartial<Repository<User>>;
  let mockRedisService: Partial<Cache>;
  const signUpAuthCode = 132426;

  beforeEach(async () => {
    user = createUser();

    mockUserRepository = {
      findOne: () => Promise.resolve(user),
      create: () => user,
      save: async () => user,
      update: () => Promise.resolve(),
      delete: jest.fn(),
    };

    mockRedisService = {
      get: async (key: string) => signUpAuthCode.toString(),
      set: async (key: string, value: string) => 'OK',
      del: async (ket: string) => Promise.resolve(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('정의되어야 한다.', () => {
    expect(service).toBeDefined();
  });

  it('이미 등록된 이메일이라면 해당 User를 반환한다.', async () => {
    const result = await service.findByEmail(user.email);

    expect(result).toStrictEqual(user);
  });

  it('등록되지 않은 이메일이라면 null을 반환한다.', async () => {
    mockUserRepository.findOne = async () => Promise.resolve(null);

    const result = await service.findByEmail(user.email);

    expect(result).toBeNull();
  });

  it('등록된 회원가입 인증 번호와 일치하지 않으면 false를 반환한다.', async () => {
    mockRedisService.get = async (key: string) => signUpAuthCode + 1;

    const result = await service.validateSignUpAuthCode(
      user.email,
      signUpAuthCode,
    );

    expect(result).toBeFalsy();
  });

  it('등록된 회원가입 인증 번호와 일치하면 true를 반환한다.', async () => {
    const result = await service.validateSignUpAuthCode(
      user.email,
      signUpAuthCode,
    );

    expect(result).toBeTruthy();
  });

  it('User를 생성하면 생성한 User를 반환한다.', async () => {
    const encryptPasswordSpy = jest
      .spyOn(UserService.prototype as any, 'encryptPassword')
      .mockImplementation(() => Promise.resolve(user.password));

    const createdUser = await service.save({
      email: user.email,
      password: user.password,
      nickname: user.nickname,
    });

    expect(createdUser).toStrictEqual(user);
    expect(encryptPasswordSpy).toHaveBeenCalled();
  });

  it('이메일과 비밀번호가 일치하면 User를 반환한다.', async () => {
    const compareSpy = jest
      .spyOn(bcrypt as any, 'compare')
      .mockImplementation(() => Promise.resolve(true));

    const result = await service.findOneByEmailAndPassword(
      user.email,
      user.password,
    );

    expect(compareSpy).toHaveBeenCalled();
    expect(result).toMatchObject({
      ...user,
    });
  });

  it('이메일이 일치하지 않으면 null을 반환한다.', async () => {
    mockUserRepository.findOne = async () => null;

    const result = await service.findOneByEmailAndPassword(
      user.email,
      user.password,
    );

    expect(result).toBeNull();
  });

  it('이메일은 일치하지만 비밀번호가 일치하지 않으면 null을 반환한다.', async () => {
    const compareSpy = jest
      .spyOn(bcrypt as any, 'compare')
      .mockImplementation(() => Promise.resolve(false));
    mockUserRepository.findOne = () =>
      Promise.resolve({
        ...user,
      });

    const result = await service.findOneByEmailAndPassword(
      user.email,
      user.password,
    );

    expect(result).toBeNull();
  });

  it('회원정보를 업데이트하면 UpdatedUserResponseDto를 반환한다.', async () => {
    // given
    const encryptPasswordSpy = jest
      .spyOn(UserService.prototype as any, 'encryptPassword')
      .mockImplementation(() => Promise.resolve(user.password));

    const updateUserDto: UpdateUserDto = {
      email: user.email,
      password: user.password,
      newNickname: 'newnickname',
      newPassword: 'newpwd',
    };
    mockUserRepository.findOne = async () => {
      const updatedUser = { ...user };
      updatedUser.nickname = updateUserDto.newNickname;
      updatedUser.password = updateUserDto.newPassword;
      return updatedUser;
    };

    //when
    const updatedUserResponseDto: UpdatedUserResponseDto = await service.update(
      user,
      updateUserDto,
    );

    // then
    expect(updatedUserResponseDto).toStrictEqual({
      id: user.id,
      email: user.email,
      nickname: updateUserDto.newNickname,
    });
  });

  it('회원탈퇴를 하면 user repository의 delete 메소드를 호출한다.', async () => {
    await service.deleteById(user.id);

    expect(mockUserRepository.delete).toBeCalled();
  });

  it('비밀번호를 업데이트하면 레디스에 저장된 인증 번호를 삭제하고, 비밀번호를 해시한 뒤 업데이트한다.', async () => {
    const deleteResetPasswordAuthCodeSpy = jest
      .spyOn(UserService.prototype as any, 'deleteResetPasswordAuthCode')
      .mockImplementation(() => Promise.resolve());
    const encryptPasswordSpy = jest
      .spyOn(UserService.prototype as any, 'encryptPassword')
      .mockImplementation(() => Promise.resolve(user.password));
    mockUserRepository.update = jest.fn();

    await service.updatePassword(user.email, user.password);

    expect(deleteResetPasswordAuthCodeSpy).toBeCalledWith(user.email);
    expect(encryptPasswordSpy).toBeCalledWith(user.password);
    expect(mockUserRepository.update).toBeCalledWith(
      { email: user.email },
      { password: user.password },
    );
  });
});
