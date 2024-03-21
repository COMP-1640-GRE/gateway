import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

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
