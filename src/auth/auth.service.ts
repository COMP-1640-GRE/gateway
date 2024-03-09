import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtPayloadType } from 'src/decorators/jwt-payload.decorator';
import { AccountStatus, User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CompleteAccountDto as ActiveAccountDto } from './dto/auth.dto';
import { TOKEN_KEY } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  }

  async login(res: Response, username: string, password: string) {
    try {
      const user = await this.validateUser(username, password);
      const {
        id,
        role,
        secret,
        account_status,
        email,
        first_name,
        last_name,
        faculty,
      } = user;

      // if user is not inactive
      if (account_status === AccountStatus.INACTIVE) {
        return new HttpException(
          'You have to activate your account first',
          HttpStatus.FORBIDDEN,
        );
      }

      // if user is locked
      if (account_status === AccountStatus.LOCKED) {
        return new HttpException(
          'Your account is locked. Please contact administrator',
          HttpStatus.FORBIDDEN,
        );
      }

      const payload: JwtPayloadType = {
        id,
        username,
        role,
        email,
        first_name,
        last_name,
        account_status,
        faculty_id: faculty?.id,
      };

      const access_token = await this.jwtService.signAsync(payload, { secret });

      res.cookie(TOKEN_KEY, access_token);

      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Incorrect username or password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async activate(res: Response, dto: ActiveAccountDto) {
    const { username, password, new_password, email, first_name, last_name } =
      dto;

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
    user.account_status = AccountStatus.ACTIVE;

    await this.usersService.update(user);

    return this.login(res, username, new_password);
  }
}
