import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

@Processor('NOTIFICATION')
export class NotificationsProcessor {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Process()
  async handleJob(job: Job) {
    try {
      await this.notificationsService.notify(job.data);
    } catch (error) {
      console.warn(error);
    }
  }
}
