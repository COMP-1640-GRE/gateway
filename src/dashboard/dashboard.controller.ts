import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardDto, DashboardTimeSeriesDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('faculty-stats')
  async facultyStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.facultyStats(dto);
  }

  @Get('semester-stats')
  async semesterStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.semesterStats(dto);
  }

  @Get('contribution-stats')
  async contributionStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.contributionStats(dto);
  }

  @Get('users-stats')
  async usersStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.usersStats(dto);
  }

  @Get('notifications-stats')
  async notificationsStats(
    @Query()
    dto: DashboardDto,
  ) {
    return this.dashboardService.notificationsStats(dto);
  }

  @Get('contributions-time-series')
  async contributionsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.contributionsTimeSeries(dto);
  }

  @Get('reactions-time-series')
  async reactionsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.reactionsTimeSeries(dto);
  }

  @Get('comments-time-series')
  async commentsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.commentsTimeSeries(dto);
  }

  @Get('reviews-time-series')
  async reviewsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.reviewsTimeSeries(dto);
  }

  @Get('notifications-time-series')
  async notificationsTimeSeries(
    @Query()
    dto: DashboardTimeSeriesDto,
  ) {
    return this.dashboardService.notificationsTimeSeries(dto);
  }
}
