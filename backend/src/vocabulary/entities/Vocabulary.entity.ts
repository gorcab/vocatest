import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Example } from './Example.entity';
import { VocabularyList } from './VocabularyList.entity';

@Entity()
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  english: string;

  @Column()
  korean: string;

  @ManyToOne(
    () => VocabularyList,
    (vocabularyList) => vocabularyList.vocabularies,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'vocabulary_list_id' })
  vocabularyList: VocabularyList;

  @OneToMany(() => Example, (example) => example.vocabulary, {
    lazy: true,
    cascade: ['insert'],
  })
  examples: Promise<Array<Example>>;
}
