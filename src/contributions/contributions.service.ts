import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateContributionDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Contribution } from './entities/contribution.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private contributionsRepository: Repository<Contribution>,
    private readonly attachmentsService: AttachmentsService,
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

  findOne(id: number) {
    return this.contributionsRepository.findOne(
      { id },
      {
        relations: ['attachments'],
      },
    );
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

    await this.attachmentsService.deletes(to_delete);

    await this.attachmentsService.creates(
      new Contribution({ id }),
      attachmentsDto,
    );

    const contribution = await this.contributionsRepository.update(id, dto);

    return contribution;
  }

  async remove(id: number) {
    const contribution = await this.contributionsRepository.findOne({ id });

    if (!contribution) {
      throw new NotFoundException(`Contribution with id ${id} not found`);
    }

    const attachments = contribution.attachments.map(({ path }) => path);
    await this.attachmentsService.deletes(attachments);

    return this.contributionsRepository.remove(contribution);
  }
}
