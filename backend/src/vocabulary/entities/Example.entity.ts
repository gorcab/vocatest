import { Category } from 'src/category/entities/category.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Vocabulary } from './Vocabulary.entity';
import { VocabularyList } from './VocabularyList.entity';

@Entity()
export class Example {
  @PrimaryColumn()
  id: number;

  @Column()
  sentence: string;

  @Column()
  translation: string;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.examples, {
    onDelete: 'CASCADE',
    primary: true,
  })
  @JoinColumn([
    {
      name: 'vocabulary_id',
      referencedColumnName: 'id',
    },
    {
      name: 'vocabulary_list_id',
      referencedColumnName: 'vocabularyListId',
    },
  ])
  vocabulary: Vocabulary;
}
