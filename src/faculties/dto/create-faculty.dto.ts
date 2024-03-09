import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({
    example: 'Computer Science',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  name: string;
}
