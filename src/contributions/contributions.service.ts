import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Cache } from 'cache-manager';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { Repository } from 'typeorm';
import {
  CreateContributionDto,
  EvaluateDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import { Contribution } from './entities/contribution.entity';

const VIEW_CACHE_TIME = 5 * 60 * 1000;

@Injectable()
export class ContributionsService extends TypeOrmCrudService<Contribution> {
  constructor(
    @InjectRepository(Contribution)
    private contributionsRepository: Repository<Contribution>,
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

    const contribution = await this.contributionsRepository.save({
      ...dto,
      student: { id: userId },
      semester: { id: dto.semester_id },
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
    { to_delete, ...dto }: UpdateContributionDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const attachmentsDto = this.attachmentsService.validate(attachments);
    const contribution = await this.contributionsRepository.findOne(id, {
      relations: ['student'],
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    await this.attachmentsService.deletes(to_delete);

    await this.attachmentsService.creates(
      new Contribution({ id }),
      attachmentsDto,
    );

    return await this.contributionsRepository.update(id, dto);
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

  async approve(id: number) {
    const contribution = await this.contributionsRepository.findOne(id);

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    return await this.contributionsRepository.update(id, {
      approved: !contribution.approved,
    });
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
}
