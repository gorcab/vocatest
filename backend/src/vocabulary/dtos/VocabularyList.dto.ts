import { PickType } from '@nestjs/mapped-types';
import { CategoryDto } from 'src/category/dtos/Category.dto';
import { VocabularyList } from '../entities/VocabularyList.entity';
import { CreateVocabularyListDto } from './CreateVocabularyList.dto';

export class VocabularyListDto extends PickType(CreateVocabularyListDto, [
  'title',
] as const) {
  id: number;
  createdAt: Date;
  numOfVocabularies: number;
  category: CategoryDto;

  static create(
    { id, createdAt, category, title }: VocabularyList,
    numOfVocabularies?: number,
  ) {
    const vocabularyListResponseDto: VocabularyListDto = {
      id,
      title,
      category: CategoryDto.create(category),
      createdAt,
      numOfVocabularies,
    };

    return vocabularyListResponseDto;
  }
}
