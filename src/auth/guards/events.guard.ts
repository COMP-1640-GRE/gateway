import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EVENTS_KEY } from 'src/decorators/events.decorator';
import { EventTypes } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class EventsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly notificationsService: NotificationsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const events = this.reflector.getAllAndOverride<EventTypes[]>(EVENTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log(events);

    if (!events) {
      return true;
    }

    events.forEach((event) => this.notificationsService.event(event));

    return true;
  }
}
