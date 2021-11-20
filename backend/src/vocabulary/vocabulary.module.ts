import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { User } from 'src/user/entities/user.entity';
import { VocabularyController } from './controller/vocabulary.controller';
import { Example } from './entities/Example.entity';
import { Vocabulary } from './entities/Vocabulary.entity';
import { VocabularyList } from './entities/VocabularyList.entity';
import { SameTitleVocabularyListInCategoryGuard } from './guards/SameTitleVocabularyListInCategory.guard';
import { VocabularyService } from './service/vocabulary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VocabularyList, Vocabulary, Example]),
    CategoryModule,
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService, SameTitleVocabularyListInCategoryGuard],
})
export class VocabularyModule {}
