import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsPositive } from 'class-validator';

export class DashboardDto {
  @ApiProperty({ required: false, example: '2022-01-01' })
  @IsDateString()
  @IsOptional()
  from: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  to: string;
}

export class DashboardTimeSeriesDto extends DashboardDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  faculty_id: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  semester_id: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  user_id: number;
}
