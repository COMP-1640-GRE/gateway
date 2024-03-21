import { Faculty } from 'src/faculties/entities/faculty.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const SEMESTER_ENTITY = 'semester';

@Entity({ name: SEMESTER_ENTITY })
export class Semester {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Faculty, (faculty) => faculty.semesters, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  faculty: Faculty;
}
