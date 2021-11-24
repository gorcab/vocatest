import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateVocabularyDto } from './CreateVocabulary.dto';

export class CreateVocabularyListDto {
  @IsInt({ message: '올바르지 않은 카테고리입니다.' })
  categoryId: number;

  @IsString({ message: '단어장 제목은 문자열로 구성되어야 합니다.' })
  title: string;

  @IsArray({ message: '단어장은 하나 이상의 단어들로 구성되어야 합니다.' })
  @ArrayNotEmpty({
    message: '단어장은 하나 이상의 단어들로 구성되어야 합니다.',
  })
  @ValidateNested({ each: true, message: '단어 형식이 올바르지 않습니다.' })
  @Type(() => CreateVocabularyDto)
  vocabularies: Array<CreateVocabularyDto>;
}
