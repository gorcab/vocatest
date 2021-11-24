import { PickType } from '@nestjs/mapped-types';
import { VocabularyList } from '../entities/VocabularyList.entity';
import { VocabularyDto } from './Vocabulary.dto';
import { VocabularyListDto } from './VocabularyList.dto';

export class DetailedVocabularyListDto extends PickType(VocabularyListDto, [
  'id',
  'title',
  'category',
  'createdAt',
] as const) {
  vocabularies: Array<VocabularyDto>;

  static async create({
    id,
    title,
    createdAt,
    category,
    vocabularies,
  }: VocabularyList) {
    const vocabularyDtos: Array<VocabularyDto> = [];
    for (const { id, english, korean, examples } of vocabularies) {
      const resolvedExamples = await examples;
      const vocabularyDto: VocabularyDto = {
        id,
        english,
        korean,
      };

      resolvedExamples?.length > 0 &&
        (vocabularyDto.examples = resolvedExamples.map((example) => ({
          id: example.id,
          sentence: example.sentence,
          translation: example.translation,
        })));
      vocabularyDtos.push(vocabularyDto);
    }
    const detailedVocabularyListDto: DetailedVocabularyListDto = {
      id,
      title,
      category: {
        id: category.id,
        name: category.name,
      },
      createdAt,
      vocabularies: vocabularyDtos,
    };

    return detailedVocabularyListDto;
  }
}
