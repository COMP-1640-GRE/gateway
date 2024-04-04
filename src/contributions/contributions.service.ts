import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Cache } from 'cache-manager';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { Semester } from 'src/semesters/entities/semester.entity';
import { SemestersService } from 'src/semesters/semesters.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import {
  CreateContributionDto,
  EvaluateDto,
  StatusDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import {
  Contribution,
  ContributionStatus,
} from './entities/contribution.entity';

const VIEW_CACHE_TIME = 5 * 60 * 1000;

@Injectable()
export class ContributionsService extends TypeOrmCrudService<Contribution> {
  constructor(
    @InjectRepository(Contribution)
    private contributionsRepository: Repository<Contribution>,
    private readonly usersService: UsersService,
    private readonly semestersService: SemestersService,
    private readonly attachmentsService: AttachmentsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    super(contributionsRepository);
  }

  async create(
    userId: number,
    dto: CreateContributionDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const attachmentsDto = this.attachmentsService.validate(attachments);
    const semester = await this.getValidSemester(dto.semester_id);
    const student = await this.getValidStudent(userId, semester);

    const contribution = await this.contributionsRepository.save({
      ...dto,
      student,
      semester,
    });

    try {
      await this.attachmentsService.creates(contribution, attachmentsDto);
    } catch (error) {
      await this.contributionsRepository.remove(contribution);
      throw error;
    }

    return contribution;
  }

  async findOneById(id: number, fingerprint: string) {
    const contribution = await this.contributionsRepository.findOne(
      { id },
      {
        relations: [
          'attachments',
          'student',
          'reviews',
          'reviews.reviewer',
          'semester',
          'semester.faculty',
        ],
      },
    );

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    const key = `contribution-${id}-${fingerprint}`;

    const cache = await this.cacheManager.get<boolean>(key);

    if (!cache) {
      await this.cacheManager.set(key, true, VIEW_CACHE_TIME);

      contribution.view_count++;

      await this.contributionsRepository.save(contribution);
    }

    if (contribution.is_anonymous) {
      contribution.student = undefined;
    }

    return contribution;
  }

  async update(
    id: number,
    userId: number,
    { to_delete, ...dto }: UpdateContributionDto,
    attachments: Array<Express.Multer.File>,
  ) {
    let toDelete: string[] = [];
    try {
      toDelete = JSON.parse(to_delete);
    } catch {
      throw new BadRequestException('Invalid to_delete');
    }
    const attachmentsDto = this.attachmentsService.validate(attachments, false);
    const contribution = await this.contributionsRepository.findOne(id);

    const semester = await this.getValidSemester(dto.semester_id, true);
    await this.getValidStudent(userId, semester);

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    await this.attachmentsService.deletes(toDelete);

    await this.attachmentsService.creates(contribution, attachmentsDto);

    return await this.contributionsRepository.save({
      id,
      ...dto,
      semester,
      status: ContributionStatus.PENDING,
    });
  }

  async remove(id: number) {
    const contribution = await this.contributionsRepository.findOne(id, {
      relations: ['student', 'attachments'],
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    const attachments = contribution.attachments.map(({ path }) => path);
    await this.attachmentsService.deletes(attachments);

    return this.contributionsRepository.remove(contribution);
  }

  async select(id: number) {
    const contribution = await this.contributionsRepository.findOne(id);

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    return await this.contributionsRepository.update(id, {
      selected: !contribution.selected,
    });
  }

  async evaluate(id: number, { evaluation }: EvaluateDto) {
    const contribution = await this.contributionsRepository.findOne(id);

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    return await this.contributionsRepository.update(id, { evaluation });
  }
  async status(id: number, { status }: StatusDto) {
    const contribution = await this.contributionsRepository.findOne(id);

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    return await this.contributionsRepository.update(id, { status });
  }

  async getValidSemester(id: number, checkDueDate = false) {
    const semester = await this.semestersService.findOne(id, {
      relations: ['faculty'],
    });

    if (!semester) {
      throw new NotFoundException(`Semester with id ${id} not found`);
    }

    const { start_date, end_date, due_date } = semester;

    // make sure that now is between start date and end date
    const now = new Date();
    if (now < start_date || now > end_date) {
      throw new BadRequestException(
        'You can only create contribution in the current semester',
      );
    }

    if (checkDueDate && now > due_date) {
      throw new BadRequestException(
        'You can only create contribution before the due date of the semester',
      );
    }

    return semester;
  }

  async getValidStudent(id: number, semester: Semester) {
    const student = await this.usersService.findOne(id, {
      relations: ['faculty'],
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    if (student.faculty.id !== semester.faculty.id) {
      throw new BadRequestException(
        'You can only create contribution in your faculty',
      );
    }

    return student;
  }

  async selectMultiple(ids: number[]) {
    return await this.contributionsRepository.update(ids, { selected: true });
  }

  async download(ids: number[]) {
    const contributions = await this.contributionsRepository.findByIds(ids, {
      relations: ['attachments'],
    });

    if (!contributions || contributions.length === 0) {
      throw new NotFoundException('Contributions not found');
    }

    const attachments = contributions.flatMap(({ attachments }) =>
      attachments.map(({ path }) => path).filter(Boolean),
    );

    return this.attachmentsService.download('contributions', attachments);
  }
}
