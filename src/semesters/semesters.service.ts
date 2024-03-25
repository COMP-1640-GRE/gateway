import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { FacultiesService } from 'src/faculties/faculties.service';
import { Repository } from 'typeorm';
import { CreateSemesterDto } from './dto/semester.dto';
import { Semester } from './entities/semester.entity';

@Injectable()
export class SemestersService extends TypeOrmCrudService<Semester> {
  constructor(
    @InjectRepository(Semester)
    private semestersRepository: Repository<Semester>,
    private facultiesService: FacultiesService,
  ) {
    super(semestersRepository);
  }

  async create(dto: CreateSemesterDto) {
    const { faculty_id, ...semester } = dto;

    const { start_date, end_date, due_date } = semester;

    // make sure that start date is before end date
    if (start_date >= end_date) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (due_date < end_date) {
      throw new BadRequestException(
        'Due date must be after the end date of the semester',
      );
    }

    const faculty = await this.facultiesService.findById(faculty_id);

    if (!faculty) {
      throw new BadRequestException(`Faculty with id ${faculty_id} not found`);
    }

    semester['faculty'] = faculty;

    return await this.semestersRepository.save(semester);
  }

  async update(id: number, dto: CreateSemesterDto) {
    const { faculty_id, ...semester } = dto;

    const faculty = await this.facultiesService.findById(faculty_id);

    if (!faculty) {
      throw new BadRequestException(`Faculty with id ${faculty_id} not found`);
    }

    semester['faculty'] = faculty;

    return await this.semestersRepository.update(id, semester);
  }

  remove(id: number) {
    return this.semestersRepository.delete(id);
  }
}
