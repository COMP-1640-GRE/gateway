import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter } from 'rxjs';

export type EventTypes = 'notification' | 'dashboard';

@Injectable()
export class EventsService {
  private eventSub = new Subject<MessageEvent>();

  publish(eventName: string, data?: string | object): void {
    console.log(eventName, data);

    const event = new MessageEvent(eventName, {
      data: typeof data === 'object' ? JSON.stringify(data) : data,
    });
    this.eventSub.next(event);
  }

  event(eventName: string): Observable<MessageEvent> {
    return this.eventSub
      .asObservable()
      .pipe(filter((event) => event.type === eventName));
  }

  dashboardEvent(): Observable<MessageEvent> {
    return this.event('dashboard');
  }
}
