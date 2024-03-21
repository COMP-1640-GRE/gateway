import { Semester } from 'src/semesters/entities/semester.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';

export const FACULTY_ENTITY = 'faculty';

@Entity({ name: FACULTY_ENTITY })
export class Faculty extends BaseEntity {
  @Column({ unique: true })
  @Index()
  name: string;

  @OneToMany(() => User, (user) => user.faculty)
  users: User[];

  @OneToMany(() => Semester, (semester) => semester.faculty)
  semesters: Semester[];
}
