import { Category } from '../entities/category.entity';
import { CategoryDto } from './Category.dto';

export class CategoriesDto {
  categories: Array<CategoryDto>;

  static create(categories: Array<Category>) {
    const categoriesDto: CategoriesDto = {
      categories: categories.map((category) => CategoryDto.create(category)),
    };

    return categoriesDto;
  }
}
