import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'I love this contribution' })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty({ example: 1 })
  @IsPositive()
  contribution_id: number;
}
