import { IsEnum } from 'class-validator';
import { ReactionType } from '../entities/reaction.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ReactionDto {
  user_id: number;
  contribution_id?: number;
  comment_id?: number;
  type: ReactionType;
}

export class CreateReactionDto {
  @ApiProperty({ type: 'enum', enum: ReactionType, example: ReactionType.LIKE })
  @IsEnum(ReactionType)
  type: ReactionType;
}
