import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { CategoryDto } from '../dtos/Category.dto';
import { CategoryService } from '../service/category.service';
import { CategoriesDto } from '../dtos/Categories.dto';
import { UpdateCategoryDto } from '../dtos/UpdateCategory.dto';
import { UsersCategoryGuard } from '../guards/UsersCategory.guard';
import { IsCategoryNameAlreadyExistGuard } from '../guards/IsCategoryNameAlreadyExist.guard';
import { User as UserEntity } from 'src/user/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(IsCategoryNameAlreadyExistGuard)
  public async create(
    @User() user: UserEntity,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    return await this.categoryService.save(user, createCategoryDto);
  }

  @Get()
  public async getAll(@User() user: UserEntity): Promise<CategoriesDto> {
    return await this.categoryService.findByUser(user);
  }

  @Patch(':id')
  @UseGuards(IsCategoryNameAlreadyExistGuard)
  @UseGuards(UsersCategoryGuard)
  public async update(
    @User() user: UserEntity,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return await this.categoryService.update(user, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(UsersCategoryGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') categoryId: number): Promise<void> {
    await this.categoryService.deleteById(categoryId);
  }
}
