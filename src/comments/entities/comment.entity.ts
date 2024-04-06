import { Exclude, Expose } from 'class-transformer';
import { Contribution } from 'src/contributions/entities/contribution.entity';
import { Reaction, ReactionType } from 'src/reactions/entities/reaction.entity';
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
  @Exclude({ toPlainOnly: true })
  db_author: User;

  @Expose()
  get author() {
    return this.is_anonymous ? null : this.db_author;
  }

  @Column({ default: false })
  is_anonymous: boolean;

  @ManyToOne(() => Contribution, (contribution) => contribution.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  contribution: Contribution;

  @OneToMany(() => Reaction, (reaction) => reaction.comment)
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

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Comment;

  @TreeChildren()
  children: Comment[];
}
