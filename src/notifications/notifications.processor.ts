import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

@Processor('NOTIFICATION')
export class NotificationsProcessor {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Process()
  handleJob(job: Job) {
    return this.notificationsService.notify(job.data);
  }
}
