import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vocabulary } from './Vocabulary.entity';

@Entity()
export class Example {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sentence: string;

  @Column()
  translation: string;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.examples, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;
}
