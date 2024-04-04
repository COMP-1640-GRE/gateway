import { Contribution } from 'src/contributions/entities/contribution.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export const REACTION_ENTITY = 'reaction';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity({ name: REACTION_ENTITY })
export class Reaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Contribution, (contribution) => contribution.reactions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  contribution: Contribution;

  //   @ManyToOne(() => Comment, (comment) => comment.reactions, {
  //     onDelete: 'CASCADE',
  //   })
  //   comment: Comment;

  @Column({
    type: 'enum',
    enum: ReactionType,
  })
  type: ReactionType;
}
