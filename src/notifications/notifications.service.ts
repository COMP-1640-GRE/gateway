import { Inject, Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { SystemsService } from 'src/systems/systems.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService extends TypeOrmCrudService<Notification> {
  private emailService: any;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc,
    private readonly systemsService: SystemsService,
  ) {
    super(notificationsRepository);
  }

  onModuleInit() {
    this.emailService = this.client.getService('NotificationService');
  }

  async notify(userId: number, templateCode: string, option?: any) {
    const { enabled, send_mail: withEmail } =
      this.systemsService.config.notifications;
    if (!enabled) {
      return;
    }

    return lastValueFrom<any>(
      this.emailService.sendNotification({
        templateCode,
        userId,
        option,
        withEmail,
      }),
    );
  }
}
