import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { CategoryResponseDto } from '../dtos/CategoryResponse.dto';
import { CategoryService } from '../service/category.service';
import { CategoriesResponseDto } from '../dtos/CategoriesResponse.dto';
import { UpdateCategoryDto } from '../dtos/UpdateCategory.dto';
import { UsersCategoryGuard } from '../guards/UsersCategory.guard';
import { IsCategoryNameAlreadyExistGuard } from '../guards/IsCategoryNameAlreadyExist.guard';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { DeleteCategoryDto } from '../dtos/DeleteCategory.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(IsCategoryNameAlreadyExistGuard)
  public async create(
    @User() user: UserEntity,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryService.save(user, createCategoryDto);

    const createCategoryResponseDto: CategoryResponseDto = {
      id: category.id,
      name: category.name,
    };

    return createCategoryResponseDto;
  }

  @Get()
  public async getAll(
    @User() user: UserEntity,
  ): Promise<CategoriesResponseDto> {
    const categories = await this.categoryService.findByUser(user);

    const categoryResponseDtos: Array<CategoryResponseDto> = categories.map(
      ({ id, name }) => ({
        id,
        name,
      }),
    );

    return {
      categories: categoryResponseDtos,
    };
  }

  @Patch(':id')
  @UseGuards(IsCategoryNameAlreadyExistGuard)
  @UseGuards(UsersCategoryGuard)
  public async update(
    @User() user: UserEntity,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoryService.update(user, updateCategoryDto);

    const categoryResponseDto: CategoryResponseDto = {
      id: category.id,
      name: category.name,
    };

    return categoryResponseDto;
  }

  @Delete(':id')
  @UseGuards(UsersCategoryGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @Body() deleteCategoryDto: DeleteCategoryDto,
  ): Promise<void> {
    const isDeleted = await this.categoryService.deleteById(
      deleteCategoryDto.id,
    );

    if (!isDeleted) {
      throw new ServiceUnavailableException('카테고리 삭제에 실패했습니다.');
    }
  }
}
