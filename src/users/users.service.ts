import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { isAlphanumeric } from 'class-validator';
import { nanoid } from 'nanoid';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { FacultiesService } from 'src/faculties/faculties.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { SystemsService } from 'src/systems/systems.service';
import { Repository } from 'typeorm';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  CreateUsersDto,
  CreateUsersResponseDto as UsersResponseDto,
} from './dto/user.dto';
import { AccountStatus, User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    public usersRepository: Repository<User>,
    private facultiesService: FacultiesService,
    private attachmentsService: AttachmentsService,
    private systemsService: SystemsService,
    private notificationsService: NotificationsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    super(usersRepository);
    // check if users table is empty
    this.usersRepository.count().then((count) => {
      // if table is empty, create administrator user
      if (count === 0) {
        const usernames = 'admin';

        this.createUsers({
          usernames,
          role: UserRole.ADMINISTRATOR,
        }).then(() => {
          Logger.log(
            `'Administrator user created with username: ${usernames} and password: ${this.systemsService.config.user.default_password}`,
          );
        });
      }
    });
  }

  async createUsers({
    usernames,
    role,
    faculty_id,
  }: CreateUsersDto): Promise<UsersResponseDto> {
    const usernamesArray = usernames.replace(/\s/g, '').split(',');

    const invalidUsername = usernamesArray.find(
      (username) => !isAlphanumeric(username),
    );

    if (invalidUsername) {
      throw new BadRequestException(
        'Usernames must only contain alphanumeric characters. Invalid username: ' +
          invalidUsername,
      );
    }
    // Check if any user already exists with Promise.race
    const user = await Promise.race(
      usernamesArray.map((username) => this.findByUsername(username)),
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
    const password = await this.hashPassword(
      this.systemsService.config.user.default_password,
    );
    // Hash the passwords
    const usersToCreate = await Promise.all(
      usernamesArray.map(async (username) => ({
        username,
        role,
        faculty,
        password,
        secret: this.generateSecret(),
      })),
    );

    return new UsersResponseDto({
      data: await this.usersRepository.save(usersToCreate),
    });
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOne({ id: id });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ username });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ email });
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

    const updatingUser = await this.findById(id);
    if (!updatingUser) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    if (updatingUser.account_status === AccountStatus.INACTIVE) {
      throw new BadRequestException(`User with id ${id} is not active`);
    }

    // Check if any user already exists with Promise.race
    if (username && username !== updatingUser.username) {
      const user = await this.findByUsername(username);

      if (user) {
        throw new BadRequestException(`User "${username}" already exists`);
      }
    }

    if (email && email !== updatingUser.email) {
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

    const hashedPassword = await this.hashPassword(new_password);

    return this.usersRepository.update(id, { password: hashedPassword });
  }

  getFacultyCoordinators(facultyId: number) {
    return this.usersRepository.find({
      where: {
        role: UserRole.FACULTY_MARKETING_COORDINATOR,
        faculty: {
          id: facultyId,
        },
      },
      relations: ['faculty'],
    });
  }

  async resetPassword(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }

    const password = await this.hashPassword(
      this.systemsService.config.user.default_password,
    );

    return this.usersRepository.update(id, {
      password,
      secret: this.generateSecret(),
      account_status: AccountStatus.INACTIVE,
    });
  }

  async lockUser(id: number, currentId: number) {
    if (currentId === id) {
      throw new BadRequestException('You cannot lock yourself');
    }

    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }
    const account_status =
      user.account_status === AccountStatus.LOCKED
        ? AccountStatus.INACTIVE
        : AccountStatus.LOCKED;
    await this.usersRepository.update(id, { account_status });

    return { ...user, account_status };
  }

  async avatar(id: number, file: Express.Multer.File) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException(`User with id ${id} not found`);
    }

    if (!file) {
      throw new BadRequestException('File not found');
    }

    const avatar = await this.attachmentsService.uploadAvatar(id, file);

    await this.usersRepository.update(id, { avatar: avatar.path });
    return avatar;
  }

  async forgotPassword(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }

    const code = nanoid(6);

    await this.cacheManager.set(
      this.getForgotPasswordKey(user.id),
      code,
      5 * 60 * 1000,
    );

    await this.notificationsService.queueNotify({
      userId: user.id,
      templateCode: 'reset_pw_email',
      option: code,
      sendMail: true,
    });

    return { message: 'Code sent successfully' };
  }

  async userResetPassword(
    email: string,
    { code, password }: { code: string; password: string },
  ) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`User with email ${email} not found`);
    }
    const key = this.getForgotPasswordKey(user.id);
    const cachedCode = await this.cacheManager.get(key);

    if (!cachedCode) {
      throw new BadRequestException('Code has expired');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('Invalid code');
    }

    const hashedPassword = await this.hashPassword(password);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      secret: this.generateSecret(),
    });

    await this.cacheManager.del(key);

    return { message: 'Password reset successfully' };
  }

  private getForgotPasswordKey(id: number) {
    return `forgot_password-${id}`;
  }

  private generateSecret() {
    return nanoid();
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
