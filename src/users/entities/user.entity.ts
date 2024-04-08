import { Exclude, Expose } from 'class-transformer';
import { Comment } from 'src/comments/entities/comment.entity';
import { Contribution } from 'src/contributions/entities/contribution.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Reaction } from 'src/reactions/entities/reaction.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { BaseEntity } from 'src/utils/entity/base-entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

export enum UserRole {
  GUEST = 'guest',
  STUDENT = 'student',
  ADMINISTRATOR = 'administrator',
  UNIVERSITY_MARKETING_MANAGER = 'university_marketing_manager',
  FACULTY_MARKETING_COORDINATOR = 'faculty_marketing_coordinator',
}

export enum UserStatus {
  LOCKED = 'locked',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export const USER_ENTITY = 'user';

@Entity({ name: USER_ENTITY })
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  secret: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role: UserRole;

  @Column({ nullable: true, unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Expose()
  get full_name() {
    return `${this.first_name ?? ''} ${this.last_name ?? ''}`.trim();
  }

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.INACTIVE,
  })
  account_status: UserStatus;

  @ManyToOne(() => Faculty, (faculty) => faculty.users, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  faculty: Faculty;

  @OneToMany(() => Contribution, (contribution) => contribution.db_author)
  contributions: Contribution[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Comment, (comment) => comment.db_author)
  comments: Comment[];

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
