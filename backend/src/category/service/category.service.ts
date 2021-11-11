import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from '../dtos/CreateCategory.dto';
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
  ): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    category.user = user;

    return this.categoryRepository.save(category);
  }

  public async findByUserAndName(
    user: User,
    name: string,
  ): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({
      where: {
        name,
        user,
      },
    });

    return category;
  }
}
