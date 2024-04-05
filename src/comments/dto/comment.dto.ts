import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'I love this contribution' })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_anonymous: boolean;
}

export class CreateCommentDto extends UpdateCommentDto {
  @ApiProperty({ example: 1 })
  @IsPositive()
  contribution_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsPositive()
  @IsOptional()
  parent_id: number;
}
