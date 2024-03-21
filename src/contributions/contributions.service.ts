import { Injectable } from '@nestjs/common';
import { CreateContributionDto } from './dto/contribution.dto';

@Injectable()
export class ContributionsService {
  create(createContributionDto: CreateContributionDto) {
    return 'This action adds a new contribution';
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
