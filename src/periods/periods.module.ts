import { Module } from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { Period } from './entities/period.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesModule } from 'src/faculties/faculties.module';

@Module({
  imports: [TypeOrmModule.forFeature([Period]), FacultiesModule],
  controllers: [PeriodsController],
  providers: [PeriodsService],
  exports: [PeriodsService],
})
export class PeriodsModule {}
