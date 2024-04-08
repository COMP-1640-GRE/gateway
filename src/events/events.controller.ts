import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { EventsService } from './events.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('notifications')
  notification(@JwtPayload() { id }: JwtPayloadType): Observable<MessageEvent> {
    return this.eventsService.event(String(id));
  }

  @Sse('dashboard')
  dashboard(): Observable<MessageEvent> {
    return this.eventsService.dashboardEvent();
  }
}
