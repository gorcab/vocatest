import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { CreateExampleDto } from './CreateExample.dto';

export class CreateVocabularyDto {
  @IsString({ message: '영단어는 문자열로 구성되어야 합니다.' })
  english: string;

  @IsString({ message: '영단어 뜻은 문자열로 구성되어야 합니다.' })
  korean: string;

  @ValidateNested({ each: true, message: '예문 형식이 올바르지 않습니다.' })
  @Type(() => CreateExampleDto)
  examples?: Array<CreateExampleDto>;
}
