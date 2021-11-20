import { Type } from 'class-transformer';
import { Min } from 'class-validator';

export class GetPaginatedVocabularyListQueryDto {
  @Min(1, { message: 'page는 1 이상의 정수여야 합니다.' })
  @Type(() => Number)
  page: number;

  @Min(1, { message: 'perPage는 1 이상의 정수여야 합니다.' })
  @Type(() => Number)
  perPage: number;
}
