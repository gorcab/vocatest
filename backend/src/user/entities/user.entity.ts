import { Category } from 'src/category/entities/category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ default: false, name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Category, (category) => category.user)
  categories: Promise<Category[]>;
}
