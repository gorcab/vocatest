import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TTL } from '../constant';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let user: User;
  let mockUserRepository: DeepPartial<Repository<User>>;
  let mockRedisService: Partial<Cache>;
  const signUpAuthCode = 132426;

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
      findOne: () => Promise.resolve(user),
      create: () => user,
      save: async () => user,
    };

    mockRedisService = {
      get: async (key: string) => signUpAuthCode.toString(),
      set: async (key: string, value: string) => 'OK',
      del: async (ket: string) => Promise.resolve(),
    };

    const mockConnection = {};

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
        {
          provide: Connection,
          useValue: mockConnection,
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

  it('Redis Store에 {"user:email": signUpAuthCode}를 저장한다.', async () => {
    jest
      .spyOn(UserService.prototype as any, 'createAuthCode')
      .mockImplementation(() => signUpAuthCode);

    const result = await service.saveSignUpAuthCode(user.email);

    expect(result).toStrictEqual({
      email: user.email,
      signUpAuthCode,
      ttl: TTL,
    });
  });

  it('User를 생성하면 생성한 User를 반환한다.', async () => {
    const deleteSignUpAuthCodeSpy = jest.spyOn(mockRedisService, 'del');
    const encryptPasswordSpy = jest
      .spyOn(UserService.prototype as any, 'encryptPassword')
      .mockImplementation(() => Promise.resolve(user.password));

    const createdUser = await service.save({
      email: user.email,
      password: user.password,
      nickname: user.nickname,
    });

    expect(createdUser).toStrictEqual(user);
    expect(deleteSignUpAuthCodeSpy).toHaveBeenCalled();
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
    expect(result).toStrictEqual({
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
});