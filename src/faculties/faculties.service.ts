import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Faculty } from './entities/faculty.entity';

@Injectable()
export class FacultiesService extends TypeOrmCrudService<Faculty> {
  constructor(
    @InjectRepository(Faculty) private facultiesRepository: Repository<Faculty>,
  ) {
    super(facultiesRepository);
  }

  async findById(id: number) {
    return await this.facultiesRepository.findOneBy({ id });
  }
}
