import { PickType } from '@nestjs/mapped-types';
import { CreateVocabularyDto } from './CreateVocabulary.dto';
import { ExampleDto } from './Example.dto';

export class VocabularyDto extends PickType(CreateVocabularyDto, [
  'english',
  'korean',
] as const) {
  id: number;

  examples?: Array<ExampleDto>;
}
