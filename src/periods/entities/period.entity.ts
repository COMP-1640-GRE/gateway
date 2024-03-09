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

export const PERIOD_ENTITY = 'period';

@Entity({ name: PERIOD_ENTITY })
export class Period {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column()
  description: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Faculty, (faculty) => faculty.periods, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  faculty: Faculty;
}
