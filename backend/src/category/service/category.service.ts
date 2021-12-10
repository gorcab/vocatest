import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CategoriesDto } from '../dtos/Categories.dto';
import { CategoryDto } from '../dtos/Category.dto';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
import { UpdateCategoryDto } from '../dtos/UpdateCategory.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  public async save(
    user: User,
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    const category = this.categoryRepository.create(createCategoryDto);
    category.user = user;
    const savedCategory = await this.categoryRepository.save(category);

    return CategoryDto.create(savedCategory);
  }

  public async findByUserAndName(user: User, name: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        name,
        user,
      },
    });

    return category;
  }

  public async findByUser(user: User): Promise<CategoriesDto> {
    const categories = await this.categoryRepository.find({
      where: {
        user,
      },
    });
    return CategoriesDto.create(categories);
  }

  public async findByUserAndId(user: User, id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        user,
      },
    });

    return category;
  }

  public async update(
    user: User,
    { id, name }: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOne({
      where: {
        user,
        id,
      },
    });
    category.updateName(name);
    await this.categoryRepository.update(id, category);

    return CategoryDto.create(category);
  }

  public async deleteById(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  public async findById(id: number): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOne(id);
    return CategoryDto.create(category);
  }
}
