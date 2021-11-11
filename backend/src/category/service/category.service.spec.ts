import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { Category } from '../entities/category.entity';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let user: User;
  let category: Category;
  let categories: Array<Category>;
  let mockCategoryRepository: DeepPartial<Repository<Category>>;

  beforeEach(async () => {
    user = {
      id: 1,
      email: 'tester@gmail.com',
      password: 'test1234',
      nickname: 'tester',
      createdAt: new Date(),
      categories: null,
    };

    category = {
      id: 1,
      name: 'toeic',
      user,
      vocabularyLists: null,
    };

    categories = Array.from({ length: 10 }).map((_, index) => ({
      id: index + 1,
      name: `toeic${index + 1}`,
      user,
      vocabularyLists: null,
    }));

    mockCategoryRepository = {
      findOne: async () => category,
      find: async () => categories,
      create: async () => category,
      save: async () => category,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('정의되어야 한다.', () => {
    expect(service).toBeDefined();
  });

  it('특정 사용자가 해당 카테고리를 가지고 있다면 그 카테고리를 반환한다.', async () => {
    const result = await service.findByUserAndName(user, category.name);

    expect(result).toStrictEqual(category);
  });

  it('사용자가 해당 카테고리를 가지고 있지 않다면 null을 반환한다.', async () => {
    mockCategoryRepository.findOne = async () => null;

    const result = await service.findByUserAndName(user, category.name);

    expect(result).toBeNull();
  });

  it('생성한 카테고리를 반환한다.', async () => {
    const createCategoryDto: CreateCategoryDto = {
      name: category.name,
      userId: user.id,
    };

    const result = await service.save(user, createCategoryDto);

    expect(result).toStrictEqual(category);
  });

  it('회원의 카테고리를 모두 반환한다.', async () => {
    const result = await service.find(user);

    expect(result).toStrictEqual(categories);
  });
});
