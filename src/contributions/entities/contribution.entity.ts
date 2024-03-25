import { Attachment } from 'src/attachments/entities/attachment.entity';
import { Review } from 'src/reviews/entities/review.entity';
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

export enum ContributionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
    enum: ContributionStatus,
    default: ContributionStatus.PENDING,
  })
  status: ContributionStatus;

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

  @OneToMany(() => Review, (review) => review.contribution)
  reviews: Review[];

  constructor(partial: Partial<Contribution>) {
    super();
    Object.assign(this, partial);
  }
}
