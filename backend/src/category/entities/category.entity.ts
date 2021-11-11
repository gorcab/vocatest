import { User } from 'src/user/entities/user.entity';
import { VocabularyList } from 'src/vocabulary/entities/VocabularyList.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.categories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => VocabularyList, (vocabularyList) => vocabularyList.category)
  vocabularyLists: Promise<VocabularyList[]>;

  updateName(name: string) {
    this.name = name;
  }
}
