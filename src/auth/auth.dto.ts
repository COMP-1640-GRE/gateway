import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  @ApiProperty({ example: 'student' })
  username: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'superSecure@123' })
  password: string;
}
