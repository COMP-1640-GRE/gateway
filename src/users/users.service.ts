import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import {
  CreateUsersDto,
  CreateUsersResponseDto as UsersResponseDto,
} from './dto/user.dto';
import { User, UserRole } from './entities/user.entity';

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

        this.createUsers({
          users: [{ username, password }],
          role: UserRole.ADMINISTRATOR,
        }).then(() => {
          Logger.log(
            `'Administrator user created with username: ${username} and password: ${password}`,
          );
        });
      }
    });
  }

  async createUsers({
    users,
    role,
  }: CreateUsersDto): Promise<UsersResponseDto> {
    // Check if any user already exists with Promise.race
    const user = await Promise.race(
      users.map((user) => this.findByUsername(user.username)),
    );

    if (user) {
      throw new BadRequestException(`User ${user.username} already exists`);
    }

    // Hash the passwords
    const usersToCreate = await Promise.all(
      users.map(async (user) => ({
        ...user,
        role,
        secret: nanoid(),
        password: await bcrypt.hash(user.password, 10),
      })),
    );

    return new UsersResponseDto({
      data: await this.usersRepository.save(usersToCreate),
    });
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }
}
