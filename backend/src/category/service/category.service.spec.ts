import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateCategoryServiceDto } from '../dtos/CreateCategoryService.dto';
import { UpdateCategoryServiceDto } from '../dtos/UpdateCategoryService.dto';
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

    category = new Category();
    category.id = 1;
    category.name = 'toeic';
    category.user = user;
    category.vocabularyLists = null;

    categories = Array.from({ length: 10 }).map((_, index) => {
      const category = new Category();
      category.id = index + 1;
      category.name = `toeic${index + 1}`;
      category.user = user;
      category.vocabularyLists = null;

      return category;
    });

    mockCategoryRepository = {
      findOne: async () => category,
      find: async () => categories,
      create: async () => category,
      save: async () => category,
      update: async () => undefined,
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
    const createCategoryServiceDto: CreateCategoryServiceDto = {
      name: category.name,
    };

    const result = await service.save(user, createCategoryServiceDto);

    expect(result).toStrictEqual(category);
  });

  it('회원의 카테고리를 모두 반환한다.', async () => {
    const result = await service.find(user);

    expect(result).toStrictEqual(categories);
  });

  it('사용자가 해당 ID의 카테고리를 가지고 있으면 해당 카테고리를 반환한다.', async () => {
    const result = await service.findByUserAndId(user, category.id);

    expect(result).toStrictEqual(category);
  });

  it('사용자가 해당 ID의 카테고리를 가지고 있지 않다면 null을 반환한다.', async () => {
    mockCategoryRepository.findOne = async () => null;

    const result = await service.findByUserAndId(user, category.id);

    expect(result).toBeNull();
  });

  it('업데이트된 카테고리를 반환한다.', async () => {
    const updateCategoryServiceDto: UpdateCategoryServiceDto = {
      id: 1,
      name: 'teps',
    };

    const result = await service.update(user, updateCategoryServiceDto);

    expect(result.name).toBe(updateCategoryServiceDto.name);
  });
});
