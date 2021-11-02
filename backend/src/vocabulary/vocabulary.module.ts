import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example } from './entities/Example.entity';
import { Vocabulary } from './entities/Vocabulary.entity';
import { VocabularyList } from './entities/VocabularyList.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyList, Vocabulary, Example])],
})
export class VocabularyModule {}
