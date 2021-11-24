import { OmitType } from '@nestjs/mapped-types';
import { CreateVocabularyListDto } from './CreateVocabularyList.dto';

export class UpdateVocabularyListDto extends OmitType(CreateVocabularyListDto, [
  'categoryId',
] as const) {}
