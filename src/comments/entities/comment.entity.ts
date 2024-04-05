import { Contribution } from 'src/contributions/entities/contribution.entity';
import { Reaction } from 'src/reactions/entities/reaction.entity';
import { User } from 'src/users/entities/user.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

export const COMMENT_ENTITY = 'comment';

@Entity({ name: COMMENT_ENTITY })
@Tree('materialized-path')
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Contribution, (contribution) => contribution.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  contribution: Contribution;

  @OneToMany(() => Reaction, (reaction) => reaction.contribution)
  reactions: Reaction[];

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Comment;

  @TreeChildren()
  children: Comment[];
}
