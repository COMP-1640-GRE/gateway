import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSemesterDto {
  @ApiProperty({
    example: '2024-2025',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  name: string;

  @ApiProperty({
    example: '2021-2022 spring semester',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  description: string;

  @ApiProperty({ example: '2024-09-01' })
  @IsDateString()
  start_date: Date;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  end_date: Date;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsPositive()
  faculty_id: number;
}
