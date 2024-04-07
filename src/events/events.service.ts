import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter } from 'rxjs';

export type EventTypes = 'notification' | 'dashboard';

@Injectable()
export class EventsService {
  private eventSub = new Subject<MessageEvent>();

  publish(
    eventName: string,
    data: { type: EventTypes; data?: string | object },
  ): void {
    const event = new MessageEvent(eventName, { data });
    this.eventSub.next(event);
  }

  event(eventName: string): Observable<MessageEvent> {
    return this.eventSub
      .asObservable()
      .pipe(filter((event) => event.type === eventName));
  }
}
