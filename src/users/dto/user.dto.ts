import { IsEnum, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @MaxLength(64)
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
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
