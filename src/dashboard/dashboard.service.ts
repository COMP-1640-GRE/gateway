import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  Contribution,
  ContributionEvaluate,
  ContributionStatus,
} from 'src/contributions/entities/contribution.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Reaction } from 'src/reactions/entities/reaction.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Semester } from 'src/semesters/entities/semester.entity';
import { User, UserRole, UserStatus } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { DashboardDto, DashboardTimeSeriesDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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

  async facultyStats({ from, to }: DashboardDto) {
    const query = this.facultyRepository
      .createQueryBuilder('f')
      .leftJoin('f.semesters', 's')
      .leftJoin('s.contributions', 'c')
      .select('f.id', 'id')
      .addSelect('f.name', 'name')
      .addSelect('COUNT(c.id)', 'total_contributions')
      .addSelect('COUNT(DISTINCT c.db_author_id)', 'total_contributors')
      .groupBy('f.name')
      .addGroupBy('f.id')
      .orderBy('COUNT(c.id)', 'DESC');

    if (from) {
      query.andWhere('c.created_at >= :from', { from });
    }
    if (to) {
      query.andWhere('c.created_at <= :to', { to });
    }

    return query.getRawMany();
  }

  async semesterStats({ from, to }: DashboardDto) {
    const query = this.semesterRepository
      .createQueryBuilder('s')
      .leftJoin('s.contributions', 'c')
      .select('s.id', 'id')
      .addSelect('s.name', 'name')
      .addSelect('COUNT(c.id)', 'total_contributions')
      .addSelect('COUNT(DISTINCT c.db_author_id)', 'total_contributors')
      .groupBy('s.name')
      .addGroupBy('s.id')
      .orderBy('COUNT(c.id)', 'DESC');

    if (from) {
      query.andWhere('c.created_at >= :from', { from });
    }
    if (to) {
      query.andWhere('c.created_at <= :to', { to });
    }

    return query.getRawMany();
  }

  async contributionStats({ from, to }: DashboardDto) {
    const query = this.contributionRepository
      .createQueryBuilder('c')
      .select('COUNT(c.id)', 'total_contributions')
      .addSelect('COUNT(DISTINCT c.db_author_id)', 'total_contributors')
      .addSelect(
        'COUNT(CASE WHEN c.is_anonymous = true THEN 1 ELSE NULL END)',
        'total_anonymous_contributions',
      )
      .addSelect('SUM(c.view_count)', 'total_views')
      .addSelect(
        'COUNT(CASE WHEN c.selected THEN 1 ELSE NULL END)',
        'total_selected_contributions',
      );
    Object.values(ContributionStatus).forEach((status) => {
      query.addSelect(
        `SUM(CASE WHEN c.status = '${status}' THEN 1 ELSE 0 END)`,
        `status_${status}`,
      );
    });

    Object.values(ContributionEvaluate).forEach((evaluate) => {
      query.addSelect(
        `SUM(CASE WHEN c.evaluation = '${evaluate}' THEN 1 ELSE 0 END)`,
        `evaluation_${evaluate}`,
      );
    });

    if (from) {
      query.andWhere('c.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('c.created_at <= :to', { to });
    }

    return query.getRawOne();
  }

  async usersStats({ from, to }: DashboardDto) {
    const query = this.userRepository
      .createQueryBuilder('u')
      .select('COUNT(u.id)', 'total_users')
      .addSelect('COUNT(DISTINCT u.faculty_id)', 'total_faculties');

    Object.values(UserRole).forEach((role) => {
      query.addSelect(
        `COUNT(CASE WHEN u.role = '${role}' THEN 1 ELSE NULL END)`,
        `role_${role}`,
      );
    });

    Object.values(UserStatus).forEach((status) => {
      query.addSelect(
        `COUNT(CASE WHEN u.account_status = '${status}' THEN 1 ELSE NULL END)`,
        `status_${status}`,
      );
    });

    if (from) {
      query.andWhere('u.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('u.created_at <= :to', { to });
    }

    return query.getRawOne();
  }

  async notificationsStats({ from, to }: DashboardDto) {
    const query = this.notificationRepository
      .createQueryBuilder('n')
      .select('COUNT(n.id)', 'total_notifications')
      .addSelect(
        'COUNT(CASE WHEN n.with_email = true THEN 1 ELSE NULL END)',
        'with_email',
      );

    if (from) {
      query.andWhere('n.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('n.created_at <= :to', { to });
    }

    return query.getRawOne();
  }

  async contributionsTimeSeries({
    from,
    to,
    faculty_id,
    semester_id,
    user_id,
  }: DashboardTimeSeriesDto) {
    const query = this.contributionRepository
      .createQueryBuilder('c')
      .select('DATE(c.created_at)', 'created_at')
      .addSelect('COUNT(c.id)', 'total_contributions')
      .addSelect('COUNT(DISTINCT c.db_author_id)', 'total_contributors')
      .groupBy('DATE(c.created_at)')
      .orderBy('DATE(c.created_at)');

    if (from) {
      query.andWhere('c.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('c.created_at <= :to', { to });
    }

    if (faculty_id) {
      query
        .leftJoin('c.semester', 's')
        .andWhere('s.faculty_id = :faculty_id', { faculty_id });
    }

    if (semester_id) {
      query.andWhere('c.semester_id = :semester_id', { semester_id });
    }

    if (user_id) {
      query.andWhere('c.db_author_id = :user_id', { user_id });
    }

    return query.getRawMany();
  }

  async reactionsTimeSeries({
    from,
    to,
    user_id,
    faculty_id,
    semester_id,
  }: DashboardTimeSeriesDto) {
    const query = this.reactionRepository
      .createQueryBuilder('r')
      .select('DATE(r.created_at)', 'created_at')
      .addSelect('COUNT(r.id)', 'total_reactions')
      .addSelect('COUNT(DISTINCT r.user_id)', 'total_reactors')
      .groupBy('DATE(r.created_at)')
      .orderBy('DATE(r.created_at)');

    if (from) {
      query.andWhere('r.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('r.created_at <= :to', { to });
    }

    if (user_id) {
      query.andWhere('r.user_id = :user_id', { user_id });
    }

    if (faculty_id) {
      query
        .leftJoin('r.contribution', 'c')
        .leftJoin('c.semester', 's')
        .andWhere('s.faculty_id = :faculty_id', { faculty_id });
    }

    if (semester_id) {
      query
        .leftJoin('r.contribution', 'c')
        .andWhere('c.semester_id = :semester_id', { semester_id });
    }

    return query.getRawMany();
  }

  async commentsTimeSeries({
    from,
    to,
    user_id,
    faculty_id,
    semester_id,
  }: DashboardTimeSeriesDto) {
    const query = this.commentRepository
      .createQueryBuilder('c')
      .select('DATE(c.created_at)', 'created_at')
      .addSelect('COUNT(c.id)', 'total_comments')
      .addSelect('COUNT(DISTINCT c.db_author)', 'total_commenters')
      .groupBy('DATE(c.created_at)')
      .orderBy('DATE(c.created_at)');

    if (from) {
      query.andWhere('c.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('c.created_at <= :to', { to });
    }

    if (user_id) {
      query.andWhere('c.db_author = :user_id', { user_id });
    }

    if (faculty_id) {
      query
        .leftJoin('c.contribution', 'con')
        .leftJoin('con.semester', 's')
        .andWhere('s.faculty_id = :faculty_id', { faculty_id });
    }

    if (semester_id) {
      query
        .leftJoin('c.contribution', 'con')
        .andWhere('con.semester_id = :semester_id', { semester_id });
    }

    return query.getRawMany();
  }

  async reviewsTimeSeries({
    from,
    to,
    user_id,
    faculty_id,
    semester_id,
  }: DashboardTimeSeriesDto) {
    const query = this.reviewRepository
      .createQueryBuilder('r')
      .select('DATE(r.created_at)', 'created_at')
      .addSelect('COUNT(r.id)', 'total_reviews')
      .addSelect('COUNT(DISTINCT r.reviewer)', 'total_reviewers')
      .groupBy('DATE(r.created_at)')
      .orderBy('DATE(r.created_at)');

    if (from) {
      query.andWhere('r.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('r.created_at <= :to', { to });
    }

    if (user_id) {
      query.andWhere('r.reviewer = :user_id', { user_id });
    }

    if (faculty_id) {
      query
        .leftJoin('r.contribution', 'con')
        .leftJoin('con.semester', 's')
        .andWhere('s.faculty_id = :faculty_id', { faculty_id });
    }

    if (semester_id) {
      query
        .leftJoin('r.contribution', 'con')
        .andWhere('con.semester_id = :semester_id', { semester_id });
    }

    return query.getRawMany();
  }

  async notificationsTimeSeries({ from, to, user_id }: DashboardTimeSeriesDto) {
    const query = this.notificationRepository
      .createQueryBuilder('n')
      .select('DATE(n.created_at)', 'created_at')
      .addSelect('COUNT(n.id)', 'total_notifications')
      .addSelect('COUNT(DISTINCT n.user_id)', 'total_users')
      .groupBy('DATE(n.created_at)')
      .orderBy('DATE(n.created_at)');

    if (from) {
      query.andWhere('n.created_at >= :from', { from });
    }

    if (to) {
      query.andWhere('n.created_at <= :to', { to });
    }

    if (user_id) {
      query.andWhere('n.user_id = :user_id', { user_id });
    }
  }
}
