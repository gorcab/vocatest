import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/user/entities/user.entity';
import { CreateCategoryRequestDto } from '../dtos/CreateCategoryRequest.dto';
import { UpdateCategoryRequestDto } from '../dtos/UpdateCategoryRequest.dto';
import { UpdateCategoryServiceDto } from '../dtos/UpdateCategoryService.dto';
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

    mockCategoryService = {
      findByUserAndName: async () => category as Category,
      find: async () => categories as Array<Category>,
      save: async () => category as Category,
      update: async (
        user: User,
        updateCategoryServiceDto: UpdateCategoryServiceDto,
      ) => {
        const updatedCategory = new Category();
        updatedCategory.id = category.id;
        updatedCategory.name = updateCategoryServiceDto.name;
        updatedCategory.user = user;
        updatedCategory.vocabularyLists = null;

        return updatedCategory;
      },
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
    const createCategoryRequestDto: CreateCategoryRequestDto = {
      name: category.name,
      userId: user.id,
    };

    const result = await controller.create(user, createCategoryRequestDto);

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

  it('업데이트된 CategoryResponseDto를 반환한다.', async () => {
    const updateCategoryRequestDto: UpdateCategoryRequestDto = {
      userId: user.id,
      id: category.id,
      name: 'teps',
    };

    const result = await controller.update(user, updateCategoryRequestDto);

    expect(result).toStrictEqual({
      id: updateCategoryRequestDto.id,
      name: updateCategoryRequestDto.name,
    });
  });
});
