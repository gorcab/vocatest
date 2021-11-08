import { CACHE_MANAGER } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { User } from '../entities/user.entity';
import { EmailFoundException } from '../exceptions/EmailFound.exception';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let user: User;
  let mockUserRepository: {
    findOne: () => any;
  };
  let mockRedisService: {
    get: (key: string) => any;
    set: (key: string, value: string) => any;
  };
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
      findOne: () => user,
    };
    mockRedisService = {
      get: async (key: string) => signUpAuthCode,
      set: async (key: string, value: string) => 'OK',
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

  it('Redis Store에 {"user:email": signUpAuthCode}를 저장한다.', async () => {
    jest
      .spyOn(UserService.prototype as any, 'createAuthCode')
      .mockImplementation(() => signUpAuthCode);

    const result = await service.saveSignUpAuthCode(user.email);

    expect(result).toStrictEqual({
      email: user.email,
      signUpAuthCode,
      ttl: 60 * 5,
    });
  });
});
