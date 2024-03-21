import { Semester } from 'src/semesters/entities/semester.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const FACULTY_ENTITY = 'faculty';

@Entity({ name: FACULTY_ENTITY })
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, (user) => user.faculty)
  @JoinColumn({ name: 'id', referencedColumnName: 'faculty_id' })
  users: User[];

  @OneToMany(() => Semester, (semester) => semester.faculty)
  semesters: Semester[];
}
