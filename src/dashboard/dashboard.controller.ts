import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardDto, DashboardTimeSeriesDto } from './dto/dashboard.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('faculty-stats')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.UNIVERSITY_MARKETING_MANAGER,
    UserRole.FACULTY_MARKETING_COORDINATOR,
  )
  async facultyStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.facultyStats(dto);
  }

  @Get('semester-stats')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.UNIVERSITY_MARKETING_MANAGER,
    UserRole.FACULTY_MARKETING_COORDINATOR,
  )
  async semesterStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.semesterStats(dto);
  }

  @Get('contribution-stats')
  @Roles(UserRole.ADMINISTRATOR, UserRole.UNIVERSITY_MARKETING_MANAGER)
  async contributionStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.contributionStats(dto);
  }

  @Get('users-stats')
  @Roles(UserRole.ADMINISTRATOR, UserRole.UNIVERSITY_MARKETING_MANAGER)
  async usersStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.usersStats(dto);
  }

  @Get('notifications-stats')
  @Roles(UserRole.ADMINISTRATOR, UserRole.UNIVERSITY_MARKETING_MANAGER)
  async notificationsStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.notificationsStats(dto);
  }

  @Get('contribution-time-series')
  async contributionsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.contributionsTimeSeries(dto);
  }

  @Get('reaction-time-series')
  async reactionsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.reactionsTimeSeries(dto);
  }

  @Get('comment-time-series')
  async commentsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.commentsTimeSeries(dto);
  }

  @Get('review-time-series')
  async reviewsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.reviewsTimeSeries(dto);
  }

  @Get('notification-time-series')
  async notificationsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.notificationsTimeSeries(dto);
  }
}
