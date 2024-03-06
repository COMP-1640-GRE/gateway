import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  GUEST = 'guest',
  STUDENT = 'student',
  ADMINISTRATOR = 'administrator',
  UNIVERSITY_MARKETING_MANAGER = 'university_marketing_manager',
  FACULTY_MARKETING_COORDINATOR = 'faculty_marketing_coordinator',
}

export enum AccountStatus {
  LOCKED = 'locked',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  secret: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role: UserRole;

  @Column({ nullable: true, unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.INACTIVE,
  })
  account_status: AccountStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
