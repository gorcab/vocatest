import { IsInt } from 'class-validator';

export class DeleteCategoryDto {
  @IsInt({ message: '올바르지 않은 카테고리입니다.' })
  id: number;
}
