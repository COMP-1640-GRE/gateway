import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ContributionEvaluate,
  ContributionStatus,
} from '../entities/contribution.entity';

export class CreateContributionDto {
  @ApiProperty({ example: 'My contribution' })
  @IsString()
  @MinLength(4)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'My contribution description', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsPositive()
  semester_id: number;

  @ApiProperty({ example: false, required: false })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_anonymous: boolean;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  attachments: Express.Multer.File[];
}

export class UpdateContributionDto extends CreateContributionDto {
  @ApiProperty({ isArray: true, example: ['1', '2'], required: false })
  @IsString()
  @IsOptional()
  to_delete: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  attachments: Express.Multer.File[];
}

export class EvaluateDto {
  @ApiProperty({
    example: ContributionEvaluate.NORMAL,
    enum: ContributionEvaluate,
  })
  @IsEnum(ContributionEvaluate)
  evaluation: ContributionEvaluate;
}

export class StatusDto {
  @ApiProperty({
    example: ContributionStatus.PENDING,
    enum: ContributionStatus,
  })
  @IsEnum(ContributionStatus)
  status: ContributionStatus;
}

export class SelectManyDto {
  @ApiProperty({ example: [1, 2], isArray: true })
  @IsPositive({ each: true })
  ids: number[];
}
