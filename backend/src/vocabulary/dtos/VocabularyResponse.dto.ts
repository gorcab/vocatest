import { PickType } from '@nestjs/mapped-types';
import { CreateVocabularyDto } from './CreateVocabulary.dto';
import { ExampleResponse } from './ExampleResponse.dto';

export class VocabularyResponse extends PickType(CreateVocabularyDto, [
  'english',
  'korean',
] as const) {
  id: number;

  examples?: Array<ExampleResponse>;
}
