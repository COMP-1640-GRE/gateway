import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty) private facultiesRepository: Repository<Faculty>,
  ) {}

  async create({ name }: CreateFacultyDto) {
    //  name must be unique
    try {
      return await this.facultiesRepository.save({ name });
    } catch (err) {
      throw new BadRequestException({
        message: `Faculty with name "${name}" already exists`,
      });
    }
  }

  findAll() {
    return this.facultiesRepository.find();
  }

  findOne(id: number) {
    // TODO: get a single faculty can return paginated users and periods
    return id;
  }

  async update(id: number, dto: CreateFacultyDto) {
    try {
      return await this.facultiesRepository.update(id, dto);
    } catch (error) {
      throw new BadRequestException({
        message: `Faculty with name "${dto.name}" already exists`,
      });
    }
  }

  remove(id: number) {
    return this.facultiesRepository.delete(id);
  }
}
