import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Example } from './Example.entity';

@Entity()
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  english: string;

  @Column()
  korean: string;

  @OneToMany(() => Example, (example) => example.vocabulary)
  examples: Promise<Example[]>;
}
