import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { EVENTS_KEY } from 'src/decorators/events.decorator';
import { EventTypes } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class EventsInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly notificationsService: NotificationsService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const events = this.reflector.getAllAndOverride<EventTypes[]>(EVENTS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!events) {
      return next.handle();
    }

    return next
      .handle()
      .pipe(
        tap(() =>
          events.forEach((event) => this.notificationsService.event(event, {})),
        ),
      );
  }
}
