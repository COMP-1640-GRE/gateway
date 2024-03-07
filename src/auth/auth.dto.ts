import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({ example: 'student' })
  username: string;

  @IsString()
  @ApiProperty({ example: 'superSecure@123' })
  password: string;
}
