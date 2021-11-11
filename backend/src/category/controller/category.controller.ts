import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { CategoryResponseDto } from '../dtos/CategoryResponse.dto';
import { CategoryService } from '../service/category.service';
import { CategoriesResponseDto } from '../dtos/CategoriesResponse.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
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
    const categories = await this.categoryService.find(user);

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
}
