import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

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

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const { id, role, secret } = user;
    const payload = {
      id,
      username,
      role,
    };

    const access_token = await this.jwtService.signAsync(payload, { secret });

    return {
      access_token,
    };
  }
}
