import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BlockedWordsDto {
  @ApiProperty({
    type: [String],
    example: ['word1', 'word2', 'word3'],
    description: 'List of blocked words',
  })
  @IsString({ each: true })
  blockedWords: string[];
}

export class GuestResourceDto {
  @ApiProperty({
    type: [String],
    example: ['word1', 'word2', 'word3'],
    description: 'List of resources for guest users',
  })
  @IsString({ each: true })
  guestResources: string[];
}

export class SystemDto {}
