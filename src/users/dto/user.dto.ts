import { IsEnum, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { User, UserRole } from '../entities/user.entity';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ListRequestDto } from 'src/utils/list.dto';

export class UserDto {
  @IsString()
  @MaxLength(64)
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
}

export class CreateUsersResponseDto {
  @ApiResponseProperty()
  @Type(() => User)
  data: User[];

  constructor(partial: Partial<CreateUsersResponseDto>) {
    Object.assign(this, partial);
  }
}
