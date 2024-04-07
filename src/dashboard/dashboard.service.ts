import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Attachment } from 'src/attachments/entities/attachment.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Contribution } from 'src/contributions/entities/contribution.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Reaction } from 'src/reactions/entities/reaction.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Semester } from 'src/semesters/entities/semester.entity';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Semester)
    private readonly semesterRepository: Repository<Semester>,
  ) {}
}

/**
 * View statistics in dashboard (reports) such as:
 * Number of contributions per faculty
 * Percentage of contribution by each faculty
 * Numbers of contributors (students) per faculty
 */
