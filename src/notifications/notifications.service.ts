import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService extends TypeOrmCrudService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private facultiesRepository: Repository<Notification>,
  ) {
    super(facultiesRepository);
  }
}
