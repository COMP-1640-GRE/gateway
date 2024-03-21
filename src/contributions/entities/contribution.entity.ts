import { Attachment } from 'src/attachments/entities/attachment.entity';
import { Semester } from 'src/semesters/entities/semester.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

export const CONTRIBUTION_ENTITY = 'contribution';

export enum ContributionEvaluate {
  GOOD = 'good',
  NORMAL = 'normal',
  BAD = 'bad',
}

@Entity({ name: CONTRIBUTION_ENTITY })
export class Contribution extends BaseEntity {
  @Column()
  @Index()
  title: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: false })
  selected: boolean;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: false })
  is_anonymous: boolean;

  @Column({
    type: 'enum',
    enum: ContributionEvaluate,
    nullable: true,
  })
  evaluation: ContributionEvaluate;

  @ManyToOne(() => User, (user) => user.contributions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  student: User;

  @ManyToOne(() => Semester, (semester) => semester.contributions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  semester: Semester;

  @OneToMany(() => Attachment, (attachment) => attachment.contribution)
  attachments: Attachment[];
}
