import { Contribution } from 'src/contributions/entities/contribution.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export const REVIEW_ENTITY = 'review';

@Entity({ name: REVIEW_ENTITY })
export class Review extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Contribution, (contribution) => contribution.reviews, {
    onDelete: 'CASCADE',
  })
  contribution: Contribution;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
  })
  reviewer: User;
}
