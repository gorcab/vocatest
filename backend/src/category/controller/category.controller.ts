import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { CreateCategoryRequestDto } from '../dtos/CreateCategoryRequest.dto';
import { CategoryResponseDto } from '../dtos/CategoryResponse.dto';
import { CategoryService } from '../service/category.service';
import { CategoriesResponseDto } from '../dtos/CategoriesResponse.dto';
import { UpdateCategoryRequestDto } from '../dtos/UpdateCategoryRequest.dto';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  public async create(
    @User() user: UserEntity,
    @Body() { userId, ...createCategoryServiceDto }: CreateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryService.save(
      user,
      createCategoryServiceDto,
    );

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

  @Patch(':id')
  public async update(
    @User() user: UserEntity,
    @Body() { userId, ...updateCategoryServiceDto }: UpdateCategoryRequestDto,
  ) {
    const category = await this.categoryService.update(
      user,
      updateCategoryServiceDto,
    );

    const categoryResponseDto: CategoryResponseDto = {
      id: category.id,
      name: category.name,
    };

    return categoryResponseDto;
  }
}
