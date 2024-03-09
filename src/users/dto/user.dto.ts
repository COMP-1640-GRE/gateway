import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsLowercase,
  IsOptional,
  IsPositive,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User, UserRole } from '../entities/user.entity';

export class UserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  @IsLowercase()
  @IsAlphanumeric()
  @ApiProperty({ example: 'john' })
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
}

export class CreateUsersDto {
  @ApiProperty({
    isArray: true,
    type: UserDto,
  })
  users: UserDto[];

  @ApiProperty({ example: 'student' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsPositive()
  faculty_id?: number;
}

export class CreateUsersResponseDto {
  @ApiResponseProperty()
  @Type(() => User)
  data: User[];

  constructor(partial: Partial<CreateUsersResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({ example: 'user@example.com', required: false })
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({ example: 'John', required: false })
  first_name: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({ example: 'Doe', required: false })
  last_name: string;
}

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(64)
  @IsLowercase()
  @IsAlphanumeric()
  @ApiProperty({ example: 'john', required: false })
  username: string;

  @ApiProperty({ example: 'student' })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsPositive()
  faculty_id?: number;
}

export class ChangePasswordDto {
  @IsString()
  @MaxLength(64)
  @ApiProperty({ example: 'superSecure@123' })
  password: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
    minLowercase: 1,
  })
  @MaxLength(64)
  @ApiProperty({ example: 'superSecure@12' })
  new_password: string;
}
