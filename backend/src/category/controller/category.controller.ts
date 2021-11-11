import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { CreateCategoryResponseDto } from '../dtos/CreateCategoryResponse.dto';
import { CategoryService } from '../service/category.service';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  public async create(
    @User() user: UserEntity,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CreateCategoryResponseDto> {
    const category = await this.categoryService.save(user, createCategoryDto);

    const createCategoryResponseDto: CreateCategoryResponseDto = {
      id: category.id,
      name: category.name,
    };

    return createCategoryResponseDto;
  }
}
