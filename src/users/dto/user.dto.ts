import { IsEnum, IsString, IsStrongPassword } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minSymbols: 1,
    minLowercase: 1,
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
