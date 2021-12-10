import { Category } from '../entities/category.entity';

export class CategoryDto {
  id: number;
  name: string;

  static create({ id, name }: Category): CategoryDto {
    const categoryDto: CategoryDto = {
      id,
      name,
    };

    return categoryDto;
  }
}
