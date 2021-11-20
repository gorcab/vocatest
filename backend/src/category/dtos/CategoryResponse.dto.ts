import { Category } from '../entities/category.entity';

export class CategoryResponseDto {
  id: number;
  name: string;

  static create({ id, name }: Category): CategoryResponseDto {
    const categoryResponseDto: CategoryResponseDto = {
      id,
      name,
    };

    return categoryResponseDto;
  }
}
