import { User } from 'src/user/entities/user.entity';

export class GetPaginatedVocabularyListServiceDto {
  categoryId?: number;
  user: User;
  page: number;
  perPage: number;
  title?: string;
}
