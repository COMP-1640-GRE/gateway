import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { FacultiesService } from 'src/faculties/faculties.service';
import { Repository } from 'typeorm';
import { CreatePeriodDto } from './dto/period.dto';
import { Period } from './entities/period.entity';

@Injectable()
export class PeriodsService extends TypeOrmCrudService<Period> {
  constructor(
    @InjectRepository(Period) private periodsRepository: Repository<Period>,
    private facultiesService: FacultiesService,
  ) {
    super(periodsRepository);
  }

  async create(dto: CreatePeriodDto) {
    const { faculty_id, ...period } = dto;

    const { start_date, end_date } = period;

    // make sure that start date is before end date
    if (start_date >= end_date) {
      throw new BadRequestException('Start date must be before end date');
    }

    const faculty = await this.facultiesService.findById(faculty_id);

    if (!faculty) {
      throw new BadRequestException(`Faculty with id ${faculty_id} not found`);
    }

    period['faculty'] = faculty;

    return await this.periodsRepository.save(period);
  }

  async update(id: number, dto: CreatePeriodDto) {
    const { faculty_id, ...period } = dto;

    const faculty = await this.facultiesService.findById(faculty_id);

    if (!faculty) {
      throw new BadRequestException(`Faculty with id ${faculty_id} not found`);
    }

    period['faculty'] = faculty;

    return await this.periodsRepository.update(id, period);
  }

  remove(id: number) {
    return this.periodsRepository.delete(id);
  }
}
