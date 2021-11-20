import { PickType } from '@nestjs/mapped-types';
import { CategoryResponseDto } from 'src/category/dtos/CategoryResponse.dto';
import { VocabularyList } from '../entities/VocabularyList.entity';
import { CreateVocabularyListDto } from './CreateVocabularyList.dto';

export class VocabularyListDto extends PickType(CreateVocabularyListDto, [
  'title',
] as const) {
  id: number;
  createdAt: Date;
  numOfVocabularies: number;
  category: CategoryResponseDto;

  static create(
    { id, createdAt, category, title }: VocabularyList,
    numOfVocabularies?: number,
  ) {
    const vocabularyListResponseDto: VocabularyListDto = {
      id,
      title,
      category: CategoryResponseDto.create(category),
      createdAt,
      numOfVocabularies,
    };

    return vocabularyListResponseDto;
  }
}
