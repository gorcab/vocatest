import { IsInt, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsInt({ message: '올바르지 않은 카테고리입니다.' })
  id: number;

  @IsString({ message: '카테고리명은 문자로 구성되어야 합니다.' })
  name: string;
}
