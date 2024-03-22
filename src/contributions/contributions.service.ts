import { Injectable } from '@nestjs/common';
import { CreateContributionDto } from './dto/contribution.dto';
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
    dto: CreateContributionDto,
    attachments: Array<Express.Multer.File>,
  ) {
    const attachmentsDto = this.attachmentsService.validate(attachments);

    const contribution = await this.contributionsRepository.save(dto);

    try {
      await this.attachmentsService.create(contribution, attachmentsDto);
    } catch (error) {
      await this.contributionsRepository.remove(contribution);
      throw error;
    }

    return contribution;
  }

  findAll() {
    return `This action returns all contributions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contribution`;
  }

  update(id: number, updateContributionDto: CreateContributionDto) {
    return `This action updates a #${id} contribution`;
  }

  remove(id: number) {
    return `This action removes a #${id} contribution`;
  }
}
