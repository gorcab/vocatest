import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/user/entities/user.entity';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { Category } from '../entities/category.entity';
import { CategoryService } from '../service/category.service';
import { CategoryController } from './category.controller';

describe('CategoryController', () => {
  let controller: CategoryController;
  let user: User;
  let category: Category;
  let categories: Array<Category>;
  let mockCategoryService: Partial<CategoryService>;

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
      user: user,
      vocabularyLists: null,
    };

    categories = Array.from({ length: 10 }).map((_, index) => ({
      id: index + 1,
      name: `toeic${index + 1}`,
      user: user,
      vocabularyLists: null,
    }));

    mockCategoryService = {
      findByUserAndName: async () => category,
      find: async () => categories,
      save: async () => category,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('정의되어야 한다.', () => {
    expect(controller).toBeDefined();
  });

  it('카테고리가 생성되면 CreateCategoryResponseDto를 반환한다.', async () => {
    const createCategoryDto: CreateCategoryDto = {
      name: category.name,
      userId: user.id,
    };

    const result = await controller.create(user, createCategoryDto);

    expect(result).toStrictEqual({
      id: category.id,
      name: category.name,
    });
  });

  it('회원의 모든 카테고리들을 CategoriesResponseDto로 반환한다.', async () => {
    const result = await controller.getAll(user);

    const expectedResult = {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
