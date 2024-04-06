import { Exclude, Expose } from 'class-transformer';
import { Attachment } from 'src/attachments/entities/attachment.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Reaction, ReactionType } from 'src/reactions/entities/reaction.entity';
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

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: false })
  selected: boolean;

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

  @Exclude({ toPlainOnly: true })
  @ManyToOne(() => User, (user) => user.contributions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  db_author: User;

  @Expose()
  get author() {
    return this.is_anonymous ? null : this.db_author;
  }

  @ManyToOne(() => Semester, (semester) => semester.contributions, {
    eager: true,
    onDelete: 'CASCADE',
  })
  semester: Semester;

  @OneToMany(() => Attachment, (attachment) => attachment.contribution)
  attachments: Attachment[];

  @OneToMany(() => Review, (review) => review.contribution)
  reviews: Review[];

  @OneToMany(() => Reaction, (reaction) => reaction.contribution)
  reactions: Reaction[];

  @Expose()
  get reaction() {
    return this.reactions?.reduce(
      (acc, curr) => {
        Object.values(ReactionType).forEach((type) => {
          if (curr.type === type) {
            acc[type] = acc[type] + 1;
          }
        });

        return acc;
      },
      {
        like: 0,
        dislike: 0,
      },
    );
  }

  @OneToMany(() => Comment, (comment) => comment.contribution)
  comments: Comment[];

  @Expose()
  get comment_count() {
    return this.comments?.length;
  }

  constructor(partial: Partial<Contribution>) {
    super();
    Object.assign(this, partial);
  }
}
