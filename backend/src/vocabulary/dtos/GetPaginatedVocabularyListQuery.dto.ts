import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class GetPaginatedVocabularyListQueryDto {
  @Min(1, { message: 'category는 1 이상의 정수여야 합니다.' })
  @IsOptional()
  @Type(() => Number)
  category: number;

  @Min(1, { message: 'page는 1 이상의 정수여야 합니다.' })
  @Type(() => Number)
  page: number;

  @Min(1, { message: 'perPage는 1 이상의 정수여야 합니다.' })
  @Max(10, { message: 'perPage는 10 이하의 정수여야 합니다.' })
  @Type(() => Number)
  perPage: number;

  @IsString({ message: '제목은 문자로 구성되어야 합니다.' })
  @IsOptional()
  title?: string;
}
