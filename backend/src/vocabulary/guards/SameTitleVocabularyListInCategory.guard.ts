import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { VocabularyService } from '../service/vocabulary.service';

@Injectable()
export class SameTitleVocabularyListInCategoryGuard implements CanActivate {
  constructor(private readonly vocabularyService: VocabularyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { categoryId, title, ...requestDto } = request.body as {
      categoryId: number;
      title: string;
      [key: string]: any;
    };

    const vocabularyList =
      await this.vocabularyService.findByCategoryIdAndTitle(categoryId, title);
    if (vocabularyList) {
      throw new BadRequestException(
        '동일한 이름의 단어장이 카테고리 내에 존재합니다.',
      );
    }

    return true;
  }
}
