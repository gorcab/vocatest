import { PickType } from '@nestjs/mapped-types';
import { CreateVocabularyListDto } from './CreateVocabularyList.dto';
import { VocabularyResponse } from './VocabularyResponse.dto';

export class VocabularyListResponseDto extends PickType(
  CreateVocabularyListDto,
  ['title'] as const,
) {
  id: number;

  createdAt: Date;

  vocabularies: Array<VocabularyResponse>;
}
