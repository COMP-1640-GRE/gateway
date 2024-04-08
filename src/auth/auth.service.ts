import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CookieOptions, Response } from 'express';
import { JwtPayloadType } from 'src/decorators/jwt-payload.decorator';
import { UserStatus, User, UserRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { ActiveAccountDto, LoginDto } from './dto/auth.dto';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new HttpException(
        'Incorrect username or password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException(
        'Incorrect username or password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return user;
  }

  async login(res: Response, dto: LoginDto) {
    const { username, password, remember = false } = dto;

    const user = await this.validateUser(username, password);
    const { id, role, secret, account_status, password: _, ...rest } = user;

    const payload: JwtPayloadType = {
      ...rest,
      id,
      role,
      username,
      account_status,
    };

    // if user is not active
    if (account_status === UserStatus.INACTIVE) {
      res.status(HttpStatus.PRECONDITION_REQUIRED);
      res.statusMessage = 'You must activate your account';

      return user;
    }

    // if user is locked
    if (account_status === UserStatus.LOCKED) {
      throw new ForbiddenException(
        'Your account is locked. Please contact administrator',
      );
    }

    if (
      [
        UserRole.GUEST,
        UserRole.STUDENT,
        UserRole.FACULTY_MARKETING_COORDINATOR,
      ].includes(role) &&
      !rest.faculty
    ) {
      throw new ForbiddenException('You must have a faculty assigned');
    }

    const access_token = await this.jwtService.signAsync(payload, { secret });
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '7d',
    });

    const cookieOptions: CookieOptions = {
      secure: true,
      sameSite: 'none',
    };

    res.cookie(TOKEN_KEY, access_token, cookieOptions);

    if (remember) {
      res.cookie(REFRESH_TOKEN_KEY, refresh_token, cookieOptions);
    }

    return user;
  }

  async activate(res: Response, dto: ActiveAccountDto) {
    const {
      username,
      password,
      new_password,
      email,
      first_name,
      last_name,
      remember,
    } = dto;

    const user = await this.usersService.findByUsername(username);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new HttpException(
        'Incorrect username or password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    user.password = await bcrypt.hash(new_password, 10);
    user.email = email;
    user.first_name = first_name;
    user.last_name = last_name;
    user.account_status = UserStatus.ACTIVE;

    await this.usersService.update(user);

    return this.login(res, {
      username,
      password: new_password,
      remember,
    });
  }

  async logout(res: Response) {
    const cookieOptions: CookieOptions = {
      secure: true,
      sameSite: 'none',
    };

    res.clearCookie(TOKEN_KEY, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_KEY, cookieOptions);

    return {
      success: true,
    };
  }
}
