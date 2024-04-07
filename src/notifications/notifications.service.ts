import { Inject, Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { SystemsService } from 'src/systems/systems.service';
import { lastValueFrom } from 'rxjs';
import { EventsService } from 'src/events/events.service';
import { NotifyType, TemplateCode } from './types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService extends TypeOrmCrudService<Notification> {
  private emailService: any;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,

    @Inject('NOTIFICATION_PACKAGE')
    private client: ClientGrpc,

    @InjectQueue('NOTIFICATION')
    private notificationQueue: Queue,

    private readonly eventsService: EventsService,
    private readonly systemsService: SystemsService,
  ) {
    super(notificationsRepository);
  }

  onModuleInit() {
    this.emailService = this.client.getService('Notification');
  }

  async queueNotify(notify: NotifyType) {
    return this.notificationQueue.add(notify, {});
  }

  async notify({ userId, templateCode, sendMail = true, option }: NotifyType) {
    const { enabled, send_mail } = this.systemsService.config.notifications;
    if (!enabled) {
      return;
    }

    const withEmail =
      templateCode === 'reset_pw_email' ? true : sendMail && send_mail;

    const res = await lastValueFrom<any>(
      this.emailService.sendNotification({
        templateCode,
        userId,
        option,
        withEmail,
      }),
    );

    this.eventsService.publish(String(userId), {
      type: 'notification',
      data: res?.content,
    });

    return res;
  }

  event(userId: string, data?: any) {
    return this.eventsService.publish(String(userId), {
      type: 'dashboard',
      data,
    });
  }
}
