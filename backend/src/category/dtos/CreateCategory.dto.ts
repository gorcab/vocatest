import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: '카테고리명은 문자로 구성되어야 합니다.' })
  name: string;
}
