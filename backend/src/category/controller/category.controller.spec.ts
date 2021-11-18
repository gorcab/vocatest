import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createCategory, createUser } from 'src/common/mocks/utils';
import { User } from 'src/user/entities/user.entity';
import { CategoryResponseDto } from '../dtos/CategoryResponse.dto';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { DeleteCategoryDto } from '../dtos/DeleteCategory.dto';
import { UpdateCategoryDto } from '../dtos/UpdateCategory.dto';
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
    user = createUser();
    category = createCategory(user);
    categories = Array.from({ length: 10 }).map(() => createCategory(user));

    mockCategoryService = {
      findByUserAndName: async () => category,
      findByUser: async () => categories,
      save: async () => category as Category,
      update: async (user: User, updateCategoryDto: CategoryResponseDto) => {
        const updatedCategory = new Category();
        updatedCategory.id = category.id;
        updatedCategory.name = updateCategoryDto.name;
        updatedCategory.user = user;
        updatedCategory.vocabularyLists = null;

        return updatedCategory;
      },
      deleteById: async () => true,
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

  it('업데이트된 CategoryResponseDto를 반환한다.', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      id: category.id,
      name: 'teps',
    };

    const result = await controller.update(user, updateCategoryDto);

    expect(result).toStrictEqual({
      id: updateCategoryDto.id,
      name: updateCategoryDto.name,
    });
  });

  it('카테고리 삭제에 성공하면 에러를 발생시키지 않는다.', async () => {
    const deleteCategoryDto: DeleteCategoryDto = {
      id: 1,
    };

    expect(async () => await controller.delete(deleteCategoryDto)).not.toThrow(
      new ServiceUnavailableException('카테고리 삭제에 실패했습니다.'),
    );
  });

  it('카테고리 삭제에 실패하면 ServiceUnavailableException이 발생한다.', async () => {
    mockCategoryService.deleteById = async () => false;

    const deleteCategoryDto: DeleteCategoryDto = {
      id: 1,
    };

    await expect(controller.delete(deleteCategoryDto)).rejects.toThrow(
      new ServiceUnavailableException('카테고리 삭제에 실패했습니다.'),
    );
  });
});
