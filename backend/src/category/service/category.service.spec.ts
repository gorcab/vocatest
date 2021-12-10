import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createCategory, createUser } from 'src/common/mocks/utils';
import { User } from 'src/user/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CategoriesDto } from '../dtos/Categories.dto';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { UpdateCategoryDto } from '../dtos/UpdateCategory.dto';
import { Category } from '../entities/category.entity';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let user: User;
  let category: Category;
  let categories: Array<Category>;
  let mockCategoryRepository: DeepPartial<Repository<Category>>;

  beforeEach(async () => {
    user = createUser();
    category = createCategory(user);
    categories = Array.from({ length: 10 }).map(() => createCategory(user));

    mockCategoryRepository = {
      findOne: async () => category,
      find: async () => categories,
      create: async () => category,
      save: async () => category,
      update: async () => undefined,
      delete: jest.fn(),
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
    };

    const result = await service.save(user, createCategoryDto);

    expect(result).toStrictEqual({
      id: expect.any(Number),
      name: createCategoryDto.name,
    });
  });

  it('회원의 카테고리를 모두 반환한다.', async () => {
    const result = await service.findByUser(user);

    expect(result).toStrictEqual(CategoriesDto.create(categories));
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
    const updateCategoryDto: UpdateCategoryDto = {
      id: 1,
      name: 'teps',
    };

    const result = await service.update(user, updateCategoryDto);

    expect(result.name).toBe(updateCategoryDto.name);
  });

  it('카테고리 삭제를 위해 repository의 delete 메소드를 호출한다.', async () => {
    const id = 1;

    await service.deleteById(id);

    expect(mockCategoryRepository.delete).toBeCalledWith(id);
  });

  it('id가 일치하는 카테고리를 반환한다.', async () => {
    const result = await service.findById(category.id);

    expect(result).toStrictEqual({
      id: category.id,
      name: category.name,
    });
  });
});
