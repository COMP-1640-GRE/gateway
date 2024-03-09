import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { FacultiesService } from 'src/faculties/faculties.service';
import { getList } from 'src/utils/list';
import { ListRequestDto } from 'src/utils/list.dto';
import { Repository } from 'typeorm';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  CreateUsersDto,
  CreateUsersResponseDto as UsersResponseDto,
} from './dto/user.dto';
import { USER_ENTITY, User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private facultiesService: FacultiesService,
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
    faculty_id,
  }: CreateUsersDto): Promise<UsersResponseDto> {
    // Check if any user already exists with Promise.race
    const user = await Promise.race(
      users.map((user) => this.findByUsername(user.username)),
    );

    if (user) {
      throw new BadRequestException(`User ${user.username} already exists`);
    }

    let faculty: Faculty;

    // get the faculty
    if (faculty_id) {
      faculty = await this.facultiesService.findById(faculty_id);

      if (!faculty) {
        throw new BadRequestException(
          `Faculty with id ${faculty_id} not found`,
        );
      }
      if (
        role === UserRole.ADMINISTRATOR ||
        role === UserRole.UNIVERSITY_MARKETING_MANAGER
      ) {
        throw new BadRequestException(
          `User with role ${role} cannot be assigned to a faculty`,
        );
      }
    }

    // Hash the passwords
    const usersToCreate = await Promise.all(
      users.map(async (user) => ({
        ...user,
        role,
        faculty,
        secret: nanoid(),
        password: await bcrypt.hash(user.password, 10),
      })),
    );

    return new UsersResponseDto({
      data: await this.usersRepository.save(usersToCreate),
    });
  }

  async findAll(dto: ListRequestDto) {
    return getList(USER_ENTITY, dto, this.usersRepository);
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(user: Partial<User>): Promise<User> {
    delete user.username;

    // check if email is unique
    const foundUser = await this.findByEmail(user.email);
    if (foundUser && foundUser.id !== user.id) {
      throw new BadRequestException(
        `User with email ${user.email} already exists`,
      );
    }

    return this.usersRepository.save(user);
  }

  async remove(currentId: number, id: number) {
    if (currentId === id) {
      throw new BadRequestException('You cannot delete yourself');
    }
    return this.usersRepository.delete(id);
  }

  async adminUpdate(id: number, dto: AdminUpdateUserDto) {
    const { role, faculty_id, username, email } = dto;
    // Check if any user already exists with Promise.race
    if (username) {
      const user = await this.findByUsername(username);

      if (user) {
        throw new BadRequestException(`User "${username}" already exists`);
      }
    }

    if (email) {
      const user = await this.findByEmail(email);

      if (user) {
        throw new BadRequestException(`Email "${email}" already exists`);
      }
    }

    let faculty: Faculty;

    // get the faculty
    if (faculty_id) {
      faculty = await this.facultiesService.findById(faculty_id);

      if (!faculty) {
        throw new BadRequestException(
          `Faculty with id ${faculty_id} not found`,
        );
      }
      if (
        role === UserRole.ADMINISTRATOR ||
        role === UserRole.UNIVERSITY_MARKETING_MANAGER
      ) {
        throw new BadRequestException(
          `User with role ${role} cannot be assigned to a faculty`,
        );
      }
    }
    delete dto.faculty_id;
    return this.usersRepository.update(id, { ...dto, faculty });
  }

  async changePassword(
    id: number,
    { password, new_password }: ChangePasswordDto,
  ) {
    const user = await this.findById(id);

    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Incorrect password');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    return this.usersRepository.update(id, { password: hashedPassword });
  }
}
