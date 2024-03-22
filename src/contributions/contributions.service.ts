import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { Repository } from 'typeorm';
import {
  CreateContributionDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import { Contribution } from './entities/contribution.entity';

const VIEW_CACHE_TIME = 5 * 60 * 1000;

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private contributionsRepository: Repository<Contribution>,
    private readonly attachmentsService: AttachmentsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(
    userId: number,
    dto: CreateContributionDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const attachmentsDto = this.attachmentsService.validate(
      userId,
      attachments,
    );

    const contribution = await this.contributionsRepository.save({
      ...dto,
      student: { id: userId },
    });

    try {
      await this.attachmentsService.creates(contribution, attachmentsDto);
    } catch (error) {
      await this.contributionsRepository.remove(contribution);
      throw error;
    }

    return contribution;
  }

  async findOne(id: number, fingerprint: string) {
    const contribution = await this.contributionsRepository.findOne(
      { id },
      { relations: ['attachments'] },
    );

    const key = `contribution-${id}-${fingerprint}`;

    const cache = await this.cacheManager.get<boolean>(key);

    if (!cache) {
      await this.cacheManager.set(key, true, VIEW_CACHE_TIME);

      contribution.view_count++;

      await this.contributionsRepository.save(contribution);
    }

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    return contribution;
  }

  async update(
    id: number,
    userId: number,
    { to_delete, ...dto }: UpdateContributionDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const attachmentsDto = this.attachmentsService.validate(
      userId,
      attachments,
    );
    const contribution = await this.contributionsRepository.findOne(id, {
      relations: ['student'],
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    if (contribution.student.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this contribution',
      );
    }

    await this.attachmentsService.deletes(to_delete);

    await this.attachmentsService.creates(
      new Contribution({ id }),
      attachmentsDto,
    );

    return await this.contributionsRepository.update(id, dto);
  }

  async remove(id: number, userId: number) {
    const contribution = await this.contributionsRepository.findOne(id, {
      relations: ['student'],
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    if (contribution.student.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this contribution',
      );
    }

    const attachments = contribution.attachments.map(({ path }) => path);
    await this.attachmentsService.deletes(attachments);

    return this.contributionsRepository.remove(contribution);
  }
}
