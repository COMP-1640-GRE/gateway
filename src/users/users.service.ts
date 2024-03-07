import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // check if users table is empty
    this.usersRepository.count().then((count) => {
      // if table is empty, create administrator user
      if (count === 0) {
        const password = nanoid();
        const username = 'admin';

        this.createUser({
          username,
          password,
          role: UserRole.ADMINISTRATOR,
        }).then(() => {
          Logger.log(
            `'Administrator user created with username: ${username} and password: ${password}`,
          );
        });
      }
    });
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const secret = nanoid();

    user.password = hashedPassword;

    return this.usersRepository.save({ ...user, secret });
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }
}
