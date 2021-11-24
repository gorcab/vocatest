import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { VocabularyService } from '../service/vocabulary.service';

@Injectable()
export class UsersVocabularyListGuard implements CanActivate {
  constructor(private readonly vocabularyService: VocabularyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const vocabularyListId = request.body.id || request.params.id;

    if (vocabularyListId == null) {
      throw new UnauthorizedException('올바르지 않은 단어장입니다.');
    }

    const vocabularyList = await this.vocabularyService.findByUserAndId(
      user,
      vocabularyListId,
    );

    if (!vocabularyList) {
      throw new UnauthorizedException('올바르지 않은 단어장입니다.');
    }

    return true;
  }
}
