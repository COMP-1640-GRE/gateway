import { Inject, Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { SystemsService } from 'src/systems/systems.service';
import { lastValueFrom } from 'rxjs';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class NotificationsService extends TypeOrmCrudService<Notification> {
  private emailService: any;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc,
    private readonly eventsService: EventsService,
    private readonly systemsService: SystemsService,
  ) {
    super(notificationsRepository);
  }

  onModuleInit() {
    this.emailService = this.client.getService('NotificationService');
  }

  async notify({
    userId,
    templateCode,
    sendMail = true,
    option,
  }: {
    userId: number;
    templateCode: string;
    sendMail?: boolean;
    option?: string;
  }) {
    const { enabled, send_mail } = this.systemsService.config.notifications;
    if (!enabled) {
      return;
    }
    this.eventsService.publish(String(userId), {
      type: 'notification',
      data: templateCode,
    });

    const withEmail = sendMail && send_mail;

    return lastValueFrom<any>(
      this.emailService.sendNotification({
        templateCode,
        userId,
        option,
        withEmail,
      }),
    );
  }

  event(userId: string, data?: any) {
    return this.eventsService.publish(String(userId), {
      type: 'dashboard',
      data,
    });
  }
}
