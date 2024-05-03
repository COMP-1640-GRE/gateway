import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@Crud({
  model: {
    type: Notification,
  },
  query: {
    limit: 100,
    cache: 200,
  },
  routes: {
    only: ['getManyBase'],
  },
  params: {
    id: {
      type: 'number',
      primary: true,
      field: 'id',
    },
  },
})
export class NotificationsController implements CrudController<Notification> {
  constructor(public service: NotificationsService) {}

  @Override('getManyBase')
  getMany(
    @ParsedRequest() req: CrudRequest,
    @JwtPayload() { id }: JwtPayloadType,
  ) {
    req.parsed.search.$and = [{ $and: [{ user_id: { $eq: id } }] }];
    req.parsed.sort = [{ field: 'created_at', order: 'DESC' }];

    return this.service.getMany(req);
  }
}
