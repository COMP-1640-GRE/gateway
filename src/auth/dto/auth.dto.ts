import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CompleteAccountDto {
  @IsString()
  @MaxLength(64)
  @MinLength(4)
  @ApiProperty({ example: 'student' })
  username: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
    minLowercase: 1,
  })
  @MaxLength(64)
  @ApiProperty({ example: 'superSecure@123' })
  password: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
    minLowercase: 1,
  })
  @MaxLength(64)
  @ApiProperty({ example: 'superSecure@123' })
  newPassword: string;

  @IsEmail()
  @MaxLength(100)
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'John' })
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'Doe' })
  last_name: string;
}
