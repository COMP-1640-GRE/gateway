import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const NOTIFICATION_ENTITY = 'notification';

@Entity(NOTIFICATION_ENTITY)
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  seen: boolean;

  @Column()
  with_email: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  user_id: number;
}
