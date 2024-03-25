import { Contribution } from 'src/contributions/entities/contribution.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const SEMESTER_ENTITY = 'semester';

@Entity({ name: SEMESTER_ENTITY })
export class Semester extends BaseEntity {
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

  @Column()
  due_date: Date;

  @ManyToOne(() => Faculty, (faculty) => faculty.semesters, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  faculty: Faculty;

  @OneToMany(() => Contribution, (contribution) => contribution.semester, {})
  contributions: Contribution[];
}
