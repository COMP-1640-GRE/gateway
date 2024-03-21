import { Module } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { SemestersController } from './semesters.controller';
import { Semester } from './entities/semester.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesModule } from 'src/faculties/faculties.module';

@Module({
  imports: [TypeOrmModule.forFeature([Semester]), FacultiesModule],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {}
