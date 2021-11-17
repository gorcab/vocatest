import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
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

  public async findByUser(user: User): Promise<Array<Category>> {
    const categories = await this.categoryRepository.find({
      where: {
        user,
      },
    });

    return categories;
  }

  public async findByUserAndId(
    user: User,
    id: number,
  ): Promise<Category | null> {
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
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        user,
        id,
      },
    });

    category.updateName(name);
    await this.categoryRepository.update(id, category);

    return category;
  }

  public async deleteById(id: number): Promise<boolean> {
    const deleteResult = await this.categoryRepository.delete(id);

    return deleteResult.affected > 0;
  }
}
