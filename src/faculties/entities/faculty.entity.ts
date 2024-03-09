import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const FACULTY_ENTITY = 'faculty';

@Entity({ name: FACULTY_ENTITY })
export class Faculty {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @OneToMany(() => User, (user) => user.faculty, {
    onDelete: 'SET NULL',
    nullable: true,
    onUpdate: 'NO ACTION',
  })
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
